"use client";
// Stato auth lato client: sostituisce useSession di NextAuth. La password non
// arriva MAI qui — il client conosce solo l'email e lo stato di login.
import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";

export type AuthUser = { email: string };
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type LoginInput = {
  email: string;
  password: string;
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
};

// error codes dalla route: "auth-failed" | "need-hosts" | "missing-credentials" | "network"
export type LoginResult = { ok: true } | { ok: false; error: string };

type AuthCtx = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/imap", { cache: "no-store" });
      const data = await res.json();
      if (data.user?.email) {
        setUser({ email: data.user.email });
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (input: LoginInput): Promise<LoginResult> => {
    try {
      const res = await fetch("/api/auth/imap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ email: data.user.email });
        setStatus("authenticated");
        try { localStorage.setItem("omu_saved", JSON.stringify({ ...input, savedAt: Date.now() })); } catch {}
        return { ok: true };
      }
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "auth-failed" };
    } catch {
      return { ok: false, error: "network" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/imap", { method: "DELETE" });
    } catch {}
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return <Ctx.Provider value={{ user, status, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve essere usato dentro <AuthProvider>");
  return ctx;
}
