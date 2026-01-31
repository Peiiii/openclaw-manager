import { useMemo } from "react";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStatusStore } from "@/stores/status-store";

import { deriveOnboardingContext } from "./domain/context";

export function useOnboardingFlow() {
  const status = useStatusStore((state) => state.status);
  const loading = useStatusStore((state) => state.loading);

  const currentStep = useOnboardingStore((store) => store.currentStep);
  const systemStep = useOnboardingStore((store) => store.systemStep);
  const pendingStep = useOnboardingStore((store) => store.pendingStep);
  const pendingSince = useOnboardingStore((store) => store.pendingSince);
  const blockingReason = useOnboardingStore((store) => store.blockingReason);

  const context = useMemo(
    () =>
      deriveOnboardingContext({
        status,
        loading
      }),
    [status, loading]
  );

  return {
    context,
    flow: {
      currentStep,
      systemStep,
      pendingStep,
      pendingSince,
      blockingReason
    }
  };
}
