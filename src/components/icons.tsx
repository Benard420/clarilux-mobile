import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Dashboard = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </Svg>
);

export const OralBoard = (p: P) => (
  <Svg {...p}>
    <path d="M4 10v4M8 6.5v11M12 3.5v17M16 6.5v11M20 10v4" />
  </Svg>
);

export const Marketplace = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 8h15l-1 12.5h-13L4.5 8z" />
    <path d="M9 8V6.5a3 3 0 016 0V8" />
  </Svg>
);

export const QuestionBank = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="3.5" width="14" height="17" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Svg>
);

export const More = (p: P) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M6 12h.01M12 12h.01M18 12h.01" />
  </Svg>
);

export const Bell = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 10a5.5 5.5 0 0111 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10z" />
    <path d="M10 19a2 2 0 004 0" />
  </Svg>
);

export const Search = (p: P) => (
  <Svg {...p} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </Svg>
);

export const Funnel = (p: P) => (
  <Svg {...p}>
    <path d="M4 5h16l-6.2 7.4V19l-3.6-2v-4.6L4 5z" />
  </Svg>
);

export const ChevronLeft = (p: P) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const ChevronRight = (p: P) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const ChevronDown = (p: P) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M5 9l7 7 7-7" />
  </Svg>
);

export const Clock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const Check = (p: P) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Svg>
);

export const CheckCircle = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.2l2.4 2.4 4.6-5" strokeWidth={2} />
  </Svg>
);

export const Verified = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.2l2.2 1.7 2.8-.2.9 2.6 2.4 1.5-.8 2.7.8 2.7-2.4 1.5-.9 2.6-2.8-.2L12 21.8l-2.2-1.7-2.8.2-.9-2.6-2.4-1.5.8-2.7-.8-2.7 2.4-1.5.9-2.6 2.8.2L12 2.2z" />
    <path d="M8.6 12.1l2.3 2.3 4.5-4.8" stroke="var(--surface)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Star = (p: P) => (
  <svg width={p.size ?? 14} height={p.size ?? 14} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.5l2.9 6.05 6.6.83-4.85 4.5 1.25 6.57L12 17.3l-5.9 3.15L7.35 13.9 2.5 9.38l6.6-.83L12 2.5z" />
  </svg>
);

export const Calendar = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
  </Svg>
);

export const Video = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="6.5" width="12.5" height="11" rx="2" />
    <path d="M15.5 11l5.5-3v8l-5.5-3v-2z" />
  </Svg>
);

export const Card = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
    <path d="M3 10h18M7 14.5h3" />
  </Svg>
);

export const Bookmark = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 4h11v16.5L12 16.6l-5.5 3.9V4z" />
  </Svg>
);

export const User = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.8 20c1.4-3.3 4-5 7.2-5s5.8 1.7 7.2 5" />
  </Svg>
);

export const Sun = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Svg>
);

export const Moon = (p: P) => (
  <Svg {...p}>
    <path d="M20 14.2A8.2 8.2 0 019.8 4 8.5 8.5 0 1020 14.2z" />
  </Svg>
);

export const Close = (p: P) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const Info = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8v.4" strokeWidth={2} />
  </Svg>
);

export const Institution = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 9.5L12 5l8.5 4.5M5.5 10.5v8M18.5 10.5v8M9.5 10.5v8M14.5 10.5v8M3.5 19.5h17" />
  </Svg>
);

export const Message = (p: P) => (
  <Svg {...p}>
    <path d="M20.5 12.5c0 3.9-3.8 7-8.5 7-1.1 0-2.2-.2-3.1-.5L4 20.5l1.6-4A6.6 6.6 0 013.5 12c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7z" />
  </Svg>
);

export const ShieldCheck = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l7 2.6v5.6c0 4.3-2.9 7.8-7 9.3-4.1-1.5-7-5-7-9.3V5.6L12 3z" />
    <path d="M9 12.2l2.2 2.2 4-4.4" strokeWidth={2} />
  </Svg>
);

export const Mic = (p: P) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3" />
  </Svg>
);

export const Wifi = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 9.5a14 14 0 0119 0M6 13a9 9 0 0112 0M9.5 16.5a4 4 0 015 0M12 20h.01" strokeWidth={2} />
  </Svg>
);

export const Trash = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13" />
  </Svg>
);
