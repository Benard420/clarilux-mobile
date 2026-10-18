"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeft } from "@/components/icons";

export function BackBar({
  title,
  subtitle,
  action,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-[52px] max-w-[480px] items-center gap-2 px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="grid size-11 shrink-0 place-items-center rounded-full text-strong active:scale-95"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="min-w-0 flex-1">
          {title ? <h1 className="truncate t-title-s text-strong">{title}</h1> : null}
          {subtitle ? <p className="truncate t-caption text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
