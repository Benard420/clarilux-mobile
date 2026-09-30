"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Chip, Field, Input, Progress } from "@/components/ui";

const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Paediatrics",
  "General surgery",
  "Psychiatry",
  "Emergency medicine",
  "Obstetrics and gynaecology",
  "Internal medicine",
  "Anaesthesia",
];

const BOARDS = ["ABIM oral boards", "MRCP PACES", "FRACP clinical", "MRCS Part B", "USMLE Step 3 CCS", "Other"];
const HOURS = [10, 15, 20, 25, 30];

const STEPS = ["Specialty", "Your exam", "Study load", "Ready"] as const;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [board, setBoard] = useState<string | null>(null);
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAdvance = [Boolean(specialty), Boolean(board), true, true][step];

  async function finish() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.replace("/sign-in");
      return;
    }
    const { error: err } = await supabase
      .from("profiles")
      .update({
        specialty,
        target_board: board,
        exam_date: examDate || null,
        weekly_goal_hours: hours,
        onboarded: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user.id);

    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.replace("/home");
    router.refresh();
  }

  return (
    <main className="rise flex min-h-[calc(100dvh-140px)] flex-col">
      <div className="space-y-3">
        <Progress value={((step + 1) / STEPS.length) * 100} />
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      {step === 0 && (
        <section key="s0" className="fade mt-6">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.025em] text-strong">
            What are you examining in?
          </h1>
          <p className="mt-2 text-[14px]">This decides which examiners we put in front of you.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <Chip key={s} active={specialty === s} onClick={() => setSpecialty(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section key="s1" className="fade mt-6 space-y-6">
          <div>
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.025em] text-strong">
              Which exam, and when?
            </h1>
            <p className="mt-2 text-[14px]">We work backwards from the date to pace your mocks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {BOARDS.map((b) => (
              <Chip key={b} active={board === b} onClick={() => setBoard(b)}>
                {b}
              </Chip>
            ))}
          </div>
          <Field label="Exam date" hint="Leave it blank if the date is not out yet." htmlFor="exam-date">
            <Input id="exam-date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </Field>
        </section>
      )}

      {step === 2 && (
        <section key="s2" className="fade mt-6">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.025em] text-strong">
            How many hours a week?
          </h1>
          <p className="mt-2 text-[14px]">
            Be honest rather than ambitious. We use it to set your readiness score, not to judge you.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {HOURS.map((h) => (
              <Chip key={h} active={hours === h} onClick={() => setHours(h)}>
                {h} hours
              </Chip>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
            <p className="text-[13px] font-semibold text-strong">At {hours} hours a week</p>
            <p className="mt-1 text-[13px] leading-relaxed">
              Two focused vivas and one full mock a month keeps you sharp without eating your rota.
            </p>
          </div>
        </section>
      )}

      {step === 3 && (
        <section key="s3" className="fade mt-6">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.025em] text-strong">
            That is everything.
          </h1>
          <p className="mt-2 text-[14px]">Here is what we have. You can change any of it later.</p>
          <dl className="mt-6 divide-y divide-divider overflow-hidden rounded-2xl border border-line bg-surface">
            {[
              ["Specialty", specialty ?? "Not set"],
              ["Target exam", board ?? "Not set"],
              ["Exam date", examDate ? new Date(examDate).toDateString() : "Not set"],
              ["Weekly goal", `${hours} hours`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <dt className="text-[13px] text-body">{k}</dt>
                <dd className="text-[13.5px] font-semibold text-strong">{v}</dd>
              </div>
            ))}
          </dl>
          {error ? (
            <p role="alert" className="mt-3 text-[12.5px] font-medium text-danger">
              {error}
            </p>
          ) : null}
        </section>
      )}

      <div className="mt-auto flex gap-2.5 pt-10">
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
          <Button className="flex-1" disabled={busy} onClick={() => void finish()}>
            {busy ? "Saving" : "Start using Clarilux"}
          </Button>
        )}
      </div>
    </main>
  );
}
