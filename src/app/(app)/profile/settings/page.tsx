import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();

  return (
    <>
      <TopBar title="Exam profile" />
      <main className="px-4 pb-10 pt-5">
        <ProfileForm profile={profile ?? null} />
        <section className="mt-8">
          <h2 className="text-[15px] font-semibold text-strong">Appearance</h2>
          <p className="mt-1 text-[12.5px] text-muted">The exam room is easier on the eyes in dark.</p>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </section>
      </main>
    </>
  );
}
