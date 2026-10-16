import { SITE } from "@/config/site";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block overflow-hidden rounded-[22%] ${className}`}
      style={{ background: "#191713" }}
    >
      <svg viewBox="0 0 64 64" fill="none" className="block h-full w-full">
        <path
          d="M23 24 A9 9 0 0 1 41 24"
          stroke="#fbf9f5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M14 24 H50 L45 50 H19 Z"
          fill="#fbf9f5"
          stroke="#fbf9f5"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <g
          stroke="#191713"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M16 33 H48 M17 42 H47 M27 23 V51 M37 23 V51" />
        </g>
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">
        {SITE.name}
      </span>
    </span>
  );
}
