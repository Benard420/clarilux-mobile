import Link from "next/link";
import { ButtonLink } from "@/components/ui";

export default async function CheckEmail({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;

  return (
    <main className="rise pt-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-tint text-brand">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3.5 7l8.5 6 8.5-6" />
        </svg>
      </span>
      <h1 className="mt-6 text-[26px] font-bold leading-tight tracking-[-0.02em] text-strong">
        Confirm your email
      </h1>
      <p className="mx-auto mt-3 max-w-[38ch] text-[14px] leading-relaxed">
        We sent a link to <span className="font-semibold text-strong">{to ?? "your inbox"}</span>.
        Open it on this device and you will land straight in your account.
      </p>
      <div className="mt-8 space-y-2.5">
        <ButtonLink href="/sign-in" variant="secondary">
          Back to sign in
        </ButtonLink>
      </div>
      <p className="mt-6 text-[12.5px] text-muted">
        Nothing arrived? Check spam, or{" "}
        <Link href="/sign-in" className="font-semibold text-brand">
          use the demo account
        </Link>{" "}
        instead.
      </p>
    </main>
  );
}
