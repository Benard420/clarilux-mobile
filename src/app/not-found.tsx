import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 text-center">
      <div>
        <p className="t-label text-brand">404</p>
        <h1 className="t-display mt-2 text-strong">
          That page is not here
        </h1>
        <p className="t-body mx-auto mt-2 max-w-[34ch] text-body">
          The link may be stale, or the session it pointed at was cancelled.
        </p>
        <Link
          href="/dashboard"
          className="t-button mt-6 inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-brand px-6 text-on-brand"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
