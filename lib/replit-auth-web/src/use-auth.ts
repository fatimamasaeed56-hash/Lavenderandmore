import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

function getBasePath() {
  return "/";
}

// Start OIDC as a first-party navigation, never inside the embedded preview.
export function navigateToAuth(path: string) {
  const url = new URL(path, window.location.origin).href;
  if (window.self !== window.top) {
    const tab = window.open(url, "_blank");
    if (!tab) throw new Error("Auth tab blocked");
    tab.opener = null;
  } else {
    window.location.assign(url);
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => fetch("/api/auth/user", { credentials: "include", cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then(data => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { cancelled = true; window.removeEventListener("focus", refresh); };
  }, []);

  const login = useCallback(() => {
    navigateToAuth(`/api/login?returnTo=${encodeURIComponent(getBasePath())}`);
  }, []);
  const logout = useCallback(() => {
    navigateToAuth(`/api/logout?returnTo=${encodeURIComponent(getBasePath())}`);
  }, []);

  return { user, isLoading, isAuthenticated: !!user, login, logout };
}