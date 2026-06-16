"use client";

import { FormEvent, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { type AuthUser, saveAuthUser } from "@/lib/auth";

export default function AccountProfilePage() {
  const { user, fetchMe } = useAuth();
  const [name, setName] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const payload = await apiFetch<ApiResponse<AuthUser>>("/api/account/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: name ?? user?.name ?? "", phone: phone ?? user?.phone ?? "" }),
      });

      if (payload.data) {
        saveAuthUser(payload.data);
      }

      await fetchMe();
      setMessage("Đã cập nhật hồ sơ.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-brand-coffee">Hồ sơ</h1>
      <p className="mt-3 text-brand-coffee/70">Cập nhật tên và số điện thoại liên hệ của tài khoản khách hàng.</p>

      <form className="mt-8 max-w-xl space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-coffee" htmlFor="email">
            Email
          </label>
          <input id="email" className="h-11 w-full rounded-md border border-brand-coffee/20 px-3 text-brand-coffee/60" value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-coffee" htmlFor="name">
            Họ tên
          </label>
          <input id="name" className="h-11 w-full rounded-md border border-brand-coffee/20 px-3" value={name ?? user?.name ?? ""} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-coffee" htmlFor="phone">
            Số điện thoại
          </label>
          <input id="phone" className="h-11 w-full rounded-md border border-brand-coffee/20 px-3" value={phone ?? user?.phone ?? ""} onChange={(event) => setPhone(event.target.value)} />
        </div>
        {message ? <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <Button variant="premium" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Lưu hồ sơ"}
        </Button>
      </form>
    </section>
  );
}
