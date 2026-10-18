import Link from "next/link";
import { Message } from "@/components/icons";
import { ButtonLink } from "@/components/ui";

export default async function CheckEmail({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;

  return (
    <main className="rise pt-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-[16px] bg-tint text-brand">
        <Message size={26} />
      </span>
      <h1 className="t-title-l mt-5 text-strong">Confirm your email</h1>
      <p className="t-body mx-auto mt-2.5 max-w-[38ch] text-body">
        We sent a link to <span className="font-semibold text-strong">{to ?? "your inbox"}</span>.
        Open it on this device and you will land straight in your account.
      </p>
      <div className="mt-7">
        <ButtonLink href="/sign-in" tone="secondary">
          Back to sign in
        </ButtonLink>
      </div>
      <p className="t-caption mt-5 text-muted">
        Nothing arrived? Check spam, or{" "}
        <Link href="/sign-in" className="font-semibold text-brand">
          use the demo account
        </Link>{" "}
        instead.
      </p>
    </main>
  );
}
