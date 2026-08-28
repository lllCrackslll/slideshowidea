"use client";

import type { ReactNode } from "react";
import { AppTabBar } from "@/components/shell/app-tab-bar";
import { WorkspaceProvider } from "@/components/studio/workspace-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <AppTabBar />
      <main className="flex-1">{children}</main>
    </WorkspaceProvider>
  );
}
