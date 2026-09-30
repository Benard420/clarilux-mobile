import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { Avatar, Badge } from "@/components/ui";
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
      <TopBar title={isNew ? "Booking confirmed" : "Session details"} />
      <main className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-5">
        {isNew ? (
          <section className="rise rounded-2xl border border-success/25 bg-success-bg p-5 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-success text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4.5 4.5L19 7" />
              </svg>
            </span>
            <h1 className="mt-3 text-[19px] font-bold tracking-[-0.02em] text-strong">You are booked</h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
              {fullWhen(b.starts_at)} with {b.examiners?.full_name}. We will nudge you an hour before.
            </p>
          </section>
        ) : null}

        <section className="mt-5 flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4">
          <Avatar name={b.examiners?.full_name ?? "Examiner"} size={54} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15.5px] font-semibold text-strong">{b.examiners?.full_name}</p>
            <p className="text-[12.5px] text-muted">{b.examiners?.institution}</p>
            <Link href={`/examiner/${b.examiner_id}`} className="mt-1 inline-block text-[12.5px] font-semibold text-brand">
              View profile
            </Link>
          </div>
          <Badge tone={b.status === "upcoming" ? "brand" : b.status === "completed" ? "success" : "neutral"}>
            {b.status === "upcoming" ? countdown(b.starts_at) : b.status.replace("_", " ")}
          </Badge>
        </section>

        <dl className="mt-3 divide-y divide-divider overflow-hidden rounded-2xl border border-line bg-surface">
          {[
            ["Session", `${b.session_types?.name ?? "Practice"} · ${b.session_types?.duration_minutes ?? 30} min`],
            ["When", fullWhen(b.starts_at)],
            ["Focus", b.focus_topics?.length ? b.focus_topics.join(", ") : "Examiner's choice"],
            ["Paid", `${money(b.price_cents, b.currency)} · ${b.payment_status}`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 px-4 py-3.5">
              <dt className="text-[13px] text-body">{k}</dt>
              <dd className="max-w-[60%] text-right text-[13.5px] font-semibold capitalize text-strong">{v}</dd>
            </div>
          ))}
        </dl>

        {b.candidate_note ? (
          <section className="mt-3 rounded-2xl border border-line bg-surface p-4">
            <p className="text-[13px] font-semibold text-strong">Your note</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed">{b.candidate_note}</p>
          </section>
        ) : null}

        <section className="mt-3 rounded-2xl border border-line bg-tint p-4">
          <p className="text-[13px] font-semibold text-strong">Before you go in</p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-body">
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
                className="flex min-h-[52px] items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white active:scale-[0.98]"
              >
                {startsSoon ? "Enter the exam room" : "Open the room and test your setup"}
              </Link>
              <CancelBooking bookingId={b.id} />
            </>
          ) : b.status === "completed" ? (
            <Link
              href={`/room/${b.id}/report`}
              className="flex min-h-[52px] items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white active:scale-[0.98]"
            >
              View your report
            </Link>
          ) : (
            <Link
              href={`/examiner/${b.examiner_id}`}
              className="flex min-h-[52px] items-center justify-center rounded-xl border border-line bg-surface text-[15px] font-semibold text-strong active:scale-[0.98]"
            >
              Book again
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
