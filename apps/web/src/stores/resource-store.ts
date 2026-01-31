import { create } from "zustand";

export type ResourceState = {
  message: string | null;
  setMessage: (value: string | null) => void;
};

export const useResourceStore = create<ResourceState>((set) => ({
  message: null,
  setMessage: (value) => set({ message: value })
}));
