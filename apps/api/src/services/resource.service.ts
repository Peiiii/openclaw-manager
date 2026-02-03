import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";

export type DownloadOptions = {
  url: string;
  filename?: string;
  dir?: string;
};

export async function downloadResource(options: DownloadOptions, onLog: (line: string) => void) {
  const url = options.url.trim();
  if (!url) throw new Error("resource url missing");

  const targetDir = options.dir ?? path.join(os.homedir(), ".clawdbot-manager", "resources");
  const safeName = options.filename?.trim() || path.basename(new URL(url).pathname) || "resource.bin";
  const targetPath = path.join(targetDir, safeName);

  fs.mkdirSync(targetDir, { recursive: true });
  onLog(`Starting download: ${url}`);
  onLog(`Save path: ${targetPath}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`download failed: ${res.status}`);
  }
  if (!res.body) {
    throw new Error("empty response body");
  }

  const total = Number(res.headers.get("content-length") ?? "0");
  if (total > 0) {
    onLog(`Content size: ${(total / 1024 / 1024).toFixed(2)} MB`);
  }

  const readable = Readable.fromWeb(res.body as unknown as ReadableStream);
  let received = 0;
  let lastLogged = 0;

  readable.on("data", (chunk: Buffer) => {
    received += chunk.length;
    if (received - lastLogged >= 1024 * 1024) {
      lastLogged = received;
      if (total > 0) {
        const percent = ((received / total) * 100).toFixed(1);
        onLog(`Download progress: ${percent}%`);
      } else {
        onLog(`Downloaded: ${(received / 1024 / 1024).toFixed(2)} MB`);
      }
    }
  });

  await pipeline(readable, fs.createWriteStream(targetPath));
  onLog("Download complete.");

  return { path: targetPath };
}
