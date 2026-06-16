"use client";

import { FormEvent, useEffect, useState } from "react";
import { MapPin, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { vietnamAddresses } from "@/data/vietnam-addresses";
import { apiFetch, ApiError, type ApiResponse } from "@/lib/api";

type Address = {
  id: string;
  receiverName: string;
  receiverPhone: string;
  city: string;
  district: string;
  ward: string;
  addressLine: string;
  isDefault: boolean;
};

const emptyForm = {
  receiverName: "",
  receiverPhone: "",
  city: "",
  district: "",
  ward: "",
  addressLine: "",
  isDefault: false,
};

function formatAddress(address: Address) {
  return `${address.addressLine}, ${address.ward}, ${address.district}, ${address.city}`;
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const selectedCity = vietnamAddresses.find(c => c.name === form.city);
  const selectedDistrict = selectedCity?.districts.find(d => d.name === form.district);
  const districts = selectedCity?.districts || [];
  const wards = selectedDistrict?.wards || [];

  async function loadAddresses() {
    const payload = await apiFetch<ApiResponse<Address[]>>("/api/account/addresses");
    setAddresses(payload.data ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      apiFetch<ApiResponse<Address[]>>("/api/account/addresses")
        .then((payload) => {
          if (!cancelled) {
            setAddresses(payload.data ?? []);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError("Không thể tải địa chỉ.");
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

  function editAddress(address: Address) {
    setEditingId(address.id);
    setForm({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      city: address.city,
      district: address.district,
      ward: address.ward,
      addressLine: address.addressLine,
      isDefault: address.isDefault,
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setFieldErrors({});

    try {
      await apiFetch<ApiResponse>(editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      setMessage(editingId ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ.");
      setForm(emptyForm);
      setEditingId(undefined);
      await loadAddresses();
    } catch (err) {
      if (err instanceof ApiError && err.fields && err.fields.length > 0) {
        const errors: Record<string, string> = {};
        for (const field of err.fields) {
          errors[field.field] = field.message;
        }
        setFieldErrors(errors);
        setError("Vui lòng kiểm tra lại thông tin.");
      } else {
        setError(err instanceof Error ? err.message : "Không thể lưu địa chỉ.");
      }
    }
  }

  async function deleteAddress(id: string) {
    if (!window.confirm("Xóa địa chỉ này?")) {
      return;
    }

    await apiFetch<ApiResponse>(`/api/account/addresses/${id}`, { method: "DELETE" });
    await loadAddresses();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-brand-coffee">Địa chỉ giao hàng</h1>
        <p className="mt-3 text-brand-coffee/70">Thêm, sửa, xóa và đặt địa chỉ mặc định cho các đơn hàng PHIN GO.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-coffee">Danh sách địa chỉ</h2>
          {isLoading ? <p className="mt-4 text-brand-coffee/70">Đang tải...</p> : null}
          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-brand-coffee/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-brand-coffee">
                      {address.receiverName} - {address.receiverPhone}
                    </p>
                    <p className="mt-1 text-sm text-brand-coffee/70">{formatAddress(address)}</p>
                    {address.isDefault ? <span className="mt-2 inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Mặc định</span> : null}
                  </div>
                  <MapPin className="h-5 w-5 text-brand-mustard" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => editAddress(address)}>
                    Sửa
                  </Button>
                  {!address.isDefault ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await apiFetch<ApiResponse>(`/api/account/addresses/${address.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ isDefault: true }),
                        });
                        await loadAddresses();
                      }}
                    >
                      Đặt mặc định
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => deleteAddress(address.id)}>
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
            {!addresses.length && !isLoading ? <p className="text-sm text-brand-coffee/70">Chưa có địa chỉ nào.</p> : null}
          </div>
        </div>

        <form className="h-fit rounded-lg bg-white p-6 shadow-sm" onSubmit={onSubmit}>
          <h2 className="text-xl font-semibold text-brand-coffee">{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ"}</h2>
          <div className="mt-4 space-y-3">
            <div>
              <input
                className={`h-11 w-full rounded-md border px-3 ${fieldErrors.receiverName ? "border-red-500" : "border-brand-coffee/20"}`}
                placeholder="Người nhận"
                value={form.receiverName}
                onChange={(e) => {
                  setForm((curr) => ({ ...curr, receiverName: e.target.value }));
                  setFieldErrors(curr => ({ ...curr, receiverName: "" }));
                }}
                required
              />
              {fieldErrors.receiverName && <p className="mt-1 text-xs text-red-600">{fieldErrors.receiverName}</p>}
            </div>
            <div>
              <input
                className={`h-11 w-full rounded-md border px-3 ${fieldErrors.receiverPhone ? "border-red-500" : "border-brand-coffee/20"}`}
                placeholder="Số điện thoại"
                value={form.receiverPhone}
                onChange={(e) => {
                  setForm((curr) => ({ ...curr, receiverPhone: e.target.value }));
                  setFieldErrors(curr => ({ ...curr, receiverPhone: "" }));
                }}
                required
              />
              {fieldErrors.receiverPhone && <p className="mt-1 text-xs text-red-600">{fieldErrors.receiverPhone}</p>}
            </div>
            <div>
              <select
                className={`h-11 w-full rounded-md border px-3 bg-white ${fieldErrors.city ? "border-red-500" : "border-brand-coffee/20"}`}
                value={form.city}
                onChange={(e) => {
                  setForm((curr) => ({ ...curr, city: e.target.value, district: "", ward: "" }));
                  setFieldErrors(curr => ({ ...curr, city: "" }));
                }}
                required
              >
                <option value="" disabled hidden>Chọn tỉnh/thành phố</option>
                {vietnamAddresses.map(city => (
                  <option key={city.code} value={city.name}>{city.name}</option>
                ))}
              </select>
              {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
            </div>
            <div>
              <select
                className={`h-11 w-full rounded-md border px-3 bg-white disabled:bg-gray-50 disabled:text-gray-400 ${fieldErrors.district ? "border-red-500" : "border-brand-coffee/20"}`}
                value={form.district}
                onChange={(e) => {
                  setForm((curr) => ({ ...curr, district: e.target.value, ward: "" }));
                  setFieldErrors(curr => ({ ...curr, district: "" }));
                }}
                required
                disabled={!form.city}
              >
                <option value="" disabled hidden>Chọn quận/huyện</option>
                {districts.map(district => (
                  <option key={district.code} value={district.name}>{district.name}</option>
                ))}
              </select>
              {fieldErrors.district && <p className="mt-1 text-xs text-red-600">{fieldErrors.district}</p>}
            </div>
            <div>
              <select
                className={`h-11 w-full rounded-md border px-3 bg-white disabled:bg-gray-50 disabled:text-gray-400 ${fieldErrors.ward ? "border-red-500" : "border-brand-coffee/20"}`}
                value={form.ward}
                onChange={(e) => {
                  setForm((curr) => ({ ...curr, ward: e.target.value }));
                  setFieldErrors(curr => ({ ...curr, ward: "" }));
                }}
                required
                disabled={!form.district}
              >
                <option value="" disabled hidden>Chọn phường/xã</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.name}>{ward.name}</option>
                ))}
              </select>
              {fieldErrors.ward && <p className="mt-1 text-xs text-red-600">{fieldErrors.ward}</p>}
            </div>
            <div>
              <input
                className={`h-11 w-full rounded-md border px-3 ${fieldErrors.addressLine ? "border-red-500" : "border-brand-coffee/20"}`}
                placeholder="Địa chỉ cụ thể"
                value={form.addressLine}
                onChange={(e) => {
                  setForm((curr) => ({ ...curr, addressLine: e.target.value }));
                  setFieldErrors(curr => ({ ...curr, addressLine: "" }));
                }}
                required
              />
              {fieldErrors.addressLine && <p className="mt-1 text-xs text-red-600">{fieldErrors.addressLine}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-brand-coffee">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
              />
              Đặt làm địa chỉ mặc định
            </label>
          </div>
          {message ? <p className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
          {error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <div className="mt-4 flex gap-2">
            <Button variant="premium">{editingId ? "Lưu thay đổi" : "Thêm địa chỉ"}</Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(undefined);
                  setForm(emptyForm);
                }}
              >
                Hủy
              </Button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
