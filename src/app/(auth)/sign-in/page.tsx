"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "@/components/icons";
import { Button, Card, Field, Input } from "@/components/ui";

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
    const { error: err } = await createClient().auth.signInWithPassword({
      email: mail,
      password: pass,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="rise">
      <Link href="/welcome" aria-label="Back" className="-ml-2 grid size-11 place-items-center text-strong">
        <ChevronLeft size={22} />
      </Link>

      <h1 className="t-display mt-4 text-strong">Welcome back</h1>
      <p className="t-body mt-1.5 text-body">Pick up where you left off.</p>

      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(email, password);
        }}
      >
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
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
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-[72px]"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="t-meta-strong absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-2 text-brand"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <Button type="submit" disabled={busy}>
          {busy ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <Card tone="tint" className="mt-5 space-y-1.5">
        <p className="t-small-strong text-strong">Want to look around first?</p>
        <p className="t-meta text-body">
          The demo account already has a booked session and a marked report waiting.
        </p>
        <Button
          tone="secondary"
          size="md"
          className="mt-2 w-full"
          disabled={busy}
          onClick={() => void submit("demo@clarilux.app", "clarilux-demo")}
        >
          Open the demo account
        </Button>
      </Card>

      <p className="t-meta mt-6 text-center text-body">
        No account yet?{" "}
        <Link href="/sign-up" className="font-semibold text-brand">
          Create one
        </Link>
      </p>
    </main>
  );
}
