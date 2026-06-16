"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { BankTransferInfoCard } from "@/components/checkout/BankTransferInfoCard";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";

type Order = {
  id: string;
  orderCode: string;
  totalAmount: number | string;
  paymentMethod: string;
  paymentStatus: string;
  payment?: {
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankAccountHolder?: string | null;
    qrImageUrl?: string | null;
    transferContentTemplate?: string | null;
  } | null;
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value));
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [order, setOrder] = useState<Order | undefined>();

  useEffect(() => {
    if (!orderCode) {
      return;
    }

    apiFetch<ApiResponse<Order>>(`/api/orders/track/${orderCode}`)
      .then((payload) => setOrder(payload.data))
      .catch(() => setOrder(undefined));
  }, [orderCode]);

  return (
    <div className="bg-brand-cream py-20">
      <div className="container mx-auto max-w-2xl px-4">
        <section className="rounded-lg bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-brand-coffee">Đặt hàng thành công</h1>
          <p className="mt-3 text-brand-coffee/70">
            Cảm ơn bạn đã đặt PHIN GO. Bạn có thể theo dõi trạng thái trong tài khoản.
          </p>

          <div className="mt-8 rounded-lg bg-brand-beige p-5 text-left text-sm text-brand-coffee/80">
            <p>
              Mã đơn: <span className="font-bold text-brand-coffee">{order?.orderCode || orderCode}</span>
            </p>
            {order ? (
              <>
                <p className="mt-2">
                  Tổng tiền: <span className="font-bold text-brand-coffee">{formatCurrency(order.totalAmount)}</span>
                </p>
                <p className="mt-2">Thanh toán: {order.paymentMethod} - {order.paymentStatus}</p>
              </>
            ) : null}
          </div>

          {order?.paymentMethod === "BANK_TRANSFER" && order.payment ? (
            <div className="mt-6 text-left">
              <BankTransferInfoCard
                amount={Number(order.totalAmount)}
                bankName={order.payment.bankName || ""}
                bankAccountNumber={order.payment.bankAccountNumber || ""}
                bankAccountHolder={order.payment.bankAccountHolder || ""}
                qrImageUrl={order.payment.qrImageUrl || undefined}
                paymentStatus={order.paymentStatus}
                transferContent={
                  order.payment.transferContentTemplate?.replace("{orderCode}", order.orderCode) ||
                  `PHINGO ${order.orderCode}`
                }
              />
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="premium">
              <Link href="/account/orders">Xem đơn hàng của tôi</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Tiếp tục mua hàng</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
