import { AppShell } from "@/components/shell/app-shell";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "carrousels.studio",
  description:
    "Génère et distribue des carrousels TikTok sur plusieurs comptes — pack multi-comptes, planning et outils image.",
};

const THEME_INIT = `(function(){try{var k="carrousels-theme";var t=localStorage.getItem(k);var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT }}
          suppressHydrationWarning
        />
      </head>
      <body className="flex min-h-full flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
