import { create } from "zustand";

export type CommandEntry = {
  id: string;
  title: string;
  description: string;
  command: string;
  cwd: string;
  allowRun: boolean;
};

export type ProcessEntry = {
  id: string;
  title: string;
  command: string;
  cwd: string;
  running: boolean;
  pid: number | null;
  startedAt: string | null;
  exitCode: number | null;
  lastLines: string[];
};

export type StatusResponse = {
  ok: boolean;
  now: string;
  system: {
    node: {
      current: string;
      required: string;
      ok: boolean;
    };
    platform: string;
    arch: string;
  };
  cli: {
    installed: boolean;
    path: string | null;
    version: string | null;
    command: string;
    packageName: string;
    displayName: string;
  };
  gateway: {
    ok: boolean;
    host: string;
    port: number;
    latencyMs: number | null;
    error: string | null;
  };
  onboarding?: {
    discord: {
      tokenConfigured: boolean;
      allowFromConfigured: boolean;
      pendingPairings: number;
    };
    ai?: {
      configured: boolean;
      missingProviders: string[];
      error?: string | null;
    };
    probe: { ok: boolean; at: string } | null;
  };
  commands: CommandEntry[];
  processes: ProcessEntry[];
};

type StatusState = {
  status: StatusResponse | null;
  commands: CommandEntry[];
  processes: ProcessEntry[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  setStatusData: (data: StatusResponse) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  clearStatus: () => void;
};

export const useStatusStore = create<StatusState>((set) => ({
  status: null,
  commands: [],
  processes: [],
  loading: false,
  error: null,
  lastUpdated: null,
  setStatusData: (data) =>
    set({
      status: data,
      commands: data.commands,
      processes: data.processes,
      lastUpdated: data.now,
      loading: false,
      error: null
    }),
  setLoading: (value) => set({ loading: value }),
  setError: (value) => set({ error: value }),
  clearStatus: () =>
    set({
      status: null,
      commands: [],
      processes: [],
      lastUpdated: null
    })
}));
