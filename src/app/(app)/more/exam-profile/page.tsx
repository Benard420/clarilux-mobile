import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackBar } from "@/components/back-bar";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function ExamProfilePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();

  return (
    <>
      <BackBar title="Exam profile" />
      <main className="px-4 pt-4">
        <ProfileForm profile={profile ?? null} />
      </main>
    </>
  );
}
