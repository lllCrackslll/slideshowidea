"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  appProfileComplete,
  DEFAULT_APP_PROFILE,
  loadAppProfile,
  saveAppProfile,
  type AppProfile,
} from "@/lib/app-profile";

type AppProfilePanelProps = {
  onChange?: (profile: AppProfile) => void;
};

export function AppProfilePanel({ onChange }: AppProfilePanelProps) {
  const [profile, setProfile] = useState<AppProfile>(DEFAULT_APP_PROFILE);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const loaded = loadAppProfile();
    setProfile(loaded);
    setOpen(!appProfileComplete(loaded));
  }, []);

  function update(partial: Partial<AppProfile>) {
    const next = saveAppProfile(partial);
    setProfile(next);
    onChange?.(next);
  }

  const complete = appProfileComplete(profile);

  return (
    <section className="k-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="k-label mb-0.5">Ton app</p>
          <h2 className="k-subheading">
            {complete ? profile.appName : "Configure une fois"}
          </h2>
          {complete ? (
            <p className="mt-0.5 text-xs k-text-muted">
              {profile.handle} · {profile.niche}
            </p>
          ) : (
            <p className="mt-0.5 text-xs k-text-muted">
              Nom, handle et niche — utilisés dans chaque carrousel généré.
            </p>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 k-accent transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs k-text-muted sm:col-span-2">
            Nom de l&apos;app
            <input
              value={profile.appName}
              onChange={(e) => update({ appName: e.target.value })}
              placeholder="Ex. FocusFlow"
              className="k-input mt-1 h-9 w-full text-sm"
            />
          </label>
          <label className="block text-xs k-text-muted">
            Handle TikTok
            <input
              value={profile.handle}
              onChange={(e) => update({ handle: e.target.value })}
              placeholder="@monapp"
              className="k-input mt-1 h-9 w-full text-sm"
            />
          </label>
          <label className="block text-xs k-text-muted">
            Niche
            <input
              value={profile.niche}
              onChange={(e) => update({ niche: e.target.value })}
              placeholder="fitness, études, finance…"
              className="k-input mt-1 h-9 w-full text-sm"
            />
          </label>
          <label className="block text-xs k-text-muted sm:col-span-2">
            Audience cible
            <input
              value={profile.audience}
              onChange={(e) => update({ audience: e.target.value })}
              placeholder="18–30 ans, entrepreneurs…"
              className="k-input mt-1 h-9 w-full text-sm"
            />
          </label>
          <label className="block text-xs k-text-muted sm:col-span-2">
            Feature à mettre en avant (slide 4)
            <input
              value={profile.features}
              onChange={(e) => update({ features: e.target.value })}
              placeholder="Ex. suivi habitudes, rappels, stats…"
              className="k-input mt-1 h-9 w-full text-sm"
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
