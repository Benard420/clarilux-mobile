import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/app-bar";
import { Clock } from "@/components/icons";
import { Avatar, ButtonLink, Card, Empty, Pill, Segmented } from "@/components/ui";
import { MARKET_TABS } from "@/lib/nav";
import { countdown, money, timeLabel } from "@/lib/format";
import type { BookingWithExaminer } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const statusTone = {
  upcoming: "brand",
  completed: "success",
  cancelled: "neutral",
  no_show: "warning",
  rescheduled: "warning",
} as const;

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle(),
    supabase
      .from("bookings")
      .select("*, examiners(*), session_types(*)")
      .eq("candidate_id", auth.user.id)
      .order("starts_at", { ascending: false }),
  ]);

  const list = (rows ?? []) as BookingWithExaminer[];
  const upcoming = list.filter((b) => b.status === "upcoming").reverse();
  const history = list.filter((b) => b.status !== "upcoming");

  return (
    <>
      <AppBar name={profile?.full_name ?? "Candidate"} />
      <main className="space-y-4 px-4 pt-4">
        <header>
          <h1 className="t-display text-strong">Your sessions</h1>
          <p className="t-body mt-1 text-body">What is coming up, and everything already done.</p>
        </header>
        <Segmented items={MARKET_TABS} active="/marketplace/sessions" />

        <div className="flex items-center gap-5 border-b border-line">
          <span className="t-small-strong -mb-px flex items-center gap-2 border-b-2 border-brand pb-2.5 text-brand">
            Upcoming
            <span className="t-caption-medium rounded-full bg-tint px-2 py-0.5">{upcoming.length}</span>
          </span>
          <span className="t-small-medium flex items-center gap-2 pb-2.5 text-muted">
            Session history
            <span className="t-caption-medium rounded-full bg-sunken px-2 py-0.5">{history.length}</span>
          </span>
        </div>

        {!list.length ? (
          <Empty
            title="No sessions yet"
            body="Book one station and you will have a marked report the same evening."
            action={
              <ButtonLink href="/marketplace" size="md" className="mt-1">
                Find an examiner
              </ButtonLink>
            }
          />
        ) : null}

        {upcoming.map((b, i) => {
          const d = new Date(b.starts_at);
          return (
            <Card key={b.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-[52px] shrink-0 place-items-center rounded-[10px] ${
                    i === 0 ? "bg-brand text-on-brand" : "bg-sunken text-body"
                  }`}
                >
                  <span className="t-label leading-none">{MONTHS[d.getMonth()]}</span>
                  <span className="t-price-m leading-none">{String(d.getDate()).padStart(2, "0")}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate t-small-strong text-strong">{b.examiners?.full_name}</p>
                  <div className="mt-1">
                    <Pill tone={i === 0 ? "brand" : "success"}>
                      {b.session_types?.name ?? "Practice session"}
                    </Pill>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-line-subtle pt-3">
                <Clock size={16} className="text-muted" />
                <span className="t-meta flex-1 text-body">
                  {timeLabel(b.starts_at)} to {timeLabel(b.ends_at)} ·{" "}
                  {b.session_types?.duration_minutes ?? 30} min
                </span>
                <span className="t-meta-strong text-brand">{countdown(b.starts_at)}</span>
              </div>
              <Link
                href={`/booking/${b.id}`}
                className="t-small-strong flex min-h-[48px] items-center justify-center rounded-[12px] border border-line bg-surface text-brand active:scale-[0.98]"
              >
                Session details
              </Link>
            </Card>
          );
        })}

        {history.length ? (
          <section className="space-y-3 pt-1">
            <h2 className="t-label text-muted">SESSION HISTORY</h2>
            {history.map((b) => (
              <Link
                key={b.id}
                href={b.status === "completed" ? `/room/${b.id}/report` : `/booking/${b.id}`}
                className="block active:scale-[0.99]"
              >
                <Card className="flex items-center gap-3">
                  <Avatar name={b.examiners?.full_name ?? "Examiner"} size={44} src={b.examiners?.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate t-small-strong text-strong">{b.examiners?.full_name}</p>
                    <p className="t-caption text-muted">
                      {new Date(b.starts_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {money(b.price_cents, b.currency)}
                    </p>
                  </div>
                  <Pill tone={statusTone[b.status]}>{b.status.replace("_", " ")}</Pill>
                </Card>
              </Link>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
