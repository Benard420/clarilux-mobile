"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Button } from "@/components/ui";
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
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
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
    const supabase = createClient();
    const { error: err } = await supabase.rpc("start_exam_session", { p_booking_id: booking.id });
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
    <main className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <Link href={`/booking/${booking.id}`} className="text-[13px] font-semibold text-brand">
          Leave
        </Link>
        <span className="rounded-full bg-sunken px-2.5 py-1 text-[11px] font-semibold tracking-wide text-body">
          EXAM ROOM
        </span>
      </div>

      <section className="rise mt-7 text-center">
        <span className="relative mx-auto block w-fit">
          <Avatar name={booking.examiners?.full_name ?? "Examiner"} size={84} />
          <span className="pulse-ring absolute inset-0 rounded-full" />
        </span>
        <h1 className="mt-4 text-[22px] font-bold tracking-[-0.025em] text-strong">
          {booking.examiners?.full_name}
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {booking.session_types?.name} · {booking.session_types?.duration_minutes} min
        </p>
        <p className="mt-3 inline-block rounded-full bg-tint px-3 py-1.5 text-[12.5px] font-semibold text-brand">
          {tooEarly ? fullWhen(booking.starts_at) : `Starts ${countdown(booking.starts_at)}`}
        </p>
      </section>

      <section className="mt-7">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">Setup check</h2>
        <ul className="mt-3 divide-y divide-divider overflow-hidden rounded-2xl border border-line bg-surface">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-3 px-4 py-4">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full ${
                  c.state === "ok" ? "bg-success-bg text-success" : c.state === "blocked" ? "bg-danger-bg text-danger" : "bg-sunken text-muted"
                }`}
              >
                {c.state === "ok" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4.5 4.5L19 7" />
                  </svg>
                ) : c.state === "blocked" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M12 7v7M12 17v.5" />
                  </svg>
                ) : (
                  <span className="text-[13px] font-bold">?</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-strong">{c.label}</p>
                <p className="text-[12.5px] leading-snug">
                  {c.state === "ok" ? c.ok : c.state === "blocked" ? c.bad : "Not checked yet"}
                </p>
              </div>
              {c.label === "Microphone" && mic !== "ok" ? (
                <Button size="sm" variant="secondary" onClick={() => void testMic()}>
                  {mic === "testing" ? "Listening" : "Test"}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        {mic === "ok" ? (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
            <span className="text-[12px] font-semibold text-body">Say something</span>
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
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-tint p-4">
        <p className="text-[13.5px] font-semibold text-strong">How this runs</p>
        <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-body">
          <li>One question at a time. You cannot look ahead.</li>
          <li>Each station is timed. Going over costs you marks, same as the real room.</li>
          <li>Type your answer as you would say it. Short bullet points score badly.</li>
          <li>Your report is scored the moment you finish.</li>
        </ul>
      </section>

      {error ? (
        <p role="alert" className="mt-4 text-[12.5px] font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-2.5">
        <Button disabled={entering || !online} onClick={() => void enter()}>
          {entering ? "Opening the room" : tooEarly ? "Start a practice run now" : "Enter the exam room"}
        </Button>
        <p className="text-center text-[12px] text-muted">
          Once you start, the clock runs. Leaving mid session counts as a walk out.
        </p>
      </div>
    </main>
  );
}
