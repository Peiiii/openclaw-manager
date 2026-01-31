import { useMemo } from "react";

import { useAiStore } from "@/stores/ai-store";
import { useCliStore } from "@/stores/cli-store";
import { useGatewayStore } from "@/stores/gateway-store";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePairingStore } from "@/stores/pairing-store";
import { useProbeStore } from "@/stores/probe-store";
import { useResourceStore } from "@/stores/resource-store";
import { useStatusStore } from "@/stores/status-store";
import { useTokenStore } from "@/stores/token-store";

import { deriveOnboardingContext } from "./domain/context";
import { buildOnboardingViewModel } from "./domain/view-model";

export function useOnboardingViewModel() {
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);

  const currentStep = useOnboardingStore((store) => store.currentStep);
  const systemStep = useOnboardingStore((store) => store.systemStep);
  const pendingStep = useOnboardingStore((store) => store.pendingStep);
  const pendingSince = useOnboardingStore((store) => store.pendingSince);
  const blockingReason = useOnboardingStore((store) => store.blockingReason);
  const cliState = useCliStore((store) => store);
  const gatewayState = useGatewayStore((store) => store);
  const tokenState = useTokenStore((store) => store);
  const aiState = useAiStore((store) => store);
  const pairingState = usePairingStore((store) => store);
  const probeState = useProbeStore((store) => store);
  const resourceState = useResourceStore((store) => store);

  const cli = useJobsStore((store) => store.cli);
  const quickstart = useJobsStore((store) => store.quickstart);
  const pairing = useJobsStore((store) => store.pairing);
  const resource = useJobsStore((store) => store.resource);
  const aiAuth = useJobsStore((store) => store.aiAuth);

  const context = useMemo(
    () =>
      deriveOnboardingContext({
        status,
        loading
      }),
    [status, loading]
  );

  const viewModel = useMemo(
    () =>
      buildOnboardingViewModel({
        state: {
          currentStep,
          systemStep,
          pendingStep,
          pendingSince,
          blockingReason,
          cli: { message: cliState.message, isProcessing: cliState.isProcessing },
          gateway: {
            message: gatewayState.message,
            isProcessing: gatewayState.isProcessing,
            autoStarted: gatewayState.autoStarted
          },
          token: {
            value: tokenState.value,
            message: tokenState.message,
            isProcessing: tokenState.isProcessing
          },
          ai: {
            provider: aiState.provider,
            value: aiState.value,
            message: aiState.message,
            isProcessing: aiState.isProcessing
          },
          pairing: {
            value: pairingState.value,
            message: pairingState.message,
            isProcessing: pairingState.isProcessing
          },
          probe: {
            message: probeState.message,
            isProcessing: probeState.isProcessing
          },
          resource: {
            message: resourceState.message
          }
        },
        context,
        jobs: {
          cli,
          quickstart,
          pairing,
          resource,
          aiAuth
        }
      }),
    [
      currentStep,
      systemStep,
      pendingStep,
      pendingSince,
      blockingReason,
      cliState,
      gatewayState,
      tokenState,
      aiState,
      pairingState,
      probeState,
      resourceState,
      context,
      cli,
      quickstart,
      pairing,
      resource,
      aiAuth
    ]
  );

  return { context, viewModel };
}
