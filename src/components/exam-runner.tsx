"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Button } from "@/components/ui";
import { mmss, nowMs } from "@/lib/format";
import type { BookingWithExaminer, ExamQuestion, ExamSession } from "@/lib/database.types";

const DOMAIN_LABEL: Record<string, string> = {
  reasoning: "Clinical reasoning",
  knowledge: "Knowledge",
  communication: "Communication",
  safety: "Patient safety",
};

export function ExamRunner({
  booking,
  session,
  questions,
}: {
  booking: BookingWithExaminer;
  session: ExamSession;
  questions: ExamQuestion[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(() => {
    const firstUnanswered = questions.findIndex((q) => !q.answered_at);
    return firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.response_text ?? ""])),
  );
  const [clock, setClock] = useState({ i: 0, s: 0 });
  const [leaving, setLeaving] = useState(false);
  const [phase, setPhase] = useState<"live" | "uploading">("live");
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(0);

  const elapsed = clock.i === index ? clock.s : 0;
  const question = questions[index];
  const limit = question?.expected_seconds ?? 120;
  const remaining = limit - elapsed;
  const over = remaining <= 0;
  const answer = answers[question?.id ?? ""] ?? "";
  const last = index === questions.length - 1;

  useEffect(() => {
    startedAt.current = nowMs();
    const id = setInterval(
      () => setClock({ i: index, s: Math.floor((nowMs() - startedAt.current) / 1000) }),
      250,
    );
    return () => clearInterval(id);
  }, [index]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (phase === "live") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const save = useCallback(
    async (q: ExamQuestion, text: string, seconds: number) => {
      const supabase = createClient();
      await supabase
        .from("exam_questions")
        .update({
          response_text: text,
          response_seconds: seconds,
          answered_at: new Date().toISOString(),
          asked_at: q.asked_at ?? new Date().toISOString(),
        })
        .eq("id", q.id);
    },
    [],
  );

  async function next() {
    if (!question) return;
    const seconds = Math.floor((nowMs() - startedAt.current) / 1000);
    await save(question, answer, seconds);
    if (!last) {
      setIndex((i) => i + 1);
      return;
    }
    setPhase("uploading");
    const supabase = createClient();
    const { error: err } = await supabase.rpc("finish_exam_session", { p_session_id: session.id });
    if (err) {
      setError(err.message);
      setPhase("live");
      return;
    }
    router.replace(`/room/${booking.id}/report`);
  }

  const answeredCount = useMemo(
    () => questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length,
    [questions, answers],
  );

  if (phase === "uploading") {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="fade">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-tint text-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="animate-spin">
              <path d="M12 3a9 9 0 019 9" />
              <path d="M12 21a9 9 0 01-9-9" opacity="0.3" />
            </svg>
          </span>
          <h1 className="mt-5 text-[20px] font-bold tracking-[-0.02em] text-strong">Marking your session</h1>
          <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-relaxed">
            Four domains, {questions.length} stations. This takes a few seconds.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar name={booking.examiners?.full_name ?? "Examiner"} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-strong">{booking.examiners?.full_name}</p>
            <p className="text-[11.5px] text-muted">
              Station {index + 1} of {questions.length} · {DOMAIN_LABEL[question.domain] ?? question.domain}
            </p>
          </div>
          <span
            aria-live="off"
            className={`rounded-lg px-2.5 py-1.5 text-[14px] font-bold tabular-nums ${
              over ? "bg-danger-bg text-danger" : remaining < 20 ? "bg-amber/15 text-amber" : "bg-sunken text-strong"
            }`}
          >
            {over ? `+${mmss(-remaining)}` : mmss(remaining)}
          </span>
          <button
            type="button"
            onClick={() => setLeaving(true)}
            aria-label="Leave the exam room"
            className="grid size-9 place-items-center rounded-full text-muted"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="flex gap-1 px-4 pb-2.5">
          {questions.map((q, i) => (
            <span
              key={q.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < index ? "bg-brand" : i === index ? "bg-brand/45" : "bg-sunken"
              }`}
            />
          ))}
        </div>
      </header>

      <section key={question.id} className="rise flex-1 px-4 pt-6">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-brand">
          {DOMAIN_LABEL[question.domain] ?? question.domain}
        </p>
        <h1 className="mt-2.5 text-[21px] font-semibold leading-[1.32] tracking-[-0.02em] text-strong">
          {question.prompt}
        </h1>

        <div className="mt-5">
          <label htmlFor="answer" className="sr-only">
            Your answer
          </label>
          <textarea
            id="answer"
            rows={9}
            autoFocus
            value={answer}
            onChange={(e) => setAnswers((a) => ({ ...a, [question.id]: e.target.value }))}
            placeholder="Answer as you would say it out loud. Structure first, then the detail."
            className="w-full rounded-2xl border border-line bg-surface p-4 text-[15px] leading-relaxed text-strong placeholder:text-muted focus:border-brand focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-muted">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span className={over ? "font-semibold text-danger" : "text-muted"}>
              {over ? "You are over time" : `${mmss(remaining)} left on this station`}
            </span>
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-[12.5px] font-medium text-danger">
            {error}
          </p>
        ) : null}
      </section>

      <footer className="sticky bottom-0 border-t border-line bg-surface/95 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-md">
        <Button onClick={() => void next()} disabled={!answer.trim()}>
          {last ? "Finish and get my report" : "Next station"}
        </Button>
        <p className="mt-2 text-center text-[11.5px] text-muted">
          {answeredCount} of {questions.length} answered. You cannot come back to a station.
        </p>
      </footer>

      {leaving ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/45 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="rise w-full rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-[16px] font-semibold text-strong">Walk out of the session?</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed">
              The stations you have answered are kept, but the session is marked as a walk out and you
              will not get a full report.
            </p>
            <div className="mt-4 flex gap-2.5">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => setLeaving(false)}>
                Stay in
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={() => router.replace(`/booking/${booking.id}`)}
              >
                Walk out
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
