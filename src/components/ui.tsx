"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { ChevronRight, Star as StarIcon } from "@/components/icons";

/* ---------------- buttons ---------------- */

const base =
  "inline-flex items-center justify-center gap-2 rounded-[12px] transition-[transform,background-color,opacity] duration-200 ease-out active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const tones = {
  primary: "bg-brand text-on-brand",
  secondary: "bg-surface text-strong border border-line",
  quiet: "bg-sunken text-strong",
  danger: "bg-danger-surface text-danger border border-danger/30",
  onBrand: "bg-surface text-brand",
} as const;

const sizes = {
  lg: "min-h-[52px] px-5 w-full t-button",
  md: "min-h-[44px] px-4 t-small-strong",
  sm: "min-h-[36px] px-3.5 t-meta-strong",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { tone = "primary", size = "lg", className = "", ...rest },
  ref,
) {
  return <button ref={ref} className={`${base} ${tones[tone]} ${sizes[size]} ${className}`} {...rest} />;
});

export function ButtonLink({
  href,
  children,
  tone = "primary",
  size = "lg",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${tones[tone]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}

/* ---------------- surfaces ---------------- */

export function Card({
  children,
  className = "",
  as = "div",
  tone = "default",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
  tone?: "default" | "tint" | "brand";
  padded?: boolean;
}) {
  const Tag = as;
  const skin =
    tone === "brand"
      ? "bg-brand border-brand"
      : tone === "tint"
        ? "bg-tint border-line"
        : "bg-surface border-line";
  return (
    <Tag className={`rounded-[12px] border ${skin} ${padded ? "p-4" : ""} ${className}`}>{children}</Tag>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-line-subtle" />;
}

export function SectionHead({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="t-title-s text-strong">{title}</h2>
      {href ? (
        <Link href={href} className="t-meta-strong text-brand">
          {cta ?? "See all"}
        </Link>
      ) : null}
    </div>
  );
}

/* ---------------- form ---------------- */

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block t-meta-strong text-strong">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="t-caption font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="t-caption text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`t-body min-h-[48px] w-full rounded-[10px] border border-line bg-surface px-3.5 text-strong placeholder:text-muted focus:border-brand focus:outline-none ${className}`}
        {...rest}
      />
    );
  },
);

export function Textarea({
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`t-body w-full rounded-[12px] border border-line bg-surface p-3.5 text-strong placeholder:text-muted focus:border-brand focus:outline-none ${className}`}
      {...rest}
    />
  );
}

/* ---------------- small parts ---------------- */

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const letters = name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(140deg, hsl(${hue} 48% 40%), hsl(${(hue + 40) % 360} 55% 27%))`,
      }}
    >
      {letters}
    </span>
  );
}

export function Stars({ rating, count }: { rating: number | null; count?: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 t-meta-strong text-strong">
      <StarIcon size={13} className="text-amber" />
      {rating?.toFixed(1) ?? "New"}
      {count ? <span className="t-meta text-muted">({count})</span> : null}
    </span>
  );
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`t-meta-medium min-h-[36px] shrink-0 rounded-full border px-3.5 transition-colors duration-200 ${
        active ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-body"
      }`}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "onBrand";
}) {
  const skins = {
    neutral: "bg-sunken text-body",
    brand: "bg-tint text-brand",
    success: "bg-success-surface text-success",
    warning: "bg-warning-surface text-warning",
    danger: "bg-danger-surface text-danger",
    onBrand: "bg-brand-pressed text-on-brand",
  } as const;
  return (
    <span className={`t-caption-medium inline-flex items-center rounded-full px-2.5 py-1.5 ${skins[tone]}`}>
      {children}
    </span>
  );
}

export function Meter({ value, label }: { value: number; label?: string }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex justify-between t-caption-medium">
          <span className="text-body">{label}</span>
          <span className="text-strong">{v}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 overflow-hidden rounded-full bg-sunken"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

export function Stats({ cells }: { cells: [string, string][] }) {
  return (
    <div className="grid grid-cols-3 text-center">
      {cells.map(([value, label]) => (
        <div key={label} className="px-1">
          <p className="t-price-s text-strong">{value}</p>
          <p className="t-caption mt-0.5 text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

export function NavRow({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <Link href={href} className="flex min-h-[64px] items-center gap-3 px-4 py-3.5 active:bg-selected">
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-tint text-brand">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block t-small-strong text-strong">{title}</span>
        {sub ? <span className="block t-caption text-muted">{sub}</span> : null}
      </span>
      <ChevronRight size={20} className="shrink-0 text-muted" />
    </Link>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rise flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-line px-6 py-12 text-center">
      <h3 className="t-title-s text-strong">{title}</h3>
      <p className="t-meta max-w-[42ch] text-body">{body}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-[12px] ${className}`} />;
}

export function Segmented({
  items,
  active,
}: {
  items: { href: string; label: string }[];
  active: string;
}) {
  return (
    <div className="flex gap-1 rounded-full border border-line bg-sunken p-1">
      {items.map((i) => {
        const on = i.href === active;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={`t-small-strong flex min-h-[38px] flex-1 items-center justify-center rounded-full px-2 transition-colors duration-200 ${
              on ? "bg-surface text-brand shadow-sm" : "text-secondary"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </div>
  );
}
