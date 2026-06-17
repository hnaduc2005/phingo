"use client";

import { useEffect, useState } from "react";

import { apiFetch, type ApiResponse } from "@/lib/api";

type ContentPage = {
  title: string;
  content: string;
};

type PublicContentPageProps = {
  slug: string;
  fallbackTitle: string;
};

const fallbackContent = "Nội dung đang được cập nhật.";

export function PublicContentPage({ slug, fallbackTitle }: PublicContentPageProps) {
  const [page, setPage] = useState<ContentPage | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        const payload = await apiFetch<ApiResponse<ContentPage>>(`/api/content/${slug}`);

        if (!cancelled) {
          setPage(payload.data);
        }
      } catch {
        if (!cancelled) {
          setPage(undefined);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const title = page?.title?.trim() || fallbackTitle;
  const content = page?.content?.trim() || fallbackContent;
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  return (
    <main className="bg-brand-cream py-20">
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-sm md:p-10">
          <h1 className="text-4xl font-bold text-brand-coffee md:text-5xl">{title}</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-brand-coffee/75">
            {isLoading ? (
              <p>Đang tải nội dung...</p>
            ) : (
              paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
