import type React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Users,
  Pin,
  Settings,
  LogOut,
  Moon,
  Sun,
  MoreVertical,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useStore } from "../store";
import { IconButton, Badge, OnlineDot } from "../ui";
import { cn } from "../utils/cn";

export default function Header() {
  const { users, groupName, groupLogo, isAdmin, theme, toggleTheme, setPanel, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const onlineCount = users.filter((u) => u.online && u.id !== "me").length;
  const total = users.length;

  return (
    <header className="relative z-20 flex items-center gap-2 border-b border-slate-200/80 bg-white/80 px-3 py-2.5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <button
        onClick={() => setPanel("members")}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-start transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <div className="relative h-11 w-11 shrink-0">
          {groupLogo ? (
            <img src={groupLogo} alt={groupName} className="h-full w-full rounded-full object-cover shadow-md ring-2 ring-white dark:ring-slate-900" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-fuchsia-500 text-white shadow-md shadow-brand-500/30">
              <Users className="h-5 w-5" />
            </div>
          )}
          <span className="absolute -bottom-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900">
            <OnlineDot className="h-2 w-2" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="group-title truncate text-[15px]">{groupName}</h2>
            <Badge tone="brand" className="hidden sm:inline-flex">مجتمع</Badge>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {onlineCount > 0 ? `${onlineCount} متصل · ${total} عضو` : `${total} عضو`}
          </p>
        </div>
        <ChevronDown className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
      </button>

      <div className="flex items-center gap-0.5">
        <IconButton onClick={() => setPanel("search")} title="بحث">
          <Search className="h-5 w-5" />
        </IconButton>
        <IconButton onClick={() => setPanel("pinned")} title="الرسائل المثبتة" className="hidden sm:inline-flex">
          <Pin className="h-5 w-5" />
        </IconButton>
        <IconButton onClick={() => setPanel("members")} title="الأعضاء" className="hidden sm:inline-flex">
          <Users className="h-5 w-5" />
        </IconButton>
        <IconButton onClick={toggleTheme} title="المظهر">
          <AnimatePresence mode="wait" initial={false}>
            {theme === "dark" ? (
              <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </IconButton>

        <div className="relative">
          <IconButton onClick={() => setMenuOpen((v) => !v)} active={menuOpen} title="المزيد">
            <MoreVertical className="h-5 w-5" />
          </IconButton>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute end-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
                >
                  <MenuItem icon={<Pin className="h-4 w-4" />} label="الرسائل المثبتة" onClick={() => { setMenuOpen(false); setPanel("pinned"); }} />
                  <MenuItem icon={<ShieldCheck className="h-4 w-4" />} label={isAdmin ? "لوحة الإدارة" : "دخول الإدارة"} onClick={() => { setMenuOpen(false); setPanel("admin"); }} />
                  <MenuItem icon={<Settings className="h-4 w-4" />} label="الإعدادات" onClick={() => { setMenuOpen(false); setPanel("settings"); }} />
                  <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                  <MenuItem icon={<LogOut className="h-4 w-4" />} label="تسجيل الخروج" danger onClick={() => { setMenuOpen(false); logout(); }} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
        danger
          ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
      )}
    >
      <span className={danger ? "text-rose-500" : "text-slate-400"}>{icon}</span>
      {label}
    </button>
  );
}
