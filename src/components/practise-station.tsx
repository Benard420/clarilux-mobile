"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Textarea } from "@/components/ui";
import type { ExamDomain } from "@/lib/database.types";

const LISTEN_FOR: Record<ExamDomain, string[]> = {
  reasoning: [
    "A structure named before any detail",
    "A differential that arrives before investigations",
    "The safety net inside the first thirty seconds",
  ],
  knowledge: [
    "Thresholds and numbers said out loud, not implied",
    "The exception to the rule, named before you are asked",
    "A short answer that stops when it is finished",
  ],
  communication: [
    "What the other person already understands, checked first",
    "Plain words, no jargon, no hedging",
    "A clear next step and when they will hear from you",
  ],
  safety: [
    "The single thing most likely to cause harm, named first",
    "The threshold at which you stop and escalate",
    "A handover that leads with the time critical step",
  ],
};

export function PractiseStation({
  prompt,
  domain,
  topic,
  expectedSeconds,
}: {
  prompt: string;
  domain: ExamDomain;
  topic: string;
  expectedSeconds: number | null;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const words = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <p className="t-label uppercase text-brand">
        {domain} · {topic}
      </p>
      <h1 className="t-title-m text-strong">{prompt}</h1>

      <Card tone="tint" className="space-y-1.5">
        <p className="t-small-strong text-strong">What examiners listen for</p>
        {revealed ? (
          <ul className="space-y-1.5">
            {LISTEN_FOR[domain].map((l) => (
              <li key={l} className="t-meta text-body">
                {l}
              </li>
            ))}
          </ul>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="t-meta-strong text-brand"
          >
            Answer first, then reveal
          </button>
        )}
      </Card>

      <div className="space-y-1.5">
        <label htmlFor="answer" className="block t-meta-strong text-strong">
          Your answer
        </label>
        <Textarea
          id="answer"
          rows={8}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer as you would say it out loud. Structure first, then the detail."
        />
        <div className="flex justify-between t-caption text-muted">
          <span>{words} words</span>
          <span>{Math.round((expectedSeconds ?? 120) / 60)} min in the real room</span>
        </div>
      </div>

      <div className="flex gap-2.5 pt-1">
        <Button tone="secondary" className="flex-1" onClick={() => router.push("/questions")}>
          Skip
        </Button>
        <Button
          className="flex-1"
          disabled={!answer.trim()}
          onClick={() => {
            setRevealed(true);
            setAnswer("");
            router.push("/questions");
          }}
        >
          Save and next
        </Button>
      </div>
    </div>
  );
}
