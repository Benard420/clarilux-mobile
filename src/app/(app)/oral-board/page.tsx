import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/app-bar";
import { Clock, Video } from "@/components/icons";
import { Avatar, ButtonLink, Card, Empty, Pill } from "@/components/ui";
import { countdown, money, timeLabel } from "@/lib/format";
import type { BookingWithExaminer } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function DateTile({ iso, highlight }: { iso: string; highlight: boolean }) {
  const d = new Date(iso);
  return (
    <span
      className={`grid size-[52px] shrink-0 place-items-center rounded-[10px] ${
        highlight ? "bg-brand text-on-brand" : "bg-sunken text-body"
      }`}
    >
      <span className="t-label leading-none">{MONTHS[d.getMonth()]}</span>
      <span className="t-price-m leading-none">{String(d.getDate()).padStart(2, "0")}</span>
    </span>
  );
}

export default async function OralBoardPage() {
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
  const done = list.filter((b) => b.status === "completed");

  return (
    <>
      <AppBar name={profile?.full_name ?? "Candidate"} />
      <main className="space-y-3 px-4 pt-4">
        <header>
          <h1 className="t-display text-strong">Oral board</h1>
          <p className="t-body mt-1 text-body">
            The room itself, and every report you have come out with.
          </p>
        </header>

        {!list.length ? (
          <Empty
            title="You have not sat one yet"
            body="Book a station and the room opens here fifteen minutes before it starts."
            action={
              <ButtonLink href="/marketplace" size="md" className="mt-1">
                Find an examiner
              </ButtonLink>
            }
          />
        ) : null}

        {upcoming.length ? (
          <section className="space-y-3">
            <h2 className="t-label text-muted">COMING UP</h2>
            {upcoming.map((b, i) => (
              <Card key={b.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <DateTile iso={b.starts_at} highlight={i === 0} />
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
                <div className="flex gap-2.5">
                  <Link
                    href={`/room/${b.id}`}
                    className={`t-small-strong flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[12px] active:scale-[0.98] ${
                      i === 0
                        ? "bg-brand text-on-brand"
                        : "border border-line bg-surface text-brand"
                    }`}
                  >
                    <Video size={18} />
                    Join session
                  </Link>
                  <Link
                    href={`/booking/${b.id}`}
                    aria-label="Session options"
                    className="grid min-h-[48px] w-[52px] place-items-center rounded-[12px] border border-line bg-surface text-strong active:scale-[0.98]"
                  >
                    •••
                  </Link>
                </div>
              </Card>
            ))}
          </section>
        ) : null}

        {done.length ? (
          <section className="space-y-3 pt-2">
            <h2 className="t-label text-muted">REPORTS</h2>
            {done.map((b) => (
              <Link key={b.id} href={`/room/${b.id}/report`} className="block active:scale-[0.99]">
                <Card className="flex items-center gap-3">
                  <Avatar name={b.examiners?.full_name ?? "Examiner"} size={44} />
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
                  <span className="t-meta-strong text-brand">Report</span>
                </Card>
              </Link>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
