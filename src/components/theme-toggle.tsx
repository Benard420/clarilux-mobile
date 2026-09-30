"use client";

import { useEffect, useSyncExternalStore } from "react";
import { readLocal, subscribeLocal, writeLocal } from "@/lib/local-store";

type Mode = "light" | "dark" | "system";
const KEY = "clarilux-theme";
const MODES: Mode[] = ["light", "system", "dark"];

function parse(value: string | null): Mode {
  return value === "light" || value === "dark" ? value : "system";
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(
    subscribeLocal,
    () => parse(readLocal(KEY)),
    () => "system" as Mode,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <div role="radiogroup" aria-label="Appearance" className="flex gap-1 rounded-full border border-line bg-sunken p-1">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => writeLocal(KEY, m)}
          className={`min-h-[34px] flex-1 rounded-full px-3 text-[12.5px] font-semibold capitalize transition-colors duration-200 ${
            mode === m ? "bg-surface text-strong shadow-sm" : "text-muted"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
