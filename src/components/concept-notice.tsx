"use client";

import { useSyncExternalStore } from "react";
import { readLocal, subscribeLocal, writeLocal } from "@/lib/local-store";

const KEY = "clarilux-concept-notice";

export function ConceptNotice() {
  const dismissed = useSyncExternalStore(
    subscribeLocal,
    () => readLocal(KEY) === "1",
    () => true,
  );

  if (dismissed) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="concept-title"
      className="fade fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <div className="rise w-full max-w-[480px] rounded-2xl border border-line bg-surface p-5 shadow-xl shadow-black/20">
        <p id="concept-title" className="text-[15px] font-semibold text-strong">
          A quick note before you start
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-body">
          Clarilux is an independent design and engineering exercise by Sandra Benard. It is not
          affiliated with, endorsed by, or connected to RioEigen. Examiners, sessions and payments
          shown here are sample data.
        </p>
        <button
          type="button"
          autoFocus
          onClick={() => writeLocal(KEY, "1")}
          className="mt-4 min-h-[48px] w-full rounded-xl bg-brand text-[15px] font-semibold text-white active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function ConceptStrip() {
  return (
    <p className="border-b border-line bg-tint px-4 py-1.5 text-center text-[11px] font-medium text-brand">
      Concept build · sample data · not affiliated with RioEigen
    </p>
  );
}
