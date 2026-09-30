import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Lobby } from "@/components/lobby";
import type { BookingWithExaminer } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function RoomLobby({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data } = await supabase
    .from("bookings")
    .select("*, examiners(*), session_types(*)")
    .eq("id", bookingId)
    .maybeSingle();

  if (!data) notFound();
  const b = data as BookingWithExaminer;

  if (b.status === "completed") redirect(`/room/${bookingId}/report`);
  if (b.status === "cancelled") redirect(`/booking/${bookingId}`);

  return <Lobby booking={b} />;
}
