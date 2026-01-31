import { create } from "zustand";

export type AiState = {
  provider: string;
  value: string;
  message: string | null;
  isProcessing: boolean;
  setProvider: (value: string) => void;
  setValue: (value: string) => void;
  setMessage: (value: string | null) => void;
  setIsProcessing: (value: boolean) => void;
};

export const useAiStore = create<AiState>((set) => ({
  provider: "anthropic",
  value: "",
  message: null,
  isProcessing: false,
  setProvider: (value) => set({ provider: value }),
  setValue: (value) => set({ value }),
  setMessage: (value) => set({ message: value }),
  setIsProcessing: (value) => set({ isProcessing: value })
}));
