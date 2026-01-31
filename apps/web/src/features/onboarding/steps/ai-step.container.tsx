import { AiStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useAiStore } from "@/stores/ai-store";
import { useJobsStore } from "@/stores/jobs-store";
import { useOnboardingFlow } from "../use-onboarding-flow";

export function AiStepContainer() {
  const presenter = usePresenter();
  const { context } = useOnboardingFlow();
  const provider = useAiStore((state) => state.provider);
  const value = useAiStore((state) => state.value);
  const isProcessing = useAiStore((state) => state.isProcessing);
  const message = useAiStore((state) => state.message);
  const logs = useJobsStore((state) => state.aiAuth.logs);
  const jobStatus = useJobsStore((state) => state.aiAuth.status);
  const jobError = useJobsStore((state) => state.aiAuth.error);

  return (
    <AiStep
      provider={provider}
      value={value}
      onProviderChange={presenter.ai.setProvider}
      onChange={presenter.ai.setValue}
      onSubmit={presenter.ai.submit}
      isProcessing={isProcessing}
      message={message}
      configured={context.aiConfigured}
      missingProviders={context.aiMissingProviders}
      logs={logs}
      jobStatus={jobStatus}
      jobError={jobError}
      statusError={context.aiStatusError}
    />
  );
}
