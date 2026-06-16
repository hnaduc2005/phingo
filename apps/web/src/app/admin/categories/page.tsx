import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export default function AdminCategoriesPage() {
  return (
    <AdminEntityPage
      title="Danh mục"
      description="Quản lý danh mục sản phẩm và trạng thái hoạt động."
      endpoint="/api/admin/categories"
      searchKeys={["name", "slug"]}
      columns={[
        { key: "name", label: "Tên" },
        { key: "slug", label: "Slug" },
        { key: "isActive", label: "Hiển thị" },
        { key: "_count.products", label: "Sản phẩm" },
      ]}
      fields={[
        { name: "name", label: "Tên danh mục", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "description", label: "Mô tả", type: "textarea" },
        { name: "isActive", label: "Đang hiển thị", type: "checkbox" },
      ]}
    />
  );
}
