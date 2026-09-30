import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackBar } from "@/components/back-bar";
import { Avatar, Pill } from "@/components/ui";
import { CancelBooking } from "@/components/cancel-booking";
import { countdown, fullWhen, money, startsWithin } from "@/lib/format";
import type { BookingWithExaminer } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function BookingDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data } = await supabase
    .from("bookings")
    .select("*, examiners(*), session_types(*)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const b = data as BookingWithExaminer;
  const startsSoon = startsWithin(b.starts_at, 60);

  return (
    <div className="min-h-dvh bg-page">
      <BackBar title={isNew ? "Booking confirmed" : "Session details"} />
      <main className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-5">
        {isNew ? (
          <section className="rise rounded-[12px] border border-success/25 bg-success-surface p-5 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-success text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4.5 4.5L19 7" />
              </svg>
            </span>
            <h1 className="t-title-m mt-3 text-strong">You are booked</h1>
            <p className="t-small mt-1.5 text-body">
              {fullWhen(b.starts_at)} with {b.examiners?.full_name}. We will nudge you an hour before.
            </p>
          </section>
        ) : null}

        <section className="mt-5 flex items-center gap-3.5 rounded-[12px] border border-line bg-surface p-4">
          <Avatar name={b.examiners?.full_name ?? "Examiner"} size={54} />
          <div className="min-w-0 flex-1">
            <p className="truncate t-title-s text-strong">{b.examiners?.full_name}</p>
            <p className="t-caption text-muted">{b.examiners?.institution}</p>
            <Link href={`/examiner/${b.examiner_id}`} className="t-meta-strong mt-1 inline-block text-brand">
              View profile
            </Link>
          </div>
          <Pill tone={b.status === "upcoming" ? "brand" : b.status === "completed" ? "success" : "neutral"}>
            {b.status === "upcoming" ? countdown(b.starts_at) : b.status.replace("_", " ")}
          </Pill>
        </section>

        <dl className="mt-3 divide-y divide-line-subtle overflow-hidden rounded-[12px] border border-line bg-surface">
          {[
            ["Session", `${b.session_types?.name ?? "Practice"} · ${b.session_types?.duration_minutes ?? 30} min`],
            ["When", fullWhen(b.starts_at)],
            ["Focus", b.focus_topics?.length ? b.focus_topics.join(", ") : "Examiner's choice"],
            ["Paid", `${money(b.price_cents, b.currency)} · ${b.payment_status}`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 px-4 py-3.5">
              <dt className="t-meta text-body">{k}</dt>
              <dd className="t-small-strong max-w-[60%] text-right capitalize text-strong">{v}</dd>
            </div>
          ))}
        </dl>

        {b.candidate_note ? (
          <section className="mt-3 rounded-[12px] border border-line bg-surface p-4">
            <p className="t-small-strong text-strong">Your note</p>
            <p className="t-small mt-1.5 text-body">{b.candidate_note}</p>
          </section>
        ) : null}

        <section className="mt-3 rounded-[12px] border border-line bg-tint p-4">
          <p className="t-small-strong text-strong">Before you go in</p>
          <ul className="t-meta mt-2 space-y-1.5 text-body">
            <li>Headphones, so the examiner hears you and not the room.</li>
            <li>Paper beside you. You will want to sketch one thing.</li>
            <li>Nothing else open. The timer does not pause.</li>
          </ul>
        </section>

        <div className="mt-6 space-y-2.5">
          {b.status === "upcoming" ? (
            <>
              <Link
                href={`/room/${b.id}`}
                className="t-button flex min-h-[52px] items-center justify-center rounded-[12px] bg-brand text-on-brand active:scale-[0.98]"
              >
                {startsSoon ? "Enter the exam room" : "Open the room and test your setup"}
              </Link>
              <CancelBooking bookingId={b.id} />
            </>
          ) : b.status === "completed" ? (
            <Link
              href={`/room/${b.id}/report`}
              className="t-button flex min-h-[52px] items-center justify-center rounded-[12px] bg-brand text-on-brand active:scale-[0.98]"
            >
              View your report
            </Link>
          ) : (
            <Link
              href={`/examiner/${b.examiner_id}`}
              className="t-button flex min-h-[52px] items-center justify-center rounded-[12px] border border-line bg-surface text-strong active:scale-[0.98]"
            >
              Book again
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
