"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/shell/brand-logo";
import { MAIN_NAV } from "@/lib/nav";

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <header className="k-nav">
      <div className="k-nav-glow-line" aria-hidden />
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 sm:gap-5 sm:px-6">
        <BrandLogo />

        <div className="hidden h-6 w-px bg-[rgba(0,122,255,0.15)] sm:block" />

        <nav className="k-nav-pill flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MAIN_NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`k-nav-link ${active ? "k-nav-link-active" : ""}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden min-[520px]:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
