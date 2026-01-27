import net from "node:net";

import { sleep } from "./utils.js";

export type GatewayProbe = {
  ok: boolean;
  host: string;
  port: number;
  latencyMs: number | null;
  error: string | null;
};

export async function checkGateway(host: string, port: number): Promise<GatewayProbe> {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;

    const finish = (ok: boolean, error?: string) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve({
        ok,
        host,
        port,
        latencyMs: ok ? Date.now() - start : null,
        error: error ?? null
      });
    };

    socket.setTimeout(1200);

    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false, "timeout"));
    socket.once("error", (err) => finish(false, err.message));

    socket.connect(port, host);
  });
}

export async function waitForGateway(host: string, port: number, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await checkGateway(host, port);
    if (res.ok) return true;
    await sleep(400);
  }
  return false;
}
