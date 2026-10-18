import Link from "next/link";
import { Verified } from "@/components/icons";
import { Avatar, Stars } from "@/components/ui";
import { money } from "@/lib/format";
import type { Examiner } from "@/lib/database.types";

export function ExaminerCard({ e, topics }: { e: Examiner; topics?: string[] }) {
  const soon = e.availability_label?.toLowerCase().includes("today");
  return (
    <Link
      href={`/examiner/${e.id}`}
      className="block rounded-[12px] border border-line bg-surface p-4 transition-transform duration-200 active:scale-[0.99]"
    >
      <div className="flex gap-3">
        <Avatar name={e.full_name} size={52} src={e.avatar_url} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="truncate t-title-s text-strong">{e.full_name}</span>
                {e.verified ? <Verified size={15} className="shrink-0 text-brand" /> : null}
              </span>
              <span className="mt-0.5 block truncate t-caption text-muted">{e.institution}</span>
              <span className="mt-1 block truncate t-small text-body">{e.headline}</span>
              <span className="mt-1 block">
                <Stars rating={e.rating} count={e.review_count} />
              </span>
            </span>
            <span className="shrink-0 whitespace-nowrap text-right">
              <span className="block t-caption text-muted">From</span>
              <span className="t-price-m text-strong">{money(e.from_price_cents, e.currency)}</span>
              <span className="t-caption text-muted">/hr</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-line-subtle pt-3">
        {topics?.length ? (
          <span className="t-caption max-w-[45%] truncate rounded-full bg-sunken px-2.5 py-1.5 text-body">
            {topics[0]}
          </span>
        ) : null}
        {topics && topics.length > 1 ? (
          <span className="t-caption shrink-0 rounded-full bg-sunken px-2.5 py-1.5 text-muted">
            +{topics.length - 1}
          </span>
        ) : null}
        {e.availability_label ? (
          <span
            className={`t-caption-medium ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap ${
              soon ? "text-success" : "text-muted"
            }`}
          >
            <span className={`size-1.5 rounded-full ${soon ? "bg-success" : "bg-muted"}`} />
            {e.availability_label}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
