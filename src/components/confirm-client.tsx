"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type State = "working" | "done" | "failed";

export function ConfirmClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<State>("working");
  const [reason, setReason] = useState<string | null>(params.get("reason"));

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const supabase = createClient();

      // Older Supabase links land with the tokens in the URL fragment, which
      // never reaches the server. The client library picks them up on load.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        setState("done");
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (cancelled) return;
        if (!error) {
          setState("done");
          router.replace("/onboarding");
          router.refresh();
          return;
        }
        setReason(error.message);
      }

      setState("failed");
      if (!reason) setReason(hash.get("error_description"));
    }

    void finish();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "working") {
    return (
      <main className="grid min-h-dvh place-items-center bg-page px-6 text-center">
        <p className="text-[15px] text-body">Confirming your email</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 text-center">
      <div>
        <h1 className="text-[21px] font-semibold tracking-[-0.01em] text-strong">
          {state === "done" ? "You are confirmed" : "That link did not work"}
        </h1>
        <p className="mx-auto mt-2 max-w-[38ch] text-[15px] leading-relaxed text-body">
          {state === "done"
            ? "Taking you into your account."
            : "Confirmation links expire, and they only open once. Ask for a fresh one by signing in with the email and password you chose."}
        </p>
        {reason ? <p className="mt-3 text-[13px] text-muted">{reason}</p> : null}
        <Link
          href="/sign-in"
          className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-brand px-6 text-[16px] font-semibold text-white"
        >
          Go to sign in
        </Link>
      </div>
    </main>
  );
}
