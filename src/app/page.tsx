import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";

export default async function Root() {
  if (!supabaseConfigured) redirect("/welcome");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.onboarded ? "/dashboard" : "/onboarding");
}
