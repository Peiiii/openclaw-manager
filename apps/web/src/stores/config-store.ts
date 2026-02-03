import { create } from "zustand";
import { persist } from "zustand/middleware";

const LEGACY_DEFAULT_API_BASE = "http://127.0.0.1:17321";
const DEFAULT_API_BASE = resolveDefaultApiBase();

export type ConfigState = {
  apiBase: string;
  gatewayHost: string;
  gatewayPort: string;
  setApiBase: (value: string) => void;
  setGatewayHost: (value: string) => void;
  setGatewayPort: (value: string) => void;
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      apiBase: DEFAULT_API_BASE,
      gatewayHost: "127.0.0.1",
      gatewayPort: "18789",
      setApiBase: (value) => set({ apiBase: normalizeBase(value) }),
      setGatewayHost: (value) => set({ gatewayHost: value.trim() }),
      setGatewayPort: (value) => set({ gatewayPort: value.trim() })
    }),
    {
      name: "clawdbot-manager-ui",
      version: 4,
      partialize: (state) => ({
        apiBase: state.apiBase,
        gatewayHost: state.gatewayHost,
        gatewayPort: state.gatewayPort
      }),
      migrate: (state) => {
        const data = (state ?? {}) as {
          apiBase?: string;
          gatewayHost?: string;
          gatewayPort?: string;
        };
        const storedBase = data.apiBase ? normalizeBase(data.apiBase) : null;
        const defaultBase = DEFAULT_API_BASE;
        const resolvedBase =
          storedBase && storedBase !== LEGACY_DEFAULT_API_BASE ? storedBase : defaultBase;
        return {
          apiBase: resolvedBase,
          gatewayHost: data.gatewayHost ?? "127.0.0.1",
          gatewayPort: data.gatewayPort ?? "18789"
        };
      }
    }
  )
);

export function getDefaultApiBase() {
  return DEFAULT_API_BASE;
}

function resolveDefaultApiBase() {
  const envBase =
    import.meta.env.VITE_MANAGER_API_URL ?? import.meta.env.VITE_ONBOARDING_API_URL;
  if (envBase) return normalizeBase(envBase);
  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeBase(window.location.origin);
  }
  return LEGACY_DEFAULT_API_BASE;
}

function normalizeBase(value: string) {
  return value.trim().replace(/\/+$/, "");
}
