import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FEATURES } from "../config";
import type { Issue } from "../faceAnalysis/quality";
import { useI18n } from "./i18n";

export function Header({ onHome }: { onHome: () => void }) {
  const { t, toggle } = useI18n();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <button onClick={onHome} className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          {t.siteName}
        </button>
        <button onClick={toggle} className="rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          {t.langToggle}
        </button>
      </div>
    </header>
  );
}

export function PrivacyBadge() {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span>{t.privacyBadge}</span>
    </div>
  );
}

export function Disclaimer() {
  const { t } = useI18n();
  return <p className="text-xs leading-relaxed text-slate-500">{t.disclaimer}</p>;
}

/**
 * Reserved ad placement. Intentionally empty until an ad network is integrated;
 * render the network's tag inside this component, keyed by `slot`.
 */
export function AdSlot({ slot }: { slot: "top-banner" | "below-result" }) {
  if (!FEATURES.showAdSlots) return null;
  return <div data-ad-slot={slot} className="ad-slot" aria-hidden />;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 disabled:bg-slate-400",
    secondary: "border border-brand-700 bg-white text-brand-800 hover:bg-brand-50 disabled:opacity-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  }[variant];
  return <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${styles} ${className}`} />;
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center" role="status">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
      <p className="font-semibold text-slate-700">{label}</p>
    </div>
  );
}

export function IssueList({ issues }: { issues: Issue[] }) {
  const { t } = useI18n();
  if (!issues.length) return null;
  return (
    <ul className="space-y-1.5">
      {issues.map((i) => (
        <li key={i.code} className={`rounded-lg px-3 py-2 text-sm font-semibold ${i.blocking ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
          ⚠️ {t.issues[i.code]}
        </li>
      ))}
    </ul>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}
