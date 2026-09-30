import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { ExaminerCard } from "@/components/examiner-card";
import { ButtonLink, Empty } from "@/components/ui";
import type { Examiner } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function Saved() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data } = await supabase
    .from("saved_examiners")
    .select("examiner_id, examiners(*)")
    .eq("profile_id", auth.user.id);

  const rows = ((data ?? []) as unknown as { examiners: Examiner | null }[])
    .map((r) => r.examiners)
    .filter((e): e is Examiner => Boolean(e));

  return (
    <>
      <TopBar title="Saved examiners" />
      <main className="px-4 pb-10 pt-5">
        {rows.length ? (
          <div className="space-y-3">
            {rows.map((e) => (
              <ExaminerCard key={e.id} e={e} />
            ))}
          </div>
        ) : (
          <Empty
            title="Nothing saved"
            body="Save the examiners whose feedback actually moves your score, so rebooking takes one tap."
            action={
              <ButtonLink href="/discover" size="md" className="mt-1">
                Browse examiners
              </ButtonLink>
            }
          />
        )}
      </main>
    </>
  );
}
