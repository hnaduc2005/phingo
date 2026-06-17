"use client";

import { Clock, DollarSign, Package, Plus, Settings, ShoppingBag, Store, Users, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AdminEmptyState,
  AdminLoadingSkeleton,
  AdminPageTitle,
  AdminStatCard,
  AdminStatusBadge
} from "@/components/admin/AdminUi";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";
import { getPaymentMethodLabel } from "@/lib/i18n/status-labels";

type TopProduct = {
  productId: string;
  id: string;
  productName: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  totalQuantitySold: number;
  totalRevenue: number | string;
};

type DashboardOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number | string;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

type PendingPayment = {
  id: string;
  amount: number | string;
  method: string;
  status: string;
  order: {
    id: string;
    orderCode: string;
    customerName: string;
    totalAmount: number | string;
  };
};

type LatestStore = {
  id: string;
  name: string;
  city: string;
  district: string;
  isActive: boolean;
};

type DashboardData = {
  totalRevenue: number | string;
  orderCount: number;
  completedOrderCount: number;
  customerCount: number;
  pendingOrders: number;
  pendingPayments: number;
  activeProductCount: number;
  storeCount: number;
  topProducts: TopProduct[];
  recentOrders: DashboardOrder[];
  pendingPaymentRecords: PendingPayment[];
  latestStores: LatestStore[];
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

function formatCurrency(value: number | string) {
  return currency.format(Number(value ?? 0));
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | undefined>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const payload = await apiFetch<ApiResponse<DashboardData>>("/api/admin/dashboard");

        if (!cancelled) {
          setDashboard(payload.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải dashboard.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageTitle title="Tổng quan" description="Đang tải dữ liệu vận hành PHIN GO." />
        <AdminLoadingSkeleton rows={8} />
      </div>
    );
  }

  if (error) {
    return <AdminEmptyState title="Không thể tải dashboard" description={error} />;
  }

  const stats = [
    { title: "Doanh thu hoàn tất", value: formatCurrency(dashboard?.totalRevenue ?? 0), icon: DollarSign, tone: "green" as const },
    { title: "Tổng đơn hàng", value: dashboard?.orderCount ?? 0, icon: ShoppingBag, tone: "blue" as const },
    { title: "Đơn hoàn tất", value: dashboard?.completedOrderCount ?? 0, icon: Package, tone: "green" as const },
    { title: "Đơn chờ xác nhận", value: dashboard?.pendingOrders ?? 0, icon: Clock, tone: "amber" as const },
    { title: "Thanh toán chờ", value: dashboard?.pendingPayments ?? 0, icon: WalletCards, tone: "amber" as const },
    { title: "Khách hàng", value: dashboard?.customerCount ?? 0, icon: Users, tone: "purple" as const },
    { title: "Sản phẩm đang bán", value: dashboard?.activeProductCount ?? 0, icon: Package, tone: "green" as const }
  ];

  const quickActions = [
    { href: "/admin/products", label: "Thêm sản phẩm", icon: Plus },
    { href: "/admin/orders", label: "Xem đơn chờ xử lý", icon: ShoppingBag },
    { href: "/admin/payments", label: "Xác nhận thanh toán", icon: WalletCards },
    { href: "/admin/stores", label: "Thêm điểm bán", icon: Store },
    { href: "/admin/settings", label: "Cập nhật liên hệ", icon: Settings }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminPageTitle
          title="Tổng quan"
          description="Theo dõi nhanh doanh thu, đơn hàng, thanh toán và dữ liệu bán hàng của PHIN GO."
        />
        <div className="flex flex-wrap gap-2">
          {quickActions.slice(0, 2).map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.href} asChild variant="outline">
                <Link href={action.href}>
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <AdminStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-950">Thao tác nhanh</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 text-sm font-semibold text-gray-700 transition hover:border-brand-mustard hover:bg-amber-50"
              >
                <Icon className="h-5 w-5 text-brand-mustard" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-950">Đơn hàng gần đây</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">Xem tất cả</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Mã đơn</th>
                  <th className="px-4 py-3 font-medium">Khách</th>
                  <th className="px-4 py-3 font-medium">Tổng</th>
                  <th className="px-4 py-3 font-medium">Đơn hàng</th>
                  <th className="px-4 py-3 font-medium">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboard?.recentOrders?.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-semibold text-gray-950">{order.orderCode}</td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3"><AdminStatusBadge type="order" status={order.status} /></td>
                    <td className="px-4 py-3"><AdminStatusBadge type="payment" status={order.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!dashboard?.recentOrders?.length ? <AdminEmptyState title="Chưa có đơn hàng" /> : null}
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-950">Thanh toán chờ xác nhận</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/payments">Xem</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {dashboard?.pendingPaymentRecords?.map((payment) => (
              <div key={payment.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-950">{payment.order.orderCode}</p>
                    <p className="mt-1 text-sm text-gray-500">{payment.order.customerName}</p>
                  </div>
                  <p className="font-bold text-gray-950">{formatCurrency(payment.amount)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{getPaymentMethodLabel(payment.method)}</span>
                  <AdminStatusBadge type="payment" status={payment.status} />
                </div>
              </div>
            ))}
            {!dashboard?.pendingPaymentRecords?.length ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Không có thanh toán đang chờ.</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-950">Sản phẩm bán chạy</h2>
          <div className="mt-4 space-y-3">
            {dashboard?.topProducts?.map((product) => (
              <div key={product.productId} className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-950">{product.productName}</p>
                  <p className="text-xs text-gray-500">{product.slug}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{product.totalQuantitySold} bán</p>
                  <p className="text-xs font-semibold text-gray-500">{formatCurrency(product.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-950">Điểm bán mới nhất</h2>
            <span className="text-sm font-semibold text-gray-500">{dashboard?.storeCount ?? 0} điểm bán</span>
          </div>
          <div className="space-y-3">
            {dashboard?.latestStores?.map((store) => (
              <div key={store.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-950">{store.name}</p>
                  <p className="text-xs text-gray-500">{store.district}, {store.city}</p>
                </div>
                <AdminStatusBadge type="user" status={store.isActive ? "ACTIVE" : "INACTIVE"} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
