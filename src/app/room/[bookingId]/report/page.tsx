import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackBar } from "@/components/back-bar";
import { Avatar, Empty, Meter, Pill } from "@/components/ui";
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
        <BackBar title="Report" />
        <main className="mx-auto w-full max-w-[480px] px-4 pt-8">
          <Empty
            title="No report yet"
            body="The report is written the moment you finish all the stations. Head back into the room to complete the session."
          />
          <Link
            href={`/room/${bookingId}`}
            className="t-button mt-4 flex min-h-[52px] items-center justify-center rounded-[12px] bg-brand text-on-brand"
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
      <BackBar title="Session report" subtitle={b.examiners?.full_name ?? undefined} />
      <main className="mx-auto w-full max-w-[480px] px-4 pb-14 pt-5">
        <section className="rise rounded-[12px] border border-line bg-surface p-5 text-center">
          <p className="t-label text-muted">Overall</p>
          <p className="mt-2 text-[56px] font-bold leading-[58px] tracking-[-1.5px] text-strong">
            {r.overall_score}
            <span className="t-body block text-muted">out of 100</span>
          </p>
          <div className="mt-3">
            <Pill tone={pass ? "success" : "warning"}>{r.verdict}</Pill>
          </div>
          <p className="t-caption mt-3 text-muted">
            {questions?.length ?? 0} stations ·{" "}
            {session?.duration_seconds ? mmss(session.duration_seconds) : "—"} in the room
          </p>
        </section>

        <section className="mt-3 space-y-4 rounded-[12px] border border-line bg-surface p-4">
          <h2 className="t-title-s text-strong">By domain</h2>
          {DOMAINS.map(([label, key]) => (
            <Meter key={key} value={(r[key] as number | null) ?? 0} label={label} />
          ))}
        </section>

        {r.examiner_notes ? (
          <section className="mt-3 flex gap-3.5 rounded-[12px] border border-line bg-tint p-4">
            <Avatar name={b.examiners?.full_name ?? "Examiner"} size={40} src={b.examiners?.avatar_url} />
            <div className="min-w-0">
              <p className="t-meta-strong text-strong">{b.examiners?.full_name}</p>
              <p className="t-small mt-1 text-body">{r.examiner_notes}</p>
            </div>
          </section>
        ) : null}

        {r.strengths?.length ? (
          <section className="mt-3 rounded-[12px] border border-line bg-surface p-4">
            <h2 className="t-title-s text-strong">What worked</h2>
            <ul className="mt-2.5 space-y-2.5">
              {r.strengths.map((s) => (
                <li key={s} className="t-small flex gap-2.5 text-body">
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
          <section className="mt-3 rounded-[12px] border border-line bg-surface p-4">
            <h2 className="text-[15px] font-semibold text-strong">
              {r.improvements.length === 1 ? "Fix this" : `Fix these ${r.improvements.length === 2 ? "two" : r.improvements.length === 3 ? "three" : r.improvements.length} things`}
            </h2>
            <ol className="mt-2.5 space-y-3">
              {r.improvements.map((s, i) => (
                <li key={s} className="t-small flex gap-3 text-body">
                  <span className="t-caption-medium grid size-6 shrink-0 place-items-center rounded-full bg-tint text-brand">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {questions?.length ? (
          <section className="mt-3 rounded-[12px] border border-line bg-surface p-4">
            <h2 className="t-title-s text-strong">Station by station</h2>
            <ul className="mt-3 divide-y divide-line-subtle">
              {(questions as ExamQuestion[]).map((q) => (
                <li key={q.id} className="py-3.5 first:pt-0 last:pb-0">
                  <p className="t-label uppercase text-muted">
                    {q.domain}
                  </p>
                  <p className="t-small-strong mt-1 text-strong">{q.prompt}</p>
                  <p className="t-meta mt-1.5 text-body">
                    {q.response_text ? q.response_text : "No answer given."}
                  </p>
                  <p className="t-caption mt-1.5 text-muted">
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
          <section className="mt-3 rounded-[12px] bg-brand p-5 text-on-brand">
            <p className="t-label text-on-brand-muted">
              What to do next
            </p>
            <p className="t-title-s mt-1.5">{r.recommended_next}</p>
            <Link
              href="/marketplace"
              className="t-button mt-4 flex min-h-[48px] items-center justify-center rounded-[12px] bg-surface text-brand active:scale-[0.98]"
            >
              Book the next session
            </Link>
          </section>
        ) : null}

        <Link
          href="/oral-board"
          className="t-button mt-3 flex min-h-[52px] items-center justify-center rounded-[12px] border border-line bg-surface text-strong active:scale-[0.98]"
        >
          Back to my sessions
        </Link>
      </main>
    </>
  );
}
