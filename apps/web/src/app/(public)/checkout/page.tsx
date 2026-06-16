"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { BankTransferInfoCard } from "@/components/checkout/BankTransferInfoCard";
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

type PaymentMethod = {
  method: "COD" | "BANK_TRANSFER" | "MOMO" | "VNPAY" | "ZALOPAY" | "CREDIT_CARD";
  name: string;
  enabled: boolean;
  bankTransfer?: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    qrImageUrl?: string;
    transferContentTemplate?: string;
  };
};

type Order = {
  id: string;
  orderCode: string;
  totalAmount: number | string;
  paymentMethod: string;
};

type Promotion = {
  code: string;
  name: string;
  description?: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number | string;
};

const emptyAddress = {
  receiverName: "",
  receiverPhone: "",
  city: "",
  district: "",
  ward: "",
  addressLine: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatAddress(address: Address) {
  return `${address.receiverName} - ${address.receiverPhone}, ${address.addressLine}, ${address.ward}, ${address.district}, ${address.city}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { items, subtotal, refreshCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod["method"]>("COD");
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | undefined>();
  const [promotionMessage, setPromotionMessage] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingPromotion, setIsApplyingPromotion] = useState(false);

  const selectedCity = vietnamAddresses.find(c => c.name === newAddress.city);
  const selectedDistrict = selectedCity?.districts.find(d => d.name === newAddress.district);
  const districts = selectedCity?.districts || [];
  const wards = selectedDistrict?.wards || [];

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadCheckoutData() {
      const [addressPayload, paymentPayload] = await Promise.all([
        apiFetch<ApiResponse<Address[]>>("/api/account/addresses"),
        apiFetch<ApiResponse<PaymentMethod[]>>("/api/payments/methods"),
      ]);
      const loadedAddresses = addressPayload.data ?? [];

      setAddresses(loadedAddresses);
      setSelectedAddressId(loadedAddresses.find((address) => address.isDefault)?.id ?? loadedAddresses[0]?.id ?? "");
      setAddressMode(loadedAddresses.length ? "saved" : "new");
      setPaymentMethods(paymentPayload.data ?? []);
    }

    loadCheckoutData().catch((err) => {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu checkout.");
    });
  }, [isAuthenticated]);

  const promotionDiscount = useMemo(() => {
    if (!appliedPromotion) {
      return 0;
    }

    const value = Number(appliedPromotion.discountValue);
    const discount = appliedPromotion.discountType === "PERCENT" ? subtotal * (value / 100) : value;

    return Math.min(subtotal, Math.max(0, discount));
  }, [appliedPromotion, subtotal]);
  const shippingFee = subtotal >= 300000 ? 0 : 25000;
  const total = Math.max(0, subtotal - promotionDiscount + shippingFee);
  const selectedPaymentMethod = paymentMethods.find((method) => method.method === paymentMethod);

  const canSubmit = useMemo(() => {
    if (!items.length || !user) {
      return false;
    }

    if (addressMode === "saved") {
      return Boolean(selectedAddressId);
    }

    return Object.values(newAddress).every((value) => value.trim().length > 1);
  }, [addressMode, items.length, newAddress, selectedAddressId, user]);

  async function applyPromotion() {
    const code = promotionCode.trim().toUpperCase();

    setPromotionMessage("");
    setAppliedPromotion(undefined);

    if (!code) {
      setPromotionMessage("Vui lòng nhập mã giảm giá.");
      return;
    }

    setIsApplyingPromotion(true);

    try {
      const payload = await apiFetch<ApiResponse<Promotion>>(`/api/promotions/validate/${encodeURIComponent(code)}`);

      if (!payload.data) {
        throw new Error(payload.message || "Mã giảm giá không hợp lệ.");
      }

      setAppliedPromotion(payload.data);
      setPromotionCode(payload.data.code);
      setPromotionMessage(`Đã áp dụng ${payload.data.name}.`);
    } catch (err) {
      setPromotionMessage(err instanceof Error ? err.message : "Không thể áp dụng mã giảm giá.");
    } finally {
      setIsApplyingPromotion(false);
    }
  }

  function removePromotion() {
    setAppliedPromotion(undefined);
    setPromotionCode("");
    setPromotionMessage("Đã bỏ mã giảm giá.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (!canSubmit) {
      setError("Vui lòng kiểm tra giỏ hàng và địa chỉ giao hàng.");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
      const payload = await apiFetch<ApiResponse<Order>>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          addressId: addressMode === "saved" ? selectedAddressId : undefined,
          shippingAddress: addressMode === "new" ? formatAddress({ id: "new", isDefault: false, ...newAddress }) : undefined,
          customerName:
            addressMode === "new"
              ? newAddress.receiverName
              : selectedAddress?.receiverName || user?.name,
          customerPhone:
            addressMode === "new"
              ? newAddress.receiverPhone
              : selectedAddress?.receiverPhone || user?.phone,
          paymentMethod,
          promotionCode: appliedPromotion?.code,
          note: note.trim() || undefined,
        }),
      });

      if (!payload.data) {
        throw new Error(payload.message || "Không nhận được thông tin đơn hàng.");
      }

      await refreshCart();
      router.replace(`/order-success?orderId=${payload.data.id}&orderCode=${payload.data.orderCode}`);
    } catch (err) {
      if (err instanceof ApiError && err.fields && err.fields.length > 0) {
        const errors: Record<string, string> = {};
        for (const field of err.fields) {
          errors[field.field] = field.message;
        }
        setFieldErrors(errors);
        setError("Vui lòng kiểm tra lại thông tin.");
      } else {
        setError(err instanceof Error ? err.message : "Không thể đặt hàng.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-cream px-4 text-brand-coffee">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-cream px-4">
        <section className="max-w-md rounded-lg bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-brand-coffee">Giỏ hàng trống</h1>
          <p className="mt-3 text-brand-coffee/70">Bạn cần có sản phẩm trong giỏ trước khi checkout.</p>
          <Button className="mt-6 w-full" variant="premium" onClick={() => router.push("/products")}>
            Xem sản phẩm
          </Button>
        </section>
      </div>
    );
  }

  return (
    <form className="bg-brand-cream py-16" onSubmit={onSubmit}>
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-brand-coffee">Checkout</h1>
            <p className="mt-3 text-brand-coffee/70">Xác nhận giỏ hàng, địa chỉ giao hàng và phương thức thanh toán.</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-coffee">1. Giỏ hàng</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm text-brand-coffee/75">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-semibold text-brand-coffee">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-coffee">2. Địa chỉ giao hàng</h2>
            {addresses.length ? (
              <div className="mt-4 flex gap-3">
                <Button type="button" variant={addressMode === "saved" ? "premium" : "outline"} onClick={() => setAddressMode("saved")}>
                  Địa chỉ đã lưu
                </Button>
                <Button type="button" variant={addressMode === "new" ? "premium" : "outline"} onClick={() => setAddressMode("new")}>
                  Nhập địa chỉ mới
                </Button>
              </div>
            ) : null}

            {addressMode === "saved" && addresses.length ? (
              <div className="mt-4 grid gap-3">
                {addresses.map((address) => (
                  <label key={address.id} className="flex gap-3 rounded-md border border-brand-coffee/15 p-3 text-sm text-brand-coffee">
                    <input
                      name="addressId"
                      type="radio"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <span>{formatAddress(address)}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <input
                    className={`h-11 w-full rounded-md border px-3 ${fieldErrors.receiverName ? "border-red-500" : "border-brand-coffee/20"}`}
                    placeholder="Người nhận"
                    value={newAddress.receiverName}
                    onChange={(e) => {
                      setNewAddress((curr) => ({ ...curr, receiverName: e.target.value }));
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
                    value={newAddress.receiverPhone}
                    onChange={(e) => {
                      setNewAddress((curr) => ({ ...curr, receiverPhone: e.target.value }));
                      setFieldErrors(curr => ({ ...curr, receiverPhone: "" }));
                    }}
                    required
                  />
                  {fieldErrors.receiverPhone && <p className="mt-1 text-xs text-red-600">{fieldErrors.receiverPhone}</p>}
                </div>
                <div>
                  <select
                    className={`h-11 w-full rounded-md border px-3 bg-white ${fieldErrors.city ? "border-red-500" : "border-brand-coffee/20"}`}
                    value={newAddress.city}
                    onChange={(e) => {
                      setNewAddress((curr) => ({ ...curr, city: e.target.value, district: "", ward: "" }));
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
                    value={newAddress.district}
                    onChange={(e) => {
                      setNewAddress((curr) => ({ ...curr, district: e.target.value, ward: "" }));
                      setFieldErrors(curr => ({ ...curr, district: "" }));
                    }}
                    required
                    disabled={!newAddress.city}
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
                    value={newAddress.ward}
                    onChange={(e) => {
                      setNewAddress((curr) => ({ ...curr, ward: e.target.value }));
                      setFieldErrors(curr => ({ ...curr, ward: "" }));
                    }}
                    required
                    disabled={!newAddress.district}
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
                    value={newAddress.addressLine}
                    onChange={(e) => {
                      setNewAddress((curr) => ({ ...curr, addressLine: e.target.value }));
                      setFieldErrors(curr => ({ ...curr, addressLine: "" }));
                    }}
                    required
                  />
                  {fieldErrors.addressLine && <p className="mt-1 text-xs text-red-600">{fieldErrors.addressLine}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-coffee">3. Phương thức thanh toán</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.method}
                  className={`flex items-center gap-3 rounded-md border p-3 text-sm ${
                    method.enabled ? "border-brand-coffee/15 text-brand-coffee" : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  <input
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === method.method}
                    disabled={!method.enabled}
                    onChange={() => setPaymentMethod(method.method)}
                  />
                  <span>
                    {method.name}
                    {!method.enabled ? " - Sắp hỗ trợ" : ""}
                  </span>
                </label>
              ))}
            </div>
            {selectedPaymentMethod?.bankTransfer ? (
              <div className="mt-6">
                <BankTransferInfoCard
                  amount={total}
                  bankName={selectedPaymentMethod.bankTransfer.bankName}
                  bankAccountNumber={selectedPaymentMethod.bankTransfer.bankAccountNumber}
                  bankAccountHolder={selectedPaymentMethod.bankTransfer.bankAccountHolder}
                  qrImageUrl={selectedPaymentMethod.bankTransfer.qrImageUrl}
                  transferContent="Nội dung chuyển khoản sẽ được tạo sau khi đặt đơn."
                />
              </div>
            ) : null}
          </div>
        </section>

        <aside className="h-fit rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-coffee">4. Xác nhận</h2>
          <div className="mt-4 flex gap-2">
            <input
              className="h-11 min-w-0 flex-1 rounded-md border border-brand-coffee/20 px-3"
              placeholder="Mã giảm giá"
              value={promotionCode}
              onChange={(event) => {
                setPromotionCode(event.target.value);
                if (appliedPromotion && event.target.value.toUpperCase() !== appliedPromotion.code) {
                  setAppliedPromotion(undefined);
                  setPromotionMessage("");
                }
              }}
            />
            {appliedPromotion ? (
              <Button type="button" variant="outline" onClick={removePromotion}>
                Bỏ
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={applyPromotion} disabled={isApplyingPromotion}>
                {isApplyingPromotion ? "Đang áp dụng..." : "Áp dụng"}
              </Button>
            )}
          </div>
          {promotionMessage ? (
            <p
              className={`mt-2 rounded-md p-3 text-sm ${
                appliedPromotion ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {promotionMessage}
            </p>
          ) : null}
          <textarea
            className="mt-3 min-h-24 w-full rounded-md border border-brand-coffee/20 px-3 py-2"
            placeholder="Ghi chú đơn hàng"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="mt-5 space-y-3 text-sm text-brand-coffee/70">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span>{shippingFee ? formatCurrency(shippingFee) : "Miễn phí"}</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá</span>
              <span>{promotionDiscount ? `-${formatCurrency(promotionDiscount)}` : formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between border-t border-brand-coffee/10 pt-3 text-lg font-bold text-brand-coffee">
              <span>Tổng</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <Button className="mt-4 w-full" variant="premium" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
