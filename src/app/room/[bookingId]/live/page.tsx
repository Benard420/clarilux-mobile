import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExamRunner } from "@/components/exam-runner";
import type { BookingWithExaminer, ExamQuestion, ExamSession } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function LiveRoom({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, examiners(*), session_types(*)")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) notFound();

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (!session) redirect(`/room/${bookingId}`);
  if (session.state === "scored") redirect(`/room/${bookingId}/report`);

  const { data: questions } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("session_id", session.id)
    .order("order_index");

  if (!questions?.length) redirect(`/room/${bookingId}`);

  return (
    <ExamRunner
      booking={booking as BookingWithExaminer}
      session={session as ExamSession}
      questions={questions as ExamQuestion[]}
    />
  );
}
