import { usePresenter } from "@/presenter/presenter-context";
import { useAiStore } from "@/stores/ai-store";
import { useCliStore } from "@/stores/cli-store";
import { useGatewayStore } from "@/stores/gateway-store";
import { usePairingStore } from "@/stores/pairing-store";
import { useProbeStore } from "@/stores/probe-store";
import { useStatusStore } from "@/stores/status-store";
import { useTokenStore } from "@/stores/token-store";
import { useJobsStore } from "@/stores/jobs-store";

import type { OnboardingStep } from "../onboarding-steps";
import {
  useAutoStartGateway,
  useEnterKeySubmit,
  useStatusPolling,
  useOnboardingFlow as useOnboardingFlowEffect
} from "../use-onboarding-effects";
import { useOnboardingFlow } from "../use-onboarding-flow";
import { useJobsRunning } from "../use-jobs-running";

export function OnboardingOrchestrator() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const { context, flow } = useOnboardingFlow();
  const jobsRunning = useJobsRunning();
  const quickstartStatus = useJobsStore((state) => state.quickstart.status);
  const cliProcessing = useCliStore((state) => state.isProcessing);
  const gatewayState = useGatewayStore((state) => state);
  const tokenValue = useTokenStore((state) => state.value);
  const tokenProcessing = useTokenStore((state) => state.isProcessing);
  const aiValue = useAiStore((state) => state.value);
  const aiProcessing = useAiStore((state) => state.isProcessing);
  const pairingValue = usePairingStore((state) => state.value);
  const pairingProcessing = usePairingStore((state) => state.isProcessing);
  const probeProcessing = useProbeStore((state) => state.isProcessing);

  useStatusPolling(presenter.status.refresh, jobsRunning);
  useAutoStartGateway({
    autoStarted: gatewayState.autoStarted,
    hasStatus: Boolean(status),
    cliInstalled: context.cliInstalled,
    quickstartRunning: quickstartStatus === "running",
    gatewayOk: context.gatewayOk,
    startGateway: presenter.gateway.autoStart
  });
  useOnboardingFlowEffect({
    hasStatus: Boolean(status),
    context,
    onStatusUpdate: presenter.onboarding.handleStatusUpdate
  });
  useEnterKeySubmit({
    currentStep: flow.currentStep,
    cliInstalled: context.cliInstalled,
    tokenInput: tokenValue,
    aiKeyInput: aiValue,
    pairingInput: pairingValue,
    isProcessing: resolveProcessing(flow.currentStep, {
      cliProcessing,
      gatewayProcessing: gatewayState.isProcessing,
      tokenProcessing,
      aiProcessing,
      pairingProcessing,
      probeProcessing
    }),
    actions: {
      installCli: presenter.cli.install,
      submitToken: presenter.token.submit,
      submitAi: presenter.ai.submit,
      submitPairing: presenter.pairing.submit,
      runProbe: presenter.probe.run
    }
  });

  return null;
}

function resolveProcessing(
  step: OnboardingStep,
  params: {
    cliProcessing: boolean;
    gatewayProcessing: boolean;
    tokenProcessing: boolean;
    aiProcessing: boolean;
    pairingProcessing: boolean;
    probeProcessing: boolean;
  }
) {
  if (step === "cli") return params.cliProcessing;
  if (step === "gateway") return params.gatewayProcessing;
  if (step === "token") return params.tokenProcessing;
  if (step === "ai") return params.aiProcessing;
  if (step === "pairing") return params.pairingProcessing;
  if (step === "probe") return params.probeProcessing;
  return false;
}
