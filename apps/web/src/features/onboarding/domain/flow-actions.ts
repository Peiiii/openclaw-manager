import { useOnboardingStore } from "@/stores/onboarding-store";

import type { OnboardingContext } from "./context";
import {
  requestOnboardingConfirmation,
  syncOnboardingFlow,
  type OnboardingFlowState
} from "./machine";
import type { OnboardingStep } from "../onboarding-steps";

export function getFlowState(): OnboardingFlowState {
  const flow = useOnboardingStore.getState();
  return {
    currentStep: flow.currentStep,
    systemStep: flow.systemStep,
    pendingStep: flow.pendingStep,
    pendingSince: flow.pendingSince,
    blockingReason: flow.blockingReason
  };
}

export function requestFlowConfirmation(step: OnboardingStep) {
  const nextFlow = requestOnboardingConfirmation(getFlowState(), step);
  useOnboardingStore.getState().setFlowState(nextFlow);
  return nextFlow;
}

export function syncFlowWithContext(context: OnboardingContext) {
  const nextFlow = syncOnboardingFlow(getFlowState(), context);
  useOnboardingStore.getState().setFlowState(nextFlow);
  return nextFlow;
}
