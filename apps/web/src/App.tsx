import { OnboardingPage } from "@/features/onboarding/onboarding-page";
import { useOnboarding } from "@/features/onboarding/use-onboarding";

export default function App() {
  const model = useOnboarding();
  return <OnboardingPage model={model} />;
}
