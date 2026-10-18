# Clarilux mobile

A mobile web app for booking oral board practice with real examiners, sitting the mock exam under
exam conditions, and getting a marked report the same evening.

> **Concept project.** Clarilux is an independent design and engineering exercise by Sandra Benard.
> It is **not affiliated with, endorsed by, or connected to RioEigen**. Every examiner, session,
> report and payment in this build is sample data. No money moves and no examiner is contacted.

---

## What it does

**Book**
- Browse verified examiners, filter by topic, sort by rating, price or years on panels
- Examiner profile with session types, open slots, and candidate reviews
- Four step booking: session type, time, focus topics and a note, then confirm
- Slots are held transactionally, so two candidates cannot take the same time

**Sit the exam**
- Lobby with a connection and microphone check, including a live input meter
- One station at a time, timed, no looking ahead and no going back
- Walk out confirmation, because leaving mid session is a real decision
- Answers saved per station as you go

**Learn from it**
- Session scored the moment you finish
- Overall score, verdict, and four domain scores: reasoning, knowledge, communication, safety
- What worked, three things to fix, examiner notes, and what to book next
- Station by station replay with the time you used against the time allowed

**Everything else**
- Email and password auth, onboarding that sets specialty, target board, exam date and weekly goal
- Sessions list with history, cancellations with refund, saved examiners, payment methods
- Notifications for reminders and released reports
- Light and dark, system aware, with a manual override
- Installable PWA with an offline shell

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4, design tokens as CSS variables |
| Backend | Supabase: Postgres, Auth, row level security |
| Hosting | Vercel |
| Offline | Web app manifest and a service worker cache |

No component library. Every element in `src/components/ui.tsx` is built from the same token set as
the Figma file, so the design system and the code share one vocabulary.

---

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project values
npm run dev
```

Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
```

Both are public client keys and safe to ship to the browser. The service role key is never used by
this app and must never be added here.

### Demo account

The seeded database ships with a candidate who already has a completed session, a released report
and one booking coming up:

```
demo@clarilux.app / clarilux-demo
```

It exists so the app can be reviewed without waiting on an email confirmation. Delete it before
using this schema for anything real.

---

## Database

Nine tables plus a question bank, all behind row level security. A candidate can only ever read and
write their own rows; the examiner catalogue and reviews are public.

```
profiles             created by a trigger on auth.users
topics               examiners            examiner_topics
session_types        availability_slots
bookings             exam_sessions        exam_questions
session_reports      reviews
payment_methods      notifications        saved_examiners
question_bank
```

Four functions carry the parts that must be atomic or must not be trusted to the client:

| Function | What it does |
|---|---|
| `create_booking` | Locks the slot, writes the booking, opens the exam session, sends the notification |
| `cancel_booking` | Cancels, refunds, and releases the slot back to the examiner |
| `start_exam_session` | Moves the session live and stocks it with stations from the question bank |
| `finish_exam_session` | Scores every station, writes the report, updates readiness and streak |

Scoring lives in the database rather than the client so a candidate cannot mark their own paper.

---

## Structure

```
src/
  app/
    (auth)/      welcome, sign in, sign up, confirm email, onboarding
    (app)/       home, discover, examiner, bookings, booking, profile, notifications
    book/        the four step booking flow
    room/        lobby, live stations, report
    auth/        the email confirmation callback
  components/    ui primitives, tab bar, exam runner, booking flow
  lib/           supabase clients, formatting, types
  proxy.ts       session refresh and route protection
```

---

## Accessibility and mobile

- Every interactive target is at least 44 by 44
- Focus rings kept, never removed
- Errors sit next to the field they belong to and announce with `role="alert"`
- Timers, progress bars and toggles carry the right roles and values
- `prefers-reduced-motion` turns the motion off
- Safe area insets respected at the top and bottom
- Body text never below 13px, inputs at 15px so iOS does not zoom on focus

---

## Credits

Design and build by Sandra Benard. Concept work, not a commercial product.
