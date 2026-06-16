import { AdminEntityPage } from "@/components/admin/AdminEntityPage";

export default function AdminContentPage() {
  return (
    <AdminEntityPage
      title="Nội dung website"
      description="Quản lý trang giới thiệu, hướng dẫn pha, liên hệ và nội dung tĩnh."
      endpoint="/api/admin/content"
      searchKeys={["key", "title", "slug", "status"]}
      columns={[
        { key: "key", label: "Key" },
        { key: "title", label: "Tiêu đề" },
        { key: "slug", label: "Slug" },
        { key: "status", label: "Trạng thái" },
      ]}
      fields={[
        { name: "key", label: "Key", required: true },
        { name: "title", label: "Tiêu đề", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "content", label: "Nội dung", type: "textarea", required: true },
        {
          name: "status",
          label: "Trạng thái",
          type: "select",
          required: true,
          options: [
            { label: "DRAFT", value: "DRAFT" },
            { label: "PUBLISHED", value: "PUBLISHED" },
          ],
        },
      ]}
    />
  );
}
