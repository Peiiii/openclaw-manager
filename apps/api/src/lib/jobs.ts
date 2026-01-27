import crypto from "node:crypto";

export type JobStatus = "pending" | "running" | "success" | "failed";

export type JobEvent =
  | { type: "log"; message: string }
  | { type: "status"; status: JobStatus }
  | { type: "done"; result?: Record<string, unknown> }
  | { type: "error"; error: string };

export type JobRecord = {
  id: string;
  title: string;
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  logs: string[];
  error: string | null;
  result: Record<string, unknown> | null;
};

type JobEntry = JobRecord & { expiresAt: number | null };

type JobSubscriber = (event: JobEvent) => void;

type JobStore = {
  createJob: (title: string) => JobRecord;
  startJob: (id: string) => void;
  appendLog: (id: string, message: string) => void;
  completeJob: (id: string, result?: Record<string, unknown>) => void;
  failJob: (id: string, error: string) => void;
  getJob: (id: string) => JobRecord | null;
  subscribe: (id: string, listener: JobSubscriber) => () => void;
};

const MAX_LOGS = 200;
const JOB_TTL_MS = 10 * 60 * 1000;

export function createJobStore(): JobStore {
  const jobs = new Map<string, JobEntry>();
  const listeners = new Map<string, Set<JobSubscriber>>();

  const cleanup = () => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
      if (job.expiresAt && job.expiresAt <= now) {
        jobs.delete(id);
        listeners.delete(id);
      }
    }
  };

  const emit = (id: string, event: JobEvent) => {
    const subs = listeners.get(id);
    if (!subs || subs.size === 0) return;
    for (const listener of subs) {
      listener(event);
    }
  };

  const getOrThrow = (id: string) => {
    const job = jobs.get(id);
    if (!job) return null;
    return job;
  };

  return {
    createJob: (title) => {
      cleanup();
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const entry: JobEntry = {
        id,
        title,
        status: "pending",
        createdAt: now,
        startedAt: null,
        endedAt: null,
        logs: [],
        error: null,
        result: null,
        expiresAt: null
      };
      jobs.set(id, entry);
      return { ...entry };
    },
    startJob: (id) => {
      const job = getOrThrow(id);
      if (!job) return;
      job.status = "running";
      job.startedAt = new Date().toISOString();
      emit(id, { type: "status", status: job.status });
    },
    appendLog: (id, message) => {
      const job = getOrThrow(id);
      if (!job) return;
      if (!message.trim()) return;
      job.logs.push(message.slice(0, 2000));
      if (job.logs.length > MAX_LOGS) {
        job.logs.splice(0, job.logs.length - MAX_LOGS);
      }
      emit(id, { type: "log", message });
    },
    completeJob: (id, result) => {
      const job = getOrThrow(id);
      if (!job) return;
      job.status = "success";
      job.endedAt = new Date().toISOString();
      job.result = result ?? null;
      job.expiresAt = Date.now() + JOB_TTL_MS;
      emit(id, { type: "status", status: job.status });
      emit(id, { type: "done", result: job.result ?? undefined });
    },
    failJob: (id, error) => {
      const job = getOrThrow(id);
      if (!job) return;
      job.status = "failed";
      job.endedAt = new Date().toISOString();
      job.error = error;
      job.expiresAt = Date.now() + JOB_TTL_MS;
      emit(id, { type: "status", status: job.status });
      emit(id, { type: "error", error });
    },
    getJob: (id) => {
      cleanup();
      const job = jobs.get(id);
      if (!job) return null;
      return { ...job };
    },
    subscribe: (id, listener) => {
      const job = jobs.get(id);
      if (!job) return () => {};
      const set = listeners.get(id) ?? new Set<JobSubscriber>();
      set.add(listener);
      listeners.set(id, set);
      return () => {
        const current = listeners.get(id);
        if (!current) return;
        current.delete(listener);
        if (current.size === 0) {
          listeners.delete(id);
        }
      };
    }
  };
}
