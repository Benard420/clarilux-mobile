"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function CancelBooking({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.replace("/bookings");
    router.refresh();
  }

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        Cancel this session
      </Button>
    );
  }

  return (
    <div className="rise rounded-2xl border border-danger/25 bg-danger-bg p-4">
      <p className="text-[13.5px] font-semibold text-strong">Cancel this session?</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-body">
        The slot goes back to the examiner and your payment is refunded. You can rebook any time.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-[12.5px] font-medium text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="md" className="flex-1" onClick={() => setConfirming(false)}>
          Keep it
        </Button>
        <Button variant="danger" size="md" className="flex-1" disabled={busy} onClick={() => void cancel()}>
          {busy ? "Cancelling" : "Yes, cancel"}
        </Button>
      </div>
    </div>
  );
}
