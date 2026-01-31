import { Card } from "@/components/ui/card";
import { WizardSidebar, MobileProgress } from "@/components/wizard-sidebar";
import { useStatusStore } from "@/stores/status-store";

import { OnboardingOrchestrator } from "./containers/onboarding-orchestrator";
import { OnboardingStepRenderer } from "./containers/onboarding-step-renderer";
import { getOnboardingStepMeta } from "./onboarding-steps";
import type { OnboardingBlockingReason } from "./domain/machine";
import { useOnboardingFlow } from "./use-onboarding-flow";

export function OnboardingPage() {
  const status = useStatusStore((state) => state.status);
  const error = useStatusStore((state) => state.error);
  const { flow } = useOnboardingFlow();
  const blockingMessage = buildBlockingMessage(flow.blockingReason);

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <OnboardingOrchestrator />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-hero-pattern opacity-90" />
        <div className="absolute left-[-20%] top-[-10%] h-96 w-96 rounded-full bg-accent/15 blur-[150px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full bg-accent-2/20 blur-[140px]" />
      </div>

      <WizardSidebar currentStep={flow.currentStep} isConnected={Boolean(status)} error={error} />

      <main className="relative flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <MobileProgress currentStep={flow.currentStep} />

          {blockingMessage ? (
            <div className="mb-4 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
              {blockingMessage}
            </div>
          ) : null}

          <Card className="animate-fade-up overflow-hidden">
            <OnboardingStepRenderer currentStep={flow.currentStep} />
          </Card>
        </div>
      </main>
    </div>
  );
}

function buildBlockingMessage(reason: OnboardingBlockingReason | null) {
  if (!reason) return null;
  if (reason.type === "pending-confirmation") {
    const step = getOnboardingStepMeta(reason.step);
    return `正在等待系统确认「${step.label}」。确认完成后会自动进入下一步。`;
  }
  if (reason.type === "system-behind") {
    const expected = getOnboardingStepMeta(reason.expectedStep);
    const current = getOnboardingStepMeta(reason.currentStep);
    return `系统仍停留在「${expected.label}」，当前已进入「${current.label}」。流程不会回退，但需要该步骤完成确认才能继续。`;
  }
  return null;
}
