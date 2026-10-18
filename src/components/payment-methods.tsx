"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Empty, Field, Input } from "@/components/ui";
import type { PaymentMethod } from "@/lib/database.types";

const BRANDS = ["Visa", "Mastercard", "Amex", "Verve"];

export function PaymentMethods({ cards, profileId }: { cards: PaymentMethod[]; profileId: string }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [brand, setBrand] = useState("Visa");
  const [last4, setLast4] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!/^\d{4}$/.test(last4)) {
      setError("Enter the last four digits only.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await createClient().from("payment_methods").insert({
      profile_id: profileId,
      brand,
      last4,
      exp_month: Number(month) || null,
      exp_year: Number(year) || null,
      is_default: cards.length === 0,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    setAdding(false);
    setLast4("");
    setMonth("");
    setYear("");
    setBusy(false);
    router.refresh();
  }

  async function remove(id: string) {
    await createClient().from("payment_methods").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Card tone="tint">
        <p className="t-caption text-brand">
          Concept build. Nothing is charged and no card network is contacted. Enter only the last four
          digits of a card, never a full number.
        </p>
      </Card>

      {cards.length ? (
        <ul className="space-y-3">
          {cards.map((c) => (
            <Card key={c.id} as="li" className="flex items-center gap-3">
              <span className="t-badge grid h-8 w-[46px] place-items-center rounded-[6px] bg-brand-ink uppercase tracking-wider text-white">
                {c.brand.slice(0, 4)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="t-small-strong text-strong">
                  {c.brand} ending {c.last4}
                </p>
                <p className="t-caption text-muted">
                  {c.exp_month && c.exp_year
                    ? `Expires ${c.exp_month}/${String(c.exp_year).slice(-2)}`
                    : "No expiry set"}
                  {c.is_default ? " · Default" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(c.id)}
                className="t-meta-strong min-h-[40px] rounded-lg px-2 text-danger"
              >
                Remove
              </button>
            </Card>
          ))}
        </ul>
      ) : (
        <Empty title="No card on file" body="Add one so booking takes a single tap. Sample data only." />
      )}

      {adding ? (
        <Card as="section" className="rise space-y-4">
          <div className="space-y-2">
            <p className="t-meta-strong text-strong">Brand</p>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  aria-pressed={brand === b}
                  className={`t-meta-medium min-h-[36px] rounded-full border px-3.5 ${
                    brand === b ? "border-brand bg-brand text-on-brand" : "border-line text-body"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <Field label="Last four digits" htmlFor="last4" error={error ?? undefined}>
            <Input
              id="last4"
              inputMode="numeric"
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
              placeholder="4242"
            />
          </Field>

          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Month" htmlFor="m">
                <Input id="m" inputMode="numeric" maxLength={2} value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))} placeholder="08" />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Year" htmlFor="y">
                <Input id="y" inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} placeholder="2029" />
              </Field>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button tone="secondary" size="md" className="flex-1" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button size="md" className="flex-1" disabled={busy} onClick={() => void add()}>
              {busy ? "Saving" : "Save card"}
            </Button>
          </div>
        </Card>
      ) : (
        <Button tone="secondary" onClick={() => setAdding(true)}>
          Add a card
        </Button>
      )}
    </div>
  );
}
