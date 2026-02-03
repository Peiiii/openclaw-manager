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
    const nextEvents = syncEventsFromContext(context, onboarding.events);
    if (nextEvents) {
      onboarding.setEvents(nextEvents);
    }
    const previousPending = onboarding.pendingStep;
    const nextFlow = syncFlowWithContext({
      ...context,
      gatewayVerified: nextEvents?.gatewayVerified ?? context.gatewayVerified,
      tokenConfirmed: nextEvents?.tokenConfirmed ?? context.tokenConfirmed,
      aiConfirmed: nextEvents?.aiConfirmed ?? context.aiConfirmed,
      pairingConfirmed: nextEvents?.pairingConfirmed ?? context.pairingConfirmed,
      probeConfirmed: nextEvents?.probeConfirmed ?? context.probeConfirmed
    });
    if (previousPending && !nextFlow.pendingStep) {
      clearPendingMessages(previousPending);
    }
  };
}

function syncEventsFromContext(
  context: OnboardingContext,
  current: {
    gatewayVerified: boolean;
    tokenConfirmed: boolean;
    aiConfirmed: boolean;
    pairingConfirmed: boolean;
    probeConfirmed: boolean;
  }
): Partial<typeof current> | null {
  const next: Partial<typeof current> = {};

  if (context.tokenConfigured !== current.tokenConfirmed) {
    next.tokenConfirmed = context.tokenConfigured;
  }
  if (!context.cliInstalled) {
    if (current.gatewayVerified) {
      next.gatewayVerified = false;
    }
  } else if (context.gatewayOk && !current.gatewayVerified) {
    next.gatewayVerified = true;
  }
  if (context.aiConfigured !== current.aiConfirmed) {
    next.aiConfirmed = context.aiConfigured;
  }
  if (context.probeOk !== current.probeConfirmed) {
    next.probeConfirmed = context.probeOk;
  }
  if (!context.tokenConfigured && current.pairingConfirmed) {
    next.pairingConfirmed = false;
  }

  return Object.keys(next).length ? next : null;
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
