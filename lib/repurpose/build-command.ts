import {
  rand,
  randomPixelShiftCommand,
  randomSizeVideo,
  usGpsMetadata,
  randInt,
} from "./random";
import type { BuiltRepurposeCommand, RepurposeSettings } from "./types";
import type { VideoMeta } from "./video-meta";

function pickRange(filter: { min: number; max: number }): number {
  return rand(filter.min, filter.max);
}

export function buildRepurposeCommand(
  settings: RepurposeSettings,
  meta: VideoMeta,
): BuiltRepurposeCommand {
  const outputOptions: string[] = [];
  const videoFilters: string[] = [];
  const audioFilters: string[] = [];
  const metadata: Record<string, string> = {};

  if (settings.framerate.enabled) {
    outputOptions.push(
      "-r",
      String(randInt(settings.framerate.min, settings.framerate.max)),
    );
  }
  if (settings.videoBitrate.enabled) {
    outputOptions.push(
      "-b:v",
      `${randInt(settings.videoBitrate.min, settings.videoBitrate.max)}k`,
    );
  }
  if (settings.audioBitrate.enabled) {
    outputOptions.push(
      "-b:a",
      `${randInt(settings.audioBitrate.min, settings.audioBitrate.max)}k`,
    );
  }

  let ss: number | undefined;
  let t: number | undefined;
  if (settings.cutoff.enabled || settings.cutoffEnd.enabled) {
    let startTime = 0;
    let endTime = meta.duration;
    if (settings.cutoff.enabled) {
      startTime = pickRange(settings.cutoff);
      ss = startTime;
    }
    if (settings.cutoffEnd.enabled) {
      endTime = Math.max(
        startTime,
        meta.duration - pickRange(settings.cutoffEnd),
      );
    }
    t = Math.max(0, endTime - startTime);
  }

  if (settings.dimensionsEnabled && settings.dimensionsInput) {
    outputOptions.push("-s", settings.dimensionsInput);
  }

  if (settings.usMetadataEnabled) {
    const { latitude, longitude } = usGpsMetadata();
    metadata.location = `${latitude}${longitude}`;
  }

  if (settings.pixelShift.enabled) {
    videoFilters.push(
      randomPixelShiftCommand(settings.pixelShift.min, settings.pixelShift.max),
    );
  }
  if (settings.waveformShift.enabled) {
    const wave = pickRange(settings.waveformShift).toFixed(4);
    videoFilters.push(
      `geq=lum='p(X+(sin(T)*${wave}),Y)':cb='cb(X,Y)':cr='cr(X,Y)'`,
    );
  }
  if (settings.vignette.enabled) {
    videoFilters.push(`vignette=${pickRange(settings.vignette).toFixed(4)}`);
  }
  if (settings.brightness.enabled) {
    videoFilters.push(`eq=brightness=${pickRange(settings.brightness).toFixed(4)}`);
  }
  if (settings.contrast.enabled) {
    videoFilters.push(`eq=contrast=${pickRange(settings.contrast).toFixed(4)}`);
  }
  if (settings.saturation.enabled) {
    videoFilters.push(`eq=saturation=${pickRange(settings.saturation).toFixed(4)}`);
  }
  if (settings.gamma.enabled) {
    videoFilters.push(`eq=gamma=${pickRange(settings.gamma).toFixed(4)}`);
  }
  if (settings.randomPixelSizeEnabled) {
    const { width, height } = randomSizeVideo(meta.width, meta.height);
    videoFilters.push(`scale=${width}:${height}`);
  }
  if (settings.rotation.enabled) {
    videoFilters.push(`rotate=${pickRange(settings.rotation).toFixed(4)}*PI/180`);
  }
  if (settings.lensCorrection.enabled) {
    const k1 = pickRange(settings.lensCorrection).toFixed(4);
    const k2 = pickRange(settings.lensCorrection).toFixed(4);
    videoFilters.push(`lenscorrection=k1=${k1}:k2=${k2}`);
  }
  if (settings.zoom.enabled) {
    const zoom = pickRange(settings.zoom).toFixed(4);
    videoFilters.push(`crop=iw/${zoom}:ih/${zoom}`);
  }
  if (settings.horizontalFlipEnabled) {
    videoFilters.push("hflip");
  }
  if (settings.speed.enabled) {
    const speed = pickRange(settings.speed).toFixed(4);
    videoFilters.push(`setpts=PTS/${speed}`);
    audioFilters.push(`atempo=${speed}`);
  }
  if (settings.volume.enabled) {
    audioFilters.push(`volume=${pickRange(settings.volume).toFixed(4)}`);
  }
  if (settings.noise.enabled) {
    videoFilters.push(`noise=alls=${pickRange(settings.noise).toFixed(4)}:allf=t+u`);
  }

  const baseChain = videoFilters.join(",");
  const borderBlur = settings.blurredBorder.enabled
    ? pickRange(settings.blurredBorder).toFixed(2)
    : null;

  let filterComplex: string | undefined;
  let videoFilterSimple: string[] = [];

  if (borderBlur && settings.watermarkEnabled) {
    filterComplex = [
      `[0:v]${baseChain}[processed]`,
      `[processed]split[original][blurred]`,
      `[blurred]boxblur=10:1[blurred2]`,
      `[original]crop=iw:ih-${borderBlur}:0:out_h[clear]`,
      `[blurred2][clear]overlay=(W-w)/2:(H-h)/2[base]`,
      `[1:v]scale=w=${settings.watermarkSize}:h=${settings.watermarkSize}:force_original_aspect_ratio=decrease,format=rgba,colorchannelmixer=aa=${settings.watermarkOpacity}[wm]`,
      `[base][wm]overlay=x=(main_w-overlay_w)*${settings.watermarkX}:y=(main_h-overlay_h)*${settings.watermarkY}:format=auto,format=yuv420p[outv]`,
    ].join(";");
  } else if (borderBlur) {
    filterComplex = [
      `[0:v]${baseChain}[processed]`,
      `[processed]split[original][blurred]`,
      `[blurred]boxblur=10:1[blurred2]`,
      `[original]crop=iw:ih-${borderBlur}:0:out_h[clear]`,
      `[blurred2][clear]overlay=(W-w)/2:(H-h)/2,format=yuv420p[outv]`,
    ].join(";");
  } else if (settings.watermarkEnabled) {
    filterComplex = [
      `[0:v]${baseChain}[base]`,
      `[1:v]scale=w=${settings.watermarkSize}:h=${settings.watermarkSize}:force_original_aspect_ratio=decrease,format=rgba,colorchannelmixer=aa=${settings.watermarkOpacity}[wm]`,
      `[base][wm]overlay=x=(main_w-overlay_w)*${settings.watermarkX}:y=(main_h-overlay_h)*${settings.watermarkY}:format=auto,format=yuv420p[outv]`,
    ].join(";");
  } else if (baseChain) {
    videoFilterSimple = [...videoFilters, "format=yuv420p"];
  } else {
    videoFilterSimple = ["format=yuv420p"];
  }

  return {
    outputOptions,
    videoFilters: videoFilterSimple,
    audioFilters,
    filterComplex,
    ss,
    t,
    metadata,
  };
}
