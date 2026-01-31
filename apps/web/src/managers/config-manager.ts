import { useConfigStore } from "@/stores/config-store";

export class ConfigManager {
  setApiBase = (value: string) => useConfigStore.getState().setApiBase(value);
  setGatewayHost = (value: string) => useConfigStore.getState().setGatewayHost(value);
  setGatewayPort = (value: string) => useConfigStore.getState().setGatewayPort(value);
}
