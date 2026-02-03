import { apiFetch } from "./api-client";

export type AuthSessionResponse = {
  ok: boolean;
  authenticated: boolean;
  required: boolean;
  configured: boolean;
  disabled?: boolean;
};

export async function loginWithCredentials(username: string, password: string) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) {
    return { ok: false, error: data?.error ?? `login failed: ${res.status}` };
  }
  return { ok: true };
}

export async function checkAuthSession() {
  try {
    const res = await apiFetch("/api/auth/session");
    const data = (await res.json().catch(() => null)) as AuthSessionResponse | null;
    if (!res.ok || !data) {
      return {
        ok: false,
        authenticated: false,
        required: true,
        configured: false,
        error: `session check failed: ${res.status}`
      };
    }
    return data;
  } catch (err) {
    return {
      ok: false,
      authenticated: false,
      required: true,
      configured: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
