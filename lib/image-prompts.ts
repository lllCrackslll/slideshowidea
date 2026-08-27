const PROMPT_PREFIX = `Vertical photo, 9:16 aspect ratio, 1080x1920px, TikTok carousel background.
Dark moody aesthetic, cinematic lighting, soft depth of field.
No text, no watermark, no logo, no readable words.
Subject: `;

export function buildImagePrompt(visual: string): string {
  const subject = visual.trim() || "minimal dark study desk, moody atmosphere";
  return `${PROMPT_PREFIX}${subject}`;
}

export function buildAllImagePrompts(
  visuals: string[],
): string {
  return visuals
    .map((visual, index) => `--- SLIDE ${index + 1} ---\n${buildImagePrompt(visual)}`)
    .join("\n\n");
}
