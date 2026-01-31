import { usePresenter } from "@/presenter/presenter-context";
import { useStatusStore } from "@/stores/status-store";

import type { OnboardingStep } from "../onboarding-steps";
import type { OnboardingViewModel } from "../domain/view-model";
import {
  useOnboardingFlow,
  useAutoStartGateway,
  useEnterKeySubmit,
  useStatusPolling
} from "../use-onboarding-effects";
import { useOnboardingViewModel } from "../use-onboarding-view-model";

export function OnboardingOrchestrator() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const { context, viewModel } = useOnboardingViewModel();

  useStatusPolling(presenter.status.refresh, viewModel.jobsRunning);
  useAutoStartGateway({
    autoStarted: viewModel.gateway.autoStarted,
    hasStatus: Boolean(status),
    cliInstalled: context.cliInstalled,
    quickstartRunning: viewModel.gateway.jobStatus === "running",
    gatewayOk: context.gatewayOk,
    startGateway: presenter.gateway.autoStart
  });
  useOnboardingFlow({
    hasStatus: Boolean(status),
    context,
    onStatusUpdate: presenter.onboarding.handleStatusUpdate
  });
  useEnterKeySubmit({
    currentStep: viewModel.currentStep,
    cliInstalled: context.cliInstalled,
    tokenInput: viewModel.token.value,
    aiKeyInput: viewModel.ai.value,
    pairingInput: viewModel.pairing.value,
    isProcessing: resolveProcessing(viewModel, viewModel.currentStep),
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

function resolveProcessing(viewModel: OnboardingViewModel, step: OnboardingStep) {
  if (step === "cli") return viewModel.cli.isProcessing;
  if (step === "gateway") return viewModel.gateway.isProcessing;
  if (step === "token") return viewModel.token.isProcessing;
  if (step === "ai") return viewModel.ai.isProcessing;
  if (step === "pairing") return viewModel.pairing.isProcessing;
  if (step === "probe") return viewModel.probe.isProcessing;
  return false;
}
