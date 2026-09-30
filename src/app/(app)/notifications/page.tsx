import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackBar } from "@/components/back-bar";
import { Bell, CheckCircle, Clock, Marketplace } from "@/components/icons";
import { Card, Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

const ICONS: Record<string, typeof Bell> = {
  report: CheckCircle,
  reminder: Clock,
  booking: Clock,
  system: Marketplace,
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (data?.some((n) => !n.read_at)) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("profile_id", auth.user.id)
      .is("read_at", null);
  }

  return (
    <>
      <BackBar title="Notifications" />
      <main className="px-4 pt-4">
        {data?.length ? (
          <ul className="space-y-3">
            {data.map((n) => {
              const Icon = ICONS[n.kind] ?? Bell;
              const inner = (
                <Card className="flex gap-3">
                  <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-tint text-brand">
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block t-small-strong text-strong">{n.title}</span>
                    <span className="mt-0.5 block t-meta text-body">{n.body}</span>
                    <span className="mt-1 block t-caption text-muted">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </span>
                </Card>
              );
              return (
                <li key={n.id}>
                  {n.action_url ? (
                    <Link href={n.action_url} className="block active:scale-[0.99]">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty
            title="Nothing here yet"
            body="Reminders, released reports and new examiners in your specialty show up here."
          />
        )}
      </main>
    </>
  );
}
