import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-brand-coffee">Đăng ký</h1>
        <p className="mt-3 text-brand-coffee/70">
          Tạo tài khoản khách hàng để đặt hàng và lưu địa chỉ giao hàng.
        </p>
        <RegisterForm />
      </section>
    </main>
  );
}
