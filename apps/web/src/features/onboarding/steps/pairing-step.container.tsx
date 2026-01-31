import { PairingStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { usePairingStore } from "@/stores/pairing-store";
import { useOnboardingFlow } from "../use-onboarding-flow";

export function PairingStepContainer() {
  const presenter = usePresenter();
  const { context } = useOnboardingFlow();
  const value = usePairingStore((state) => state.value);
  const message = usePairingStore((state) => state.message);
  const isProcessing = usePairingStore((state) => state.isProcessing);
  const logs = useJobsStore((state) => state.pairing.logs);
  const jobStatus = useJobsStore((state) => state.pairing.status);
  const jobError = useJobsStore((state) => state.pairing.error);

  return (
    <PairingStep
      value={value}
      onChange={presenter.pairing.setValue}
      onSubmit={presenter.pairing.submit}
      isProcessing={isProcessing}
      message={message}
      pendingPairings={context.pendingPairings}
      logs={logs}
      jobStatus={jobStatus}
      jobError={jobError}
    />
  );
}
