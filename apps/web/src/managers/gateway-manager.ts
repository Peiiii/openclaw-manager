import { requestFlowConfirmation } from "@/features/onboarding/domain/flow-actions";
import { useGatewayStore } from "@/stores/gateway-store";
import { useJobsStore } from "@/stores/jobs-store";

export class GatewayManager {
  setMessage = (value: string | null) => useGatewayStore.getState().setMessage(value);
  setIsProcessing = (value: boolean) => useGatewayStore.getState().setIsProcessing(value);
  setAutoStarted = (value: boolean) => useGatewayStore.getState().setAutoStarted(value);

  autoStart = async () => {
    const gateway = useGatewayStore.getState();
    gateway.setMessage("正在自动启动网关...");
    const result = await useJobsStore.getState().startQuickstartJob({
      startGateway: true,
      runProbe: false
    });
    if (!result.ok) {
      gateway.setMessage(`启动失败: ${result.error}`);
    } else if (result.result?.gatewayReady) {
      gateway.setMessage("网关已就绪。");
    } else {
      gateway.setMessage("网关正在启动中...");
    }
    gateway.setAutoStarted(true);
  };

  retry = async () => {
    const gateway = useGatewayStore.getState();
    gateway.setIsProcessing(true);
    gateway.setMessage("正在重启网关...");
    const result = await useJobsStore.getState().startQuickstartJob({
      startGateway: true,
      runProbe: false
    });
    if (!result.ok) {
      gateway.setMessage(`启动失败: ${result.error}`);
    } else if (result.result?.gatewayReady) {
      gateway.setMessage("网关已就绪，等待系统确认...");
      requestFlowConfirmation("gateway");
    } else {
      gateway.setMessage("网关正在启动中...");
    }
    gateway.setIsProcessing(false);
  };
}
