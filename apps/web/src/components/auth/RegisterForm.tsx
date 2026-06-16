"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { type AuthSession, saveAuthSession } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = await apiFetch<ApiResponse<AuthSession>>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name,
          phone: phone.trim() || undefined,
        }),
      });

      if (!payload.data) {
        throw new Error(payload.message || "Không nhận được phiên đăng ký.");
      }

      saveAuthSession(payload.data);
      router.replace("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo tài khoản.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-coffee" htmlFor="name">
          Họ tên
        </label>
        <input
          id="name"
          className="h-11 w-full rounded-md border border-brand-coffee/20 px-3 outline-none transition focus:border-brand-mustard focus:ring-2 focus:ring-brand-mustard/20"
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
          minLength={2}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-coffee" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="h-11 w-full rounded-md border border-brand-coffee/20 px-3 outline-none transition focus:border-brand-mustard focus:ring-2 focus:ring-brand-mustard/20"
          placeholder="ban@phingo.vn"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-coffee" htmlFor="phone">
          Số điện thoại
        </label>
        <input
          id="phone"
          className="h-11 w-full rounded-md border border-brand-coffee/20 px-3 outline-none transition focus:border-brand-mustard focus:ring-2 focus:ring-brand-mustard/20"
          placeholder="0901234567"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-brand-coffee" htmlFor="password">
          Mật khẩu
        </label>
        <input
          id="password"
          className="h-11 w-full rounded-md border border-brand-coffee/20 px-3 outline-none transition focus:border-brand-mustard focus:ring-2 focus:ring-brand-mustard/20"
          placeholder="Tối thiểu 8 ký tự"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button className="w-full" variant="premium" disabled={isSubmitting}>
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </Button>

      <p className="text-sm text-brand-coffee/70">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-brand-coffee transition-colors hover:text-brand-mustard">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
