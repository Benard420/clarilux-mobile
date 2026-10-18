import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/app-bar";
import { DiscoverList } from "@/components/discover-list";
import { Segmented } from "@/components/ui";
import { MARKET_TABS } from "@/lib/nav";
import type { Examiner, Topic } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type Joined = Examiner & { examiner_topics: { topics: Topic | null }[] };

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: profile }, { data: examiners }, { data: topics }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle(),
    supabase.from("examiners").select("*, examiner_topics(topics(*))").order("rating", { ascending: false }),
    supabase.from("topics").select("*").order("sort_order"),
  ]);

  const rows = ((examiners ?? []) as Joined[]).map((e) => ({
    ...e,
    topics: (e.examiner_topics ?? []).map((t) => t.topics?.name).filter((n): n is string => Boolean(n)),
  }));

  return (
    <>
      <AppBar name={profile?.full_name ?? "Candidate"} />
      <main className="space-y-4 px-4 pt-4">
        <header>
          <h1 className="t-display text-strong">
            Welcome back {(profile?.full_name ?? "there").split(" ")[0]},
          </h1>
          <p className="t-body mt-1 text-body">
            Browse examiners and book a session that fits your needs.
          </p>
        </header>
        <Segmented items={MARKET_TABS} active="/marketplace" />
        <DiscoverList examiners={rows} topics={topics ?? []} />
      </main>
    </>
  );
}
