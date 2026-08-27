"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/lib/nav";

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <header className="k-nav">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center gap-4 px-4">
        <Link
          href="/"
          className="shrink-0 text-xs font-semibold tracking-tight text-[#1d1d1f]"
        >
          Kognia Studio
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pb-px">
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
                className={`k-nav-link ${active ? "k-nav-link-active" : ""}`}
              >
                <Icon className="hidden h-3.5 w-3.5 sm:block" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
