import { ProbeStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useProbeStore } from "@/stores/probe-store";

export function ProbeStepContainer() {
  const presenter = usePresenter();
  const message = useProbeStore((state) => state.message);
  const isProcessing = useProbeStore((state) => state.isProcessing);
  const logs = useJobsStore((state) => state.quickstart.logs);
  const jobStatus = useJobsStore((state) => state.quickstart.status);
  const jobError = useJobsStore((state) => state.quickstart.error);

  return (
    <ProbeStep
      isProcessing={isProcessing}
      message={message}
      logs={logs}
      jobStatus={jobStatus}
      jobError={jobError}
      onRetry={presenter.probe.run}
    />
  );
}
