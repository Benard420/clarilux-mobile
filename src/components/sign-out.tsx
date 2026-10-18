"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      tone="secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        router.replace("/welcome");
        router.refresh();
      }}
    >
      {busy ? "Signing out" : "Sign out"}
    </Button>
  );
}
