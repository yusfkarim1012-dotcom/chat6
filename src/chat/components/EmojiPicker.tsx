import { useState } from "react";
import { motion } from "framer-motion";
import { EMOJI_CATEGORIES } from "../lib";
import { cn } from "../utils/cn";

export default function EmojiPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  const [active, setActive] = useState(EMOJI_CATEGORIES[0].id);
  const cat = EMOJI_CATEGORIES.find((c) => c.id === active)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.16 }}
      className="flex h-72 w-[20rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-slate-100 p-2 dark:border-slate-700">
        {EMOJI_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
              active === c.id
                ? "bg-brand-500 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="scrollbar-thin grid flex-1 grid-cols-8 content-start gap-0.5 overflow-y-auto p-2">
        {cat.emojis.map((e, i) => (
          <button
            key={`${e}-${i}`}
            onClick={() => onSelect(e)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-transform hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {e}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
