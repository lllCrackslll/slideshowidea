"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/lib/nav";

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <header className="k-nav">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <Link
          href="/"
          className="shrink-0 text-[11px] font-semibold tracking-tight text-[#1d1d1f] sm:text-xs"
        >
          Kognia
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                <Icon className="h-3.5 w-3.5 sm:mr-0" />
                <span className="hidden min-[480px]:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
