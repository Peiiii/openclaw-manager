import { create } from "zustand";

export type TokenState = {
  value: string;
  message: string | null;
  isProcessing: boolean;
  setValue: (value: string) => void;
  setMessage: (value: string | null) => void;
  setIsProcessing: (value: boolean) => void;
};

export const useTokenStore = create<TokenState>((set) => ({
  value: "",
  message: null,
  isProcessing: false,
  setValue: (value) => set({ value }),
  setMessage: (value) => set({ message: value }),
  setIsProcessing: (value) => set({ isProcessing: value })
}));
