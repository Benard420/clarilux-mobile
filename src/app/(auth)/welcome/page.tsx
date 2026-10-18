import { ButtonLink, Card } from "@/components/ui";
import { Wordmark } from "@/components/brand-mark";

const points = [
  ["Examiners who sit on real panels", "Institution, years on panels, and what they mark hardest."],
  ["The exam room, not a video call", "Timed stations, one question at a time."],
  ["A report you can act on tonight", "Four domain scores and the three things to fix."],
];

export default function Welcome() {
  return (
    <main className="rise flex min-h-[calc(100dvh-56px)] flex-col">
      <Wordmark />

      <h1 className="t-display mt-8 text-strong">Sit the oral board before it sits you.</h1>
      <p className="t-body mt-2.5 text-body">
        Book a real examiner, take the mock under exam conditions, and leave with a marked report
        instead of a vague feeling about how it went.
      </p>

      <ul className="mt-6 space-y-2.5">
        {points.map(([title, body]) => (
          <Card key={title} as="li" className="space-y-1">
            <p className="t-small-strong text-strong">{title}</p>
            <p className="t-meta text-body">{body}</p>
          </Card>
        ))}
      </ul>

      <div className="mt-auto space-y-2.5 pt-10">
        <ButtonLink href="/sign-up">Create an account</ButtonLink>
        <ButtonLink href="/sign-in" tone="secondary">
          I already have one
        </ButtonLink>
        <p className="t-caption pt-1 text-center text-muted">
          Concept build. Sample examiners, no real payments.
        </p>
      </div>
    </main>
  );
}
