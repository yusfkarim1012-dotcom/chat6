import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useStore } from "../store";
import { cn } from "../utils/cn";

function Toast({ id, type, text }: { id: string; type: "success" | "error" | "info"; text: string }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(id), 3000);
    return () => clearTimeout(t);
  }, [id, dismiss]);

  const cfg = {
    success: { icon: <CheckCircle2 className="h-5 w-5" />, cls: "text-emerald-500" },
    error: { icon: <XCircle className="h-5 w-5" />, cls: "text-rose-500" },
    info: { icon: <Info className="h-5 w-5" />, cls: "text-sky-500" },
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      <span className={cn("shrink-0", cfg.cls)}>{cfg.icon}</span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{text}</span>
    </motion.div>
  );
}

export default function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
