import { useAuthStore } from "@/stores/auth-store";

export class AuthManager {
  setAuthHeader = (value: string | null) => useAuthStore.getState().setAuthHeader(value);
  setAuthRequired = (required: boolean) => useAuthStore.getState().setAuthRequired(required);
  clearAuth = () => useAuthStore.getState().clearAuth();
  checkAuth = async () => useAuthStore.getState().checkAuth();
  login = async (username: string, password: string) =>
    useAuthStore.getState().login(username, password);
}
