import { Card } from "@/components/ui/card";
import { WizardSidebar, MobileProgress } from "@/components/wizard-sidebar";
import { useStatusStore } from "@/stores/status-store";
import { useTranslation } from "react-i18next";

import { OnboardingOrchestrator } from "./containers/onboarding-orchestrator";
import { OnboardingStepRenderer } from "./containers/onboarding-step-renderer";
import type { OnboardingBlockingReason } from "./domain/machine";
import { useOnboardingFlow } from "./use-onboarding-flow";

export function OnboardingPage() {
  const { t } = useTranslation();
  const status = useStatusStore((state) => state.status);
  const error = useStatusStore((state) => state.error);
  const { flow } = useOnboardingFlow();
  const blockingMessage = buildBlockingMessage(flow.blockingReason, t);

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

function buildBlockingMessage(reason: OnboardingBlockingReason | null, t: any) {
  if (!reason) return null;
  if (reason.type === "pending-confirmation") {
    return t("blocking.pendingConfirmation");
  }
  return null;
}
