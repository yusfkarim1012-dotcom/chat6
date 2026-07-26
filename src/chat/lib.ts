import type { Role } from "./types";

/* ---------- Avatar gradients ---------- */
const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-lime-500 to-emerald-600",
  "from-red-500 to-rose-600",
  "from-fuchsia-500 to-purple-600",
];

export function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] || "") + (parts[1][0] || "");
}

/* ---------- Time / date ---------- */
const AR_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toAr(input: string | number): string {
  return String(input).replace(/\d/g, (d) => AR_DIGITS[+d]);
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "ص" : "م";
  h = h % 12;
  if (h === 0) h = 12;
  return `${toAr(h)}:${toAr(m)} ${ampm}`;
}

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayLabel(ts: number): string {
  const today = startOfDay(Date.now());
  const day = startOfDay(ts);
  const diff = Math.round((today - day) / 86400000);
  if (diff <= 0) return "اليوم";
  if (diff === 1) return "أمس";
  const d = new Date(ts);
  if (diff < 7) return AR_DAYS[d.getDay()];
  return `${toAr(d.getDate())}/${toAr(d.getMonth() + 1)}/${toAr(d.getFullYear())}`;
}

export function lastSeenLabel(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "الآن";
  if (min < 60) return `قبل ${toAr(min)} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `قبل ${toAr(hr)} ساعة`;
  return dayLabel(ts);
}

/* ---------- Role labels ---------- */
export const ROLE_LABEL: Record<Role, string> = {
  owner: "المالك",
  admin: "مشرف",
  member: "عضو",
};

/* ---------- Emoji data ---------- */
export const QUICK_REACTIONS: string[] = ["❤️", "👍", "🔥", "👏", "😮", "🎉"];

export const ALL_REACTIONS = [
  "❤️",
  "👍",
  "🔥",
  "👏",
  "😮",
  "😢",
  "🎉",
] as const;

export interface EmojiCategory {
  id: string;
  name: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "smileys",
    name: "وجوه",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩",
      "😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤗","🤭","🤔","🤫","🤥","😐","😑",
      "😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","🥱","😴","😌","😎","🤓","🧐",
    ],
  },
  {
    id: "gestures",
    name: "أيدٍ",
    emojis: [
      "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️",
      "👋","🤝","🙏","💪","👏","🙌","👐","🤲","✍️","💅","🤳","👀","👁️","👄","💋","💘",
    ],
  },
  {
    id: "hearts",
    name: "قلوب",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖",
      "💘","💝","💟","❌","⭕","💯","💢","💥","💫","💦","💨","🕳️","💣","💬","🗨️","🗯️",
    ],
  },
  {
    id: "animals",
    name: "حيوانات",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🦄",
      "🐝","🦋","🐢","🐙","🦈","🐬","🐳","🐦","🦅","🦉","🐺","🐗","🐴","🦓","🐘","🦒",
    ],
  },
  {
    id: "food",
    name: "طعام",
    emojis: [
      "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝",
      "🍅","🥑","🍆","🥕","🌽","🌶️","🥦","🍔","🍟","🍕","🌮","🌯","🍣","🍜","🍩","🎂",
      "🍪","☕","🍵","🍺","🍷","🥂","🎉","🎊","🎁","🎈","🎵","🎶",
    ],
  },
  {
    id: "objects",
    name: "أشياء",
    emojis: [
      "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🎯","🎮","🎲","🎰","🚗","🚕","✈️","🚀",
      "⭐","🌟","✨","⚡","🔥","🌈","☀️","⛅","☁️","🌧️","❄️","🌙","📗","📘","📙","📚",
      "✏️","📌","📍","📎","🔒","🔑","💡","🔔","📅","⏰","📞","📷","💻","🏠","🌍","💎",
    ],
  },
];

/* ---------- Preset avatar colours for login ---------- */
export const PRESET_COLORS = [
  "#7c4dff",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
];

/* ---------- Auto-resize helper ---------- */
export function autoResize(el: HTMLTextAreaElement, maxRows = 5) {
  el.style.height = "auto";
  const lineHeight = 24;
  el.style.height = Math.min(el.scrollHeight, lineHeight * maxRows) + "px";
}
