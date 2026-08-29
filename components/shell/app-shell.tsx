"use client";

import type { ReactNode } from "react";
import { AppTabBar } from "@/components/shell/app-tab-bar";
import { SiteFooter } from "@/components/shell/site-footer";
import { WorkspaceProvider } from "@/components/studio/workspace-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <AppTabBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </WorkspaceProvider>
  );
}
