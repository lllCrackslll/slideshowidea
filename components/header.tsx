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
    <header className="k-divider bg-white/50 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
            Kognia Content Engine
          </h1>
          <span className="k-badge">Distribution TikTok</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadZip}
            disabled={!canDownload || exporting}
            className="k-btn-secondary h-8 px-2.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Télécharger les 5 PNG (.zip)</span>
            <span className="sm:hidden">Export ZIP</span>
          </button>
          <p className="hidden text-xs text-[#aeaeb2] lg:block">
            Carrousels 9:16 · StudyTok
          </p>
        </div>
      </div>
    </header>
  );
}
