import { AppTabBar } from "@/components/shell/app-tab-bar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "carrousels.studio",
  description:
    "Génère et distribue des carrousels TikTok sur plusieurs comptes — pack multi-comptes, planning et outils image.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AppTabBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
