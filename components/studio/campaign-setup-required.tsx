"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useWorkspace } from "./workspace-context";

export function CampaignSetupRequired() {
  const { workspace, campaign } = useWorkspace();

  const message =
    !workspace || !campaign
      ? "Crée une campagne pour utiliser le studio."
      : "Ajoute au moins un compte TikTok à ta campagne.";

  return (
    <section className="k-card py-14 text-center">
      <p className="text-sm k-text-muted">{message}</p>
      <Link href="/setup" className="k-btn-primary mt-5 inline-flex">
        <Settings2 className="h-4 w-4" />
        Paramètres
      </Link>
    </section>
  );
}
