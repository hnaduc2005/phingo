"use client";

import { Edit, Package, Plus, Save, Search, Trash2, X } from "lucide-react";
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
import { normalizeEmptyToUndefined, toNumberOrUndefined, trimPayload } from "@/lib/form-normalize";

type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

type Category = {
  id: string;
  name: string;
};

type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number | string;
  stock: number;
  description?: string | null;
};

type Product = {
  id: string;
  categoryId?: string | null;
  name: string;
  slug: string;
  sku: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  stock: number;
  imageUrl?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  status: ProductStatus;
  category?: Category | null;
  variants?: ProductVariant[];
  displayStock?: number;
  variantStock?: number;
  stockMismatch?: boolean;
};

type ProductForm = {
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imageUrl: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
};

type VariantForm = {
  name: string;
  sku: string;
  price: string;
  stock: string;
  description: string;
};

const emptyProductForm: ProductForm = {
  categoryId: "",
  name: "",
  slug: "",
  sku: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  imageUrl: "",
  shortDescription: "",
  description: "",
  status: "DRAFT"
};

const emptyVariantForm: VariantForm = {
  name: "",
  sku: "",
  price: "",
  stock: "0",
  description: ""
};

const LOW_STOCK_THRESHOLD = 5;

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value));
}

function getVariantStock(product: Product) {
  return product.variantStock ?? product.variants?.reduce((sum, variant) => sum + Number(variant.stock ?? 0), 0) ?? 0;
}

function getDisplayStock(product: Product) {
  if (product.displayStock !== undefined) {
    return product.displayStock;
  }

  return product.variants?.length ? getVariantStock(product) : product.stock;
}

function hasStockMismatch(product: Product) {
  return product.stockMismatch ?? (Boolean(product.variants?.length) && product.stock !== getVariantStock(product));
}

function productToForm(product: Product): ProductForm {
  return {
    categoryId: product.categoryId ?? "",
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    stock: String(product.stock),
    imageUrl: product.imageUrl ?? "",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    status: product.status
  };
}

function variantToForm(variant: ProductVariant): VariantForm {
  return {
    name: variant.name,
    sku: variant.sku,
    price: String(variant.price),
    stock: String(variant.stock),
    description: variant.description ?? ""
  };
}

function productPayload(form: ProductForm) {
  return trimPayload({
    name: form.name,
    slug: form.slug,
    sku: form.sku,
    price: Number(form.price),
    stock: Number(form.stock || 0),
    status: form.status,
    categoryId: normalizeEmptyToUndefined(form.categoryId),
    compareAtPrice: toNumberOrUndefined(form.compareAtPrice),
    imageUrl: normalizeEmptyToUndefined(form.imageUrl),
    shortDescription: normalizeEmptyToUndefined(form.shortDescription),
    description: normalizeEmptyToUndefined(form.description)
  });
}

function variantPayload(form: VariantForm) {
  return trimPayload({
    name: form.name,
    sku: form.sku,
    price: Number(form.price),
    stock: Number(form.stock || 0),
    description: normalizeEmptyToUndefined(form.description)
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [variantForm, setVariantForm] = useState<VariantForm>(emptyVariantForm);
  const [editingProductId, setEditingProductId] = useState<string | undefined>();
  const [activeProductId, setActiveProductId] = useState<string | undefined>();
  const [editingVariantId, setEditingVariantId] = useState<string | undefined>();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingVariant, setIsSavingVariant] = useState(false);
  const [deleteVariantId, setDeleteVariantId] = useState<string | undefined>();
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | undefined>();

  const activeProduct = products.find((product) => product.id === activeProductId);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const [productPayloadResponse, categoryPayloadResponse] = await Promise.all([
        apiFetch<ApiResponse<Product[]>>("/api/admin/products"),
        apiFetch<ApiResponse<Category[]>>("/api/admin/categories")
      ]);
      setProducts(productPayloadResponse.data ?? []);
      setCategories(categoryPayloadResponse.data ?? []);
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể tải sản phẩm." });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadVariants(productId: string) {
    const payload = await apiFetch<ApiResponse<ProductVariant[]>>(`/api/admin/products/${productId}/variants`);
    setVariants(payload.data ?? []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery = [product.name, product.slug, product.sku, product.category?.name]
        .some((value) => String(value ?? "").toLowerCase().includes(term));
      return matchesQuery && (!status || product.status === status);
    });
  }, [products, query, status]);

  function resetProductForm() {
    setProductForm(emptyProductForm);
    setEditingProductId(undefined);
  }

  function resetVariantForm() {
    setVariantForm(emptyVariantForm);
    setEditingVariantId(undefined);
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setActiveProductId(product.id);
    setProductForm(productToForm(product));
    loadVariants(product.id).catch((err) => {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể tải biến thể." });
    });
  }

  function selectVariants(product: Product) {
    setActiveProductId(product.id);
    resetVariantForm();
    loadVariants(product.id).catch((err) => {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể tải biến thể." });
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(undefined);
    setIsSavingProduct(true);

    try {
      await apiFetch<ApiResponse>(editingProductId ? `/api/admin/products/${editingProductId}` : "/api/admin/products", {
        method: editingProductId ? "PATCH" : "POST",
        body: JSON.stringify(productPayload(productForm))
      });
      setToast({ type: "success", text: editingProductId ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm." });
      resetProductForm();
      await loadProducts();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể lưu sản phẩm." });
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function saveVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProductId) {
      setToast({ type: "error", text: "Vui lòng chọn sản phẩm trước khi thêm biến thể." });
      return;
    }

    setToast(undefined);
    setIsSavingVariant(true);

    try {
      await apiFetch<ApiResponse>(
        editingVariantId
          ? `/api/admin/product-variants/${editingVariantId}`
          : `/api/admin/products/${activeProductId}/variants`,
        {
          method: editingVariantId ? "PATCH" : "POST",
          body: JSON.stringify(variantPayload(variantForm))
        }
      );
      setToast({ type: "success", text: editingVariantId ? "Đã cập nhật biến thể." : "Đã thêm biến thể." });
      resetVariantForm();
      await Promise.all([loadVariants(activeProductId), loadProducts()]);
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể lưu biến thể." });
    } finally {
      setIsSavingVariant(false);
    }
  }

  async function deleteVariant() {
    if (!deleteVariantId || !activeProductId) {
      return;
    }

    try {
      await apiFetch<ApiResponse>(`/api/admin/product-variants/${deleteVariantId}`, { method: "DELETE" });
      setToast({ type: "success", text: "Đã xóa biến thể." });
      setDeleteVariantId(undefined);
      await Promise.all([loadVariants(activeProductId), loadProducts()]);
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể xóa biến thể." });
    }
  }

  async function hideProduct(product: Product) {
    if (!window.confirm(`Ẩn sản phẩm ${product.name}?`)) {
      return;
    }

    try {
      await apiFetch<ApiResponse>(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setToast({ type: "success", text: "Đã ẩn sản phẩm." });
      await loadProducts();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Không thể ẩn sản phẩm." });
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Sản phẩm"
        description="Quản lý sản phẩm, SKU, tồn kho, giá bán và biến thể hiển thị trên website."
      />

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
                placeholder="Tìm tên, slug, SKU..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {["DRAFT", "ACTIVE", "INACTIVE"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <Button type="button" variant="premium" onClick={resetProductForm}>
              <Plus className="h-4 w-4" />
              Sản phẩm mới
            </Button>
          </AdminFilterBar>

          <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Giá</th>
                    <th className="px-4 py-3 font-medium">Tồn kho</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={activeProductId === product.id ? "bg-amber-50/40" : "hover:bg-gray-50/60"}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-950">{product.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{product.category?.name ?? "Chưa phân loại"} · {product.slug}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{product.sku}</td>
                      <td className="px-4 py-4 font-semibold">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-gray-950">Bán: {getDisplayStock(product)}</p>
                          <p className="text-xs text-gray-500">Product: {product.stock}</p>
                          {product.variants?.length ? (
                            <p className="text-xs text-gray-500">Variants: {getVariantStock(product)}</p>
                          ) : null}
                          {getDisplayStock(product) <= LOW_STOCK_THRESHOLD ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              Sắp hết hàng
                            </span>
                          ) : null}
                          {hasStockMismatch(product) ? (
                            <span className="ml-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                              Lệch stock
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4"><AdminStatusBadge status={product.status} /></td>
                      <td className="px-4 py-4">
                        <AdminActionMenu>
                          <Button type="button" variant="outline" size="sm" onClick={() => startEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                            Sửa
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => selectVariants(product)}>
                            Biến thể
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => hideProduct(product)}>
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
            {!isLoading && filteredProducts.length === 0 ? (
              <div className="p-6">
                <AdminEmptyState title="Chưa có sản phẩm phù hợp" description="Thử đổi bộ lọc hoặc tạo sản phẩm mới." icon={Package} />
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <form onSubmit={saveProduct}>
            <FormSection title={editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}>
              <FormFieldWrapper label="Tên sản phẩm">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} required />
              </FormFieldWrapper>
              <div className="grid gap-3 md:grid-cols-2">
                <FormFieldWrapper label="Slug">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={productForm.slug} onChange={(event) => setProductForm((current) => ({ ...current, slug: event.target.value }))} required />
                </FormFieldWrapper>
                <FormFieldWrapper label="SKU">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} required />
                </FormFieldWrapper>
              </div>
              <FormFieldWrapper label="Danh mục">
                <select className="h-10 w-full rounded-md border border-gray-200 px-3" value={productForm.categoryId} onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}>
                  <option value="">Chưa phân loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </FormFieldWrapper>
              <div className="grid gap-3 md:grid-cols-2">
                <FormFieldWrapper label="Giá">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" type="number" min="0" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} required />
                </FormFieldWrapper>
                <FormFieldWrapper label="Giá so sánh">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" type="number" min="0" value={productForm.compareAtPrice} onChange={(event) => setProductForm((current) => ({ ...current, compareAtPrice: event.target.value }))} />
                </FormFieldWrapper>
                <FormFieldWrapper label="Tồn kho">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} required />
                </FormFieldWrapper>
                <FormFieldWrapper label="Trạng thái">
                  <select className="h-10 w-full rounded-md border border-gray-200 px-3" value={productForm.status} onChange={(event) => setProductForm((current) => ({ ...current, status: event.target.value as ProductStatus }))}>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </FormFieldWrapper>
              </div>
              <FormFieldWrapper label="URL ảnh">
                <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={productForm.imageUrl} onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))} />
              </FormFieldWrapper>
              <FormFieldWrapper label="Mô tả ngắn">
                <textarea className="min-h-20 w-full rounded-md border border-gray-200 px-3 py-2" value={productForm.shortDescription} onChange={(event) => setProductForm((current) => ({ ...current, shortDescription: event.target.value }))} />
              </FormFieldWrapper>
              <FormFieldWrapper label="Mô tả">
                <textarea className="min-h-24 w-full rounded-md border border-gray-200 px-3 py-2" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
              </FormFieldWrapper>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="premium" disabled={isSavingProduct}>
                  <Save className="h-4 w-4" />
                  {isSavingProduct ? "Đang lưu..." : "Lưu sản phẩm"}
                </Button>
                {editingProductId ? (
                  <Button type="button" variant="outline" onClick={resetProductForm}>
                    <X className="h-4 w-4" />
                    Hủy
                  </Button>
                ) : null}
              </div>
            </FormSection>
          </form>

          <form onSubmit={saveVariant}>
            <FormSection title={`Biến thể sản phẩm${activeProduct ? `: ${activeProduct.name}` : ""}`}>
              {!activeProduct ? (
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Chọn một sản phẩm trong bảng để quản lý biến thể.</p>
              ) : null}
              <div className="space-y-2">
                {variants.map((variant) => (
                  <div key={variant.id} className="rounded-md border border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-950">{variant.name}</p>
                        <p className="text-xs text-gray-500">{variant.sku} · {formatCurrency(variant.price)} · Tồn {variant.stock}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          setEditingVariantId(variant.id);
                          setVariantForm(variantToForm(variant));
                        }}>
                          Sửa
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteVariantId(variant.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {activeProduct && variants.length === 0 ? (
                  <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">Sản phẩm này chưa có biến thể.</p>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FormFieldWrapper label="Tên biến thể">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={variantForm.name} onChange={(event) => setVariantForm((current) => ({ ...current, name: event.target.value }))} disabled={!activeProduct} required={Boolean(activeProduct)} />
                </FormFieldWrapper>
                <FormFieldWrapper label="SKU biến thể">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" value={variantForm.sku} onChange={(event) => setVariantForm((current) => ({ ...current, sku: event.target.value }))} disabled={!activeProduct} required={Boolean(activeProduct)} />
                </FormFieldWrapper>
                <FormFieldWrapper label="Giá riêng">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" type="number" min="0" value={variantForm.price} onChange={(event) => setVariantForm((current) => ({ ...current, price: event.target.value }))} disabled={!activeProduct} required={Boolean(activeProduct)} />
                </FormFieldWrapper>
                <FormFieldWrapper label="Tồn kho">
                  <input className="h-10 w-full rounded-md border border-gray-200 px-3" type="number" min="0" value={variantForm.stock} onChange={(event) => setVariantForm((current) => ({ ...current, stock: event.target.value }))} disabled={!activeProduct} required={Boolean(activeProduct)} />
                </FormFieldWrapper>
              </div>
              <FormFieldWrapper label="Mô tả biến thể">
                <textarea className="min-h-20 w-full rounded-md border border-gray-200 px-3 py-2" value={variantForm.description} onChange={(event) => setVariantForm((current) => ({ ...current, description: event.target.value }))} disabled={!activeProduct} />
              </FormFieldWrapper>
              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="premium" disabled={!activeProduct || isSavingVariant}>
                  <Save className="h-4 w-4" />
                  {isSavingVariant ? "Đang lưu..." : editingVariantId ? "Lưu biến thể" : "Thêm biến thể"}
                </Button>
                {editingVariantId ? (
                  <Button type="button" variant="outline" onClick={resetVariantForm}>
                    <X className="h-4 w-4" />
                    Hủy
                  </Button>
                ) : null}
              </div>
            </FormSection>
          </form>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteVariantId)}
        title="Xóa biến thể?"
        description="Biến thể sẽ bị xóa khỏi sản phẩm. Các đơn hàng cũ vẫn giữ tên sản phẩm đã chốt trong order item."
        confirmLabel="Xóa biến thể"
        onCancel={() => setDeleteVariantId(undefined)}
        onConfirm={deleteVariant}
      />
    </div>
  );
}
