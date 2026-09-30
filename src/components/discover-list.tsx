"use client";

import { useMemo, useState } from "react";
import { ExaminerCard } from "@/components/examiner-card";
import { ChevronDown, Funnel, Search } from "@/components/icons";
import { Chip, Empty, Input } from "@/components/ui";
import type { Examiner, Topic } from "@/lib/database.types";

type Row = Examiner & { topics: string[] };

const SORTS = [
  { key: "rating", label: "Top rated" },
  { key: "price", label: "Lowest price" },
  { key: "experience", label: "Most experienced" },
] as const;

export function DiscoverList({ examiners, topics }: { examiners: Row[]; topics: Topic[] }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("rating");
  const [sortOpen, setSortOpen] = useState(false);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = examiners.filter((e) => {
      const matchesTopic = !picked.length || picked.some((p) => e.topics.includes(p));
      const matchesText =
        !needle ||
        [e.full_name, e.institution, e.headline, ...e.topics]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle));
      return matchesTopic && matchesText;
    });
    return [...rows].sort((a, b) => {
      if (sort === "price") return a.from_price_cents - b.from_price_cents;
      if (sort === "experience") return (b.years_experience ?? 0) - (a.years_experience ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [examiners, q, picked, sort]);

  const toggle = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

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
          onClick={() => setPicked([])}
          className="t-small-strong flex min-h-[44px] items-center gap-2 rounded-[12px] bg-brand px-4 text-on-brand active:scale-[0.98]"
        >
          <Funnel size={17} />
          Filters
          {picked.length ? (
            <span className="t-caption-medium grid size-5 place-items-center rounded-full bg-surface text-brand">
              {picked.length}
            </span>
          ) : null}
        </button>

        <div className="relative">
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

        <span className="t-meta ml-auto text-muted">{results.length} results</span>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {topics.map((t) => (
          <Chip key={t.id} active={picked.includes(t.name)} onClick={() => toggle(t.name)}>
            {t.name}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {results.length ? (
          results.map((e) => <ExaminerCard key={e.id} e={e} topics={e.topics} />)
        ) : (
          <Empty
            title="No examiner matches that"
            body="Try clearing the topic filters, or search by institution instead."
          />
        )}
      </div>
    </div>
  );
}
