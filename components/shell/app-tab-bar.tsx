"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/shell/brand-logo";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { TOOLS } from "@/lib/nav";

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <header className="k-nav">
      <div className="k-nav-glow-line" aria-hidden />
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-6">
        <BrandLogo className="min-w-0 shrink-0" />

        <nav
          aria-label="Outils"
          className="k-nav-pill flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TOOLS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`k-nav-link flex min-h-9 shrink-0 items-center gap-1.5 px-2.5 sm:px-3 ${active ? "k-nav-link-active" : ""}`}
                title={item.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
