import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

const icons: Record<string, string> = {
  report: "M7 4h10v16H7zM10 9h4M10 13h4",
  reminder: "M12 8v4.5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z",
  booking: "M4 6.5h16V20H4zM8 3v5M16 3v5",
  system: "M12 8v5M12 16.5v.5M12 21a9 9 0 100-18 9 9 0 000 18z",
};

export default async function Notifications() {
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
      <TopBar title="Notifications" />
      <main className="px-4 pt-4">
        {data?.length ? (
          <ul className="space-y-2.5">
            {data.map((n) => {
              const body = (
                <div className="flex gap-3.5 rounded-2xl border border-line bg-surface p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-brand">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icons[n.kind] ?? icons.system} />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-strong">{n.title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug">{n.body}</p>
                    <p className="mt-1.5 text-[11.5px] text-muted">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.action_url ? (
                    <Link href={n.action_url} className="block active:scale-[0.985]">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty title="Nothing here yet" body="Reminders, released reports and new examiners in your specialty will show up here." />
        )}
      </main>
    </>
  );
}
