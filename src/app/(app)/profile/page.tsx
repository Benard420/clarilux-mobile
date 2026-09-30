import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOut } from "@/components/sign-out";
import { Avatar, Badge, Progress } from "@/components/ui";

export const dynamic = "force-dynamic";

const rows = [
  { href: "/profile/settings", label: "Exam profile", sub: "Specialty, board and exam date" },
  { href: "/profile/payment", label: "Payment methods", sub: "Cards used for bookings" },
  { href: "/profile/saved", label: "Saved examiners", sub: "The ones you keep coming back to" },
  { href: "/notifications", label: "Notifications", sub: "Reminders and released reports" },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: profile }, { count: done }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("candidate_id", auth.user.id)
      .eq("status", "completed"),
  ]);

  return (
    <main className="px-4 pt-5">
      <h1 className="text-[24px] font-bold tracking-[-0.025em] text-strong">Profile</h1>

      <section className="mt-5 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
        <Avatar name={profile?.full_name ?? "Candidate"} size={58} />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-strong">{profile?.full_name ?? "Candidate"}</p>
          <p className="truncate text-[12.5px] text-muted">{auth.user.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profile?.specialty ? <Badge tone="brand">{profile.specialty}</Badge> : null}
            {profile?.target_board ? <Badge>{profile.target_board}</Badge> : null}
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
        <Progress value={profile?.readiness_pct ?? 0} label="Readiness" />
        <div className="mt-4 grid grid-cols-3 divide-x divide-divider text-center">
          {[
            ["Sessions done", String(done ?? 0)],
            ["Streak", `${profile?.streak_days ?? 0} d`],
            ["Weekly goal", `${profile?.weekly_goal_hours ?? 0} h`],
          ].map(([k, v]) => (
            <div key={k} className="px-2">
              <p className="text-[17px] font-bold tracking-[-0.02em] text-strong">{v}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">{k}</p>
            </div>
          ))}
        </div>
      </section>

      <ul className="mt-5 divide-y divide-divider overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="flex min-h-[64px] items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold text-strong">{r.label}</span>
                <span className="block text-[12.5px] text-muted">{r.sub}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-5 rounded-2xl border border-line bg-surface p-4">
        <p className="text-[13px] font-semibold text-strong">About this build</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed">
          Clarilux is an independent design and engineering concept by Sandra Benard. It is not
          affiliated with, endorsed by, or connected to RioEigen. Examiners, availability, reports and
          payments are sample data.
        </p>
      </section>

      <div className="mt-5">
        <SignOut />
      </div>
    </main>
  );
}
