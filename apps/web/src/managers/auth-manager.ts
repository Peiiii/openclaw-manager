import { checkAuthSession, loginWithCredentials } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";

export class AuthManager {
  setAuthHeader = (value: string | null) => useAuthStore.getState().setAuthHeader(value);
  clearAuth = () => useAuthStore.getState().clearAuth();

  login = async (username: string, password: string) => {
    const result = await loginWithCredentials(username, password);
    if (result.ok) {
      const authHeader = buildBasicAuth(username, password);
      useAuthStore.getState().setAuthHeader(authHeader);
      useAuthStore.getState().setAuthenticated(true);
      useAuthStore.getState().setSessionChecked(true);
    }
    return result;
  };

  checkSession = async () => {
    const result = await checkAuthSession();
    if (result.ok) {
      useAuthStore.getState().setAuthenticated(result.authenticated);
      useAuthStore.getState().setSessionChecked(true);
      if (!result.authenticated) {
        useAuthStore.getState().setAuthHeader(null);
      }
    } else {
      useAuthStore.getState().setAuthenticated(false);
      useAuthStore.getState().setAuthHeader(null);
      useAuthStore.getState().setSessionChecked(true);
    }
    return result;
  };
}

function buildBasicAuth(username: string, password: string) {
  const raw = `${username}:${password}`;
  const encoded = btoa(raw);
  return `Basic ${encoded}`;
}
