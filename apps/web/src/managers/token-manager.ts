import { requestFlowConfirmation } from "@/features/onboarding/domain/flow-actions";
import { useStatusStore } from "@/stores/status-store";
import { useTokenStore } from "@/stores/token-store";

export class TokenManager {
  setValue = (value: string) => useTokenStore.getState().setValue(value);
  setMessage = (value: string | null) => useTokenStore.getState().setMessage(value);
  setIsProcessing = (value: boolean) => useTokenStore.getState().setIsProcessing(value);

  submit = async () => {
    const token = useTokenStore.getState();
    const value = token.value.trim();
    if (!value) return;
    token.setIsProcessing(true);
    token.setMessage(null);
    const result = await useStatusStore.getState().setDiscordToken(value);
    if (result.ok) {
      token.setValue("");
      token.setMessage("Token 已保存，等待系统确认...");
      requestFlowConfirmation("token");
    } else {
      token.setMessage(`保存失败: ${result.error}`);
    }
    token.setIsProcessing(false);
  };
}
