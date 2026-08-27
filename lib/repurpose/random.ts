export function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

export function randomSizeVideo(originalWidth: number, originalHeight: number) {
  const minScale = 800 / originalWidth;
  const maxScale = 1800 / originalWidth;
  const scaleFactor = rand(minScale, maxScale);
  const width = Math.floor((originalWidth * scaleFactor) / 2) * 2;
  const height = Math.floor((originalHeight * scaleFactor) / 2) * 2;
  return { width, height };
}

export function usGpsMetadata(): { latitude: number; longitude: number } {
  const north = 49.3457868;
  const south = 24.396308;
  const east = -66.93457;
  const west = -125;
  return {
    latitude: rand(south, north),
    longitude: rand(west, east),
  };
}

export function randomPixelShiftCommand(min: number, max: number): string {
  const commands = [
    "geq=lum='p(X+SHIFT*sin(2*PI*Y/H),Y)':cb='cb(X,Y)':cr='cr(X,Y)'",
    "geq=lum='p(X+SHIFT*sin(2*PI*sqrt((X-W/2)*(X-W/2)+(Y-H/2)*(Y-H/2))/W),Y)':cb='cb(X,Y)':cr='cr(X,Y)'",
    "geq=lum='p(X+SHIFT*sin(PI*Y/H),Y+SHIFT*cos(PI*X/W))':cb='cb(X,Y)':cr='cr(X,Y)'",
  ];
  const shift = (rand(min, max) * (Math.random() < 0.5 ? 1 : -1)).toFixed(3);
  return commands[Math.floor(Math.random() * commands.length)].replace(
    /SHIFT/g,
    shift,
  );
}
