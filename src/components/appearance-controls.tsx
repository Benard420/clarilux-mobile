"use client";

import { useTheme } from "@/components/app-bar";
import { Card } from "@/components/ui";

const MODES = ["light", "system", "dark"] as const;

export function AppearanceControls() {
  const { mode, setMode } = useTheme();

  return (
    <div className="space-y-4">
      <p className="t-body text-body">
        The exam room is easier on the eyes in dark. Pick one, or let the phone decide.
      </p>

      <div role="radiogroup" aria-label="Appearance" className="flex gap-1 rounded-full border border-line bg-sunken p-1">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`t-meta-strong min-h-[38px] flex-1 rounded-full capitalize transition-colors duration-200 ${
              mode === m ? "bg-surface text-strong shadow-sm" : "text-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div>
        <p className="t-label mb-2 text-muted">PREVIEW</p>
        <Card className="space-y-2">
          <p className="t-caption text-muted">Station 2 of 5 · Knowledge</p>
          <p className="t-small-strong text-strong">
            Which findings would push you to cardiovert immediately?
          </p>
          <div className="t-small-strong flex min-h-[44px] items-center justify-center rounded-[10px] bg-brand text-on-brand">
            Next station
          </div>
        </Card>
      </div>
    </div>
  );
}
