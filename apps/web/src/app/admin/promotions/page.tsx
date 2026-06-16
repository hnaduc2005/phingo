import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export default function AdminPromotionsPage() {
  return (
    <AdminEntityPage
      title="Mã giảm giá"
      description="Quản lý mã giảm giá theo phần trăm hoặc số tiền cố định."
      endpoint="/api/admin/promotions"
      searchKeys={["code", "name", "discountType"]}
      columns={[
        { key: "code", label: "Mã" },
        { key: "name", label: "Tên" },
        { key: "discountType", label: "Loại" },
        { key: "discountValue", label: "Giá trị" },
        { key: "usedCount", label: "Đã dùng" },
        { key: "isActive", label: "Hoạt động" },
      ]}
      fields={[
        { name: "code", label: "Mã", required: true },
        { name: "name", label: "Tên", required: true },
        { name: "description", label: "Mô tả", type: "textarea" },
        {
          name: "discountType",
          label: "Loại giảm",
          type: "select",
          required: true,
          options: [
            { label: "PERCENT", value: "PERCENT" },
            { label: "FIXED", value: "FIXED" },
          ],
        },
        { name: "discountValue", label: "Giá trị", type: "number", required: true },
        { name: "usageLimit", label: "Giới hạn lượt dùng", type: "number" },
        { name: "startDate", label: "Ngày bắt đầu", type: "date" },
        { name: "endDate", label: "Ngày kết thúc", type: "date" },
        { name: "isActive", label: "Đang hoạt động", type: "checkbox" },
      ]}
    />
  );
}
