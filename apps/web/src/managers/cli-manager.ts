import { requestFlowConfirmation } from "@/features/onboarding/domain/flow-actions";
import { useCliStore } from "@/stores/cli-store";
import { useJobsStore } from "@/stores/jobs-store";

export class CliManager {
  setMessage = (value: string | null) => useCliStore.getState().setMessage(value);
  setIsProcessing = (value: boolean) => useCliStore.getState().setIsProcessing(value);

  install = async () => {
    const cli = useCliStore.getState();
    cli.setIsProcessing(true);
    cli.setMessage("正在启动安装任务...");
    const result = await useJobsStore.getState().startCliInstallJob();
    if (!result.ok) {
      cli.setMessage(`安装失败: ${result.error}`);
    } else {
      cli.setMessage("安装完成，等待系统确认...");
      requestFlowConfirmation("cli");
    }
    cli.setIsProcessing(false);
  };
}
