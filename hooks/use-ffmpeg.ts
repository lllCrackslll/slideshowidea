"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useCallback, useRef, useState } from "react";
import { buildRepurposeCommand } from "@/lib/repurpose/build-command";
import type { RepurposeSettings } from "@/lib/repurpose/types";
import { getVideoMeta } from "@/lib/repurpose/video-meta";

const LOAD_TIMEOUT_MS = 120_000;

function canUseMultiThread(): boolean {
  return (
    typeof window !== "undefined" &&
    window.crossOriginIsolated === true &&
    typeof SharedArrayBuffer !== "undefined"
  );
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function attachHandlers(
  ffmpeg: FFmpeg,
  onProgress: (value: number) => void,
  onLog: (message: string) => void,
): void {
  ffmpeg.on("progress", ({ progress: p }) => onProgress(Math.round(p * 100)));
  ffmpeg.on("log", ({ message }) => onLog(message));
}

async function loadSingleThread(ffmpeg: FFmpeg): Promise<void> {
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await withTimeout(
    ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    }),
    LOAD_TIMEOUT_MS,
    "Chargement FFmpeg trop long. Vérifie ta connexion et réessaie.",
  );
}

async function loadMultiThread(ffmpeg: FFmpeg): Promise<void> {
  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
  await withTimeout(
    ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript",
      ),
    }),
    LOAD_TIMEOUT_MS,
    "Timeout FFmpeg multi-thread.",
  );
}

async function createLoadedFfmpeg(
  onProgress: (value: number) => void,
  onLog: (message: string) => void,
): Promise<{ ffmpeg: FFmpeg; mode: "mt" | "st" }> {
  if (canUseMultiThread()) {
    onLog("Chargement FFmpeg multi-thread…");
    const mt = new FFmpeg();
    attachHandlers(mt, onProgress, onLog);
    try {
      await loadMultiThread(mt);
      return { ffmpeg: mt, mode: "mt" };
    } catch {
      onLog("Multi-thread indisponible — mode standard…");
    }
  }

  onLog("Chargement FFmpeg (~30 Mo)…");
  const st = new FFmpeg();
  attachHandlers(st, onProgress, onLog);
  await loadSingleThread(st);
  return { ffmpeg: st, mode: "st" };
}

export function useFfmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadPromiseRef = useRef<Promise<FFmpeg> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState("");

  const load = useCallback(async (): Promise<FFmpeg> => {
    if (loaded && ffmpegRef.current) return ffmpegRef.current;
    if (loadPromiseRef.current) return loadPromiseRef.current;

    const promise = (async () => {
      setLoading(true);
      setLog("Initialisation FFmpeg…");

      try {
        const { ffmpeg, mode } = await createLoadedFfmpeg(setProgress, setLog);
        ffmpegRef.current = ffmpeg;
        setLoaded(true);
        setLog(mode === "mt" ? "FFmpeg prêt (multi-thread)." : "FFmpeg prêt.");
        return ffmpeg;
      } catch (error) {
        ffmpegRef.current = null;
        setLoaded(false);
        loadPromiseRef.current = null;
        throw error instanceof Error
          ? error
          : new Error("Impossible de charger FFmpeg.");
      } finally {
        setLoading(false);
      }
    })();

    loadPromiseRef.current = promise;
    return promise;
  }, [loaded]);

  const repurpose = useCallback(
    async (
      videoFile: File,
      settings: RepurposeSettings,
      watermarkFile: File | null,
      outputName: string,
    ): Promise<Blob> => {
      const ffmpeg = await load();
      const meta = await getVideoMeta(videoFile);
      const built = buildRepurposeCommand(settings, meta);

      const inputName = `input-${Date.now()}.mp4`;
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      const args: string[] = ["-i", inputName];

      if (settings.watermarkEnabled && watermarkFile) {
        const wmName = `wm-${Date.now()}.png`;
        await ffmpeg.writeFile(wmName, await fetchFile(watermarkFile));
        args.push("-i", wmName);
      }

      if (built.ss !== undefined) args.push("-ss", built.ss.toFixed(2));
      if (built.t !== undefined) args.push("-t", built.t.toFixed(2));

      if (built.filterComplex) {
        args.push("-filter_complex", built.filterComplex, "-map", "[outv]", "-map", "0:a?");
      } else if (built.videoFilters.length) {
        args.push("-vf", built.videoFilters.join(","));
      }

      if (built.audioFilters.length) {
        args.push("-af", built.audioFilters.join(","));
      }

      args.push(...built.outputOptions);
      for (const [key, value] of Object.entries(built.metadata)) {
        args.push("-metadata", `${key}=${value}`);
      }

      args.push(
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        outputName,
      );

      await ffmpeg.exec(args);
      return readOutput(ffmpeg, outputName);
    },
    [load],
  );

  return { load, loaded, loading, progress, log, repurpose };
}

async function readOutput(ffmpeg: FFmpeg, outputName: string): Promise<Blob> {
  const data = await ffmpeg.readFile(outputName);
  const bytes =
    data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  const mime = outputName.endsWith(".gif")
    ? "image/gif"
    : outputName.endsWith(".mp4")
      ? "video/mp4"
      : "application/octet-stream";
  return new Blob([bytes.buffer as ArrayBuffer], { type: mime });
}
