import { create } from "zustand";

import { useConfigStore } from "@/stores/config-store";

export type AuthState = {
  authHeader: string | null;
  authRequired: boolean;
  setAuthHeader: (value: string | null) => void;
  setAuthRequired: (required: boolean) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  authHeader: null,
  authRequired: false,
  setAuthHeader: (value) => set({ authHeader: value }),
  setAuthRequired: (required) => set({ authRequired: required }),
  clearAuth: () => set({ authHeader: null, authRequired: false }),
  checkAuth: async () => {
    const { apiBase } = useConfigStore.getState();
    try {
      const res = await fetch(`${apiBase}/api/auth/status`);
      if (!res.ok) throw new Error(`Auth status failed: ${res.status}`);
      const data = (await res.json()) as { required?: boolean };
      set({ authRequired: Boolean(data.required) });
    } catch {
      set({ authRequired: true });
    }
  },
  login: async (username, password) => {
    const { apiBase } = useConfigStore.getState();
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) return data;
      const authHeader = buildBasicAuth(username, password);
      set({ authHeader, authRequired: true });
      await get().checkAuth();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}));

function buildBasicAuth(username: string, password: string) {
  const raw = `${username}:${password}`;
  const encoded = btoa(raw);
  return `Basic ${encoded}`;
}
