import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-brand-coffee">Đăng nhập</h1>
        <p className="mt-3 text-brand-coffee/70">
          Đăng nhập để checkout, quản lý địa chỉ và theo dõi đơn hàng.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
