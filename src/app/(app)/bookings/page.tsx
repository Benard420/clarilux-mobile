import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge, ButtonLink, Empty } from "@/components/ui";
import { countdown, fullWhen, money } from "@/lib/format";
import type { BookingWithExaminer } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const tone = {
  upcoming: "brand",
  completed: "success",
  cancelled: "neutral",
  no_show: "warn",
  rescheduled: "warn",
} as const;

export default async function Bookings() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data } = await supabase
    .from("bookings")
    .select("*, examiners(*), session_types(*)")
    .eq("candidate_id", auth.user.id)
    .order("starts_at", { ascending: false });

  const rows = (data ?? []) as BookingWithExaminer[];
  const upcoming = rows.filter((b) => b.status === "upcoming").reverse();
  const past = rows.filter((b) => b.status !== "upcoming");

  return (
    <main className="px-4 pt-5">
      <h1 className="text-[24px] font-bold tracking-[-0.025em] text-strong">Your sessions</h1>

      {!rows.length ? (
        <div className="mt-6">
          <Empty
            title="No sessions yet"
            body="Book one station and you will have a marked report the same evening."
            action={
              <ButtonLink href="/discover" size="md" className="mt-1">
                Find an examiner
              </ButtonLink>
            }
          />
        </div>
      ) : null}

      {upcoming.length ? (
        <section className="mt-6">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">Coming up</h2>
          <ul className="space-y-3">
            {upcoming.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/booking/${b.id}`}
                  className="block rounded-2xl border border-line bg-surface p-4 active:scale-[0.985]"
                >
                  <div className="flex items-start gap-3.5">
                    <Avatar name={b.examiners?.full_name ?? "Examiner"} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[14.5px] font-semibold text-strong">
                          {b.examiners?.full_name}
                        </p>
                        <Badge tone="brand">{countdown(b.starts_at)}</Badge>
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {b.session_types?.name} · {b.session_types?.duration_minutes} min
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-body">{fullWhen(b.starts_at)}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length ? (
        <section className="mt-7">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">History</h2>
          <ul className="space-y-3">
            {past.map((b) => (
              <li key={b.id}>
                <Link
                  href={b.status === "completed" ? `/room/${b.id}/report` : `/booking/${b.id}`}
                  className="block rounded-2xl border border-line bg-surface p-4 active:scale-[0.985]"
                >
                  <div className="flex items-start gap-3.5">
                    <Avatar name={b.examiners?.full_name ?? "Examiner"} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[14.5px] font-semibold text-strong">
                          {b.examiners?.full_name}
                        </p>
                        <Badge tone={tone[b.status]}>{b.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {new Date(b.starts_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        · {money(b.price_cents, b.currency)}
                      </p>
                      {b.status === "completed" ? (
                        <p className="mt-1.5 text-[12.5px] font-semibold text-brand">View report</p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
