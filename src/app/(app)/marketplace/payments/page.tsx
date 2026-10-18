import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/app-bar";
import { PaymentMethods } from "@/components/payment-methods";
import { Segmented } from "@/components/ui";
import { MARKET_TABS } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");

  const [{ data: profile }, { data: cards }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle(),
    supabase.from("payment_methods").select("*").order("is_default", { ascending: false }),
  ]);

  return (
    <>
      <AppBar name={profile?.full_name ?? "Candidate"} />
      <main className="space-y-4 px-4 pt-4">
        <header>
          <h1 className="t-display text-strong">Payments</h1>
          <p className="t-body mt-1 text-body">Cards used for bookings. Nothing is ever charged.</p>
        </header>
        <Segmented items={MARKET_TABS} active="/marketplace/payments" />
        <PaymentMethods cards={cards ?? []} profileId={auth.user.id} />
      </main>
    </>
  );
}
