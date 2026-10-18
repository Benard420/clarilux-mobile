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
    router.replace("/oral-board");
    router.refresh();
  }

  if (!confirming) {
    return (
      <Button tone="secondary" onClick={() => setConfirming(true)}>
        Cancel this session
      </Button>
    );
  }

  return (
    <div className="rise rounded-[12px] border border-danger/25 bg-danger-surface p-4">
      <p className="t-small-strong text-strong">Cancel this session?</p>
      <p className="t-meta mt-1 text-body">
        The slot goes back to the examiner and your payment is refunded. You can rebook any time.
      </p>
      {error ? (
        <p role="alert" className="t-caption mt-2 font-medium text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button tone="secondary" size="md" className="flex-1" onClick={() => setConfirming(false)}>
          Keep it
        </Button>
        <Button tone="danger" size="md" className="flex-1" disabled={busy} onClick={() => void cancel()}>
          {busy ? "Cancelling" : "Yes, cancel"}
        </Button>
      </div>
    </div>
  );
}
