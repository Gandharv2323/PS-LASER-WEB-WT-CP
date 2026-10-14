"use client";

import { useEffect, useState } from "react";
import { getWorkOrders } from "@/lib/api/browser";
import { SPRING_WS } from "@/lib/api/config";
import { workOrderSchema } from "@/lib/api/schemas";
import { connectStomp, type StompStatus } from "@/lib/api/stomp";
import type { WorkOrder } from "@/lib/api/types";
import { safeParse } from "@/lib/api/validate";
import { useQuery, useQueryCache } from "./use-query";

export const WORK_ORDERS_KEY = ["work-orders"] as const;
const POLL_MS = 15_000;

/**
 * Work orders for the staff dashboard:
 *  - initial load + cache via useQuery (SWR-style, retries with backoff);
 *  - live updates from Spring's STOMP topic /topic/work-orders — a pushed order is
 *    upserted straight into the cache (no refetch);
 *  - when the socket is not available, polling every 15 s takes over automatically.
 */
export function useLiveWorkOrders() {
  const cache = useQueryCache();
  const [live, setLive] = useState<StompStatus>("closed");
  const query = useQuery(WORK_ORDERS_KEY, ({ signal }) => getWorkOrders(signal).then((r) => r.orders), {
    staleTime: 5_000,
    retry: 2,
    refetchInterval: live === "live" ? false : POLL_MS,
  });

  // Only open the socket once the API has answered, so an offline backend doesn't
  // produce failed WebSocket handshakes in the console; polling covers that case.
  const apiUp = query.state.status === "success";

  useEffect(() => {
    if (!apiUp) return;
    const handle = connectStomp(
      SPRING_WS,
      "/topic/work-orders",
      (body) => {
        let json: unknown = null;
        try {
          json = JSON.parse(body);
        } catch {
          /* not JSON */
        }
        const parsed = safeParse(workOrderSchema, json);
        if (parsed.ok) {
          const order = parsed.value;
          cache.setData<WorkOrder[]>(WORK_ORDERS_KEY, (old = []) => {
            const i = old.findIndex((o) => o.orderNo === order.orderNo);
            return i === -1 ? [order, ...old] : old.map((o, j) => (j === i ? order : o));
          });
        } else {
          // Unknown payload: just refetch the list.
          cache.fetch(WORK_ORDERS_KEY, ({ signal }) => getWorkOrders(signal).then((r) => r.orders)).catch(() => undefined);
        }
      },
      setLive,
    );
    return () => handle.close();
  }, [cache, apiUp]);

  return { ...query, live };
}
