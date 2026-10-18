"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import type { Topic } from "@/lib/database.types";

export type Filters = {
  topics: string[];
  availability: string | null;
  price: string | null;
  rating: number | null;
};

export const EMPTY_FILTERS: Filters = { topics: [], availability: null, price: null, rating: null };

export const AVAILABILITY = ["Available today", "Available this week", "This weekend"];
export const PRICE_BANDS: { label: string; min: number; max: number }[] = [
  { label: "$0–100", min: 0, max: 10000 },
  { label: "$100–200", min: 10000, max: 20000 },
  { label: "$200–300", min: 20000, max: 30000 },
  { label: "$300–500", min: 30000, max: 50000 },
  { label: "$500+", min: 50000, max: Number.MAX_SAFE_INTEGER },
];
export const RATINGS = [4.5, 4.0, 3.0];

export function countFilters(f: Filters) {
  return (
    f.topics.length + (f.availability ? 1 : 0) + (f.price ? 1 : 0) + (f.rating !== null ? 1 : 0)
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`t-small-medium min-h-[40px] rounded-full border px-4 transition-colors duration-200 ${
        active ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-body"
      }`}
    >
      {label}
    </button>
  );
}

function Section({ label, meta, children }: { label: string; meta?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <h3 className="t-label text-muted">{label}</h3>
        {meta ? <span className="t-caption text-brand">{meta}</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export function FilterSheet({
  open,
  onClose,
  topics,
  value,
  onChange,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  topics: Topic[];
  value: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggleTopic = (name: string) =>
    onChange({
      ...value,
      topics: value.topics.includes(name)
        ? value.topics.filter((t) => t !== name)
        : [...value.topics, name],
    });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="fade absolute inset-0 bg-scrim/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="rise relative flex max-h-[86dvh] w-full max-w-[480px] flex-col rounded-t-[24px] bg-surface"
      >
        <div className="shrink-0 px-5 pb-1 pt-3">
          <div className="mx-auto h-1 w-11 rounded-full bg-line-strong" />
          <div className="mt-4 flex items-center justify-between">
            <h2 className="t-title-l text-strong">Filters</h2>
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTERS)}
              className="t-small-strong text-brand"
            >
              Reset all
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <Section
            label="TOPIC"
            meta={value.topics.length ? `${value.topics.length} selected` : undefined}
          >
            {topics.map((t) => (
              <Pill
                key={t.id}
                label={t.name}
                active={value.topics.includes(t.name)}
                onClick={() => toggleTopic(t.name)}
              />
            ))}
          </Section>

          <Section label="AVAILABILITY">
            {AVAILABILITY.map((a) => (
              <Pill
                key={a}
                label={a.replace("Available ", "").replace(/^this week$/, "This week")}
                active={value.availability === a}
                onClick={() =>
                  onChange({ ...value, availability: value.availability === a ? null : a })
                }
              />
            ))}
          </Section>

          <Section label="SESSION PRICING">
            {PRICE_BANDS.map((b) => (
              <Pill
                key={b.label}
                label={b.label}
                active={value.price === b.label}
                onClick={() => onChange({ ...value, price: value.price === b.label ? null : b.label })}
              />
            ))}
          </Section>

          <Section label="RATING">
            {RATINGS.map((r) => (
              <Pill
                key={r}
                label={`${r}+`}
                active={value.rating === r}
                onClick={() => onChange({ ...value, rating: value.rating === r ? null : r })}
              />
            ))}
            <Pill
              label="Any"
              active={value.rating === null}
              onClick={() => onChange({ ...value, rating: null })}
            />
          </Section>
        </div>

        <div className="shrink-0 border-t border-line p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <Button onClick={onClose}>
            {resultCount === 0
              ? "No examiners match"
              : `Show ${resultCount} examiner${resultCount === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
