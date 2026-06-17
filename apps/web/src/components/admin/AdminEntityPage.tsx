"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/common/AdminPageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";

type AdminRecord = Record<string, unknown> & { id: string };

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkbox" | "date";
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
};

export type AdminColumn = {
  key: string;
  label: string;
  format?: (record: AdminRecord) => string;
};

type AdminEntityPageProps = {
  title: string;
  description: string;
  endpoint: string;
  fields: AdminField[];
  columns: AdminColumn[];
  searchKeys?: string[];
  createLabel?: string;
};

function readPath(record: AdminRecord, key: string) {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }

    return undefined;
  }, record);
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("vi-VN");
  }

  return String(value);
}

function emptyForm(fields: AdminField[]) {
  return fields.reduce<Record<string, string | boolean>>((acc, field) => {
    acc[field.name] = field.type === "checkbox" ? false : "";
    return acc;
  }, {});
}

function toPayload(fields: AdminField[], form: Record<string, string | boolean>) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    const value = form[field.name];

    if (value === "" && !field.required) {
      return acc;
    }

    if (field.type === "number") {
      acc[field.name] = Number(value);
    } else if (field.type === "checkbox") {
      acc[field.name] = Boolean(value);
    } else if (field.type === "date") {
      acc[field.name] = value ? new Date(String(value)).toISOString() : undefined;
    } else {
      acc[field.name] = value;
    }

    return acc;
  }, {});
}

function isStatusValue(value: string) {
  return /^(ACTIVE|INACTIVE|BANNED|DRAFT|PAID|PENDING|UNPAID|FAILED|COMPLETED|CANCELLED|PUBLISHED|NEW|READ|REPLIED|ARCHIVED)$/.test(value);
}

function getEntityStatusType(endpoint: string) {
  if (endpoint.includes("content")) {
    return "content" as const;
  }

  if (endpoint.includes("contact-messages")) {
    return "contact" as const;
  }

  if (endpoint.includes("customers")) {
    return "user" as const;
  }

  if (endpoint.includes("products")) {
    return "product" as const;
  }

  if (endpoint.includes("payments")) {
    return "payment" as const;
  }

  return "generic" as const;
}

export function AdminEntityPage({
  title,
  description,
  endpoint,
  fields,
  columns,
  searchKeys = [],
  createLabel = "Thêm mới",
}: AdminEntityPageProps) {
  const [items, setItems] = useState<AdminRecord[]>([]);
  const [form, setForm] = useState(emptyForm(fields));
  const [editingId, setEditingId] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadItems() {
    const payload = await apiFetch<ApiResponse<AdminRecord[]>>(endpoint);
    setItems(payload.data ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiFetch<ApiResponse<AdminRecord[]>>(endpoint)
        .then((payload) => {
          if (!cancelled) {
            setItems(payload.data ?? []);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
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
  }, [endpoint]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((item) =>
      searchKeys.some((key) => displayValue(readPath(item, key)).toLowerCase().includes(term))
    );
  }, [items, query, searchKeys]);

  function startEdit(record: AdminRecord) {
    setEditingId(record.id);
    setForm(
      fields.reduce<Record<string, string | boolean>>((acc, field) => {
        const value = readPath(record, field.name);
        acc[field.name] = field.type === "checkbox" ? Boolean(value) : value === null || value === undefined ? "" : String(value);
        return acc;
      }, {})
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await apiFetch<ApiResponse>(editingId ? `${endpoint}/${editingId}` : endpoint, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(toPayload(fields, form)),
      });
      setMessage(editingId ? "Đã cập nhật." : "Đã tạo mới.");
      setEditingId(undefined);
      setForm(emptyForm(fields));
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu dữ liệu.");
    }
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Xác nhận xóa hoặc ẩn bản ghi này?")) {
      return;
    }

    await apiFetch<ApiResponse>(`${endpoint}/${id}`, { method: "DELETE" });
    await loadItems();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} description={description} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="h-10 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-brand-mustard"
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <span className="text-sm text-gray-500">{filteredItems.length} bản ghi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 font-medium">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    {columns.map((column) => {
                      const raw = column.format ? column.format(item) : displayValue(readPath(item, column.key));
                      return (
                        <td key={column.key} className="px-4 py-3 text-gray-700">
                          {isStatusValue(String(raw))
                            ? <StatusBadge type={getEntityStatusType(endpoint)} value={String(raw)} />
                            : raw}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                          Sửa
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading ? <p className="py-8 text-center text-gray-500">Đang tải...</p> : null}
            {!isLoading && filteredItems.length === 0 ? <p className="py-8 text-center text-gray-500">Chưa có dữ liệu.</p> : null}
          </div>
        </section>

        <form className="h-fit rounded-lg border border-gray-100 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Plus className="h-5 w-5 text-brand-mustard" />
            {editingId ? "Sửa bản ghi" : createLabel}
          </h2>
          <div className="mt-5 space-y-3">
            {fields.map((field) => (
              <label key={field.name} className="block text-sm font-medium text-gray-700">
                {field.type === "checkbox" ? (
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.name])}
                      onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))}
                    />
                    {field.label}
                  </span>
                ) : (
                  <>
                    <span>{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        className="mt-1 min-h-24 w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-brand-mustard"
                        placeholder={field.placeholder}
                        value={String(form[field.name] ?? "")}
                        onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                        required={field.required}
                      />
                    ) : field.type === "select" ? (
                      <select
                        className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3 outline-none focus:border-brand-mustard"
                        value={String(form[field.name] ?? "")}
                        onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                        required={field.required}
                      >
                        <option value="">Chọn...</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3 outline-none focus:border-brand-mustard"
                        placeholder={field.placeholder}
                        type={field.type || "text"}
                        value={String(form[field.name] ?? "")}
                        onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                        required={field.required}
                      />
                    )}
                  </>
                )}
              </label>
            ))}
          </div>
          {message ? <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <div className="mt-5 flex gap-2">
            <Button variant="premium">{editingId ? "Lưu" : "Tạo"}</Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(undefined);
                  setForm(emptyForm(fields));
                }}
              >
                Hủy
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
