"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";

type Order = {
  id: string;
  orderCode: string;
  totalAmount: number | string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
};

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiFetch<ApiResponse<Order[]>>("/api/account/orders")
        .then((payload) => {
          if (!cancelled) {
            setOrders(payload.data ?? []);
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
  }, []);

  return (
    <section className="rounded-lg bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-brand-coffee">Đơn hàng của tôi</h1>
      <p className="mt-3 text-brand-coffee/70">Xem lịch sử đơn hàng, trạng thái xử lý và trạng thái thanh toán.</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-beige text-brand-coffee">
            <tr>
              <th className="rounded-l-lg px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Ngày đặt</th>
              <th className="px-4 py-3">Tổng tiền</th>
              <th className="px-4 py-3">Đơn hàng</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="rounded-r-lg px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-coffee/10">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-4 font-semibold text-brand-coffee">{order.orderCode}</td>
                <td className="px-4 py-4 text-brand-coffee/70">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-4 font-semibold text-brand-coffee">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-4">
                  <Badge variant="outline">{order.status}</Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="secondary">{order.paymentStatus}</Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/account/orders/${order.id}`}>Chi tiết</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && !isLoading ? <p className="py-8 text-center text-brand-coffee/70">Bạn chưa có đơn hàng nào.</p> : null}
        {isLoading ? <p className="py-8 text-center text-brand-coffee/70">Đang tải đơn hàng...</p> : null}
      </div>
    </section>
  );
}
