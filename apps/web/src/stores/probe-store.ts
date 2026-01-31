import { create } from "zustand";

export type ProbeState = {
  message: string | null;
  isProcessing: boolean;
  setMessage: (value: string | null) => void;
  setIsProcessing: (value: boolean) => void;
};

export const useProbeStore = create<ProbeState>((set) => ({
  message: null,
  isProcessing: false,
  setMessage: (value) => set({ message: value }),
  setIsProcessing: (value) => set({ isProcessing: value })
}));
