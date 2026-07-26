"use client";

import { useEffect } from "react";
import { useStore } from "../store";
import Login from "./Login";
import Header from "./Header";
import MessageList from "./MessageList";
import Composer from "./Composer";
import { PinnedBar, SidePanels } from "./Panels";
import Toasts from "./Toasts";

const SIM_POOL = [
  "السلام عليكم 👋",
  "تمام، شكراً 🙂",
  "هذا الموضوع مميز 🔥",
  "أوافقك الرأي 👍",
  "مضحك 😂",
  "متى نلتقي؟",
  "رائع 🤩",
  "كل شيء تمام، شكراً 🙏",
  "أهلاً بالجميع 🎉",
  "عمل ممتاز 👏",
];

function useSimulation() {
  const currentUser = useStore((s) => s.currentUser);
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay = 10000 + Math.random() * 13000;
      timer = setTimeout(() => {
        if (cancelled) return;
        const s = useStore.getState();
        const bots = s.users.filter((u) => u.online && u.id !== "me");
        if (bots.length && Math.random() < 0.72) {
          const bot = bots[Math.floor(Math.random() * bots.length)];
          const text = SIM_POOL[Math.floor(Math.random() * SIM_POOL.length)];
          s.botType(bot.id, true);
          setTimeout(() => {
            if (cancelled) return;
            useStore.getState().botSendMessage(bot.id, text);
          }, 1400 + Math.random() * 1800);
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [currentUser]);
}

export default function App() {
  const currentUser = useStore((s) => s.currentUser);
  const theme = useStore((s) => s.theme);
  const fontScale = useStore((s) => s.fontScale);

  // apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // apply message font size only (not whole UI)
  useEffect(() => {
    document.documentElement.style.setProperty("--chat-msg-size", `${fontScale}px`);
  }, [fontScale]);

  // restore admin session
  useEffect(() => {
    try {
      if (localStorage.getItem("chat_admin") === "1") {
        useStore.setState({ isAdmin: true });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useSimulation();

  if (!currentUser) return (
    <>
      <Login />
      <Toasts />
    </>
  );

  return (
    <div className="relative flex h-[100dvh] w-full items-stretch justify-center bg-slate-200/70 dark:bg-black sm:p-0 lg:p-4">
      {/* decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -top-40 start-[15%] h-96 w-96 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-600/15" />
        <div className="animate-float-slower absolute -bottom-40 end-[15%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/15 blur-3xl dark:bg-fuchsia-700/10" />
      </div>

      {/* app window */}
      <div className="relative z-10 flex h-full w-full max-w-[980px] flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10 lg:h-[calc(100dvh-2rem)] lg:rounded-3xl">
        <Header />
        <PinnedBar />
        <MessageList />
        <Composer />
      </div>

      <SidePanels />
      <Toasts />
    </div>
  );
}
