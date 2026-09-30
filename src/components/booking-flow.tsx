"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/top-bar";
import { Avatar, Button, Chip, Progress } from "@/components/ui";
import { dayLabel, money, timeLabel } from "@/lib/format";
import type { AvailabilitySlot, Examiner, PaymentMethod, SessionType } from "@/lib/database.types";

const STEPS = ["Session", "Time", "Focus", "Pay"] as const;

export function BookingFlow({
  examiner,
  sessionTypes,
  topics,
  slots,
  card,
  preselectType,
  preselectSlot,
}: {
  examiner: Examiner;
  sessionTypes: SessionType[];
  topics: string[];
  slots: AvailabilitySlot[];
  card: PaymentMethod | null;
  preselectType: string | null;
  preselectSlot: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(preselectType || preselectSlot ? 1 : 0);
  const [typeId, setTypeId] = useState<string | null>(preselectType ?? sessionTypes[0]?.id ?? null);
  const [slotId, setSlotId] = useState<string | null>(preselectSlot ?? null);
  const [focus, setFocus] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const type = sessionTypes.find((t) => t.id === typeId) ?? null;
  const slot = slots.find((s) => s.id === slotId) ?? null;

  const byDay = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    slots.forEach((s) => {
      const key = new Date(s.starts_at).toDateString();
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return [...map.entries()].slice(0, 10);
  }, [slots]);

  const [day, setDay] = useState<string>(() => {
    if (preselectSlot) {
      const found = slots.find((s) => s.id === preselectSlot);
      if (found) return new Date(found.starts_at).toDateString();
    }
    return slots[0] ? new Date(slots[0].starts_at).toDateString() : "";
  });

  const canAdvance = [Boolean(typeId), Boolean(slotId), true, Boolean(card)][step];

  async function confirm() {
    if (!typeId || !slotId) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.rpc("create_booking", {
      p_examiner_id: examiner.id,
      p_session_type_id: typeId,
      p_slot_id: slotId,
      p_focus_topics: focus.length ? focus : null,
      p_note: note.trim() || null,
    });
    if (err || !data) {
      setError(err?.message ?? "That slot was taken a moment ago. Pick another time.");
      setBusy(false);
      return;
    }
    router.replace(`/booking/${data}?new=1`);
  }

  return (
    <div className="min-h-dvh bg-page">
      <TopBar title={`Book ${examiner.full_name}`} subtitle={examiner.institution ?? undefined} />
      <main className="mx-auto flex min-h-[calc(100dvh-56px)] w-full max-w-[480px] flex-col px-4 pb-28 pt-4">
        <Progress value={((step + 1) / STEPS.length) * 100} />
        <p className="mt-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-brand">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>

        {step === 0 && (
          <section className="fade mt-5">
            <h1 className="text-[22px] font-bold tracking-[-0.025em] text-strong">
              What kind of session?
            </h1>
            <ul className="mt-4 space-y-2.5">
              {sessionTypes.map((t) => {
                const active = typeId === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setTypeId(t.id)}
                      aria-pressed={active}
                      className={`flex w-full gap-3 rounded-2xl border p-4 text-left transition-colors duration-200 ${
                        active ? "border-brand bg-tint" : "border-line bg-surface"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold text-strong">{t.name}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-body">{t.description}</span>
                        <span className="mt-1.5 block text-[12px] font-medium text-muted">
                          {t.duration_minutes} minutes
                        </span>
                      </span>
                      <span className="text-[15px] font-bold tracking-[-0.02em] text-strong">
                        {money(t.price_cents, t.currency)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {step === 1 && (
          <section className="fade mt-5">
            <h1 className="text-[22px] font-bold tracking-[-0.025em] text-strong">Pick a time</h1>
            <p className="mt-1.5 text-[13px]">Times are shown in your device timezone.</p>
            <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
              {byDay.map(([key, list]) => (
                <Chip key={key} active={day === key} onClick={() => setDay(key)}>
                  {dayLabel(list[0].starts_at)}
                </Chip>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(byDay.find(([k]) => k === day)?.[1] ?? []).map((s) => {
                const active = slotId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlotId(s.id)}
                    aria-pressed={active}
                    className={`min-h-[48px] rounded-xl border text-[14px] font-semibold transition-colors duration-200 ${
                      active ? "border-brand bg-brand text-white" : "border-line bg-surface text-strong"
                    }`}
                  >
                    {timeLabel(s.starts_at)}
                  </button>
                );
              })}
            </div>
            {!byDay.length ? (
              <p className="mt-6 text-[13px]">No open slots right now. Try another examiner.</p>
            ) : null}
          </section>
        )}

        {step === 2 && (
          <section className="fade mt-5">
            <h1 className="text-[22px] font-bold tracking-[-0.025em] text-strong">
              Anything you want hit hard?
            </h1>
            <p className="mt-1.5 text-[13px]">Optional, but examiners use it to pick your stations.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topics.map((t) => (
                <Chip
                  key={t}
                  active={focus.includes(t)}
                  onClick={() => setFocus((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]))}
                >
                  {t}
                </Chip>
              ))}
            </div>
            <div className="mt-5 space-y-1.5">
              <label htmlFor="note" className="block text-[13px] font-semibold text-strong">
                Note for the examiner
              </label>
              <textarea
                id="note"
                rows={4}
                maxLength={400}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="I keep losing marks on communication stations."
                className="w-full rounded-xl border border-line bg-surface p-3.5 text-[14.5px] text-strong placeholder:text-muted focus:border-brand focus:outline-none"
              />
              <p className="text-[12px] text-muted">{note.length} of 400</p>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="fade mt-5">
            <h1 className="text-[22px] font-bold tracking-[-0.025em] text-strong">Check and confirm</h1>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <Avatar name={examiner.full_name} size={44} />
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-semibold text-strong">{examiner.full_name}</p>
                <p className="text-[12.5px] text-muted">{examiner.institution}</p>
              </div>
            </div>

            <dl className="mt-3 divide-y divide-divider overflow-hidden rounded-2xl border border-line bg-surface">
              {[
                ["Session", type ? `${type.name} · ${type.duration_minutes} min` : "Not set"],
                ["When", slot ? `${dayLabel(slot.starts_at)} at ${timeLabel(slot.starts_at)}` : "Not set"],
                ["Focus", focus.length ? focus.join(", ") : "Examiner's choice"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-3.5">
                  <dt className="text-[13px] text-body">{k}</dt>
                  <dd className="max-w-[60%] text-right text-[13.5px] font-semibold text-strong">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
              <p className="text-[13px] font-semibold text-strong">Paying with</p>
              {card ? (
                <p className="mt-1.5 text-[13.5px]">
                  {card.brand} ending {card.last4}
                  <span className="ml-2 text-[12px] text-muted">
                    {card.exp_month}/{String(card.exp_year).slice(-2)}
                  </span>
                </p>
              ) : (
                <p className="mt-1.5 text-[13px] text-body">
                  No card on file. Add one in your profile first. No real charge is made in this concept
                  build.
                </p>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-tint px-4 py-3.5">
              <span className="text-[13.5px] font-semibold text-strong">Total</span>
              <span className="text-[19px] font-bold tracking-[-0.02em] text-brand">
                {type ? money(type.price_cents, type.currency) : "—"}
              </span>
            </div>

            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              Free cancellation up to twelve hours before. This is a concept build, so nothing is
              charged and no examiner is notified.
            </p>

            {error ? (
              <p role="alert" className="mt-3 text-[12.5px] font-medium text-danger">
                {error}
              </p>
            ) : null}
          </section>
        )}

        <div className="mt-auto flex gap-2.5 pt-8">
          {step > 0 ? (
            <Button variant="secondary" className="!w-auto flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1" disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button className="flex-1" disabled={busy || !canAdvance} onClick={() => void confirm()}>
              {busy ? "Confirming" : `Confirm ${type ? money(type.price_cents, type.currency) : ""}`}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
