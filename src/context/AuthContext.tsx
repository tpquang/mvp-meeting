"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN } from "@/lib/routes";
import { getToken, loginService, logoutService } from "@/services/auth";
import { getAIConfig as loadAIConfig } from "@/services/aiService";
import type { AIConfig } from "@/types";

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  aiConfig: AIConfig;
  setAIConfig: (c: AIConfig) => void;
};

const defaultAI: AIConfig = { domain: "gpt", apiKey: "", prompt: "", processingMode: "conversation", selectedKeyId: null };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig>(defaultAI);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          const serverToken = j.token as string | undefined;
          if (serverToken) {
            // persist client-side copy for client logic
            try {
              setToken(serverToken);
            } catch (e) {}
          }
        } else {
          setToken(null);
        }
      } catch (e) {
        // fallback: try client storage
        const t = getToken();
        if (mounted) setToken(t);
      }

      try {
        const ai = loadAIConfig();
        if (mounted) setAiConfig(ai);
      } catch (e) {}
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (username: string, password: string) => {
    const t = loginService(username, password);
    if (t) {
      setToken(t);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      // call server logout to clear httpOnly cookie
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }

    try {
      logoutService();
    } catch (e) {
      // ignore
    }

    setToken(null);
    try {
      router.push(LOGIN);
    } catch (e) {
      // noop
    }
  };

  const setAIConfig = (c: AIConfig) => {
    setAiConfig(c);
    try {
      localStorage.setItem("mvp_ai", JSON.stringify(c));
    } catch (e) {
      // noop
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, logout, aiConfig, setAIConfig }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
