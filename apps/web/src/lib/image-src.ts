import { imageAssets } from "@/config/images";

export function isSafeImageSrc(value?: string | null) {
  const src = value?.trim();

  if (!src) {
    return false;
  }

  if (src.startsWith("/") || src.startsWith("data:image/")) {
    return true;
  }

  try {
    const parsed = new URL(src);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isRemoteImageSrc(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:image/");
}

export function safeImageSrc(value?: string | null, fallback = imageAssets.productGroup) {
  return isSafeImageSrc(value) ? value!.trim() : fallback;
}
