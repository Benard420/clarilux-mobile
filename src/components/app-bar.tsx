"use client";

import Link from "next/link";
import { Bell, Moon, Sun } from "@/components/icons";
import { Wordmark } from "@/components/brand-mark";
import { Avatar } from "@/components/ui";
import { readLocal, subscribeLocal, writeLocal } from "@/lib/local-store";
import { useEffect, useSyncExternalStore } from "react";

const KEY = "clarilux-theme";
type Mode = "light" | "dark" | "system";
const parse = (v: string | null): Mode => (v === "light" || v === "dark" ? v : "system");

export function useTheme() {
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
  return { mode, setMode: (m: Mode) => writeLocal(KEY, m) };
}

export function AppBar({ name, unread }: { name: string; unread?: boolean }) {
  const { mode, setMode } = useTheme();
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-[52px] max-w-[480px] items-center gap-2 px-4">
        <Link href="/dashboard" aria-label="Clarilux home" className="flex-1">
          <Wordmark />
        </Link>

        <div
          role="group"
          aria-label="Appearance"
          className="flex items-center gap-0.5 rounded-full bg-toggle-track p-1"
        >
          <button
            type="button"
            aria-label="Light mode"
            aria-pressed={!isDark}
            onClick={() => setMode("light")}
            className={`grid size-[26px] place-items-center rounded-full transition-colors duration-200 ${
              !isDark ? "bg-toggle-knob text-brand shadow-sm" : "text-muted"
            }`}
          >
            <Sun size={15} />
          </button>
          <button
            type="button"
            aria-label="Dark mode"
            aria-pressed={isDark}
            onClick={() => setMode("dark")}
            className={`grid size-[26px] place-items-center rounded-full transition-colors duration-200 ${
              isDark ? "bg-toggle-knob text-amber shadow-sm" : "text-muted"
            }`}
          >
            <Moon size={15} />
          </button>
        </div>

        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full text-strong"
        >
          <Bell size={21} />
          {unread ? (
            <span className="absolute right-2 top-2 size-[7px] rounded-full bg-danger ring-2 ring-surface" />
          ) : null}
        </Link>

        <Link href="/more" aria-label="Your profile">
          <Avatar name={name} size={30} />
        </Link>
      </div>
    </header>
  );
}
