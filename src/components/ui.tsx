"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[transform,background-color,opacity] duration-200 ease-out active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const variants = {
  primary: "bg-brand text-white",
  secondary: "bg-surface text-strong border border-line",
  ghost: "text-brand",
  danger: "bg-danger-bg text-danger border border-danger/25",
} as const;

const sizes = {
  lg: "min-h-[52px] px-5 text-[15px] w-full",
  md: "min-h-[44px] px-4 text-[14px]",
  sm: "min-h-[36px] px-3 text-[13px]",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "lg", className = "", ...rest },
  ref,
) {
  return <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />;
});

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "lg",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Tag = as;
  return (
    <Tag className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>{children}</Tag>
  );
}

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
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-strong">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[12px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`min-h-[48px] w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-strong placeholder:text-muted focus:border-brand focus:outline-none ${className}`}
        {...rest}
      />
    );
  },
);

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
        background: `linear-gradient(140deg, hsl(${hue} 55% 38%), hsl(${(hue + 40) % 360} 60% 26%))`,
      }}
    >
      {letters}
    </span>
  );
}

export function Stars({ rating, count }: { rating: number | null; count?: number | null }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-strong">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber">
        <path d="M12 2.5l2.9 6.05 6.6.83-4.85 4.5 1.25 6.57L12 17.3l-5.9 3.15L7.35 13.9 2.5 9.38l6.6-.83L12 2.5z" />
      </svg>
      {rating?.toFixed(1) ?? "New"}
      {count ? <span className="font-normal text-muted">({count})</span> : null}
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
      className={`min-h-[36px] shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-200 ${
        active ? "border-brand bg-brand text-white" : "border-line bg-surface text-body"
      }`}
    >
      {children}
    </button>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warn" | "brand"; children: ReactNode }) {
  const tones = {
    neutral: "bg-sunken text-body",
    success: "bg-success-bg text-success",
    warn: "bg-amber/12 text-amber",
    brand: "bg-tint text-brand",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rise flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-tint text-brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </span>
      <h3 className="text-[16px] font-semibold text-strong">{title}</h3>
      <p className="max-w-[46ch] text-[13px] leading-relaxed">{body}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function SectionHead({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-strong">{title}</h2>
      {href ? (
        <Link href={href} className="text-[13px] font-semibold text-brand">
          {cta ?? "See all"}
        </Link>
      ) : null}
    </div>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex justify-between text-[12px] font-medium">
          <span className="text-body">{label}</span>
          <span className="text-strong">{value}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-sunken"
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
