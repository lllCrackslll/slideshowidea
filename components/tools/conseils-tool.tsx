"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Cpu,
  Shield,
  Smartphone,
  XCircle,
} from "lucide-react";
import { ToolPage } from "@/components/shell/tool-page";

type TipSection = {
  id: string;
  icon: ReactNode;
  title: string;
  danger: string[];
  good: string[];
};

const SECTIONS: TipSection[] = [
  {
    id: "device",
    icon: <Smartphone className="h-4 w-4 k-accent" />,
    title: "Comptes & appareil (inscription)",
    danger: [
      "Créer 10+ comptes sur le même téléphone le même jour",
      "Même numéro / email de récupération sur plusieurs comptes",
      "Se connecter à tous les comptes sur le même appareil avant de publier",
      "Comptes créés en rafale sans activité « normale » entre les deux",
    ],
    good: [
      "1 compte = 1 téléphone (ou profil work dédié) quand c’est possible",
      "Emails et numéros différents par compte",
      "Faire chauffer un compte quelques jours (scroll, likes) avant le mass post",
      "OAuth TikTok par compte depuis ton outil — pas besoin d’être loggé sur 20 comptes sur un seul tel",
    ],
  },
  {
    id: "content",
    icon: <Shield className="h-4 w-4 k-accent" />,
    title: "Contenu dupliqué",
    danger: [
      "La même vidéo ou le même carrousel sur 20 comptes",
      "Même légende mot pour mot + mêmes hashtags partout",
      "Repurpose trop léger (juste luminosité) — TikTok voit encore le duplicate",
    ],
    good: [
      "Repurpose vidéo + metadata différente par compte",
      "Carrousels : fonds et textes uniques (Content Engine + variantes export)",
      "Légende reformulée légèrement par compte",
      "Varier musique / hook visuel slide 1",
    ],
  },
  {
    id: "api",
    icon: <Cpu className="h-4 w-4 k-accent" />,
    title: "API TikTok & abus",
    danger: [
      "Publier en rafale : 20 posts en 10 minutes via l’API",
      "Relancer 100 requêtes si une échoue (retry agressif)",
      "Partager les tokens OAuth entre utilisateurs du site",
      "Automation navigateur + proxies en contournant l’API (hors CGU)",
    ],
    good: [
      "Utiliser l’API Content Posting officielle uniquement",
      "1 token OAuth par compte, stocké de façon isolée par user",
      "Respecter les rate limits TikTok (file d’attente côté serveur)",
      "Logger les erreurs et backoff exponentiel (attendre avant de réessayer)",
    ],
  },
  {
    id: "spacing",
    icon: <Clock className="h-4 w-4 k-accent" />,
    title: "Espacement des posts",
    danger: [
      "Tous les comptes publient à la même minute (même avec 20 min entre chaque vague)",
      "20+ posts / jour / compte dès le jour 1",
      "Horaires robotiques identiques chaque jour (08:00, 08:20, 08:40…)",
    ],
    good: [
      "Minimum 15–30 min entre deux comptes (idéal : 20–45 min aléatoire)",
      "Max 3–5 posts / jour / compte au début",
      "Utiliser le Planning : intervalle 25 min+ et horaires décalés",
      "Exemple 20 comptes : étaler sur 6–10 h, pas sur 1 h",
    ],
  },
];

function TipList({
  items,
  variant,
}: {
  items: string[];
  variant: "danger" | "good";
}) {
  const Icon = variant === "danger" ? XCircle : CheckCircle2;
  const color =
    variant === "danger" ? "text-red-500 dark:text-red-400" : "k-accent";

  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-xs leading-relaxed k-text-muted">
          <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${color}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ConseilsTool() {
  return (
    <ToolPage
      title="Conseils multi-comptes"
      subtitle="Ce qui fait bannir — et ce qui protège tes comptes TikTok."
    >
      <div className="mb-5 k-callout">
        <p className="text-xs leading-relaxed k-text-secondary">
          TikTok ne bannit pas parce que tout passe par{" "}
          <strong className="font-medium k-text">carrousels.studio</strong>.
          Le risque vient surtout du{" "}
          <strong className="font-medium">contenu identique</strong>, des comptes
          liés au même appareil, et des publications trop rapides. L’IP de ton
          serveur (API) est normale — ce n’est pas la même chose que 20 comptes
          créés sur 1 téléphone.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {SECTIONS.map((section) => (
          <section key={section.id} className="k-card">
            <div className="mb-2 flex items-center gap-2">
              {section.icon}
              <h2 className="k-subheading">{section.title}</h2>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">
              À éviter
            </p>
            <TipList items={section.danger} variant="danger" />
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider k-accent">
              Bonnes pratiques
            </p>
            <TipList items={section.good} variant="good" />
          </section>
        ))}
      </div>

      <section className="k-card-glow mt-6">
        <h2 className="k-subheading">Protocole recommandé (20 comptes)</h2>
        <ol className="mt-3 space-y-2 text-xs leading-relaxed k-text-muted">
          <li>
            <span className="font-medium k-text">1.</span>{" "}
            Génère 1 concept → Repurpose ou variantes export par compte.
          </li>
          <li>
            <span className="font-medium k-text">2.</span>{" "}
            Connecte chaque compte via OAuth (API), pas via le même téléphone.
          </li>
          <li>
            <span className="font-medium k-text">3.</span>{" "}
            Planifie 20–45 min d’écart aléatoire entre comptes (
            <Link href="/planning" className="k-link">
              Planning
            </Link>
            ).
          </li>
          <li>
            <span className="font-medium k-text">4.</span>{" "}
            Max 3 posts / jour / compte les 2 premières semaines.
          </li>
          <li>
            <span className="font-medium k-text">5.</span>{" "}
            Coche dans Planning au fur et à mesure — repère les comptes en shadowban
            (0 vues).
          </li>
        </ol>
      </section>
    </ToolPage>
  );
}
