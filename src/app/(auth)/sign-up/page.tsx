"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "@/components/icons";
import { Button, Field, Input } from "@/components/ui";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const weak = password.length > 0 && password.length < 8;

  async function submit() {
    if (weak) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      router.replace("/onboarding");
      router.refresh();
      return;
    }
    router.replace(`/check-email?to=${encodeURIComponent(email)}`);
  }

  return (
    <main className="rise">
      <Link href="/welcome" aria-label="Back" className="-ml-2 grid size-11 place-items-center text-strong">
        <ChevronLeft size={22} />
      </Link>

      <h1 className="t-display mt-4 text-strong">Create your account</h1>
      <p className="t-body mt-1.5 text-body">Two minutes, then you can book your first station.</p>

      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr Sandra Benard"
          />
        </Field>

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

        <Field
          label="Password"
          htmlFor="password"
          hint="Eight characters or more."
          error={weak ? "Use at least eight characters." : (error ?? undefined)}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" disabled={busy || weak}>
          {busy ? "Creating account" : "Continue"}
        </Button>
      </form>

      <p className="t-caption mt-5 text-center text-muted">
        Concept build for portfolio review. Do not enter details you would not want in a sample
        database.
      </p>

      <p className="t-meta mt-5 text-center text-body">
        Already registered?{" "}
        <Link href="/sign-in" className="font-semibold text-brand">
          Sign in
        </Link>
      </p>
    </main>
  );
}
