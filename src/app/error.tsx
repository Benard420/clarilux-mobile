"use client";

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 text-center">
      <div>
        <h1 className="t-title-l text-strong">Something broke</h1>
        <p className="t-body mx-auto mt-2 max-w-[36ch] text-body">
          The screen failed to load. Nothing you did is lost, try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="t-button mt-6 min-h-[52px] rounded-[12px] bg-brand px-6 text-on-brand"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
