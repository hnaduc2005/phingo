"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/common/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";

type Order = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number | string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
};

const orderStatuses = ["PENDING", "CONFIRMED", "PACKING", "SHIPPING", "COMPLETED", "CANCELLED"];

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("vi-VN");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [message, setMessage] = useState("");

  async function loadOrders() {
    const payload = await apiFetch<ApiResponse<Order[]>>("/api/admin/orders");
    setOrders(payload.data ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiFetch<ApiResponse<Order[]>>("/api/admin/orders").then((payload) => {
        if (!cancelled) {
          setOrders(payload.data ?? []);
        }
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return orders.filter((order) => {
      const matchesQuery = [order.orderCode, order.customerName, order.customerPhone].some((value) =>
        String(value).toLowerCase().includes(term)
      );
      return matchesQuery && (!status || order.status === status) && (!paymentStatus || order.paymentStatus === paymentStatus);
    });
  }, [orders, paymentStatus, query, status]);

  async function updateStatus(orderId: string, nextStatus: string) {
    await apiFetch<ApiResponse>(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    setMessage("Đã cập nhật trạng thái đơn hàng.");
    await loadOrders();
  }

  async function cancelOrder(orderId: string) {
    if (!window.confirm("Hủy đơn hàng và hoàn kho?")) {
      return;
    }

    await apiFetch<ApiResponse>(`/api/admin/orders/${orderId}/cancel`, { method: "PATCH" });
    setMessage("Đã hủy đơn hàng.");
    await loadOrders();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Đơn hàng" description="Xem đơn hàng, cập nhật trạng thái xử lý và theo dõi thanh toán." />
      <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <input className="h-10 rounded-md border border-gray-200 px-3" placeholder="Tìm mã đơn, tên, SĐT..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="h-10 rounded-md border border-gray-200 px-3" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái đơn</option>
            {orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="h-10 rounded-md border border-gray-200 px-3" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
            <option value="">Tất cả thanh toán</option>
            {["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {message ? <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Tổng</th>
                <th className="px-4 py-3">Đơn hàng</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{order.orderCode}</td>
                  <td className="px-4 py-3">
                    <p>{order.customerName}</p>
                    <p className="text-gray-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalAmount)}đ</td>
                  <td className="px-4 py-3"><Badge variant="outline">{order.status}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="secondary">{order.paymentStatus}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <select className="h-9 rounded-md border border-gray-200 px-2" value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                        {orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                      {order.status !== "CANCELLED" ? (
                        <Button variant="outline" size="sm" onClick={() => cancelOrder(order.id)}>
                          Hủy
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="py-8 text-center text-gray-500">Không có đơn hàng phù hợp.</p> : null}
        </div>
      </section>
    </div>
  );
}
