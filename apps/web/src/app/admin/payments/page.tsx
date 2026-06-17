"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/common/AdminPageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { formatCurrencyVND } from "@/lib/format";
import { getPaymentMethodLabel, getPaymentStatusLabel } from "@/lib/i18n/status-labels";

type Payment = {
  id: string;
  method: string;
  status: string;
  amount: number | string;
  transactionCode?: string | null;
  transferImageUrl?: string | null;
  order: {
    id: string;
    orderCode: string;
    customerName: string;
    customerPhone: string;
  };
};

const paymentMethods = ["COD", "BANK_TRANSFER", "MOMO", "VNPAY", "ZALOPAY", "CREDIT_CARD"];
const paymentStatuses = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  async function loadPayments() {
    const payload = await apiFetch<ApiResponse<Payment[]>>("/api/admin/payments");
    setPayments(payload.data ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiFetch<ApiResponse<Payment[]>>("/api/admin/payments").then((payload) => {
        if (!cancelled) {
          setPayments(payload.data ?? []);
        }
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const filtered = useMemo(
    () => payments.filter((payment) => (!method || payment.method === method) && (!status || payment.status === status)),
    [method, payments, status]
  );

  async function confirmPayment(id: string) {
    await apiFetch<ApiResponse>(`/api/admin/payments/${id}/confirm`, { method: "PATCH", body: JSON.stringify({}) });
    setMessage("Đã xác nhận thanh toán.");
    await loadPayments();
  }

  async function rejectPayment(id: string) {
    if (!window.confirm("Từ chối thanh toán này?")) {
      return;
    }

    await apiFetch<ApiResponse>(`/api/admin/payments/${id}/reject`, { method: "PATCH" });
    setMessage("Đã từ chối thanh toán.");
    await loadPayments();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Thanh toán" description="Xác nhận chuyển khoản, từ chối giao dịch lỗi và theo dõi trạng thái thanh toán." />
      <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <select className="h-10 rounded-md border border-gray-200 px-3" value={method} onChange={(event) => setMethod(event.target.value)}>
            <option value="">Tất cả phương thức</option>
            {paymentMethods.map((item) => <option key={item} value={item}>{getPaymentMethodLabel(item)}</option>)}
          </select>
          <select className="h-10 rounded-md border border-gray-200 px-3" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {paymentStatuses.map((item) => <option key={item} value={item}>{getPaymentStatusLabel(item)}</option>)}
          </select>
        </div>
        {message ? <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Đơn hàng</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Phương thức</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Bằng chứng</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 font-semibold">{payment.order.orderCode}</td>
                  <td className="px-4 py-3">
                    <p>{payment.order.customerName}</p>
                    <p className="text-gray-500">{payment.order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3">{getPaymentMethodLabel(payment.method)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrencyVND(payment.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge type="payment" value={payment.status} /></td>
                  <td className="px-4 py-3">
                    {payment.transferImageUrl ? (
                      <a className="text-brand-blue underline" href={payment.transferImageUrl} target="_blank" rel="noreferrer">
                        Xem ảnh
                      </a>
                    ) : payment.transactionCode ? payment.transactionCode : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {payment.status !== "PAID" ? (
                        <Button variant="outline" size="sm" onClick={() => confirmPayment(payment.id)}>
                          Xác nhận
                        </Button>
                      ) : null}
                      {payment.status !== "FAILED" && payment.status !== "PAID" ? (
                        <Button variant="ghost" size="sm" onClick={() => rejectPayment(payment.id)}>
                          Từ chối
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="py-8 text-center text-gray-500">Không có thanh toán phù hợp.</p> : null}
        </div>
      </section>
    </div>
  );
}
