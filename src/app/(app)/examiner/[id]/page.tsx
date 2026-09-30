import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackBar } from "@/components/back-bar";
import { Bookmark, Verified } from "@/components/icons";
import { Avatar, Card, Divider, Stars } from "@/components/ui";
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
    <div className="min-h-dvh bg-page pb-[92px]">
      <BackBar action={<Bookmark size={22} className="mr-2 text-strong" />} />
      <main className="mx-auto max-w-[480px] space-y-3 px-4 pt-4">
        <Card className="rise space-y-3">
          <div className="flex gap-3.5">
            <Avatar name={e.full_name} size={64} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate t-title-m text-strong">{e.full_name}</h1>
                {e.verified ? <Verified size={17} className="shrink-0 text-brand" /> : null}
              </div>
              <p className="mt-0.5 t-meta text-muted">{e.institution}</p>
              <div className="mt-1.5 flex items-center gap-3">
                <Stars rating={e.rating} count={e.review_count} />
                {e.years_experience ? (
                  <span className="t-caption text-body">{e.years_experience} yrs examining</span>
                ) : null}
              </div>
            </div>
          </div>
          {topics.length ? (
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span key={t} className="t-caption rounded-full bg-tint px-3 py-1.5 text-brand">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="space-y-2">
          <h2 className="t-title-s text-strong">About</h2>
          <p className="t-body text-body">{e.bio}</p>
        </Card>

        <Card padded={false} className="overflow-hidden">
          <h2 className="t-title-s px-4 pt-4 text-strong">Session types</h2>
          <ul className="mt-2">
            {types.map((t, i) => (
              <li key={t.id}>
                <Link href={`/book/${e.id}?type=${t.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-selected">
                  <span className="min-w-0 flex-1">
                    <span className="block t-small-strong text-strong">{t.name}</span>
                    <span className="mt-0.5 block t-meta text-body">{t.description}</span>
                    <span className="mt-1 block t-caption text-muted">{t.duration_minutes} minutes</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block t-price-m text-strong">{money(t.price_cents, t.currency)}</span>
                    <span className="t-meta-strong text-brand">Book</span>
                  </span>
                </Link>
                {i < types.length - 1 ? <Divider /> : null}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h2 className="t-title-s text-strong">Next open slots</h2>
          {slots?.length ? (
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {slots.map((s) => (
                <Link
                  key={s.id}
                  href={`/book/${e.id}?slot=${s.id}`}
                  className="shrink-0 rounded-[10px] border border-line bg-surface px-4 py-2.5 text-center active:scale-[0.97]"
                >
                  <span className="block t-caption text-muted">{dayLabel(s.starts_at)}</span>
                  <span className="block t-small-strong text-strong">{timeLabel(s.starts_at)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="t-meta text-body">No open slots in the next two weeks. Check back on Monday.</p>
          )}
        </Card>

        {reviews?.length ? (
          <Card className="space-y-3">
            <h2 className="t-title-s text-strong">What candidates say</h2>
            {(reviews as Review[]).map((r) => (
              <div key={r.id} className="space-y-1.5 border-t border-line-subtle pt-3 first:border-0 first:pt-0">
                <Stars rating={r.rating} />
                <p className="t-small text-body">{r.body}</p>
              </div>
            ))}
          </Card>
        ) : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-[480px] items-center gap-3 px-4 py-3">
          <span className="shrink-0">
            <span className="block t-caption text-muted">From</span>
            <span className="t-price-m text-strong">{money(e.from_price_cents, e.currency)}</span>
            <span className="t-caption text-muted">/hr</span>
          </span>
          <Link
            href={`/book/${e.id}`}
            className="t-button flex min-h-[52px] flex-1 items-center justify-center rounded-[12px] bg-brand text-on-brand active:scale-[0.98]"
          >
            Book a session
          </Link>
        </div>
      </div>
    </div>
  );
}
