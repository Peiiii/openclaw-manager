import { TokenStep } from "@/components/wizard-steps";
import { usePresenter } from "@/presenter/presenter-context";
import { useTokenStore } from "@/stores/token-store";

export function TokenStepContainer() {
  const presenter = usePresenter();
  const value = useTokenStore((state) => state.value);
  const message = useTokenStore((state) => state.message);
  const isProcessing = useTokenStore((state) => state.isProcessing);

  return (
    <TokenStep
      value={value}
      onChange={presenter.token.setValue}
      onSubmit={presenter.token.submit}
      isProcessing={isProcessing}
      message={message}
    />
  );
}
