import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking-flow";
import type { Examiner, SessionType, Topic } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type Joined = Examiner & { session_types: SessionType[]; examiner_topics: { topics: Topic | null }[] };

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ examinerId: string }>;
  searchParams: Promise<{ type?: string; slot?: string }>;
}) {
  const { examinerId } = await params;
  const { type, slot } = await searchParams;
  const supabase = await createClient();

  const [{ data: examiner }, { data: slots }, { data: cards }] = await Promise.all([
    supabase
      .from("examiners")
      .select("*, session_types(*), examiner_topics(topics(*))")
      .eq("id", examinerId)
      .maybeSingle(),
    supabase
      .from("availability_slots")
      .select("*")
      .eq("examiner_id", examinerId)
      .eq("is_booked", false)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(120),
    supabase.from("payment_methods").select("*").order("is_default", { ascending: false }),
  ]);

  if (!examiner) notFound();
  const e = examiner as Joined;

  return (
    <BookingFlow
      examiner={e}
      sessionTypes={[...(e.session_types ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))}
      topics={(e.examiner_topics ?? []).map((t) => t.topics?.name).filter((n): n is string => Boolean(n))}
      slots={slots ?? []}
      card={cards?.[0] ?? null}
      preselectType={type ?? null}
      preselectSlot={slot ?? null}
    />
  );
}
