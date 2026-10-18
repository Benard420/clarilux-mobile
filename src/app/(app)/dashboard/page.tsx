import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/app-bar";
import { Avatar, ButtonLink, Card, Empty, Meter, Pill, Stats } from "@/components/ui";
import { countdown, daysUntil, fullWhen } from "@/lib/format";
import type { BookingWithExaminer } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: profile }, { data: upcoming }, { data: unread }, { data: lastReport }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
      supabase
        .from("bookings")
        .select("*, examiners(*), session_types(*)")
        .eq("candidate_id", auth.user.id)
        .eq("status", "upcoming")
        .order("starts_at")
        .limit(1),
      supabase.from("notifications").select("id").eq("profile_id", auth.user.id).is("read_at", null),
      supabase
        .from("session_reports")
        .select("overall_score, verdict, examiner_notes, session_id, exam_sessions(booking_id)")
        .order("released_at", { ascending: false })
        .limit(1),
    ]);

  const next = (upcoming?.[0] ?? null) as BookingWithExaminer | null;
  const firstName = (profile?.full_name ?? "there").split(" ")[0];
  const daysToExam = profile?.exam_date ? daysUntil(profile.exam_date) : null;
  const report = lastReport?.[0] as
    | { overall_score: number; examiner_notes: string | null; exam_sessions: { booking_id: string } | null }
    | undefined;

  return (
    <>
      <AppBar name={profile?.full_name ?? "Candidate"} unread={Boolean(unread?.length)} />
      <main className="space-y-3 px-4 pt-4">
        <header>
          <h1 className="t-display text-strong">Welcome back {firstName},</h1>
          <p className="t-body mt-1 text-body">
            {next
              ? "One station booked, and a report waiting to be acted on."
              : "Nothing booked yet. One station is enough to find your weak spot."}
          </p>
        </header>

        {next?.examiners ? (
          <section className="rise overflow-hidden rounded-[12px] bg-brand">
            <div className="flex items-center gap-2 px-4 pt-3.5">
              <span className="t-label rounded-full bg-brand-pressed px-2.5 py-1.5 text-on-brand">
                NEXT SESSION
              </span>
              <span className="t-meta-strong ml-auto text-on-brand-muted">
                {countdown(next.starts_at)}
              </span>
            </div>
            <div className="flex gap-3 px-4 pb-3.5 pt-3">
              <Avatar name={next.examiners.full_name} size={46} src={next.examiners.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="truncate t-title-s text-on-brand">{next.examiners.full_name}</p>
                <p className="t-meta text-on-brand-muted">
                  {next.session_types?.name ?? "Practice session"} ·{" "}
                  {next.session_types?.duration_minutes ?? 30} min
                </p>
                <p className="t-meta text-on-brand-muted">{fullWhen(next.starts_at)}</p>
              </div>
            </div>
            <div className="flex gap-2.5 bg-brand-pressed p-3">
              <Link
                href={`/room/${next.id}`}
                className="t-small-strong flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] bg-surface text-brand active:scale-[0.98]"
              >
                Enter the exam room
              </Link>
              <Link
                href={`/booking/${next.id}`}
                className="t-small-strong flex min-h-[44px] items-center justify-center rounded-[10px] border border-on-brand-muted px-4 text-on-brand active:scale-[0.98]"
              >
                Details
              </Link>
            </div>
          </section>
        ) : (
          <Empty
            title="Nothing booked yet"
            body="Pick an examiner in your specialty and take one 30 minute station."
            action={
              <ButtonLink href="/marketplace" size="md" className="mt-1">
                Find an examiner
              </ButtonLink>
            }
          />
        )}

        <Card className="space-y-3">
          <h2 className="t-title-s text-strong">Where you stand</h2>
          <Meter value={profile?.readiness_pct ?? 0} label="Readiness" />
          <Stats
            cells={[
              [`${profile?.streak_days ?? 0} d`, "Streak"],
              [`${profile?.weekly_goal_hours ?? 0} h`, "Weekly goal"],
              [daysToExam === null ? "Not set" : `${daysToExam} d`, "To exam"],
            ]}
          />
          {profile?.specialty ? (
            <div className="flex flex-wrap gap-1.5">
              <Pill tone="brand">{profile.specialty}</Pill>
              {profile.target_board ? <Pill>{profile.target_board}</Pill> : null}
            </div>
          ) : null}
        </Card>

        {report ? (
          <Card className="space-y-2.5">
            <div className="flex items-center gap-3">
              <h2 className="t-title-s flex-1 text-strong">Your last report</h2>
              <Pill tone={report.overall_score >= 60 ? "success" : "warning"}>
                {report.overall_score} / 100
              </Pill>
            </div>
            <p className="t-meta text-body">{report.examiner_notes}</p>
            {report.exam_sessions?.booking_id ? (
              <Link
                href={`/room/${report.exam_sessions.booking_id}/report`}
                className="t-meta-strong block text-brand"
              >
                Open the report
              </Link>
            ) : null}
          </Card>
        ) : null}
      </main>
    </>
  );
}
