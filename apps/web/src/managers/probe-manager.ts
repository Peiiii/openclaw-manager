import { requestFlowConfirmation } from "@/features/onboarding/domain/flow-actions";
import { useJobsStore } from "@/stores/jobs-store";
import { useProbeStore } from "@/stores/probe-store";

type ProbeRunOptions = {
  requestPending: boolean;
  successMessage: string;
};

async function runProbeFlow(options: ProbeRunOptions) {
  const probeState = useProbeStore.getState();
  probeState.setIsProcessing(true);
  probeState.setMessage("正在探测通道...");
  const probe = await useJobsStore.getState().startQuickstartJob({
    runProbe: true,
    startGateway: true
  });
  if (probe.ok && probe.result?.probeOk) {
    probeState.setMessage(options.successMessage);
    if (options.requestPending) {
      requestFlowConfirmation("probe");
    }
  } else if (probe.ok) {
    probeState.setMessage("通道探测未通过，请重试。");
  } else {
    probeState.setMessage(`通道探测失败: ${probe.error ?? "unknown"}`);
  }
  probeState.setIsProcessing(false);
}

export class ProbeManager {
  setMessage = (value: string | null) => useProbeStore.getState().setMessage(value);
  setIsProcessing = (value: boolean) => useProbeStore.getState().setIsProcessing(value);

  run = async () =>
    runProbeFlow({
      requestPending: true,
      successMessage: "通道探测通过，等待系统确认..."
    });
}

export async function runProbeAfterPairing() {
  await runProbeFlow({
    requestPending: false,
    successMessage: "通道探测通过。"
  });
}
