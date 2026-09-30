"use client";

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 text-center">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.025em] text-strong">Something broke</h1>
        <p className="mx-auto mt-2 max-w-[36ch] text-[14px] leading-relaxed">
          The screen failed to load. Nothing you did is lost, try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-[48px] rounded-xl bg-brand px-6 text-[15px] font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
