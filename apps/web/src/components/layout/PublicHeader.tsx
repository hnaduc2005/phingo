import Link from "next/link";

import { HeaderAuthActions } from "@/components/layout/HeaderAuthActions";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/guide", label: "Hướng dẫn pha" },
  { href: "/about", label: "Về PHIN GO" },
  { href: "/stores", label: "Điểm bán" },
  { href: "/contact", label: "Liên hệ" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-coffee/10 bg-brand-cream/90 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-brand-coffee">
            PHIN <span className="text-brand-mustard text-glow">GO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-coffee/80 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-brand-coffee">
              {item.label}
            </Link>
          ))}
        </nav>

        <HeaderAuthActions />
      </div>
    </header>
  );
}
