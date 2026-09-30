import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/app-bar";
import { Bell, Bookmark, Card as CardIcon, Sun, User } from "@/components/icons";
import { Avatar, Card, Divider, NavRow, Pill, Stats } from "@/components/ui";
import { SignOut } from "@/components/sign-out";

export const dynamic = "force-dynamic";

export default async function MorePage() {
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

  const rows = [
    { href: "/more/exam-profile", icon: <User size={19} />, title: "Exam profile", sub: "Specialty, board and exam date" },
    { href: "/marketplace/payments", icon: <CardIcon size={19} />, title: "Payment methods", sub: "Cards used for bookings" },
    { href: "/more/saved", icon: <Bookmark size={19} />, title: "Saved examiners", sub: "The ones you keep coming back to" },
    { href: "/notifications", icon: <Bell size={19} />, title: "Notifications", sub: "Reminders and released reports" },
    { href: "/more/appearance", icon: <Sun size={19} />, title: "Appearance", sub: "Light, dark or follow the system" },
  ];

  return (
    <>
      <AppBar name={profile?.full_name ?? "Candidate"} />
      <main className="space-y-3 px-4 pt-4">
        <Card className="flex items-center gap-3.5">
          <Avatar name={profile?.full_name ?? "Candidate"} size={56} />
          <div className="min-w-0">
            <p className="truncate t-title-s text-strong">{profile?.full_name ?? "Candidate"}</p>
            <p className="truncate t-caption text-muted">{auth.user.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {profile?.specialty ? <Pill tone="brand">{profile.specialty}</Pill> : null}
              {profile?.target_board ? <Pill>{profile.target_board}</Pill> : null}
            </div>
          </div>
        </Card>

        <Card>
          <Stats
            cells={[
              [String(done ?? 0), "Sessions done"],
              [`${profile?.streak_days ?? 0} d`, "Streak"],
              [`${profile?.weekly_goal_hours ?? 0} h`, "Weekly goal"],
            ]}
          />
        </Card>

        <Card padded={false} className="overflow-hidden">
          {rows.map((r, i) => (
            <div key={r.href}>
              <NavRow {...r} />
              {i < rows.length - 1 ? <Divider /> : null}
            </div>
          ))}
        </Card>

        <Card tone="tint" className="space-y-1.5">
          <p className="t-small-strong text-strong">About this build</p>
          <p className="t-meta text-body">
            Clarilux is an independent design and engineering concept by Sandra Benard. It is not
            affiliated with, endorsed by, or connected to RioEigen. Examiners, availability, reports
            and payments are sample data.
          </p>
        </Card>

        <SignOut />
      </main>
    </>
  );
}
