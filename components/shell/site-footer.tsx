import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs k-text-muted">
        <span>© {new Date().getFullYear()} carrousels.studio</span>
        <Link href="/terms" className="k-link">
          Conditions d&apos;utilisation
        </Link>
        <Link href="/privacy" className="k-link">
          Politique de confidentialité
        </Link>
      </div>
    </footer>
  );
}
