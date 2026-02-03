import { useAuthStore } from "@/stores/auth-store";
import { getDefaultApiBase, useConfigStore } from "@/stores/config-store";

export function getApiBase() {
  return useConfigStore.getState().apiBase;
}

export function getAuthHeader() {
  return useAuthStore.getState().authHeader;
}

export function buildApiUrl(path: string) {
  return `${getApiBase()}${path}`;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const authHeader = getAuthHeader();
  const headers = new Headers(init.headers ?? {});
  if (authHeader && !headers.has("authorization")) {
    headers.set("authorization", authHeader);
  }
  const request = () =>
    fetch(buildApiUrl(path), {
      ...init,
      headers,
      credentials: "include"
    });

  try {
    return await request();
  } catch (err) {
    if (!(err instanceof TypeError)) throw err;
    const currentBase = getApiBase();
    const fallbackBase = getDefaultApiBase();
    if (currentBase !== fallbackBase) {
      useConfigStore.getState().setApiBase(fallbackBase);
      return await request();
    }
    throw err;
  }
}
