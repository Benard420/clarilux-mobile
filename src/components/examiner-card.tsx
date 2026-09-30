import Link from "next/link";
import { Avatar, Badge, Stars } from "@/components/ui";
import { money } from "@/lib/format";
import type { Examiner } from "@/lib/database.types";

export function ExaminerCard({ e, topics }: { e: Examiner; topics?: string[] }) {
  return (
    <Link
      href={`/examiner/${e.id}`}
      className="block rounded-2xl border border-line bg-surface p-4 transition-transform duration-200 active:scale-[0.985]"
    >
      <div className="flex gap-3.5">
        <Avatar name={e.full_name} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[15px] font-semibold text-strong">{e.full_name}</p>
            {e.verified ? <Badge tone="brand">Verified</Badge> : null}
          </div>
          <p className="mt-0.5 truncate text-[12.5px] text-muted">{e.institution}</p>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug">{e.headline}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Stars rating={e.rating} count={e.review_count} />
            <span className="text-[12.5px] font-semibold text-strong">
              from {money(e.from_price_cents, e.currency)}
            </span>
            {e.availability_label ? (
              <span className="text-[12px] font-medium text-success">{e.availability_label}</span>
            ) : null}
          </div>
        </div>
      </div>
      {topics?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-divider pt-3">
          {topics.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-sunken px-2.5 py-1 text-[11.5px] font-medium text-body">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export function ExaminerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex gap-3.5">
        <div className="skeleton size-[52px] rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
