"use client";

import { Check, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  defaultAccountName,
  loadNamedAccounts,
  saveNamedAccount,
} from "@/lib/distribution/accounts";
import {
  formatTodayLabel,
  loadDailyPublishState,
  publishProgress,
  resetDailyPublishState,
  togglePublishItem,
} from "@/lib/distribution/daily-publish";
import { buildDailySchedule } from "@/lib/distribution/planning";
import {
  DEFAULT_PLANNING_SETTINGS,
  loadPlanningSettings,
  savePlanningSettings,
  type PlanningSettings,
} from "@/lib/distribution/planning-settings";
import { ToolPage } from "@/components/shell/tool-page";

export function PlanningTool() {
  const [settings, setSettings] = useState<PlanningSettings>(
    DEFAULT_PLANNING_SETTINGS,
  );
  const [accounts, setAccounts] = useState(() =>
    loadNamedAccounts(DEFAULT_PLANNING_SETTINGS.accountCount),
  );
  const [publishState, setPublishState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loaded = loadPlanningSettings();
    setSettings(loaded);
    setAccounts(loadNamedAccounts(loaded.accountCount));
    setPublishState(loadDailyPublishState());
  }, []);

  const accountNames = useMemo(
    () => accounts.map((a) => a.name),
    [accounts],
  );

  const schedule = useMemo(
    () =>
      buildDailySchedule({
        accountCount: settings.accountCount,
        postsPerDay: settings.postsPerDay,
        accountNames,
        startHour: settings.startHour,
        startMinute: settings.startMinute,
        intervalMinutes: settings.intervalMinutes,
      }),
    [settings, accountNames],
  );

  const progress = publishProgress(publishState, schedule.length);

  function updateSettings(partial: Partial<PlanningSettings>) {
    const next = savePlanningSettings(partial);
    setSettings(next);
    setAccounts(loadNamedAccounts(next.accountCount));
  }

  function updateAccountName(index: number, name: string) {
    saveNamedAccount(index, name);
    setAccounts(loadNamedAccounts(settings.accountCount));
  }

  function toggleItem(accountIndex: number, postNumber: number) {
    const key = `${accountIndex}-post-${postNumber}`;
    const next = togglePublishItem(
      accountIndex,
      postNumber,
      !publishState[key],
    );
    setPublishState(next);
  }

  function handleResetDay() {
    resetDailyPublishState();
    setPublishState({});
  }

  const grouped = useMemo(() => {
    const map = new Map<number, typeof schedule>();
    for (const item of schedule) {
      const list = map.get(item.accountIndex) ?? [];
      list.push(item);
      map.set(item.accountIndex, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [schedule]);

  return (
    <ToolPage
      title="Planning"
      subtitle="Organise tes comptes TikTok et coche chaque publication."
    >
      <div className="mx-auto flex max-w-[720px] flex-col gap-5">
        <section className="k-card">
          <h2 className="k-subheading">Configuration</h2>
          <p className="mt-1 text-xs text-[#86868b]">
            Ces réglages sont aussi utilisés pour l&apos;export du Content
            Engine.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-[#86868b]">
              Nombre de comptes
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={settings.accountCount}
                  onChange={(e) =>
                    updateSettings({ accountCount: Number(e.target.value) })
                  }
                  className="w-full accent-[#007aff]"
                />
                <span className="w-8 text-sm font-semibold text-[#1d1d1f]">
                  {settings.accountCount}
                </span>
              </div>
            </label>

            <label className="block text-xs text-[#86868b]">
              Posts par jour / compte
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={settings.postsPerDay}
                  onChange={(e) =>
                    updateSettings({ postsPerDay: Number(e.target.value) })
                  }
                  className="w-full accent-[#007aff]"
                />
                <span className="w-8 text-sm font-semibold text-[#1d1d1f]">
                  {settings.postsPerDay}
                </span>
              </div>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <label className="text-[10px] text-[#aeaeb2]">
              Début (h)
              <input
                type="number"
                min={6}
                max={23}
                value={settings.startHour}
                onChange={(e) =>
                  updateSettings({ startHour: Number(e.target.value) })
                }
                className="k-input mt-1 h-9 w-full text-sm"
              />
            </label>
            <label className="text-[10px] text-[#aeaeb2]">
              Min
              <input
                type="number"
                min={0}
                max={59}
                step={5}
                value={settings.startMinute}
                onChange={(e) =>
                  updateSettings({ startMinute: Number(e.target.value) })
                }
                className="k-input mt-1 h-9 w-full text-sm"
              />
            </label>
            <label className="text-[10px] text-[#aeaeb2]">
              Écart (min)
              <input
                type="number"
                min={10}
                max={120}
                step={5}
                value={settings.intervalMinutes}
                onChange={(e) =>
                  updateSettings({ intervalMinutes: Number(e.target.value) })
                }
                className="k-input mt-1 h-9 w-full text-sm"
              />
            </label>
          </div>
        </section>

        <section className="k-card">
          <h2 className="k-subheading">Noms des comptes</h2>
          <ul className="mt-3 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
            {accounts.map((account) => (
              <li key={account.index}>
                <label className="block text-[10px] text-[#aeaeb2]">
                  Compte {account.index + 1}
                  <input
                    value={account.name}
                    onChange={(e) =>
                      updateAccountName(account.index, e.target.value)
                    }
                    placeholder={defaultAccountName(account.index)}
                    className="k-input mt-0.5 h-9 w-full text-sm"
                  />
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="k-card-glow">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="k-subheading capitalize">{formatTodayLabel()}</h2>
              <p className="mt-1 text-xs text-[#86868b]">
                {settings.accountCount} comptes × {settings.postsPerDay} posts ={" "}
                {schedule.length} publications
              </p>
            </div>
            <span className="k-badge">
              {progress.done}/{progress.total}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(0,122,255,0.08)]">
            <div
              className="h-full rounded-full bg-[#007aff] transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <ul className="mt-4 space-y-4">
            {grouped.map(([accountIndex, posts]) => (
              <li key={accountIndex}>
                <p className="mb-2 text-xs font-semibold text-[#1d1d1f]">
                  {posts[0]?.accountLabel ?? defaultAccountName(accountIndex)}
                </p>
                <ul className="space-y-1.5">
                  {posts.map((item) => {
                    const key = `${item.accountIndex}-post-${item.postNumber}`;
                    const done = Boolean(publishState[key]);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() =>
                            toggleItem(item.accountIndex, item.postNumber)
                          }
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            done
                              ? "border-[rgba(0,122,255,0.25)] bg-[rgba(0,122,255,0.06)]"
                              : "border-[rgba(0,122,255,0.1)] bg-white/90"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              done
                                ? "border-[#007aff] bg-[#007aff] text-white"
                                : "border-[rgba(0,122,255,0.2)]"
                            }`}
                          >
                            {done ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span className="flex-1 text-sm text-[#1d1d1f]">
                            Post {item.postNumber}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-[#007aff]">
                            {item.time}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleResetDay}
            className="k-btn-secondary mt-4 h-9 w-full text-xs sm:w-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser la journée
          </button>
        </section>
      </div>
    </ToolPage>
  );
}
