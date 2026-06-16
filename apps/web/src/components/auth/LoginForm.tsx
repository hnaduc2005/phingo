"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { type AuthSession, saveAuthSession } from "@/lib/auth";

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = await apiFetch<ApiResponse<AuthSession>>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!payload.data) {
        throw new Error(payload.message || "Không nhận được phiên đăng nhập.");
      }

      saveAuthSession(payload.data);

      const redirect = safeRedirect(searchParams.get("redirect"));
      router.replace(payload.data.user.role === "ADMIN" ? "/admin" : redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-coffee" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="h-11 w-full rounded-md border border-brand-coffee/20 px-3 outline-none transition focus:border-brand-mustard focus:ring-2 focus:ring-brand-mustard/20"
          placeholder="admin@phingo.vn"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-coffee" htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          className="h-11 w-full rounded-md border border-brand-coffee/20 px-3 outline-none transition focus:border-brand-mustard focus:ring-2 focus:ring-brand-mustard/20"
          placeholder="Nhập mật khẩu"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button className="w-full" variant="premium" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="flex justify-between text-sm text-brand-coffee/70">
        <Link className="transition-colors hover:text-brand-coffee" href="/register">
          Tạo tài khoản
        </Link>
        <Link className="transition-colors hover:text-brand-coffee" href="/forgot-password">
          Quên mật khẩu?
        </Link>
      </div>
    </form>
  );
}
