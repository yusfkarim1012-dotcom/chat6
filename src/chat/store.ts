import { create } from "zustand";
import type {
  EditingState,
  Message,
  PanelType,
  Reaction,
  ToastItem,
  User,
} from "./types";
import { gradientFor } from "./lib";

let NEXT_ID = 5000;
const newId = () => ++NEXT_ID;

const now = Date.now();

/* ---------- Seed users ---------- */
const SEED_USERS: User[] = [
  { id: "u_ahmad", name: "أحمد", role: "owner", online: true, bio: "مؤسس المجتمع" },
  { id: "u_sara", name: "سارة", role: "admin", online: true, bio: "مشرفة" },
  { id: "u_khalid", name: "خالد", role: "member", online: true },
  { id: "u_nora", name: "نورة", role: "member", online: true },
  { id: "u_omar", name: "عمر", role: "member", online: false, lastSeen: now - 1000 * 60 * 24 },
  { id: "u_layla", name: "ليلى", role: "member", online: false, lastSeen: now - 1000 * 60 * 180 },
  { id: "u_youssef", name: "يوسف", role: "member", online: true },
];

function mk(
  partial: Omit<Message, "id" | "reactions"> & { reactions?: Message["reactions"] }
): Message {
  return {
    id: newId(),
    reactions: partial.reactions ?? {},
    status: "seen",
    ...partial,
  };
}

const SEED_MESSAGES: Message[] = [
  mk({ userId: "u_ahmad", type: "text", text: "السلام عليكم ورحمة الله 👋 أهلاً بكم في مجتمع لا أبرح", createdAt: now - 1000 * 60 * 90 }),
  mk({ userId: "u_sara", type: "text", text: "وعليكم السلام، شكراً لدعوتنا إلى المجتمع 🙏", createdAt: now - 1000 * 60 * 88 }),
  mk({
    userId: "u_khalid",
    type: "text",
    text: "واو! التصميم رائع جداً 🤩 سعيد جداً بانضمامي.",
    createdAt: now - 1000 * 60 * 70,
    pinned: true,
    reactions: { "❤️": ["u_sara", "u_nora"], "🔥": ["u_omar", "u_youssef"] },
  }),
  mk({ userId: "u_nora", type: "text", text: "نعم، فعلاً منظم وجميل", createdAt: now - 1000 * 60 * 68, replyToId: 0 }),
  mk({ userId: "u_omar", type: "text", text: "هل يمكنني إرسال رسائل صوتية؟ 🎙️", createdAt: now - 1000 * 60 * 40 }),
  mk({ userId: "u_ahmad", type: "text", text: "بالتأكيد! اضغط على زر الميكروفون للتسجيل، ويمكنك أيضاً الرد والتفاعل على الرسائل 🙂", createdAt: now - 1000 * 60 * 38 }),
  mk({ userId: "u_youssef", type: "text", text: "أي سؤال أنتم في الخدمة جميعاً 💜", createdAt: now - 1000 * 60 * 12 }),
];
SEED_MESSAGES[3].replyToId = SEED_MESSAGES[0].id;

const ONLINE_BOTS = SEED_USERS.filter((u) => u.online).map((u) => u.id);

const BOT_POOL = [
  "تمام، شكراً جزيلاً 🙂",
  "أوافقك الرأي 👍",
  "هذا رائع فعلاً 😂",
  "متى نلتقي؟",
  "جميل جداً 🔥",
  "نحن جميعاً هنا، لنتحدث",
  "أهلاً بالجميع 🎉",
  "عمل رائع 👏",
  "صحيح 💯",
  "أحسنت 🙏",
];

interface ChatState {
  currentUser: User | null;
  isAdmin: boolean;
  theme: "light" | "dark";
  fontScale: number;

  /* group meta */
  groupName: string;
  groupDescription: string;
  groupLogo: string | null;

  users: User[];
  messages: Message[];

  activePanel: PanelType;
  replyTo: Message | null;
  editing: EditingState | null;
  searchQuery: string;
  typingUserIds: string[];
  toasts: ToastItem[];
  highlightId: number | null;
  pendingScrollId: number | null;

  /* auth */
  login: (name: string, avatarUrl?: string | null, color?: string) => void;
  logout: () => void;
  setAvatar: (url: string | null) => void;

  /* ui */
  toggleTheme: () => void;
  setFontScale: (n: number) => void;
  setPanel: (p: PanelType) => void;
  setReply: (m: Message | null) => void;
  setEditing: (e: EditingState | null) => void;
  setSearch: (q: string) => void;
  toast: (type: ToastItem["type"], text: string) => void;
  dismissToast: (id: string) => void;
  setHighlightId: (id: number | null) => void;
  setPendingScrollId: (id: number | null) => void;

  /* group settings */
  setGroupName: (name: string) => void;
  setGroupDescription: (d: string) => void;
  setGroupLogo: (url: string | null) => void;
  clearMessages: () => void;

  /* messages */
  sendText: (text: string) => void;
  sendVoice: (voiceUrl: string, duration: number) => void;
  sendImage: (imageUrl: string) => void;
  editMessage: (id: number, text: string) => void;
  deleteMessage: (id: number) => void;
  toggleReaction: (id: number, emoji: Reaction) => void;
  togglePin: (id: number) => void;

  /* admin */
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  muteUser: (id: string) => void;
  unmuteUser: (id: string) => void;
  adminDeleteMessage: (id: number) => void;

  /* simulation */
  botType: (userId: string, on: boolean) => void;
  botPost: () => void;
  botSendMessage: (userId: string, text: string) => void;
}

function uid(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useStore = create<ChatState>((set, get) => ({
  currentUser: null,
  isAdmin: false,
  theme:
    typeof localStorage !== "undefined" &&
    localStorage.getItem("chat_theme") === "dark"
      ? "dark"
      : "light",
  fontScale:
    typeof localStorage !== "undefined"
      ? parseFloat(localStorage.getItem("chat_msgsize") || "17") || 17
      : 17,

  groupName: "مجتمع لا أبرح",
  groupDescription: "مجتمع للتواصل والتعارف وتبادل الأفكار بين الأعضاء",
  groupLogo: null,

  users: SEED_USERS,
  messages: SEED_MESSAGES,

  activePanel: null,
  replyTo: null,
  editing: null,
  searchQuery: "",
  typingUserIds: [],
  toasts: [],
  highlightId: null,
  pendingScrollId: null,

  login: (name, avatarUrl, color) => {
    const trimmed = name.trim();
    const user: User = {
      id: "me",
      name: trimmed,
      avatarUrl: avatarUrl ?? null,
      color: color || undefined,
      role: "member",
      online: true,
      bio: "عضو في المجتمع",
    };
    set((s) => ({
      currentUser: user,
      users: [user, ...s.users.filter((u) => u.id !== "me")],
    }));
  },

  logout: () =>
    set((s) => ({
      currentUser: null,
      isAdmin: false,
      users: s.users.filter((u) => u.id !== "me"),
      activePanel: null,
    })),

  setAvatar: (url) =>
    set((s) => (s.currentUser ? { currentUser: { ...s.currentUser, avatarUrl: url } } : {})),

  toggleTheme: () =>
    set((s) => {
      const theme = s.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("chat_theme", theme);
      } catch {
        /* ignore */
      }
      return { theme };
    }),

  setFontScale: (n) => {
    try {
      localStorage.setItem("chat_font", String(n));
    } catch {
      /* ignore */
    }
    set({ fontScale: n });
  },

  setPanel: (p) => set({ activePanel: p }),
  setReply: (m) => set({ replyTo: m }),
  setEditing: (e) => set({ editing: e }),
  setSearch: (q) => set({ searchQuery: q }),
  setHighlightId: (id) => set({ highlightId: id }),
  setPendingScrollId: (id) => set({ pendingScrollId: id }),

  toast: (type, text) =>
    set((s) => ({ toasts: [...s.toasts, { id: uid(), type, text }] })),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  setGroupName: (name) => set({ groupName: name || "مجتمع لا أبرح" }),
  setGroupDescription: (d) => set({ groupDescription: d }),
  setGroupLogo: (url) => set({ groupLogo: url }),
  clearMessages: () => set({ messages: [] }),

  sendText: (text) => {
    const trimmed = text.trim();
    if (!trimmed || !get().currentUser) return;
    const replyId = get().replyTo?.id ?? null;
    const msg = mk({
      userId: "me",
      type: "text",
      text: trimmed,
      createdAt: Date.now(),
      replyToId: replyId,
      status: "sent",
    });
    set((s) => ({ messages: [...s.messages, msg], replyTo: null }));
    setTimeout(() => {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === msg.id ? { ...m, status: "seen" } : m
        ),
      }));
    }, 1400);
  },

  sendVoice: (voiceUrl, duration) => {
    if (!get().currentUser) return;
    const msg = mk({
      userId: "me",
      type: "voice",
      voiceUrl,
      duration,
      createdAt: Date.now(),
      status: "sent",
    });
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  sendImage: (imageUrl) => {
    if (!get().currentUser) return;
    const msg = mk({
      userId: "me",
      type: "image",
      imageUrl,
      createdAt: Date.now(),
      status: "sent",
    });
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  editMessage: (id, text) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, text, edited: true } : m
      ),
      editing: null,
    })),

  deleteMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, deleted: true, text: "", reactions: {} } : m
      ),
    })),

  toggleReaction: (id, emoji) => {
    const me = get().currentUser?.id;
    if (!me) return;
    set((s) => ({
      messages: s.messages.map((m) => {
        if (m.id !== id) return m;
        const map = { ...m.reactions };
        const list = map[emoji] ?? [];
        const next = list.includes(me)
          ? list.filter((x) => x !== me)
          : [...list, me];
        if (next.length === 0) delete map[emoji];
        else map[emoji] = next;
        return { ...m, reactions: map };
      }),
    }));
  },

  togglePin: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, pinned: !m.pinned } : m
      ),
    })),

  adminLogin: (password) => {
    if (password === "12345678rk") {
      set({ isAdmin: true });
      try {
        localStorage.setItem("chat_admin", "1");
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  },

  adminLogout: () => {
    try {
      localStorage.removeItem("chat_admin");
    } catch {
      /* ignore */
    }
    set({ isAdmin: false, activePanel: null });
  },

  blockUser: (id) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, blocked: true, online: false } : u
      ),
    })),
  unblockUser: (id) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, blocked: false } : u)),
    })),
  muteUser: (id) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, muted: true } : u)),
    })),
  unmuteUser: (id) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, muted: false } : u)),
    })),
  adminDeleteMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, deleted: true, text: "", reactions: {} } : m
      ),
    })),

  botType: (userId, on) =>
    set((s) => ({
      typingUserIds: on
        ? Array.from(new Set([...s.typingUserIds, userId]))
        : s.typingUserIds.filter((u) => u !== userId),
    })),

  botPost: () => {
    const bot = ONLINE_BOTS[Math.floor(Math.random() * ONLINE_BOTS.length)];
    const text = BOT_POOL[Math.floor(Math.random() * BOT_POOL.length)];
    const msg = mk({ userId: bot, type: "text", text, createdAt: Date.now() });
    set((s) => ({
      messages: [...s.messages, msg],
      typingUserIds: s.typingUserIds.filter((u) => u !== bot),
    }));
  },

  botSendMessage: (userId, text) => {
    const msg = mk({ userId, type: "text", text, createdAt: Date.now() });
    set((s) => ({
      messages: [...s.messages, msg],
      typingUserIds: s.typingUserIds.filter((u) => u !== userId),
    }));
  },
}));

export { gradientFor };
