import OpenAI from "openai";
import { NextResponse } from "next/server";
import { CAROUSEL_JSON_SCHEMA, type GenerateRequest } from "@/lib/api-types";
import { formatLabel, genreLabel } from "@/lib/content-engine";
import type { FormatId, GenreId } from "@/lib/types";

const GENRE_IDS: GenreId[] = ["motivation", "conseil"];
const FORMAT_IDS: FormatId[] = ["story", "short"];

const STORY_SYSTEM_PROMPT = `Tu écris des carrousels TikTok pour étudiants (lycée, prépa, fac).

Format : STORY — récit d'expérience personnelle.

Voix obligatoire :
- Parle comme un grand frère / une pote de promo bienveillante.
- Toujours à la première personne : « je », « mon », « moi », « perso ».
- Mélange vécu personnel, motivation simple et conseil concret.
- Jamais de ton magistral, professoral ou condescendant.

Structure obligatoire des 5 slides :
- Slide 1 (Hook / Vécu) : une phrase sur une galère ou un doute vécu au début (stress, fatigue, mauvaises notes, surcharge de rentrée). Zéro mention d'application.
- Slide 2 (Prise de conscience) : le constat honnête sur l'ancienne méthode qui ne marchait pas. Zéro mention d'application.
- Slide 3 (Déclic & Motivation) : le conseil simple ou le changement de mentalité appliqué pour s'en sortir sans s'épuiser. Zéro mention d'application.
- Slide 4 (Routine / Kognia) : comment j'applique ce conseil au quotidien avec l'app Kognia (scan, PDF, fiches swipeables, quiz IA, coachs Maya/Noah/Zoé/Hugo, mode focus/Pomodoro).
- Slide 5 (Encouragement & CTA) : motivation fraternelle + rappel discret du lien en bio (@kognia.app).

Contraintes :
- 1 à 2 phrases max par slide.
- Chaque slide : title (accroche) + text (corps).
- background_idea : description visuelle concrète, optimisée pour génération IA (ambiance sombre, sujet clair, sans texte dans l'image).
- caption : légende TikTok à la première personne, prête à publier.
- hashtags : 8 à 12, sans le #.`;

const SHORT_SYSTEM_PROMPT = `Tu écris des carrousels TikTok ultra-courts pour étudiants (lycée, prépa, fac).

Format : SHORT — quelques mots par slide, style punchline scroll-stopping.

Voix :
- Phrases fragmentées, percutantes, lisibles en 2 secondes.
- Pas de récit long. Pas de paragraphe. Pas de ton professoral.
- Tu peux utiliser « tu » ou impératif pour parler direct à l'étudiant.

Structure obligatoire des 5 slides (même arc narratif, version ultra condensée) :
- Slide 1 (Hook) : 3 à 8 mots max. Galère ou vérité qui pique. Pas d'app.
- Slide 2 (Erreur) : 3 à 8 mots max. L'ancienne méthode qui foire. Pas d'app.
- Slide 3 (Fix) : 3 à 8 mots max. Le conseil ou le déclic en une punchline. Pas d'app.
- Slide 4 (Kognia) : 3 à 10 mots max. Mention naturelle et brève de Kognia (scan, fiches, quiz, focus).
- Slide 5 (CTA) : 3 à 8 mots max. Motivation + lien en bio (@kognia.app).

Contraintes :
- text : contient TOUJOURS le texte visible à l'écran (obligatoire, jamais vide).
- title : optionnel, uniquement si tu veux séparer accroche et corps (sinon laisse vide).
- background_idea : description visuelle concrète et minimaliste, optimisée pour génération IA (pas de texte dans l'image, ambiance sombre, sujet clair).
- caption : légende courte (3 à 5 lignes max), directe, prête à publier.
- hashtags : 8 à 12, sans le #.`;

function isGenreId(value: unknown): value is GenreId {
  return typeof value === "string" && GENRE_IDS.includes(value as GenreId);
}

function isFormatId(value: unknown): value is FormatId {
  return typeof value === "string" && FORMAT_IDS.includes(value as FormatId);
}

function systemPromptFor(format: FormatId): string {
  return format === "short" ? SHORT_SYSTEM_PROMPT : STORY_SYSTEM_PROMPT;
}

function userPromptFor(
  format: FormatId,
  genreName: string,
): string {
  if (format === "short") {
    return `Format : Short.\nThème : ${genreName}.\nChoisis un angle ${genreName === "Motivation" ? "motivant et encourageant" : "pratique et actionnable"} pour cette catégorie, puis génère un carrousel TikTok ultra-court en français — quelques mots par slide, punchlines seulement.`;
  }

  return `Format : Story.\nThème : ${genreName}.\nChoisis un sujet ${genreName === "Motivation" ? "motivant (mindset, confiance, persévérance)" : "de conseil concret (méthode, organisation, révision)"} pour cette catégorie, puis génère un carrousel TikTok complet en français, entièrement à la première personne (voix pote de promo / grand frère).`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const hint =
      process.env.VERCEL === "1"
        ? "Ajoute OPENAI_API_KEY dans Vercel → Project → Settings → Environment Variables, puis redeploie."
        : "Ajoute OPENAI_API_KEY dans .env.local à la racine du projet, puis redémarre npm run dev.";

    return NextResponse.json(
      { error: `OPENAI_API_KEY manquante. ${hint}` },
      { status: 500 },
    );
  }

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (!isGenreId(body.genre)) {
    return NextResponse.json({ error: "Genre invalide." }, { status: 400 });
  }

  if (!isFormatId(body.format)) {
    return NextResponse.json({ error: "Format invalide." }, { status: 400 });
  }

  const genreName = genreLabel(body.genre);
  const formatName = formatLabel(body.format);

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: body.format === "short" ? 0.9 : 0.85,
      messages: [
        { role: "system", content: systemPromptFor(body.format) },
        {
          role: "user",
          content: userPromptFor(body.format, `${genreName} (${formatName})`),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "tiktok_carousel",
          strict: true,
          schema: CAROUSEL_JSON_SCHEMA,
        },
      },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "Réponse vide du modèle." },
        { status: 502 },
      );
    }

    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/generate]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la génération.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
