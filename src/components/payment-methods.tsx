"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Empty, Field, Input } from "@/components/ui";
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
    const supabase = createClient();
    const { error: err } = await supabase.from("payment_methods").insert({
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
    <div>
      <p className="rounded-xl border border-line bg-tint px-3.5 py-2.5 text-[12px] leading-relaxed text-brand">
        Concept build. Nothing is charged and no card network is contacted. Enter only the last four
        digits of a card, never a full number.
      </p>

      {cards.length ? (
        <ul className="mt-4 space-y-2.5">
          {cards.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="grid h-9 w-13 place-items-center rounded-md bg-brand-ink px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-white">
                {c.brand.slice(0, 4)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-strong">
                  {c.brand} ending {c.last4}
                </p>
                <p className="text-[12px] text-muted">
                  {c.exp_month && c.exp_year ? `Expires ${c.exp_month}/${String(c.exp_year).slice(-2)}` : "No expiry set"}
                  {c.is_default ? " · Default" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(c.id)}
                className="min-h-[40px] rounded-lg px-3 text-[12.5px] font-semibold text-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <Empty title="No card on file" body="Add one so booking takes a single tap. Sample data only." />
        </div>
      )}

      {adding ? (
        <form
          className="rise mt-4 space-y-4 rounded-2xl border border-line bg-surface p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-strong">Brand</p>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  aria-pressed={brand === b}
                  className={`min-h-[36px] rounded-full border px-3.5 text-[13px] font-medium ${
                    brand === b ? "border-brand bg-brand text-white" : "border-line text-body"
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
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="md" className="flex-1" disabled={busy}>
              {busy ? "Saving" : "Save card"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => setAdding(true)}>
            Add a card
          </Button>
        </div>
      )}
    </div>
  );
}
