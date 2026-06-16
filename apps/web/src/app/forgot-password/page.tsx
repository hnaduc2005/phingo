import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-brand-coffee">Quên mật khẩu</h1>
        <p className="mt-3 text-brand-coffee/70">
          Nhập email để nhận hướng dẫn đặt lại mật khẩu khi tính năng được kích hoạt.
        </p>
        <div className="mt-8 space-y-3">
          <input className="h-11 w-full rounded-md border border-brand-coffee/20 px-3" placeholder="Email" />
          <Button className="w-full" variant="premium">Gửi hướng dẫn</Button>
        </div>
      </section>
    </main>
  )
}
