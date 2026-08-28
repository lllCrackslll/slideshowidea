import OpenAI from "openai";
import { NextResponse } from "next/server";
import { DEFAULT_APP_PROFILE } from "@/lib/app-profile";
import { CAROUSEL_JSON_SCHEMA, type GenerateRequest } from "@/lib/api-types";
import { formatLabel, genreLabel } from "@/lib/content-engine";
import {
  systemPromptFor,
  userPromptFor,
} from "@/lib/prompts/carousel-prompts";
import type { FormatId, GenreId } from "@/lib/types";

const GENRE_IDS: GenreId[] = ["motivation", "conseil"];
const FORMAT_IDS: FormatId[] = ["story", "short"];

function isGenreId(value: unknown): value is GenreId {
  return typeof value === "string" && GENRE_IDS.includes(value as GenreId);
}

function isFormatId(value: unknown): value is FormatId {
  return typeof value === "string" && FORMAT_IDS.includes(value as FormatId);
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

  const profile = { ...DEFAULT_APP_PROFILE, ...body.profile };
  const genreName = genreLabel(body.genre);
  const formatName = formatLabel(body.format);
  const sourceText =
    typeof body.sourceText === "string" ? body.sourceText : undefined;

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: body.format === "short" ? 0.9 : 0.85,
      messages: [
        { role: "system", content: systemPromptFor(body.format, profile) },
        {
          role: "user",
          content: userPromptFor(
            body.format,
            `${genreName} (${formatName})`,
            profile,
            sourceText,
          ),
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
