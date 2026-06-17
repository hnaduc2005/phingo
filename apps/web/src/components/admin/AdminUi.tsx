"use client";

import type { LucideIcon } from "lucide-react";
import { AlertTriangle, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "gray" | "amber" | "green" | "red" | "blue" | "purple" | "cyan";

const toneClasses: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-700",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  cyan: "bg-cyan-100 text-cyan-700"
};

export function AdminPageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{description}</p> : null}
    </div>
  );
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  tone = "gray",
  helper
}: {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 truncate text-2xl font-bold text-gray-950">{value}</p>
        </div>
      </div>
      {helper ? <p className="mt-3 text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

export function AdminStatusBadge({
  status,
  type = "generic"
}: {
  status: string;
  type?: "order" | "payment" | "product" | "user" | "method" | "content" | "contact" | "generic";
}) {
  return <StatusBadge type={type} value={status} />;
}

export function AdminFilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  icon: Icon = AlertTriangle
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-4 font-semibold text-gray-900">{title}</p>
      {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
    </div>
  );
}

export function AdminLoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}

export function AdminActionMenu({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <MoreHorizontal className="hidden h-4 w-4 text-gray-300 sm:block" />
      {children}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}

export function FormFieldWrapper({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-950">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
