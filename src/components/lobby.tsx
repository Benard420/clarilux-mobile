"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Info } from "@/components/icons";
import { Avatar, Button, Card, Divider } from "@/components/ui";
import { countdown, fullWhen, minutesUntil } from "@/lib/format";
import type { BookingWithExaminer } from "@/lib/database.types";

type CheckState = "idle" | "testing" | "ok" | "blocked";

export function Lobby({ booking }: { booking: BookingWithExaminer }) {
  const router = useRouter();
  const [mic, setMic] = useState<CheckState>("idle");
  const [level, setLevel] = useState(0);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanup = useRef<() => void>(() => {});

  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  const tooEarly = minutesUntil(booking.starts_at) > 15;

  const testMic = useCallback(async () => {
    setMic("testing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        setLevel(Math.min(1, peak / 40));
        raf = requestAnimationFrame(tick);
      };
      tick();
      setMic("ok");
      cleanup.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      };
    } catch {
      setMic("blocked");
    }
  }, []);

  useEffect(() => () => cleanup.current(), []);

  async function enter() {
    setEntering(true);
    setError(null);
    cleanup.current();
    const { error: err } = await createClient().rpc("start_exam_session", {
      p_booking_id: booking.id,
    });
    if (err) {
      setError(err.message);
      setEntering(false);
      return;
    }
    router.push(`/room/${booking.id}/live`);
  }

  const checks = [
    {
      label: "Connection",
      state: online ? ("ok" as CheckState) : ("blocked" as CheckState),
      ok: "Stable enough for a live station",
      bad: "You are offline. The timer will not start.",
    },
    {
      label: "Microphone",
      state: mic,
      ok: "Picking you up clearly",
      bad: "Blocked. You can still type your answers.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-4">
      <div className="flex items-center">
        <Link href={`/booking/${booking.id}`} className="t-small-strong flex-1 text-brand">
          Leave
        </Link>
        <span className="t-label rounded-full bg-sunken px-3 py-1.5 text-body">EXAM ROOM</span>
      </div>

      <section className="rise mt-7 flex flex-col items-center">
        <span className="relative">
          <Avatar name={booking.examiners?.full_name ?? "Examiner"} size={84} />
          <span className="pulse-ring absolute inset-0 rounded-full" />
        </span>
        <h1 className="t-title-l mt-4 text-strong">{booking.examiners?.full_name}</h1>
        <p className="t-meta mt-0.5 text-muted">
          {booking.session_types?.name} · {booking.session_types?.duration_minutes} min
        </p>
        <p className="t-meta-strong mt-3 rounded-full bg-tint px-3 py-1.5 text-brand">
          {tooEarly ? fullWhen(booking.starts_at) : `Starts ${countdown(booking.starts_at)}`}
        </p>
      </section>

      <h2 className="t-label mb-2 mt-7 text-muted">SETUP CHECK</h2>
      <Card padded={false} className="overflow-hidden">
        {checks.map((c, i) => (
          <div key={c.label}>
            <div className="flex items-center gap-3 px-4 py-4">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full ${
                  c.state === "ok"
                    ? "bg-success-surface text-success"
                    : c.state === "blocked"
                      ? "bg-danger-surface text-danger"
                      : "bg-sunken text-muted"
                }`}
              >
                {c.state === "ok" ? <Check size={16} /> : <Info size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="t-small-strong text-strong">{c.label}</p>
                <p className="t-meta text-body">
                  {c.state === "ok" ? c.ok : c.state === "blocked" ? c.bad : "Not checked yet"}
                </p>
              </div>
              {c.label === "Microphone" && mic !== "ok" ? (
                <Button size="sm" tone="secondary" onClick={() => void testMic()}>
                  {mic === "testing" ? "Listening" : "Test"}
                </Button>
              ) : null}
            </div>
            {i < checks.length - 1 ? <Divider /> : null}
          </div>
        ))}
      </Card>

      {mic === "ok" ? (
        <Card className="mt-3 flex items-center gap-3">
          <span className="t-meta-medium shrink-0 text-body">Say something</span>
          <span className="flex h-6 flex-1 items-center gap-[3px]">
            {Array.from({ length: 22 }).map((_, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-brand transition-[height,opacity] duration-100"
                style={{
                  height: `${Math.max(3, level * 24 * (0.45 + Math.sin(i / 2.4) * 0.55))}px`,
                  opacity: level > 0.04 ? 1 : 0.22,
                }}
              />
            ))}
          </span>
        </Card>
      ) : null}

      <Card tone="tint" className="mt-3 space-y-1.5">
        <p className="t-small-strong text-strong">How this runs</p>
        {[
          "One question at a time. You cannot look ahead.",
          "Each station is timed. Going over costs you marks.",
          "Type your answer as you would say it out loud.",
          "Your report is scored the moment you finish.",
        ].map((l) => (
          <p key={l} className="t-meta text-body">
            {l}
          </p>
        ))}
      </Card>

      {error ? (
        <p role="alert" className="t-caption mt-3 font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-5 space-y-2">
        <Button disabled={entering || !online} onClick={() => void enter()}>
          {entering ? "Opening the room" : tooEarly ? "Start a practice run now" : "Enter the exam room"}
        </Button>
        <p className="t-caption text-center text-muted">
          Once you start, the clock runs. Leaving mid session counts as a walk out.
        </p>
      </div>
    </main>
  );
}
