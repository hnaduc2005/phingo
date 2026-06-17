import { PublicContentPage } from "@/components/content/PublicContentPage";

export const metadata = {
  title: "Hướng dẫn pha - PHIN GO",
  description: "Hướng dẫn pha PHIN GO do admin quản lý.",
};

export default function GuidePage() {
  return <PublicContentPage slug="guide" fallbackTitle="Hướng dẫn pha" />;
}
