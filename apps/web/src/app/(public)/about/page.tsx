import { PublicContentPage } from "@/components/content/PublicContentPage";

export const metadata = {
  title: "Về PHIN GO",
  description: "Câu chuyện và sứ mệnh của thương hiệu cà phê phin giấy PHIN GO.",
};

export default function AboutPage() {
  return <PublicContentPage slug="about" fallbackTitle="Về PHIN GO" />;
}
