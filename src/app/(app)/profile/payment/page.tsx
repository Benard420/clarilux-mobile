import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { PaymentMethods } from "@/components/payment-methods";

export const dynamic = "force-dynamic";

export default async function PaymentPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/welcome");
  const { data } = await supabase
    .from("payment_methods")
    .select("*")
    .order("is_default", { ascending: false });

  return (
    <>
      <TopBar title="Payment methods" />
      <main className="px-4 pb-10 pt-5">
        <PaymentMethods cards={data ?? []} profileId={auth.user.id} />
      </main>
    </>
  );
}
