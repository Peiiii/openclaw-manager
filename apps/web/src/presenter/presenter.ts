import { AiManager } from "@/managers/ai-manager";
import { AuthManager } from "@/managers/auth-manager";
import { CliManager } from "@/managers/cli-manager";
import { ConfigManager } from "@/managers/config-manager";
import { GatewayManager } from "@/managers/gateway-manager";
import { JobsManager } from "@/managers/jobs-manager";
import { OnboardingManager } from "@/managers/onboarding-manager";
import { PairingManager } from "@/managers/pairing-manager";
import { ProbeManager } from "@/managers/probe-manager";
import { ResourceManager } from "@/managers/resource-manager";
import { StatusManager } from "@/managers/status-manager";
import { TokenManager } from "@/managers/token-manager";

export class Presenter {
  auth = new AuthManager();
  cli = new CliManager();
  gateway = new GatewayManager();
  token = new TokenManager();
  ai = new AiManager();
  pairing = new PairingManager();
  probe = new ProbeManager();
  resource = new ResourceManager();
  config = new ConfigManager();
  status = new StatusManager();
  jobs = new JobsManager();
  onboarding = new OnboardingManager();
}
