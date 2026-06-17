"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

type VideoPreviewProps = {
  thumbnailUrl?: string;
  videoUrl?: string;
  title?: string;
  description?: string;
};

export function VideoPreview({ thumbnailUrl, videoUrl, title, description }: VideoPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Close on Escape key
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
  }

  return (
    <div className="relative mx-auto max-w-4xl w-full">
      {/* Thumbnail Trigger */}
      <button
        type="button"
        className="group relative block w-full overflow-hidden rounded-2xl bg-brand-cream/50 shadow-lg aspect-video"
        onClick={openModal}
        aria-label="Play video"
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title || "Video preview"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-coffee/5 to-brand-coffee/20" />
        )}
        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-brand-coffee shadow-xl transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 ml-1" fill="currentColor" />
          </div>
        </div>
        {(title || description) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-left text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {title && <h3 className="text-xl font-bold">{title}</h3>}
            {description && <p className="mt-2 text-sm text-white/80">{description}</p>}
          </div>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl aspect-video animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
            {videoUrl ? (
              <iframe
                src={videoUrl}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || "Video"}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-brand-coffee text-white p-8 text-center">
                <Play className="h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-2xl font-bold">Video hướng dẫn đang được cập nhật</h3>
                <p className="mt-2 text-white/70">Vui lòng quay lại sau</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
