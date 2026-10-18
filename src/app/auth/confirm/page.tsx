import { Suspense } from "react";
import { ConfirmClient } from "@/components/confirm-client";

export const dynamic = "force-dynamic";

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmClient />
    </Suspense>
  );
}
