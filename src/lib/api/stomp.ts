/**
 * Minimal STOMP 1.2 client over a native WebSocket (enough for SUBSCRIBE to a Spring
 * simple-broker topic such as /topic/work-orders). No dependency; frames are text:
 *   COMMAND\nheader:value\n\nbody\0
 */
export type StompStatus = "connecting" | "live" | "closed";

export interface StompHandle {
  close: () => void;
}

function frame(command: string, headers: Record<string, string>, body = ""): string {
  const head = Object.entries(headers)
    .map(([k, v]) => `${k}:${v}`)
    .join("\n");
  return `${command}\n${head}\n\n${body}\0`;
}

export function connectStomp(
  url: string,
  destination: string,
  onMessage: (body: string) => void,
  onStatus: (s: StompStatus) => void,
): StompHandle {
  let ws: WebSocket;
  try {
    ws = new WebSocket(url, ["v12.stomp"]);
  } catch {
    onStatus("closed");
    return { close: () => undefined };
  }
  let closedByUs = false;
  onStatus("connecting");

  ws.onopen = () => {
    ws.send(frame("CONNECT", { "accept-version": "1.2", host: new URL(url).host, "heart-beat": "0,0" }));
  };
  ws.onmessage = (ev) => {
    if (typeof ev.data !== "string") return;
    for (const raw of ev.data.split("\0")) {
      const text = raw.replace(/^\n+/, "");
      if (!text) continue;
      const [head, ...rest] = text.split("\n\n");
      const command = head.split("\n")[0];
      if (command === "CONNECTED") {
        onStatus("live");
        ws.send(frame("SUBSCRIBE", { id: "sub-0", destination, ack: "auto" }));
      } else if (command === "MESSAGE") {
        onMessage(rest.join("\n\n"));
      } else if (command === "ERROR") {
        ws.close();
      }
    }
  };
  ws.onerror = () => onStatus("closed");
  ws.onclose = () => {
    if (!closedByUs) onStatus("closed");
  };

  return {
    close: () => {
      closedByUs = true;
      if (ws.readyState === WebSocket.OPEN) ws.send(frame("DISCONNECT", {}));
      ws.close();
    },
  };
}
