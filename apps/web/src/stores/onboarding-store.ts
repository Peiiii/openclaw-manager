import { create } from "zustand";

import type { OnboardingBlockingReason } from "@/features/onboarding/domain/machine";
import type { OnboardingStep } from "@/features/onboarding/onboarding-steps";

type OnboardingState = {
  currentStep: OnboardingStep;
  systemStep: OnboardingStep;
  pendingStep: OnboardingStep | null;
  pendingSince: string | null;
  blockingReason: OnboardingBlockingReason | null;
  setFlowState: (flow: {
    currentStep: OnboardingStep;
    systemStep: OnboardingStep;
    pendingStep: OnboardingStep | null;
    pendingSince: string | null;
    blockingReason: OnboardingBlockingReason | null;
  }) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: "cli",
  systemStep: "cli",
  pendingStep: null,
  pendingSince: null,
  blockingReason: null,
  setFlowState: (flow) =>
    set(() => ({
      currentStep: flow.currentStep,
      systemStep: flow.systemStep,
      pendingStep: flow.pendingStep,
      pendingSince: flow.pendingSince,
      blockingReason: flow.blockingReason
    }))
}));
