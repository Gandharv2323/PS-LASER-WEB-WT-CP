"use client";

/**
 * Quote cart shared across pages (/quote, /track, header), persisted to localStorage.
 *
 * Why Zustand (not Redux Toolkit): the cart is small client state with a handful of
 * actions; Zustand gives a typed store, selector subscriptions (components re-render only
 * when their slice changes) and `persist` middleware in ~1 kB, without providers or
 * boilerplate. Server data (estimates, work orders) is NOT kept here — that lives in the
 * query cache (src/lib/api/query-cache.ts). Redux/RTK is used in services/react-portal.
 *
 * Why not Context: a Context value change re-renders every consumer; Zustand's
 * useSyncExternalStore-based selectors re-render only components whose selected slice
 * changed, and the store is usable outside React (e.g. in event handlers).
 */
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DataSource, EstimateInput, EstimateResult } from "@/lib/api/types";

export interface CartItem {
  readonly id: string;
  readonly label: string;
  readonly input: EstimateInput;
  readonly estimate: EstimateResult;
  readonly source: DataSource;
  readonly addedAt: number;
}

export interface Customer {
  name: string;
  phone: string;
}

interface QuoteState {
  items: CartItem[];
  customer: Customer;
  add: (item: Omit<CartItem, "id" | "addedAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
  setCustomer: (patch: Partial<Customer>) => void;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      items: [],
      customer: { name: "", phone: "" },
      add: (item) =>
        set((s) => ({
          items: [{ ...item, id: crypto.randomUUID(), addedAt: Date.now() }, ...s.items].slice(0, 20),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      setCustomer: (patch) => set((s) => ({ customer: { ...s.customer, ...patch } })),
    }),
    {
      name: "psl-quote-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, customer: s.customer }), // never persist functions
      skipHydration: true, // rehydrate after mount -> server HTML and first client render match
    },
  ),
);

/** Derived selectors (memo-free: they return primitives, so equality is cheap). */
export const selectCount = (s: QuoteState) => s.items.length;
export const selectCartTotal = (s: QuoteState) => s.items.reduce((sum, i) => sum + i.estimate.total, 0);

/**
 * True once the persisted cart has been loaded. Built on useSyncExternalStore over the
 * persist API's hydration events; server snapshot is `false`.
 */
export function useQuoteStoreHydrated(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const unsub = useQuoteStore.persist.onFinishHydration(notify);
      if (!useQuoteStore.persist.hasHydrated()) void useQuoteStore.persist.rehydrate();
      return unsub;
    },
    () => useQuoteStore.persist.hasHydrated(),
    () => false,
  );
}
