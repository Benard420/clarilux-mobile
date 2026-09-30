import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { Avatar, Badge, Empty, Progress } from "@/components/ui";
import { mmss } from "@/lib/format";
import type { BookingWithExaminer, ExamQuestion, SessionReport } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const DOMAINS = [
  ["Clinical reasoning", "reasoning_score"],
  ["Knowledge", "knowledge_score"],
  ["Communication", "communication_score"],
  ["Patient safety", "safety_score"],
] as const;

export default async function Report({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, examiners(*), session_types(*)")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) notFound();

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  const [{ data: report }, { data: questions }] = await Promise.all([
    session
      ? supabase.from("session_reports").select("*").eq("session_id", session.id).maybeSingle()
      : Promise.resolve({ data: null }),
    session
      ? supabase.from("exam_questions").select("*").eq("session_id", session.id).order("order_index")
      : Promise.resolve({ data: [] as ExamQuestion[] }),
  ]);

  const b = booking as BookingWithExaminer;

  if (!report) {
    return (
      <>
        <TopBar title="Report" />
        <main className="mx-auto w-full max-w-[480px] px-4 pt-8">
          <Empty
            title="No report yet"
            body="The report is written the moment you finish all the stations. Head back into the room to complete the session."
          />
          <Link
            href={`/room/${bookingId}`}
            className="mt-4 flex min-h-[52px] items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white"
          >
            Back to the room
          </Link>
        </main>
      </>
    );
  }

  const r = report as SessionReport;
  const pass = r.overall_score >= 60;

  return (
    <>
      <TopBar title="Session report" subtitle={b.examiners?.full_name ?? undefined} />
      <main className="mx-auto w-full max-w-[480px] px-4 pb-14 pt-5">
        <section className="rise rounded-2xl border border-line bg-surface p-5 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">Overall</p>
          <p className="mt-1 text-[52px] font-bold leading-none tracking-[-0.04em] text-strong">
            {r.overall_score}
            <span className="text-[20px] font-semibold text-muted"> / 100</span>
          </p>
          <div className="mt-3">
            <Badge tone={pass ? "success" : "warn"}>{r.verdict}</Badge>
          </div>
          <p className="mt-3 text-[12.5px] text-muted">
            {questions?.length ?? 0} stations ·{" "}
            {session?.duration_seconds ? mmss(session.duration_seconds) : "—"} in the room
          </p>
        </section>

        <section className="mt-4 space-y-4 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-[15px] font-semibold text-strong">By domain</h2>
          {DOMAINS.map(([label, key]) => (
            <Progress key={key} value={(r[key] as number | null) ?? 0} label={label} />
          ))}
        </section>

        {r.examiner_notes ? (
          <section className="mt-4 flex gap-3.5 rounded-2xl border border-line bg-tint p-4">
            <Avatar name={b.examiners?.full_name ?? "Examiner"} size={40} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-strong">{b.examiners?.full_name}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-body">{r.examiner_notes}</p>
            </div>
          </section>
        ) : null}

        {r.strengths?.length ? (
          <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-[15px] font-semibold text-strong">What worked</h2>
            <ul className="mt-2.5 space-y-2">
              {r.strengths.map((s) => (
                <li key={s} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-success">
                    <path d="M5 13l4.5 4.5L19 7" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {r.improvements?.length ? (
          <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-[15px] font-semibold text-strong">
              {r.improvements.length === 1 ? "Fix this" : `Fix these ${r.improvements.length === 2 ? "two" : r.improvements.length === 3 ? "three" : r.improvements.length} things`}
            </h2>
            <ol className="mt-2.5 space-y-3">
              {r.improvements.map((s, i) => (
                <li key={s} className="flex gap-3 text-[13.5px] leading-relaxed">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tint text-[12px] font-bold text-brand">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {questions?.length ? (
          <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-[15px] font-semibold text-strong">Station by station</h2>
            <ul className="mt-3 divide-y divide-divider">
              {(questions as ExamQuestion[]).map((q) => (
                <li key={q.id} className="py-3.5 first:pt-0 last:pb-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                    {q.domain}
                  </p>
                  <p className="mt-1 text-[13.5px] font-medium leading-snug text-strong">{q.prompt}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed">
                    {q.response_text ? q.response_text : "No answer given."}
                  </p>
                  <p className="mt-1.5 text-[11.5px] text-muted">
                    {q.response_seconds ? mmss(q.response_seconds) : "—"} used of{" "}
                    {mmss(q.expected_seconds ?? 120)}
                    {q.response_seconds && q.expected_seconds && q.response_seconds > q.expected_seconds
                      ? " · over time"
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {r.recommended_next ? (
          <section className="mt-4 rounded-2xl bg-brand p-5 text-white">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/70">
              What to do next
            </p>
            <p className="mt-1.5 text-[15px] font-semibold leading-snug">{r.recommended_next}</p>
            <Link
              href="/discover"
              className="mt-4 flex min-h-[46px] items-center justify-center rounded-xl bg-white text-[14px] font-semibold text-brand active:scale-[0.98]"
            >
              Book the next session
            </Link>
          </section>
        ) : null}

        <Link
          href="/bookings"
          className="mt-4 flex min-h-[52px] items-center justify-center rounded-xl border border-line bg-surface text-[15px] font-semibold text-strong active:scale-[0.98]"
        >
          Back to my sessions
        </Link>
      </main>
    </>
  );
}
