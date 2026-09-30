import { ButtonLink } from "@/components/ui";

const points = [
  { t: "Examiners who actually sit on panels", b: "Every examiner lists their institution, years on panels and what they mark hardest." },
  { t: "The exam room, not a video call", b: "Timed stations, one question at a time, the same pressure as the day itself." },
  { t: "A report you can act on tonight", b: "Four domain scores, the three things to fix, and what to book next." },
];

export default function Welcome() {
  return (
    <main className="rise flex min-h-[calc(100dvh-120px)] flex-col">
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="10" r="6" />
            <path d="M15.5 14.5L20 20M8 10h6" />
          </svg>
        </span>
        <span className="text-[18px] font-bold tracking-[-0.02em] text-strong">Clarilux</span>
      </div>

      <h1 className="mt-10 text-[34px] font-bold leading-[1.1] tracking-[-0.03em] text-strong">
        Sit the oral board
        <br />
        before it sits you.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed">
        Book a real examiner, take the mock under exam conditions, and leave with a marked report
        instead of a vague feeling about how it went.
      </p>

      <ul className="mt-8 space-y-3">
        {points.map((p) => (
          <li key={p.t} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-[14px] font-semibold text-strong">{p.t}</p>
            <p className="mt-1 text-[13px] leading-relaxed">{p.b}</p>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-2.5 pt-10">
        <ButtonLink href="/sign-up">Create an account</ButtonLink>
        <ButtonLink href="/sign-in" variant="secondary">
          I already have one
        </ButtonLink>
        <p className="pt-1 text-center text-[12px] text-muted">
          Concept build. Sample examiners, no real payments.
        </p>
      </div>
    </main>
  );
}
