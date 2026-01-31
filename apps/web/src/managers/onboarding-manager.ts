import type { OnboardingContext } from "@/features/onboarding/domain/context";
import { syncFlowWithContext } from "@/features/onboarding/domain/flow-actions";
import type { OnboardingStep } from "@/features/onboarding/onboarding-steps";
import { useAiStore } from "@/stores/ai-store";
import { useCliStore } from "@/stores/cli-store";
import { useGatewayStore } from "@/stores/gateway-store";
import { usePairingStore } from "@/stores/pairing-store";
import { useProbeStore } from "@/stores/probe-store";
import { useTokenStore } from "@/stores/token-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export class OnboardingManager {
  handleStatusUpdate = (context: OnboardingContext) => {
    const onboarding = useOnboardingStore.getState();
    const previousPending = onboarding.pendingStep;
    const nextFlow = syncFlowWithContext(context);
    if (previousPending && !nextFlow.pendingStep) {
      clearPendingMessages(previousPending);
    }
  };
}

function clearPendingMessages(step: OnboardingStep) {
  if (step === "cli") {
    useCliStore.getState().setMessage("CLI 已确认，继续下一步。");
    return;
  }
  if (step === "ai") {
    useAiStore.getState().setMessage("AI 配置已确认。");
    return;
  }
  if (step === "probe") {
    useProbeStore.getState().setMessage("通道状态已确认。");
    return;
  }
  if (step === "token") {
    useTokenStore.getState().setMessage("Token 已确认。");
    return;
  }
  if (step === "pairing") {
    usePairingStore.getState().setMessage("配对已确认。");
    return;
  }
  if (step === "gateway") {
    useGatewayStore.getState().setMessage("网关状态已确认。");
  }
}
