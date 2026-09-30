"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, Search } from "@/components/icons";
import { Card, Chip, Empty, Input } from "@/components/ui";
import type { ExamDomain } from "@/lib/database.types";

type Q = {
  id: string;
  topic_slug: string;
  domain: ExamDomain;
  prompt: string;
  expected_seconds: number | null;
};

const DOMAINS: ExamDomain[] = ["reasoning", "knowledge", "communication", "safety"];

function timeLabel(seconds: number | null) {
  const s = seconds ?? 120;
  if (s < 120) return `${s} sec`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${m} min ${rest}` : `${m} min`;
}

export function QuestionList({
  questions,
  topicNames,
}: {
  questions: Q[];
  topicNames: Record<string, string>;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return questions.filter((item) => {
      const topic = topicNames[item.topic_slug] ?? item.topic_slug;
      const matchesFilter =
        filter === "all" || item.domain === filter || item.topic_slug === filter;
      const matchesText =
        !needle ||
        item.prompt.toLowerCase().includes(needle) ||
        topic.toLowerCase().includes(needle) ||
        item.domain.includes(needle);
      return matchesFilter && matchesText;
    });
  }, [questions, q, filter, topicNames]);

  const topicSlugs = useMemo(
    () => [...new Set(questions.map((x) => x.topic_slug))].slice(0, 8),
    [questions],
  );

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
          placeholder="Search by topic or domain"
          aria-label="Search questions"
          className="!rounded-[12px] !pl-11"
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        {DOMAINS.map((d) => (
          <Chip key={d} active={filter === d} onClick={() => setFilter(d)}>
            <span className="capitalize">{d}</span>
          </Chip>
        ))}
        {topicSlugs.map((s) => (
          <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {topicNames[s] ?? s}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {results.length ? (
          results.map((item) => (
            <Link key={item.id} href={`/questions/${item.id}`} className="block active:scale-[0.99]">
              <Card className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="t-label flex-1 uppercase text-brand">{item.domain}</span>
                  <span className="t-caption text-muted">
                    {topicNames[item.topic_slug] ?? item.topic_slug}
                  </span>
                </div>
                <p className="t-small-strong text-strong">{item.prompt}</p>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-muted" />
                  <span className="t-caption flex-1 text-muted">
                    {timeLabel(item.expected_seconds)}
                  </span>
                  <span className="t-meta-strong text-brand">Practise</span>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <Empty
            title="Nothing matches that"
            body="Clear the filter, or search for a domain like reasoning or safety."
          />
        )}
      </div>
    </div>
  );
}
