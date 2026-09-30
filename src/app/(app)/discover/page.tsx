import { createClient } from "@/lib/supabase/server";
import { DiscoverList } from "@/components/discover-list";
import type { Examiner, Topic } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type Joined = Examiner & { examiner_topics: { topics: Topic | null }[] };

export default async function Discover() {
  const supabase = await createClient();
  const [{ data: examiners }, { data: topics }] = await Promise.all([
    supabase.from("examiners").select("*, examiner_topics(topics(*))").order("rating", { ascending: false }),
    supabase.from("topics").select("*").order("sort_order"),
  ]);

  const rows = ((examiners ?? []) as Joined[]).map((e) => ({
    ...e,
    topics: (e.examiner_topics ?? []).map((t) => t.topics?.name).filter((n): n is string => Boolean(n)),
  }));

  return (
    <main className="px-4 pt-5">
      <h1 className="text-[24px] font-bold tracking-[-0.025em] text-strong">Find an examiner</h1>
      <p className="mt-1.5 text-[13.5px] leading-relaxed">
        Everyone here has sat on a real panel. Filter by what you need marked hardest.
      </p>
      <div className="mt-5">
        <DiscoverList examiners={rows} topics={topics ?? []} />
      </div>
    </main>
  );
}
