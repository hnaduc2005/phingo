"use client";

import { Edit, Eye, EyeOff, Plus, Save, Search, Store, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  AdminActionMenu,
  AdminEmptyState,
  AdminFilterBar,
  AdminLoadingSkeleton,
  AdminPageTitle,
  AdminStatusBadge,
  ConfirmDialog,
  FormFieldWrapper,
  FormSection
} from "@/components/admin/AdminUi";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiResponse } from "@/lib/api";

type StoreType = "SHOWROOM" | "DEALER" | "CONVENIENCE_STORE" | "COFFEE_SHOP" | "GROCERY";

type StoreLocation = {
  id: string;
  name: string;
  type: StoreType;
  address: string;
  city: string;
  district: string;
  ward?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  googleMapUrl?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  description?: string | null;
  isActive: boolean;
};

type StoreForm = {
  name: string;
  type: StoreType | "";
  address: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  openingHours: string;
  googleMapUrl: string;
  latitude: string;
  longitude: string;
  description: string;
  isActive: boolean;
};

const emptyForm: StoreForm = {
  name: "",
  type: "",
  address: "",
  city: "",
  district: "",
  ward: "",
  phone: "",
  openingHours: "",
  googleMapUrl: "",
  latitude: "",
  longitude: "",
  description: "",
  isActive: true
};

const storeTypes: { value: StoreType; label: string }[] = [
  { value: "SHOWROOM", label: "Showroom" },
  { value: "DEALER", label: "Đại lý" },
  { value: "CONVENIENCE_STORE", label: "Cửa hàng tiện lợi" },
  { value: "COFFEE_SHOP", label: "Quán cà phê" },
  { value: "GROCERY", label: "Tạp hóa" }
];

function toForm(store: StoreLocation): StoreForm {
  return {
    name: store.name,
    type: store.type,
    address: store.address,
    city: store.city,
    district: store.district,
    ward: store.ward ?? "",
    phone: store.phone ?? "",
    openingHours: store.openingHours ?? "",
    googleMapUrl: store.googleMapUrl ?? "",
    latitude: store.latitude ? String(store.latitude) : "",
    longitude: store.longitude ? String(store.longitude) : "",
    description: store.description ?? "",
    isActive: store.isActive
  };
}

function toPayload(form: StoreForm) {
  return {
    name: form.name,
    type: form.type,
    address: form.address,
    city: form.city,
    district: form.district,
    ward: form.ward || null,
    phone: form.phone || null,
    openingHours: form.openingHours || null,
    googleMapUrl: form.googleMapUrl || null,
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    description: form.description || null,
    isActive: form.isActive
  };
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [form, setForm] = useState<StoreForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [isActive, setIsActive] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | undefined>();
  const [deleteId, setDeleteId] = useState<string | undefined>();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (type) params.set("type", type);
    if (city.trim()) params.set("city", city.trim());
    if (district.trim()) params.set("district", district.trim());
    if (isActive) params.set("isActive", isActive);
    return params.toString();
  }, [city, district, isActive, keyword, type]);

  async function loadStores() {
    setIsLoading(true);
    try {
      const payload = await apiFetch<ApiResponse<StoreLocation[]>>(
        `/api/admin/stores${queryString ? `?${queryString}` : ""}`
      );
      setStores(payload.data ?? []);
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể tải điểm bán." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadStores();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [queryString]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(undefined);
  }

  function startEdit(store: StoreLocation) {
    setEditingId(store.id);
    setForm(toForm(store));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(undefined);
    setIsSaving(true);

    try {
      await apiFetch<ApiResponse>(editingId ? `/api/admin/stores/${editingId}` : "/api/admin/stores", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(toPayload(form))
      });
      setToast({ type: "success", text: editingId ? "Đã cập nhật điểm bán." : "Đã thêm điểm bán." });
      resetForm();
      await loadStores();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể lưu điểm bán." });
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleStore(store: StoreLocation) {
    setToast(undefined);

    try {
      await apiFetch<ApiResponse>(`/api/admin/stores/${store.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !store.isActive })
      });
      setToast({ type: "success", text: store.isActive ? "Đã tắt hiển thị điểm bán." : "Đã bật hiển thị điểm bán." });
      await loadStores();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể cập nhật trạng thái." });
    }
  }

  async function deleteStore() {
    if (!deleteId) {
      return;
    }

    try {
      await apiFetch<ApiResponse>(`/api/admin/stores/${deleteId}`, { method: "DELETE" });
      setToast({ type: "success", text: "Đã ẩn điểm bán." });
      setDeleteId(undefined);
      await loadStores();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể ẩn điểm bán." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <AdminPageTitle
          title="Điểm bán"
          description="Quản lý showroom, đại lý, cửa hàng tiện lợi và các điểm bán đang hiển thị trên website."
        />
        <Button type="button" variant="premium" onClick={resetForm}>
          <Plus className="h-4 w-4" />
          Thêm điểm bán
        </Button>
      </div>

      {toast ? (
        <div
          className={`rounded-lg border p-4 text-sm font-medium ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-4">
          <AdminFilterBar>
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="h-10 w-full rounded-md border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-brand-mustard"
                placeholder="Tìm tên, địa chỉ, SĐT..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
            <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">Tất cả loại</option>
              {storeTypes.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <input className="h-10 rounded-md border border-gray-200 px-3 text-sm" placeholder="Thành phố" value={city} onChange={(event) => setCity(event.target.value)} />
            <input className="h-10 rounded-md border border-gray-200 px-3 text-sm" placeholder="Quận/Huyện" value={district} onChange={(event) => setDistrict(event.target.value)} />
            <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hiển thị</option>
              <option value="false">Đang ẩn</option>
            </select>
          </AdminFilterBar>

          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Điểm bán</th>
                    <th className="px-4 py-3 font-medium">Loại</th>
                    <th className="px-4 py-3 font-medium">Khu vực</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-950">{store.name}</p>
                        <p className="mt-1 max-w-md text-xs text-gray-500">{store.address}</p>
                        {store.phone ? <p className="mt-1 text-xs text-gray-500">{store.phone}</p> : null}
                      </td>
                      <td className="px-4 py-4">{storeTypes.find((item) => item.value === store.type)?.label ?? store.type}</td>
                      <td className="px-4 py-4 text-gray-600">{store.district}, {store.city}</td>
                      <td className="px-4 py-4">
                        <AdminStatusBadge status={store.isActive ? "ACTIVE" : "INACTIVE"} />
                      </td>
                      <td className="px-4 py-4">
                        <AdminActionMenu>
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(store)}>
                            <Edit className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => toggleStore(store)}>
                            {store.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteId(store.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AdminActionMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isLoading ? <div className="p-6"><AdminLoadingSkeleton rows={5} /></div> : null}
            {!isLoading && stores.length === 0 ? (
              <div className="p-6">
                <AdminEmptyState title="Chưa có điểm bán phù hợp" description="Thử đổi bộ lọc hoặc thêm điểm bán mới." icon={Store} />
              </div>
            ) : null}
          </div>
        </section>

        <form className="space-y-4" onSubmit={saveStore}>
          <FormSection title={editingId ? "Sửa điểm bán" : "Thêm điểm bán"}>
            <FormFieldWrapper label="Tên điểm bán">
              <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </FormFieldWrapper>
            <FormFieldWrapper label="Loại điểm bán">
              <select className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as StoreForm["type"] }))} required>
                <option value="">Chọn loại</option>
                {storeTypes.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </FormFieldWrapper>
            <FormFieldWrapper label="Địa chỉ">
              <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} required />
            </FormFieldWrapper>
            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper label="Thành phố">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
              </FormFieldWrapper>
              <FormFieldWrapper label="Quận/Huyện">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} required />
              </FormFieldWrapper>
              <FormFieldWrapper label="Phường/Xã">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.ward} onChange={(event) => setForm((current) => ({ ...current, ward: event.target.value }))} />
              </FormFieldWrapper>
              <FormFieldWrapper label="Số điện thoại">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </FormFieldWrapper>
            </div>
            <FormFieldWrapper label="Giờ mở cửa">
              <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.openingHours} onChange={(event) => setForm((current) => ({ ...current, openingHours: event.target.value }))} />
            </FormFieldWrapper>
            <FormFieldWrapper label="Google Map URL">
              <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={form.googleMapUrl} onChange={(event) => setForm((current) => ({ ...current, googleMapUrl: event.target.value }))} />
            </FormFieldWrapper>
            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper label="Latitude">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" type="number" step="any" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} />
              </FormFieldWrapper>
              <FormFieldWrapper label="Longitude">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" type="number" step="any" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} />
              </FormFieldWrapper>
            </div>
            <FormFieldWrapper label="Mô tả">
              <textarea className="min-h-24 w-full rounded-md border border-gray-200 px-3 py-2" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </FormFieldWrapper>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
              Hiển thị trên website
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="premium" disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
              ) : null}
            </div>
          </FormSection>
        </form>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Ẩn điểm bán?"
        description="Điểm bán sẽ không còn hiển thị trên website public. Bạn vẫn có thể bật lại bằng chức năng sửa/toggle."
        confirmLabel="Ẩn điểm bán"
        onCancel={() => setDeleteId(undefined)}
        onConfirm={deleteStore}
      />
    </div>
  );
}
