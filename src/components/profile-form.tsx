"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Chip, Field, Input } from "@/components/ui";
import type { Profile } from "@/lib/database.types";

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
const HOURS = [10, 15, 20, 25, 30];

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [specialty, setSpecialty] = useState(profile?.specialty ?? "");
  const [board, setBoard] = useState(profile?.target_board ?? "");
  const [examDate, setExamDate] = useState(profile?.exam_date ?? "");
  const [hours, setHours] = useState(profile?.weekly_goal_hours ?? 20);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!profile) return;
    setState("saving");
    setError(null);
    const { error: err } = await createClient()
      .from("profiles")
      .update({
        full_name: name,
        specialty: specialty || null,
        target_board: board || null,
        exam_date: examDate || null,
        weekly_goal_hours: hours,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    if (err) {
      setError(err.message);
      setState("idle");
      return;
    }
    setState("saved");
    router.refresh();
    setTimeout(() => setState("idle"), 2200);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <Field label="Full name" htmlFor="name">
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </Field>

      <div className="space-y-2">
        <p className="t-meta-strong text-strong">Specialty</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <Chip key={s} active={specialty === s} onClick={() => setSpecialty(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <Field label="Target exam" htmlFor="board">
        <Input id="board" value={board} onChange={(e) => setBoard(e.target.value)} placeholder="ABIM oral boards" />
      </Field>

      <Field label="Exam date" hint="We pace your mocks backwards from here." htmlFor="date">
        <Input id="date" type="date" value={examDate ?? ""} onChange={(e) => setExamDate(e.target.value)} />
      </Field>

      <div className="space-y-2">
        <p className="t-meta-strong text-strong">Weekly goal</p>
        <div className="flex flex-wrap gap-2">
          {HOURS.map((h) => (
            <Chip key={h} active={hours === h} onClick={() => setHours(h)}>
              {h} hours
            </Chip>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="t-caption font-medium text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={state === "saving"}>
        {state === "saving" ? "Saving" : state === "saved" ? "Saved" : "Save changes"}
      </Button>
    </form>
  );
}
