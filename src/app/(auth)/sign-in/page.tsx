"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input } from "@/components/ui";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(mail: string, pass: string) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.replace("/home");
    router.refresh();
  }

  return (
    <main className="rise">
      <Link href="/welcome" className="text-[13px] font-semibold text-brand">
        Back
      </Link>
      <h1 className="mt-6 text-[28px] font-bold leading-tight tracking-[-0.025em] text-strong">
        Welcome back
      </h1>
      <p className="mt-2 text-[14px]">Pick up where you left off.</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(email, password);
        }}
      >
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@hospital.org"
          />
        </Field>

        <Field label="Password" htmlFor="password" error={error ?? undefined}>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-20"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold text-brand"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <Button type="submit" disabled={busy}>
          {busy ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-line bg-tint p-4">
        <p className="text-[13px] font-semibold text-strong">Want to look around first?</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-body">
          The demo account already has a booked session and a marked report waiting.
        </p>
        <Button
          variant="secondary"
          size="md"
          className="mt-3 w-full"
          disabled={busy}
          onClick={() => void submit("demo@clarilux.app", "clarilux-demo")}
        >
          Open the demo account
        </Button>
      </div>

      <p className="mt-6 text-center text-[13px]">
        No account yet?{" "}
        <Link href="/sign-up" className="font-semibold text-brand">
          Create one
        </Link>
      </p>
    </main>
  );
}
