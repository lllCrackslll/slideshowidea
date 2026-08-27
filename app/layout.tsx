import { AppTabBar } from "@/components/shell/app-tab-bar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kognia Studio",
  description:
    "Suite carrousels TikTok : génération, distribution multi-comptes, outils image.",
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
