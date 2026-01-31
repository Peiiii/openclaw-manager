import type { JobState } from "@/stores/jobs-store";

import type { OnboardingContext } from "./context";
import type { OnboardingBlockingReason } from "./machine";
import type { OnboardingStep } from "../onboarding-steps";

type JobBundle = {
  cli: JobState<{ version?: string | null }>;
  quickstart: JobState<{ gatewayReady?: boolean; probeOk?: boolean }>;
  pairing: JobState<{ code?: string }>;
  resource: JobState<{ path?: string }>;
  aiAuth: JobState<{ provider?: string }>;
};

export type OnboardingViewModel = {
  currentStep: OnboardingStep;
  systemStep: OnboardingStep;
  pendingStep: OnboardingStep | null;
  pendingSince: string | null;
  blockingReason: OnboardingBlockingReason | null;
  jobsRunning: boolean;
  cli: {
    installed: boolean;
    version: string | null;
    isChecking: boolean;
    isProcessing: boolean;
    message: string | null;
    logs: string[];
    jobStatus: JobState["status"];
    jobError: string | null;
  };
  gateway: {
    isReady: boolean;
    autoStarted: boolean;
    message: string | null;
    isProcessing: boolean;
    logs: string[];
    jobStatus: JobState["status"];
    jobError: string | null;
  };
  token: {
    value: string;
    isProcessing: boolean;
    message: string | null;
  };
  ai: {
    provider: string;
    value: string;
    isProcessing: boolean;
    message: string | null;
    configured: boolean;
    missingProviders: string[];
    logs: string[];
    jobStatus: JobState["status"];
    jobError: string | null;
    statusError: string | null;
  };
  pairing: {
    value: string;
    isProcessing: boolean;
    message: string | null;
    pendingPairings: number;
    logs: string[];
    jobStatus: JobState["status"];
    jobError: string | null;
  };
  probe: {
    isProcessing: boolean;
    message: string | null;
    logs: string[];
    jobStatus: JobState["status"];
    jobError: string | null;
  };
  complete: {
    probeOk: boolean;
    resourceLogs: string[];
    resourceJobStatus: JobState["status"];
    resourceMessage: string | null;
    resourceError: string | null;
  };
};

export function buildOnboardingViewModel(params: {
  state: {
    currentStep: OnboardingStep;
    systemStep: OnboardingStep;
    pendingStep: OnboardingStep | null;
    pendingSince: string | null;
    blockingReason: OnboardingBlockingReason | null;
    cli: { isProcessing: boolean; message: string | null };
    gateway: { isProcessing: boolean; message: string | null; autoStarted: boolean };
    token: { value: string; isProcessing: boolean; message: string | null };
    ai: { provider: string; value: string; isProcessing: boolean; message: string | null };
    pairing: { value: string; isProcessing: boolean; message: string | null };
    probe: { isProcessing: boolean; message: string | null };
    resource: { message: string | null };
  };
  context: OnboardingContext;
  jobs: JobBundle;
}): OnboardingViewModel {
  const { state, context, jobs } = params;
  const jobsRunning =
    jobs.cli.status === "running" ||
    jobs.quickstart.status === "running" ||
    jobs.pairing.status === "running" ||
    jobs.resource.status === "running" ||
    jobs.aiAuth.status === "running";

  return {
    currentStep: state.currentStep,
    systemStep: state.systemStep,
    pendingStep: state.pendingStep,
    pendingSince: state.pendingSince,
    blockingReason: state.blockingReason,
    jobsRunning,
    cli: {
      installed: context.cliInstalled,
      version: context.cliVersion,
      isChecking: context.cliChecking,
      isProcessing: state.cli.isProcessing,
      message: state.cli.message,
      logs: jobs.cli.logs,
      jobStatus: jobs.cli.status,
      jobError: jobs.cli.error
    },
    gateway: {
      isReady: context.gatewayOk,
      autoStarted: state.gateway.autoStarted,
      message: state.gateway.message,
      isProcessing: state.gateway.isProcessing,
      logs: jobs.quickstart.logs,
      jobStatus: jobs.quickstart.status,
      jobError: jobs.quickstart.error
    },
    token: {
      value: state.token.value,
      isProcessing: state.token.isProcessing,
      message: state.token.message
    },
    ai: {
      provider: state.ai.provider,
      value: state.ai.value,
      isProcessing: state.ai.isProcessing,
      message: state.ai.message,
      configured: context.aiConfigured,
      missingProviders: context.aiMissingProviders,
      logs: jobs.aiAuth.logs,
      jobStatus: jobs.aiAuth.status,
      jobError: jobs.aiAuth.error,
      statusError: context.aiStatusError
    },
    pairing: {
      value: state.pairing.value,
      isProcessing: state.pairing.isProcessing,
      message: state.pairing.message,
      pendingPairings: context.pendingPairings,
      logs: jobs.pairing.logs,
      jobStatus: jobs.pairing.status,
      jobError: jobs.pairing.error
    },
    probe: {
      isProcessing: state.probe.isProcessing,
      message: state.probe.message,
      logs: jobs.quickstart.logs,
      jobStatus: jobs.quickstart.status,
      jobError: jobs.quickstart.error
    },
    complete: {
      probeOk: context.probeOk,
      resourceLogs: jobs.resource.logs,
      resourceJobStatus: jobs.resource.status,
      resourceMessage: state.resource.message,
      resourceError: jobs.resource.error
    }
  };
}
