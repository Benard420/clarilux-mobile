"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "Home", d: "M3 10.5L12 3l9 7.5M5.5 9.5V20h13V9.5" },
  { href: "/discover", label: "Discover", d: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5" },
  { href: "/bookings", label: "Sessions", d: "M4 6.5h16M4 6.5V20h16V6.5M8 3v5M16 3v5M8 13h8" },
  { href: "/profile", label: "Profile", d: "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20c1.4-3.3 4.2-5 7.5-5s5.9 1.7 7.5 5" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-[480px]">
        {tabs.map((t) => {
          const active = path === t.href || path.startsWith(`${t.href}/`);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className="flex min-h-[56px] flex-col items-center justify-center gap-1 pt-1.5"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.1 : 1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-colors duration-200 ${active ? "text-brand" : "text-muted"}`}
                >
                  <path d={t.d} />
                </svg>
                <span
                  className={`text-[10.5px] font-semibold tracking-wide transition-colors duration-200 ${
                    active ? "text-brand" : "text-muted"
                  }`}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
