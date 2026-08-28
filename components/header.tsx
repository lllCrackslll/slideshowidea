"use client";

import { Download, Loader2 } from "lucide-react";

type HeaderProps = {
  onDownloadZip: () => void;
  exporting: boolean;
  canDownload: boolean;
};

export function Header({
  onDownloadZip,
  exporting,
  canDownload,
}: HeaderProps) {
  return (
    <header className="k-divider backdrop-blur-sm" style={{ background: "var(--surface-nav)" }}>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="k-subheading text-sm font-semibold tracking-tight">
            Content Engine
          </h1>
          <span className="k-badge">Distribution TikTok</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadZip}
            disabled={!canDownload || exporting}
            className="k-btn-secondary h-9 w-full px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-auto"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span className="sm:hidden">Export ZIP</span>
            <span className="hidden sm:inline">Télécharger les 5 PNG (.zip)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
