"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BankTransferInfoCard } from "@/components/checkout/BankTransferInfoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";

type Order = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number | string;
  discountAmount: number | string;
  shippingFee: number | string;
  totalAmount: number | string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  note?: string | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
  }[];
  payment?: {
    id: string;
    status: string;
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

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadOrder() {
    const payload = await apiFetch<ApiResponse<Order>>(`/api/account/orders/${params.id}`);
    setOrder(payload.data);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiFetch<ApiResponse<Order>>(`/api/account/orders/${params.id}`)
        .then((payload) => {
          if (!cancelled) {
            setOrder(payload.data);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError("Không thể tải đơn hàng.");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [params.id]);

  async function cancelOrder() {
    if (!window.confirm("Hủy đơn hàng này?")) {
      return;
    }

    await apiFetch<ApiResponse<Order>>(`/api/account/orders/${params.id}/cancel`, { method: "PATCH" });
    setMessage("Đã hủy đơn hàng.");
    await loadOrder();
  }

  async function submitPaymentProof() {
    setMessage("");
    setError("");

    try {
      await apiFetch<ApiResponse>(`/api/payments/bank-transfer-proof`, {
        method: "POST",
        body: JSON.stringify({
          orderId: params.id,
          transferImageUrl: proofUrl,
          transactionCode: transactionCode || undefined,
        }),
      });
      setMessage("Đã gửi bằng chứng chuyển khoản.");
      setProofUrl("");
      setTransactionCode("");
      await loadOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi bằng chứng chuyển khoản.");
    }
  }

  if (isLoading) {
    return <section className="rounded-lg bg-white p-8 shadow-sm text-brand-coffee/70">Đang tải đơn hàng...</section>;
  }

  if (!order) {
    return <section className="rounded-lg bg-white p-8 shadow-sm text-red-700">{error || "Không tìm thấy đơn hàng."}</section>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-coffee">Chi tiết đơn hàng</h1>
            <p className="mt-2 text-brand-coffee/70">Mã đơn: <span className="font-semibold text-brand-coffee">{order.orderCode}</span></p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{order.status}</Badge>
            <Badge variant="secondary">{order.paymentStatus}</Badge>
          </div>
        </div>
        {message ? <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus !== "PAID" && order.payment ? (
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
          ) : null}

          <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-coffee">Sản phẩm</h2>
          <div className="mt-4 divide-y divide-brand-coffee/10">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-brand-coffee">{item.productName}</p>
                  <p className="text-brand-coffee/60">SL: {item.quantity} x {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="font-semibold text-brand-coffee">{formatCurrency(item.totalPrice)}</p>
              </div>
            ))}
          </div>
        </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-coffee">Giao hàng</h2>
            <p className="mt-3 text-sm text-brand-coffee/70">{order.shippingAddress}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-coffee">Thanh toán</h2>
            <p className="mt-3 text-sm text-brand-coffee/70">{order.paymentMethod} - {order.paymentStatus}</p>
            {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus !== "PAID" ? (
              <div className="mt-4 space-y-2">
                <input
                  className="h-10 w-full rounded-md border border-brand-coffee/20 px-3 text-sm"
                  placeholder="URL ảnh minh chứng chuyển khoản"
                  value={proofUrl}
                  onChange={(event) => setProofUrl(event.target.value)}
                />
                <input
                  className="h-10 w-full rounded-md border border-brand-coffee/20 px-3 text-sm"
                  placeholder="Mã giao dịch nếu có"
                  value={transactionCode}
                  onChange={(event) => setTransactionCode(event.target.value)}
                />
                <Button className="w-full" variant="outline" onClick={submitPaymentProof} disabled={!proofUrl}>
                  Gửi bằng chứng
                </Button>
              </div>
            ) : null}
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-coffee">Tổng cộng</h2>
            <div className="mt-4 space-y-2 text-sm text-brand-coffee/70">
              <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Giảm giá</span><span>{formatCurrency(order.discountAmount)}</span></div>
              <div className="flex justify-between"><span>Vận chuyển</span><span>{formatCurrency(order.shippingFee)}</span></div>
              <div className="flex justify-between border-t border-brand-coffee/10 pt-2 text-lg font-bold text-brand-coffee">
                <span>Tổng</span><span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {order.status === "PENDING" ? (
                <Button variant="destructive" onClick={cancelOrder}>
                  Hủy đơn
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href="/account/orders">Quay lại danh sách</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
