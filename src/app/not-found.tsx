import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 text-center">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">404</p>
        <h1 className="mt-2 text-[24px] font-bold tracking-[-0.025em] text-strong">
          That page is not here
        </h1>
        <p className="mx-auto mt-2 max-w-[34ch] text-[14px] leading-relaxed">
          The link may be stale, or the session it pointed at was cancelled.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand px-6 text-[15px] font-semibold text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
