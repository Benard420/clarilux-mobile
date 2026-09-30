"use client";

import { useMemo, useState } from "react";
import { ExaminerCard } from "@/components/examiner-card";
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
  const [topic, setTopic] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("rating");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = examiners.filter((e) => {
      const matchesTopic = !topic || e.topics.includes(topic);
      const matchesText =
        !needle ||
        [e.full_name, e.institution, e.headline, ...e.topics]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle));
      return matchesTopic && matchesText;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "price") return a.from_price_cents - b.from_price_cents;
      if (sort === "experience") return (b.years_experience ?? 0) - (a.years_experience ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
    return rows;
  }, [examiners, q, topic, sort]);

  return (
    <div>
      <div className="relative">
        <svg
          aria-hidden
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Examiner, institution or topic"
          aria-label="Search examiners"
          className="!pl-10"
        />
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={!topic} onClick={() => setTopic(null)}>
          All topics
        </Chip>
        {topics.map((t) => (
          <Chip key={t.id} active={topic === t.name} onClick={() => setTopic(t.name)}>
            {t.name}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-muted">
          {results.length} {results.length === 1 ? "examiner" : "examiners"}
        </p>
        <div className="flex gap-1 rounded-full border border-line bg-sunken p-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-pressed={sort === s.key}
              onClick={() => setSort(s.key)}
              className={`min-h-[32px] rounded-full px-3 text-[12px] font-semibold transition-colors duration-200 ${
                sort === s.key ? "bg-surface text-strong shadow-sm" : "text-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {results.length ? (
          results.map((e) => <ExaminerCard key={e.id} e={e} topics={e.topics} />)
        ) : (
          <Empty
            title="No examiner matches that"
            body="Try clearing the topic filter, or search by institution instead. New examiners join every week."
          />
        )}
      </div>
    </div>
  );
}
