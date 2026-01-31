import { requestFlowConfirmation } from "@/features/onboarding/domain/flow-actions";
import { useAiStore } from "@/stores/ai-store";
import { useJobsStore } from "@/stores/jobs-store";

export class AiManager {
  setProvider = (value: string) => useAiStore.getState().setProvider(value);
  setValue = (value: string) => useAiStore.getState().setValue(value);
  setMessage = (value: string | null) => useAiStore.getState().setMessage(value);
  setIsProcessing = (value: boolean) => useAiStore.getState().setIsProcessing(value);

  submit = async () => {
    const ai = useAiStore.getState();
    const apiKey = ai.value.trim();
    if (!apiKey) return;
    ai.setIsProcessing(true);
    ai.setMessage(null);
    const result = await useJobsStore.getState().startAiAuthJob(ai.provider, apiKey);
    if (result.ok) {
      ai.setValue("");
      ai.setMessage("AI 凭证已保存，等待系统确认...");
      requestFlowConfirmation("ai");
    } else {
      ai.setMessage(`配置失败: ${result.error}`);
    }
    ai.setIsProcessing(false);
  };
}
