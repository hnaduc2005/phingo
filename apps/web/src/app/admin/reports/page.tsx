"use client";

import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/common/AdminPageHeader";
import { apiFetch, type ApiResponse } from "@/lib/api";

type Overview = {
  orders: number;
  customers: number;
  revenue: number | string;
  pendingOrders: number;
  pendingPayments: number;
};

type Sales = {
  byStatus: { status: string; _count: { _all: number }; _sum: { totalAmount: number | string | null } }[];
  byPaymentStatus: { paymentStatus: string; _count: { _all: number }; _sum: { totalAmount: number | string | null } }[];
  totalCompleted: number | string;
};

type ProductReport = {
  id: string;
  name: string;
  stock: number;
  displayStock?: number;
  variantStock?: number;
  stockMismatch?: boolean;
  status: string;
  _count: {
    orderItems: number;
  };
};

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<Overview | undefined>();
  const [sales, setSales] = useState<Sales | undefined>();
  const [products, setProducts] = useState<ProductReport[]>([]);

  useEffect(() => {
    async function loadReports() {
      const [overviewPayload, salesPayload, productPayload] = await Promise.all([
        apiFetch<ApiResponse<Overview>>("/api/admin/reports/overview"),
        apiFetch<ApiResponse<Sales>>("/api/admin/reports/sales"),
        apiFetch<ApiResponse<ProductReport[]>>("/api/admin/reports/products"),
      ]);
      setOverview(overviewPayload.data);
      setSales(salesPayload.data);
      setProducts(productPayload.data ?? []);
    }

    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Báo cáo" description="Xem báo cáo doanh thu, đơn hàng, sản phẩm và khách hàng." />
      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Doanh thu", Number(overview?.revenue ?? 0).toLocaleString("vi-VN") + "đ"],
          ["Đơn hàng", overview?.orders ?? 0],
          ["Đơn chờ", overview?.pendingOrders ?? 0],
          ["Thanh toán chờ", overview?.pendingPayments ?? 0],
          ["Khách hàng", overview?.customers ?? 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Đơn hàng theo trạng thái</h2>
          <div className="mt-4 space-y-3">
            {sales?.byStatus.map((item) => (
              <div key={item.status} className="flex justify-between rounded-md bg-gray-50 px-4 py-3 text-sm">
                <span>{item.status}</span>
                <span className="font-semibold">{item._count._all} đơn</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Thanh toán theo trạng thái</h2>
          <div className="mt-4 space-y-3">
            {sales?.byPaymentStatus.map((item) => (
              <div key={item.paymentStatus} className="flex justify-between rounded-md bg-gray-50 px-4 py-3 text-sm">
                <span>{item.paymentStatus}</span>
                <span className="font-semibold">{item._count._all} đơn</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Số dòng đơn hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-semibold">{product.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{product.displayStock ?? product.stock}</p>
                    {product.variantStock !== undefined ? (
                      <p className="text-xs text-gray-500">Product {product.stock} · Variants {product.variantStock}</p>
                    ) : null}
                    {product.stockMismatch ? <p className="text-xs font-semibold text-red-600">Lệch stock</p> : null}
                  </td>
                  <td className="px-4 py-3">{product.status}</td>
                  <td className="px-4 py-3">{product._count.orderItems}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
