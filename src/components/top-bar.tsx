"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function TopBar({ title, action, subtitle }: { title: string; action?: ReactNode; subtitle?: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[480px] items-center gap-2 px-2 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="grid size-11 shrink-0 place-items-center rounded-full text-strong active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[16px] font-semibold text-strong">{title}</h1>
          {subtitle ? <p className="truncate text-[12px] text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
