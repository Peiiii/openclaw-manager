import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./language-switcher";
import type { OnboardingStep } from "@/features/onboarding/onboarding-steps";

const STEP_IDS: OnboardingStep[] = [
  "cli",
  "gateway", 
  "token",
  "ai",
  "pairing",
  "probe",
  "complete"
];

interface WizardSidebarProps {
    currentStep: OnboardingStep;
    isConnected: boolean;
    error?: string | null;
}

export function WizardSidebar({ currentStep, isConnected, error }: WizardSidebarProps) {
    const { t } = useTranslation();
    const currentStepIndex = STEP_IDS.findIndex((s) => s === currentStep);

    return (
        <aside className="relative hidden md:flex w-80 shrink-0 flex-col border-r border-line/40 bg-white/40 backdrop-blur-xl p-8">
            {/* Branding */}
            <div className="mb-10">
                <h1 className="text-xl font-semibold tracking-tight">{t("app.name")}</h1>
                <p className="mt-1 text-sm text-muted">{t("app.subtitle")}</p>
            </div>

            {/* Step list */}
            <nav className="flex-1 space-y-2">
                {STEP_IDS.map((stepId, idx) => {
                    const isFinal = currentStep === "complete" && idx === currentStepIndex;
                    const isCompleted = idx < currentStepIndex || isFinal;
                    const isCurrent = idx === currentStepIndex && !isFinal;

                    return (
                        <div
                            key={stepId}
                            className={cn(
                                "relative flex gap-4 rounded-2xl p-4 transition-all duration-300",
                                isCurrent && "bg-accent/10",
                                isCompleted && "opacity-60"
                            )}
                        >
                            {/* Vertical line connector */}
                            {idx < STEP_IDS.length - 1 && (
                                <div
                                    className={cn(
                                        "absolute left-[2.25rem] top-[3.5rem] w-0.5 h-8 transition-all duration-300",
                                        isCompleted ? "bg-success" : "bg-line/50"
                                    )}
                                />
                            )}
                            {/* Step number */}
                            <div
                                className={cn(
                                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                                    isCompleted
                                        ? "bg-success text-white"
                                        : isCurrent
                                            ? "bg-accent text-white shadow-lg shadow-accent/30"
                                            : "border-2 border-line/50 bg-white text-muted"
                                )}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : idx + 1}
                            </div>
                            {/* Step text */}
                            <div className="flex-1 min-w-0">
                                <div
                                    className={cn(
                                        "text-sm font-semibold transition-colors",
                                        isCurrent ? "text-accent" : isCompleted ? "text-success" : "text-muted"
                                    )}
                                >
                                    {t(`steps.${stepId}.label`)}
                                </div>
                                <div className="mt-0.5 text-xs text-muted truncate">{t(`steps.${stepId}.description`)}</div>
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Footer status */}
            <div className="pt-6 border-t border-line/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <span
                            className={cn(
                                "h-2 w-2 rounded-full",
                                isConnected ? "bg-success animate-pulse" : "bg-danger"
                            )}
                        />
                        <span>{isConnected ? t("status.connected") : t("status.connecting")}</span>
                    </div>
                    <LanguageSwitcher />
                </div>
                {error && <div className="mt-2 text-xs text-danger">{error}</div>}
            </div>
        </aside>
    );
}

interface MobileProgressProps {
    currentStep: OnboardingStep;
}

export function MobileProgress({ currentStep }: MobileProgressProps) {
    const { t } = useTranslation();
    const currentStepIndex = STEP_IDS.findIndex((s) => s === currentStep);
    const totalSteps = STEP_IDS.length;
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;

    return (
        <div className="md:hidden mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink">
                    {t(`steps.${currentStep}.label`)}
                </span>
                <span className="text-xs text-muted">
                    {currentStepIndex + 1} / {totalSteps}
                </span>
            </div>
            <div className="h-2 bg-line/30 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
