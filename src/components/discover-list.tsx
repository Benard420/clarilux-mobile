"use client";

import { useMemo, useState } from "react";
import { ExaminerCard } from "@/components/examiner-card";
import { ChevronDown, Close, Funnel, Search } from "@/components/icons";
import { Empty, Input } from "@/components/ui";
import {
  countFilters,
  EMPTY_FILTERS,
  FilterSheet,
  PRICE_BANDS,
  type Filters,
} from "@/components/filter-sheet";
import type { Examiner, Topic } from "@/lib/database.types";

type Row = Examiner & { topics: string[] };

const SORTS = [
  { key: "rating", label: "Top rated" },
  { key: "price", label: "Lowest price" },
  { key: "experience", label: "Most experienced" },
] as const;

function apply(rows: Row[], q: string, f: Filters) {
  const needle = q.trim().toLowerCase();
  const band = f.price ? PRICE_BANDS.find((b) => b.label === f.price) : null;
  return rows.filter((e) => {
    if (f.topics.length && !f.topics.some((t) => e.topics.includes(t))) return false;
    if (f.availability && e.availability_label !== f.availability) return false;
    if (band && (e.from_price_cents < band.min || e.from_price_cents >= band.max)) return false;
    if (f.rating !== null && (e.rating ?? 0) < f.rating) return false;
    if (
      needle &&
      ![e.full_name, e.institution, e.headline, ...e.topics]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle))
    )
      return false;
    return true;
  });
}

export function DiscoverList({ examiners, topics }: { examiners: Row[]; topics: Topic[] }) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("rating");
  const [sortOpen, setSortOpen] = useState(false);

  const results = useMemo(() => {
    const rows = apply(examiners, q, filters);
    return [...rows].sort((a, b) => {
      if (sort === "price") return a.from_price_cents - b.from_price_cents;
      if (sort === "experience") return (b.years_experience ?? 0) - (a.years_experience ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [examiners, q, filters, sort]);

  const liveCount = useMemo(() => apply(examiners, q, filters).length, [examiners, q, filters]);
  const activeCount = countFilters(filters);

  const activeChips: { label: string; clear: () => void }[] = [
    ...filters.topics.map((t) => ({
      label: t,
      clear: () => setFilters((f) => ({ ...f, topics: f.topics.filter((x) => x !== t) })),
    })),
    ...(filters.availability
      ? [{ label: filters.availability, clear: () => setFilters((f) => ({ ...f, availability: null })) }]
      : []),
    ...(filters.price
      ? [{ label: filters.price, clear: () => setFilters((f) => ({ ...f, price: null })) }]
      : []),
    ...(filters.rating !== null
      ? [{ label: `${filters.rating}+`, clear: () => setFilters((f) => ({ ...f, rating: null })) }]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={19}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or topic"
          aria-label="Search examiners"
          className="!rounded-[12px] !pl-11"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="t-small-strong flex min-h-[44px] shrink-0 items-center gap-2 rounded-[12px] bg-brand px-4 text-on-brand active:scale-[0.98]"
        >
          <Funnel size={17} />
          Filters
          {activeCount ? (
            <span className="t-caption-medium grid size-5 place-items-center rounded-full bg-surface text-brand">
              {activeCount}
            </span>
          ) : null}
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            aria-expanded={sortOpen}
            className="t-small-medium flex min-h-[44px] items-center gap-2 rounded-[12px] border border-line bg-surface px-3.5 text-strong"
          >
            {SORTS.find((s) => s.key === sort)?.label}
            <ChevronDown size={16} className="text-muted" />
          </button>
          {sortOpen ? (
            <ul className="fade absolute left-0 top-[48px] z-20 w-[190px] overflow-hidden rounded-[12px] border border-line bg-surface shadow-lg shadow-black/10">
              {SORTS.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setSort(s.key);
                      setSortOpen(false);
                    }}
                    className={`t-small w-full px-4 py-3 text-left ${
                      s.key === sort ? "bg-selected text-brand" : "text-body"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <span className="t-meta ml-auto shrink-0 text-muted">{results.length} results</span>
      </div>

      {activeChips.length ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {activeChips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={c.clear}
              className="t-meta-medium flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full bg-tint px-3.5 text-brand"
            >
              {c.label}
              <Close size={14} />
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {results.length ? (
          results.map((e) => <ExaminerCard key={e.id} e={e} topics={e.topics} />)
        ) : (
          <Empty
            title="No examiner matches that"
            body="Loosen a filter or clear the search. Every examiner takes at least one topic outside their headline."
          />
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        topics={topics}
        value={filters}
        onChange={setFilters}
        resultCount={liveCount}
      />
    </div>
  );
}
