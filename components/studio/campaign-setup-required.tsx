"use client";

import { useState } from "react";
import { useWorkspace } from "./workspace-context";

export function CampaignSetupRequired() {
  const { addApp } = useWorkspace();
  const [name, setName] = useState("Ma campagne");

  return (
    <section className="k-card py-14 text-center">
      <p className="text-sm k-text-muted">Crée une campagne pour utiliser le studio.</p>
      <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="k-input h-10 flex-1 px-3 text-sm"
          placeholder="Nom de campagne"
        />
        <button type="button" onClick={() => addApp(name)} className="k-btn-primary">
          Créer
        </button>
      </div>
    </section>
  );
}
