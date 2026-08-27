"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useCallback, useRef, useState } from "react";
import { buildRepurposeCommand } from "@/lib/repurpose/build-command";
import type { RepurposeSettings } from "@/lib/repurpose/types";
import { getVideoMeta } from "@/lib/repurpose/video-meta";

export function useFfmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState("");

  const load = useCallback(async () => {
    if (loaded && ffmpegRef.current) return ffmpegRef.current;

    setLoading(true);
    setLog("Chargement de FFmpeg (~30 Mo)…");

    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));
    ffmpeg.on("log", ({ message }) => setLog(message));

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegRef.current = ffmpeg;
    setLoaded(true);
    setLoading(false);
    setLog("FFmpeg prêt.");
    return ffmpeg;
  }, [loaded]);

  const run = useCallback(
    async (
      inputName: string,
      inputFile: File,
      outputName: string,
      args: string[],
    ): Promise<Blob> => {
      const ffmpeg = await load();
      await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
      await ffmpeg.exec(["-i", inputName, ...args, outputName]);
      return readOutput(ffmpeg, outputName);
    },
    [load],
  );

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
        "fast",
        "-crf",
        "22",
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

  return { load, loaded, loading, progress, log, run, repurpose };
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
