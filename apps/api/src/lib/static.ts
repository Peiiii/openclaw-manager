import fs from "node:fs";
import path from "node:path";

export function serveStaticFile(reqPath: string, webRoot: string) {
  const relPath = reqPath === "/" ? "/index.html" : reqPath;
  const safePath = safeJoin(webRoot, relPath);
  if (!safePath) return new Response("Not Found", { status: 404 });

  const fileContent = readFileOrNull(safePath);
  if (fileContent) {
    return new Response(toArrayBuffer(fileContent), {
      headers: { "content-type": contentType(path.extname(safePath)) }
    });
  }

  if (relPath !== "/index.html") {
    const indexPath = path.join(webRoot, "index.html");
    const indexContent = readFileOrNull(indexPath);
    if (indexContent) {
      return new Response(toArrayBuffer(indexContent), {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }
  }

  return new Response("Not Found", { status: 404 });
}

function readFileOrNull(filePath: string): Uint8Array | null {
  try {
    return fs.readFileSync(filePath) as Uint8Array;
  } catch {
    return null;
  }
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

function safeJoin(root: string, reqPath: string) {
  const normalized = path.normalize(reqPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const resolved = path.join(root, normalized);
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

function contentType(ext: string) {
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".map":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".ico":
      return "image/x-icon";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}
