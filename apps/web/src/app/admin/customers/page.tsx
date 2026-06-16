"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/common/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { apiFetch, type ApiResponse } from "@/lib/api";

type Customer = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  status: string;
  createdAt: string;
  _count?: {
    orders: number;
    addresses: number;
  };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  async function loadCustomers() {
    const payload = await apiFetch<ApiResponse<Customer[]>>("/api/admin/customers");
    setCustomers(payload.data ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiFetch<ApiResponse<Customer[]>>("/api/admin/customers").then((payload) => {
        if (!cancelled) {
          setCustomers(payload.data ?? []);
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
    return customers.filter((customer) => {
      const matchesQuery = [customer.name, customer.email, customer.phone].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );
      return matchesQuery && (!status || customer.status === status);
    });
  }, [customers, query, status]);

  async function updateStatus(id: string, nextStatus: string) {
    await apiFetch<ApiResponse>(`/api/admin/customers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    await loadCustomers();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Khách hàng" description="Quản lý tài khoản khách hàng, trạng thái và lịch sử mua hàng." />
      <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <input className="h-10 rounded-md border border-gray-200 px-3" placeholder="Tìm tên, email, SĐT..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="h-10 rounded-md border border-gray-200 px-3" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {["ACTIVE", "INACTIVE", "BANNED"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Liên hệ</th>
                <th className="px-4 py-3">Đơn hàng</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3">
                    <p>{customer.email}</p>
                    <p className="text-gray-500">{customer.phone || "-"}</p>
                  </td>
                  <td className="px-4 py-3">{customer._count?.orders ?? 0}</td>
                  <td className="px-4 py-3">{customer._count?.addresses ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{customer.status}</Badge>
                      <select className="h-9 rounded-md border border-gray-200 px-2" value={customer.status} onChange={(event) => updateStatus(customer.id, event.target.value)}>
                        {["ACTIVE", "INACTIVE", "BANNED"].map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length ? <p className="py-8 text-center text-gray-500">Không có khách hàng phù hợp.</p> : null}
        </div>
      </section>
    </div>
  );
}
