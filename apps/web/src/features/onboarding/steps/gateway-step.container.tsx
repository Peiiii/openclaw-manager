import { GatewayStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useGatewayStore } from "@/stores/gateway-store";
import { useJobsStore } from "@/stores/jobs-store";
import { useStatusStore } from "@/stores/status-store";

export function GatewayStepContainer() {
  const presenter = usePresenter();
  const status = useStatusStore((state) => state.status);
  const job = useJobsStore((state) => state.quickstart);
  const message = useGatewayStore((state) => state.message);
  const isProcessing = useGatewayStore((state) => state.isProcessing);
  const autoStarted = useGatewayStore((state) => state.autoStarted);

  const isReady = Boolean(status?.gateway.ok);

  return (
    <GatewayStep
      isReady={isReady}
      autoStarted={autoStarted}
      message={message}
      isProcessing={isProcessing}
      logs={job.logs}
      jobStatus={job.status}
      jobError={job.error}
      onRetry={presenter.gateway.retry}
    />
  );
}
