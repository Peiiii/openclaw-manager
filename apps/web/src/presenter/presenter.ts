import { AuthManager } from "@/managers/auth-manager";
import { ConfigManager } from "@/managers/config-manager";
import { JobsManager } from "@/managers/jobs-manager";
import { OnboardingManager } from "@/managers/onboarding-manager";
import { StatusManager } from "@/managers/status-manager";

export class Presenter {
  auth = new AuthManager();
  config = new ConfigManager();
  status = new StatusManager();
  jobs = new JobsManager();
  onboarding = new OnboardingManager();
}
