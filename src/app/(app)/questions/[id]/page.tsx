import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackBar } from "@/components/back-bar";
import { PractiseStation } from "@/components/practise-station";

export const dynamic = "force-dynamic";

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: question }, { data: topics }] = await Promise.all([
    supabase.from("question_bank").select("*").eq("id", id).maybeSingle(),
    supabase.from("topics").select("*"),
  ]);
  if (!question) notFound();

  const topic = (topics ?? []).find((t) => t.slug === question.topic_slug)?.name ?? question.topic_slug;

  return (
    <>
      <BackBar title="Practise" subtitle="No clock, no marks" />
      <main className="px-4 pt-4">
        <PractiseStation
          prompt={question.prompt}
          domain={question.domain}
          topic={topic}
          expectedSeconds={question.expected_seconds}
        />
      </main>
    </>
  );
}
