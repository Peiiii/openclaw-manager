import { CompleteStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useOnboardingViewModel } from "../use-onboarding-view-model";

export function CompleteStepContainer() {
  const presenter = usePresenter();
  const { viewModel } = useOnboardingViewModel();

  return (
    <CompleteStep
      probeOk={viewModel.complete.probeOk}
      onDownloadResource={presenter.resource.download}
      resourceLogs={viewModel.complete.resourceLogs}
      resourceJobStatus={viewModel.complete.resourceJobStatus}
      resourceMessage={viewModel.complete.resourceMessage}
      resourceError={viewModel.complete.resourceError}
    />
  );
}
