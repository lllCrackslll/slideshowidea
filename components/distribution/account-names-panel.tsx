"use client";

import { useEffect, useState } from "react";
import {
  defaultAccountName,
  loadNamedAccounts,
  saveNamedAccount,
} from "@/lib/distribution/accounts";

type AccountNamesPanelProps = {
  accountCount: number;
  onChange?: () => void;
};

export function AccountNamesPanel({
  accountCount,
  onChange,
}: AccountNamesPanelProps) {
  const [accounts, setAccounts] = useState(() =>
    loadNamedAccounts(accountCount),
  );

  useEffect(() => {
    setAccounts(loadNamedAccounts(accountCount));
  }, [accountCount]);

  function update(index: number, name: string) {
    saveNamedAccount(index, name);
    setAccounts(loadNamedAccounts(accountCount));
    onChange?.();
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[#86868b]">
        Nomme tes comptes TikTok — utilisé dans le planning et les dossiers
        exportés.
      </p>
      <ul className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
        {accounts.map((account) => (
          <li key={account.index}>
            <label className="block text-[10px] text-[#aeaeb2]">
              Compte {account.index + 1}
              <input
                value={account.name}
                onChange={(e) => update(account.index, e.target.value)}
                placeholder={defaultAccountName(account.index)}
                className="k-input mt-0.5 h-9 w-full text-sm"
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function getAccountNames(count: number): string[] {
  return loadNamedAccounts(count).map((a) => a.name);
}
