import { create } from "zustand";

export type GatewayState = {
  message: string | null;
  isProcessing: boolean;
  autoStarted: boolean;
  setMessage: (value: string | null) => void;
  setIsProcessing: (value: boolean) => void;
  setAutoStarted: (value: boolean) => void;
};

export const useGatewayStore = create<GatewayState>((set) => ({
  message: null,
  isProcessing: false,
  autoStarted: false,
  setMessage: (value) => set({ message: value }),
  setIsProcessing: (value) => set({ isProcessing: value }),
  setAutoStarted: (value) => set({ autoStarted: value })
}));
