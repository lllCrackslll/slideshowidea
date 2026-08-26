import OpenAI from "openai";
import { NextResponse } from "next/server";
import { CAROUSEL_JSON_SCHEMA, type GenerateRequest } from "@/lib/api-types";
import { genreLabel } from "@/lib/content-engine";
import type { GenreId } from "@/lib/types";

const GENRE_IDS: GenreId[] = ["neuroscience", "debunking", "routines", "tech"];

const SYSTEM_PROMPT = `Tu es un créateur d'élite de carrousels TikTok pour étudiants (lycée, prépa, fac).

Structure obligatoire des 5 slides :
- Slide 1 (Hook) : phrase choc ou contre-intuitive sur le travail ou le stress des cours. Zéro mention d'application.
- Slides 2 et 3 : 100 % valeur éducative pure (Active Recall, méthode Feynman, gestion du temps, neuroscience appliquée, etc.). Zéro mention d'application.
- Slide 4 : placement subtil et naturel de l'application Kognia (scan de notes manuscrites, import PDF, fiches synthèses swipeables, quiz IA, coachs virtuels Maya/Noah/Zoé/Hugo, mode Pomodoro) comme outil pour appliquer le conseil des slides précédentes.
- Slide 5 (CTA) : synthèse rapide + appel à l'action discret vers le lien en bio (@kognia.app).

Style :
- Textes très courts : 1 à 2 phrases max par slide.
- Ton percutant, direct, crédible, jamais condescendant.
- Français naturel, adapté TikTok study.
- Chaque slide a un title court (accroche) et un text (corps).
- background_idea : description visuelle concrète pour créer la slide (ambiance, objet, cadrage).
- caption : légende TikTok complète avec sauts de ligne, prête à publier.
- hashtags : 8 à 12 hashtags pertinents, sans le # (ajouté côté app).`;

function isGenreId(value: unknown): value is GenreId {
  return typeof value === "string" && GENRE_IDS.includes(value as GenreId);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY manquante. Ajoute-la dans .env.local." },
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

  const genreName = genreLabel(body.genre);

  const userPrompt = `Catégorie : ${genreName}.\nChoisis un sujet pertinent et varié pour cette catégorie, puis génère un carrousel TikTok complet en français.`;

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.85,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
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
