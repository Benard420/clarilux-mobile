import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExaminerCard } from "@/components/examiner-card";
import { Avatar, Badge, ButtonLink, Empty, Progress, SectionHead } from "@/components/ui";
import { countdown, daysUntil, fullWhen, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: profile }, { data: upcoming }, { data: examiners }, { data: unread }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
    supabase
      .from("bookings")
      .select("*, examiners(*), session_types(*)")
      .eq("candidate_id", auth.user.id)
      .eq("status", "upcoming")
      .order("starts_at")
      .limit(1),
    supabase.from("examiners").select("*").order("rating", { ascending: false }).limit(4),
    supabase.from("notifications").select("id").eq("profile_id", auth.user.id).is("read_at", null),
  ]);

  const next = upcoming?.[0];
  const firstName = (profile?.full_name ?? "there").split(" ").slice(-1)[0];
  const daysToExam = profile?.exam_date ? daysUntil(profile.exam_date) : null;

  return (
    <main className="px-4 pt-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12.5px] font-medium text-muted">Good to see you</p>
          <h1 className="mt-0.5 text-[24px] font-bold tracking-[-0.025em] text-strong">{firstName}</h1>
        </div>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative grid size-11 place-items-center rounded-full border border-line bg-surface text-strong active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6.5 10a5.5 5.5 0 0111 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10zM10 19a2 2 0 004 0" />
          </svg>
          {unread?.length ? (
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger ring-2 ring-surface" />
          ) : null}
        </Link>
      </header>

      <section className="mt-5 rise">
        {next?.examiners ? (
          <div className="overflow-hidden rounded-2xl bg-brand text-white">
            <div className="flex items-center justify-between gap-2 px-4 pt-4">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                NEXT SESSION
              </span>
              <span className="text-[12.5px] font-semibold text-white/85">{countdown(next.starts_at)}</span>
            </div>
            <div className="flex gap-3.5 px-4 pb-4 pt-3.5">
              <Avatar name={next.examiners.full_name} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15.5px] font-semibold">{next.examiners.full_name}</p>
                <p className="mt-0.5 text-[12.5px] text-white/80">
                  {next.session_types?.name ?? "Practice session"} · {next.session_types?.duration_minutes ?? 30} min
                </p>
                <p className="mt-1 text-[12.5px] text-white/80">{fullWhen(next.starts_at)}</p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-white/15 p-3">
              <Link
                href={`/room/${next.id}`}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-white text-[14px] font-semibold text-brand active:scale-[0.98]"
              >
                Enter the exam room
              </Link>
              <Link
                href={`/booking/${next.id}`}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/30 px-4 text-[14px] font-semibold active:scale-[0.98]"
              >
                Details
              </Link>
            </div>
          </div>
        ) : (
          <Empty
            title="Nothing booked yet"
            body="Pick an examiner in your specialty and take one 30 minute station. That is enough to find your weak spot."
            action={
              <ButtonLink href="/discover" size="md" className="mt-1">
                Find an examiner
              </ButtonLink>
            }
          />
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-4">
        <SectionHead title="Where you stand" />
        <Progress value={profile?.readiness_pct ?? 0} label="Readiness" />
        <div className="mt-4 grid grid-cols-3 divide-x divide-divider text-center">
          {[
            ["Streak", `${profile?.streak_days ?? 0} d`],
            ["Weekly goal", `${profile?.weekly_goal_hours ?? 0} h`],
            ["To exam", daysToExam === null ? "Not set" : `${daysToExam} d`],
          ].map(([k, v]) => (
            <div key={k} className="px-2">
              <p className="text-[17px] font-bold tracking-[-0.02em] text-strong">{v}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">{k}</p>
            </div>
          ))}
        </div>
        {profile?.specialty ? (
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-divider pt-3.5">
            <Badge tone="brand">{profile.specialty}</Badge>
            {profile.target_board ? <Badge>{profile.target_board}</Badge> : null}
          </div>
        ) : null}
      </section>

      <section className="mt-7">
        <SectionHead title="Highest rated this week" href="/discover" />
        <div className="space-y-3">
          {examiners?.map((e) => <ExaminerCard key={e.id} e={e} />)}
        </div>
      </section>

      <section className="mt-7 rounded-2xl border border-line bg-tint p-4">
        <p className="text-[14px] font-semibold text-strong">One station, tonight</p>
        <p className="mt-1 text-[13px] leading-relaxed text-body">
          A 30 minute focused viva costs less than a textbook and tells you more. Sessions start from{" "}
          {money(9500)}.
        </p>
        <ButtonLink href="/discover" size="md" className="mt-3">
          Browse tonight&apos;s slots
        </ButtonLink>
      </section>
    </main>
  );
}
