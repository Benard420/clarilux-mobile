"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dashboard, Marketplace, More, OralBoard, QuestionBank } from "@/components/icons";

const tabs = [
  { href: "/dashboard", label: "Dashboard", Icon: Dashboard },
  { href: "/oral-board", label: "Oral Board", Icon: OralBoard },
  { href: "/marketplace", label: "Marketplace", Icon: Marketplace },
  { href: "/questions", label: "Questions", Icon: QuestionBank },
  { href: "/more", label: "More", Icon: More },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[480px]">
        {tabs.map(({ href, label, Icon }) => {
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-[58px] flex-col items-center justify-center gap-1 pt-2"
              >
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${active ? "text-brand" : "text-muted"}`}
                />
                <span
                  className={`t-tab transition-colors duration-200 ${active ? "font-semibold text-brand" : "text-muted"}`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mx-auto mb-1.5 h-[5px] w-[134px] rounded-full bg-strong/80" aria-hidden />
    </nav>
  );
}
