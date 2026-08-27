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
    <header className="border-b border-[#27272a]">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-medium tracking-tight text-zinc-100">
            Kognia Content Engine
          </h1>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-400">
            Distribution TikTok
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadZip}
            disabled={!canDownload || exporting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#27272a] px-2.5 text-[11px] text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-white/[0.03] hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-xs"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Télécharger les 5 PNG (.zip)</span>
            <span className="sm:hidden">Export ZIP</span>
          </button>
          <p className="hidden text-xs text-zinc-600 lg:block">
            Carrousels 9:16 · StudyTok
          </p>
        </div>
      </div>
    </header>
  );
}
