import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { Avatar, Badge, Card, Stars } from "@/components/ui";
import { dayLabel, money, timeLabel } from "@/lib/format";
import type { Examiner, Review, SessionType, Topic } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type Joined = Examiner & {
  session_types: SessionType[];
  examiner_topics: { topics: Topic | null }[];
};

export default async function ExaminerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: examiner }, { data: slots }, { data: reviews }] = await Promise.all([
    supabase.from("examiners").select("*, session_types(*), examiner_topics(topics(*))").eq("id", id).maybeSingle(),
    supabase
      .from("availability_slots")
      .select("*")
      .eq("examiner_id", id)
      .eq("is_booked", false)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(6),
    supabase.from("reviews").select("*").eq("examiner_id", id).order("created_at", { ascending: false }).limit(3),
  ]);

  if (!examiner) notFound();
  const e = examiner as Joined;
  const topics = (e.examiner_topics ?? []).map((t) => t.topics?.name).filter(Boolean) as string[];
  const types = [...(e.session_types ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <>
      <TopBar title={e.full_name} subtitle={e.institution ?? undefined} />
      <main className="px-4 pb-6 pt-5">
        <section className="rise flex gap-4">
          <Avatar name={e.full_name} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[19px] font-bold tracking-[-0.02em] text-strong">{e.full_name}</h1>
              {e.verified ? <Badge tone="brand">Verified</Badge> : null}
            </div>
            <p className="mt-0.5 text-[13px] text-muted">{e.institution}</p>
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={e.rating} count={e.review_count} />
              {e.years_experience ? (
                <span className="text-[12.5px] text-body">{e.years_experience} yrs examining</span>
              ) : null}
            </div>
          </div>
        </section>

        <p className="mt-5 text-[14px] leading-relaxed">{e.bio}</p>

        {topics.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <span key={t} className="rounded-full bg-sunken px-3 py-1.5 text-[12px] font-medium text-body">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <section className="mt-7">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-strong">Session types</h2>
          <ul className="mt-3 space-y-2.5">
            {types.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/book/${e.id}?type=${t.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-transform duration-200 active:scale-[0.985]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-strong">{t.name}</p>
                    <p className="mt-0.5 text-[12.5px] leading-snug">{t.description}</p>
                    <p className="mt-1.5 text-[12px] font-medium text-muted">{t.duration_minutes} minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold tracking-[-0.02em] text-strong">
                      {money(t.price_cents, t.currency)}
                    </p>
                    <span className="mt-1 inline-block text-[12px] font-semibold text-brand">Book</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-7">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-strong">Next open slots</h2>
          {slots?.length ? (
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
              {slots.map((s) => (
                <Link
                  key={s.id}
                  href={`/book/${e.id}?slot=${s.id}`}
                  className="shrink-0 rounded-xl border border-line bg-surface px-4 py-3 text-center active:scale-[0.97]"
                >
                  <p className="text-[12px] font-medium text-muted">{dayLabel(s.starts_at)}</p>
                  <p className="mt-0.5 text-[14px] font-semibold text-strong">{timeLabel(s.starts_at)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-[13px]">No open slots in the next two weeks. Check back on Monday.</p>
          )}
        </section>

        {reviews?.length ? (
          <section className="mt-7">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-strong">What candidates say</h2>
            <ul className="mt-3 space-y-2.5">
              {(reviews as Review[]).map((r) => (
                <Card key={r.id} as="li">
                  <Stars rating={r.rating} />
                  <p className="mt-2 text-[13.5px] leading-relaxed">{r.body}</p>
                </Card>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="sticky bottom-[88px] mt-8 rounded-2xl border border-line bg-surface/95 p-3 backdrop-blur-md">
          <Link
            href={`/book/${e.id}`}
            className="flex min-h-[52px] items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white active:scale-[0.98]"
          >
            Book with {e.full_name.split(" ").slice(-1)[0]} · from {money(e.from_price_cents, e.currency)}
          </Link>
        </div>
      </main>
    </>
  );
}
