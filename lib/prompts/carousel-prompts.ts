import type { AppProfile } from "@/lib/app-profile";
import type { FormatId } from "@/lib/types";

function profileBlock(profile: AppProfile): string {
  return [
    `App : ${profile.appName}`,
    `Handle TikTok : ${profile.handle}`,
    `Niche : ${profile.niche}`,
    `Audience : ${profile.audience}`,
    `À mentionner slide 4 : ${profile.features}`,
  ].join("\n");
}

export function systemPromptFor(
  format: FormatId,
  profile: AppProfile,
): string {
  const app = profile.appName;
  const handle = profile.handle;

  const structureShort = `
Structure obligatoire des 5 slides (arc narratif ultra condensé) :
- Slide 1 (Hook) : 3 à 8 mots max. Problème ou vérité qui accroche. Pas d'app.
- Slide 2 (Erreur) : 3 à 8 mots max. L'ancienne méthode qui ne marche pas. Pas d'app.
- Slide 3 (Fix) : 3 à 8 mots max. Le conseil ou déclic en une punchline. Pas d'app.
- Slide 4 (${app}) : 3 à 10 mots max. Mention naturelle de ${app} (${profile.features}).
- Slide 5 (CTA) : 3 à 8 mots max. Motivation + ${handle} en bio.`;

  const structureStory = `
Structure obligatoire des 5 slides :
- Slide 1 (Hook) : galère ou doute vécu lié à la niche. Pas d'app.
- Slide 2 (Prise de conscience) : constat honnête sur ce qui ne marchait pas. Pas d'app.
- Slide 3 (Déclic) : conseil ou changement de mentalité concret. Pas d'app.
- Slide 4 (${app}) : comment j'utilise ${app} au quotidien (${profile.features}).
- Slide 5 (CTA) : encouragement + ${handle} en bio.`;

  if (format === "short") {
    return `Tu écris des carrousels TikTok ultra-courts pour promouvoir une app mobile.

${profileBlock(profile)}

Format : SHORT — quelques mots par slide, style punchline scroll-stopping.
Voix : phrases fragmentées, percutantes, lisibles en 2 secondes. Tutoiement OK.
${structureShort}

Contraintes :
- text : texte visible à l'écran (obligatoire, jamais vide).
- title : optionnel si tu sépares accroche et corps.
- background_idea : visuel concret pour génération IA (ambiance sombre, sans texte dans l'image).
- caption : légende TikTok courte, prête à publier, avec ${handle}.
- hashtags : 8 à 12, sans le #, mix FR + niche.`;
  }

  return `Tu écris des carrousels TikTok pour promouvoir une app mobile.

${profileBlock(profile)}

Format : STORY — récit d'expérience personnelle à la première personne.
Voix : pote bienveillante, jamais professorale.
${structureStory}

Contraintes :
- 1 à 2 phrases max par slide.
- Chaque slide : title (accroche) + text (corps).
- background_idea : visuel concret pour génération IA (ambiance sombre, sans texte dans l'image).
- caption : légende TikTok prête à publier, avec ${handle}.
- hashtags : 8 à 12, sans le #.`;
}

export function userPromptFor(
  format: FormatId,
  genreName: string,
  profile: AppProfile,
  sourceText?: string,
): string {
  const angle =
    genreName === "Motivation"
      ? "motivant et encourageant"
      : "pratique et actionnable";

  if (sourceText?.trim()) {
    return [
      `Adapte ce contenu US en carrousel TikTok français pour ${profile.appName}.`,
      `Format : ${format === "short" ? "Short (punchlines)" : "Story (récit perso)"}.`,
      `Angle : ${angle}.`,
      "",
      "--- Contenu source (EN) ---",
      sourceText.trim(),
      "--- Fin ---",
      "",
      "Traduis, réécris en français naturel, garde la structure 5 slides, personnalise pour l'audience FR.",
    ].join("\n");
  }

  if (format === "short") {
    return `Format : Short.\nThème : ${genreName}.\nGénère un carrousel TikTok ultra-court en français pour ${profile.appName} — angle ${angle}, punchlines seulement.`;
  }

  return `Format : Story.\nThème : ${genreName}.\nGénère un carrousel TikTok complet en français pour ${profile.appName} — angle ${angle}, voix à la première personne.`;
}
