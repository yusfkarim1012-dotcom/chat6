import type React from "react";
import { cn } from "./utils/cn";
import type { User } from "./types";
import { gradientFor, initials } from "./lib";

/* ---------- Avatar ---------- */
export function Avatar({
  user,
  size = 40,
  online,
  ring,
  className,
}: {
  user: Pick<User, "name" | "avatarUrl" | "color">;
  size?: number;
  online?: boolean;
  ring?: boolean;
  className?: string;
}) {
  const grad = user.color
    ? undefined
    : `bg-gradient-to-br ${gradientFor(user.name)}`;
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className={cn(
            "h-full w-full rounded-full object-cover",
            ring && "ring-2 ring-white dark:ring-slate-900"
          )}
        />
      ) : (
        <span
          style={user.color ? { background: user.color } : undefined}
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full font-bold text-white",
            !user.color && grad,
            ring && "ring-2 ring-white dark:ring-slate-900"
          )}
        >
          <span style={{ fontSize: size * 0.4 }}>{initials(user.name)}</span>
        </span>
      )}
      {online && (
        <span
          className="absolute -bottom-0 -end-0 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </span>
  );
}

/* ---------- IconButton ---------- */
export function IconButton({
  children,
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all",
        "hover:bg-slate-200/70 hover:text-slate-900 active:scale-90",
        "dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-white",
        "disabled:pointer-events-none disabled:opacity-40",
        active &&
          "bg-brand-500/15 text-brand-600 hover:bg-brand-500/20 hover:text-brand-600 dark:text-brand-300",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  tone = "brand",
  className,
}: {
  children: React.ReactNode;
  tone?: "brand" | "emerald" | "amber" | "rose" | "slate";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand:
      "bg-brand-500/15 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300",
    emerald:
      "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    amber:
      "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    rose: "bg-rose-500/15 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    slate:
      "bg-slate-500/15 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Segmented tabs ---------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800",
        className
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors",
            value === o.value
              ? "text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          {value === o.value && (
            <span className="absolute inset-0 -z-0 rounded-lg bg-brand-500 shadow-sm shadow-brand-500/30" />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Online pulse dot ---------- */
export function OnlineDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  );
}
