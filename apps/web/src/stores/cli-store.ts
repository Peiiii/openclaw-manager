import { create } from "zustand";

export type CliState = {
  message: string | null;
  isProcessing: boolean;
  setMessage: (value: string | null) => void;
  setIsProcessing: (value: boolean) => void;
};

export const useCliStore = create<CliState>((set) => ({
  message: null,
  isProcessing: false,
  setMessage: (value) => set({ message: value }),
  setIsProcessing: (value) => set({ isProcessing: value })
}));
