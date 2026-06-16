"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { apiFetch, type ApiResponse } from "@/lib/api";
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  saveAuthSession,
  saveAuthUser,
  type AuthSession,
  type AuthUser,
} from "@/lib/auth";

type AuthContextValue = {
  user?: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<AuthSession>;
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<AuthSession>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<AuthUser | undefined>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!getAccessToken()) {
      clearAuthSession();
      setUser(undefined);
      setIsLoading(false);
      return undefined;
    }

    try {
      const payload = await apiFetch<ApiResponse<AuthUser>>("/api/auth/me");

      if (!payload.data) {
        throw new Error(payload.message || "Không tìm thấy tài khoản.");
      }

      saveAuthUser(payload.data);
      setUser(payload.data);
      return payload.data;
    } catch {
      clearAuthSession();
      setUser(undefined);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(getStoredUser());
      fetchMe();
    }, 0);

    function syncUser() {
      setUser(getStoredUser());
    }

    window.addEventListener("storage", syncUser);
    window.addEventListener("phingo-auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("phingo-auth-change", syncUser);
      window.clearTimeout(timer);
    };
  }, [fetchMe]);

  async function login(input: { email: string; password: string }) {
    const payload = await apiFetch<ApiResponse<AuthSession>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuthRefresh: true,
    });

    if (!payload.data) {
      throw new Error(payload.message || "Không nhận được phiên đăng nhập.");
    }

    saveAuthSession(payload.data);
    setUser(payload.data.user);
    return payload.data;
  }

  async function register(input: { name: string; email: string; phone?: string; password: string }) {
    const payload = await apiFetch<ApiResponse<AuthSession>>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuthRefresh: true,
    });

    if (!payload.data) {
      throw new Error(payload.message || "Không nhận được phiên đăng ký.");
    }

    saveAuthSession(payload.data);
    setUser(payload.data.user);
    return payload.data;
  }

  async function logout() {
    try {
      await apiFetch<ApiResponse>("/api/auth/logout", { method: "POST" });
    } catch {
      // Local logout should still complete if the server-side no-op logout request is rejected.
    } finally {
      clearAuthSession();
      setUser(undefined);
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
