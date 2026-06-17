"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HeaderAuthActions } from "@/components/layout/HeaderAuthActions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/guide", label: "Hướng dẫn pha" },
  { href: "/about", label: "Về PHIN GO" },
  { href: "/stores", label: "Điểm bán" },
  { href: "/contact", label: "Liên hệ" },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-coffee/10 bg-brand-cream/90 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-brand-coffee">
            PHIN <span className="text-brand-mustard text-glow">GO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navItems.map((item) => {
            const isActive = item.href === "/" 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
              
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "relative py-2 transition-all hover:text-brand-coffee",
                  isActive ? "text-brand-coffee font-bold" : "text-brand-coffee/75"
                )}
              >
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-brand-mustard shadow-sm" />
                )}
              </Link>
            );
          })}
        </nav>

        <HeaderAuthActions />
      </div>
    </header>
  );
}

