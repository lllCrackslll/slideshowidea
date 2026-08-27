export type VideoMeta = {
  width: number;
  height: number;
  duration: number;
};

export function getVideoMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire la vidéo."));
    };
    video.src = url;
  });
}
