import { CompleteStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useJobsStore } from "@/stores/jobs-store";
import { useResourceStore } from "@/stores/resource-store";
import { useOnboardingFlow } from "../use-onboarding-flow";

export function CompleteStepContainer() {
  const presenter = usePresenter();
  const { context } = useOnboardingFlow();
  const resourceMessage = useResourceStore((state) => state.message);
  const resourceLogs = useJobsStore((state) => state.resource.logs);
  const resourceJobStatus = useJobsStore((state) => state.resource.status);
  const resourceError = useJobsStore((state) => state.resource.error);

  return (
    <CompleteStep
      probeOk={context.probeOk}
      onDownloadResource={presenter.resource.download}
      resourceLogs={resourceLogs}
      resourceJobStatus={resourceJobStatus}
      resourceMessage={resourceMessage}
      resourceError={resourceError}
    />
  );
}
