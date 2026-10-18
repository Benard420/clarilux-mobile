import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/app-bar";
import { QuestionList } from "@/components/question-list";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: profile }, { data: bank }, { data: topics }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle(),
    supabase.from("question_bank").select("*"),
    supabase.from("topics").select("*").order("sort_order"),
  ]);

  const names = Object.fromEntries((topics ?? []).map((t) => [t.slug, t.name]));

  return (
    <>
      <AppBar name={profile?.full_name ?? "Candidate"} />
      <main className="space-y-4 px-4 pt-4">
        <header>
          <h1 className="t-display text-strong">Question bank</h1>
          <p className="t-body mt-1 text-body">
            Drill single stations between mocks. No clock, no marks.
          </p>
        </header>
        <QuestionList questions={bank ?? []} topicNames={names} />
      </main>
    </>
  );
}
