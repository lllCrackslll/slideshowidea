"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/lib/nav";

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center gap-4 px-4">
        <Link
          href="/"
          className="shrink-0 text-xs font-medium tracking-tight text-zinc-100"
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
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] transition-colors sm:text-xs ${
                  active
                    ? "bg-zinc-100 font-medium text-zinc-950"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                }`}
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
