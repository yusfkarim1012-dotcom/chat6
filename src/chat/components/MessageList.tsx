import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Message } from "../types";
import { useStore } from "../store";
import { Avatar } from "../ui";
import { dayLabel, startOfDay } from "../lib";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const {
    messages,
    users,
    typingUserIds,
    highlightId,
    setHighlightId,
    pendingScrollId,
    setPendingScrollId,
  } = useStore();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const stickToBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);

  const userMap = useMemo(() => {
    const m = new Map<string, (typeof users)[number]>();
    users.forEach((u) => m.set(u.id, u));
    return m;
  }, [users]);

  const msgMap = useMemo(() => {
    const m = new Map<number, Message>();
    messages.forEach((msg) => m.set(msg.id, msg));
    return m;
  }, [messages]);

  const scrollToBottom = (smooth = true) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    stickToBottom.current = true;
    setShowJump(false);
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    stickToBottom.current = near;
    setShowJump(!near && messages.length > 4);
  };

  useEffect(() => {
    if (stickToBottom.current) scrollToBottom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, typingUserIds.length]);

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 1800);
    return () => clearTimeout(t);
  }, [highlightId, setHighlightId]);

  useEffect(() => {
    if (pendingScrollId == null) return;
    const node = itemRefs.current.get(pendingScrollId);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightId(pendingScrollId);
    }
    const t = setTimeout(() => setPendingScrollId(null), 400);
    return () => clearTimeout(t);
  }, [pendingScrollId, setHighlightId, setPendingScrollId]);

  const rendered: React.ReactNode[] = [];
  let lastDay = 0;
  let prev: Message | undefined;

  messages.forEach((m) => {
    const day = startOfDay(m.createdAt);
    if (day !== lastDay) {
      lastDay = day;
      rendered.push(
        <div key={`d-${day}`} className="sticky top-2 z-10 mx-auto my-3 w-fit">
          <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur dark:bg-slate-700/80">
            {dayLabel(m.createdAt)}
          </span>
        </div>
      );
    }
    const isGrouped =
      !!prev &&
      prev.userId === m.userId &&
      !prev.deleted &&
      m.createdAt - prev.createdAt < 5 * 60 * 1000 &&
      day === startOfDay(prev.createdAt);

    rendered.push(
      <div
        key={m.id}
        ref={(node) => {
          if (node) itemRefs.current.set(m.id, node);
          else itemRefs.current.delete(m.id);
        }}
      >
        <MessageItem
          message={m}
          user={userMap.get(m.userId)}
          isMine={m.userId === "me"}
          isGrouped={isGrouped}
          getMessage={(id) => msgMap.get(id)}
          getUser={(id) => userMap.get(id)}
          onScrollTo={(id) => setPendingScrollId(id)}
        />
      </div>
    );
    prev = m;
  });

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="scrollbar-thin h-full overflow-y-auto overflow-x-hidden bg-grid"
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-white/40 dark:from-slate-900/40 dark:to-slate-900/40" />
        <div className="relative min-h-full pb-2 pt-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-3xl">
                💬
              </div>
              <p className="font-bold text-slate-600 dark:text-slate-300">لا توجد رسائل بعد</p>
              <p className="max-w-xs text-sm text-slate-400">أرسل أول رسالة لبدء المحادثة!</p>
            </div>
          ) : (
            rendered
          )}

          {typingUserIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2 px-2 py-1 sm:px-4"
            >
              <div className="w-8 shrink-0">
                {(() => {
                  const u = userMap.get(typingUserIds[0]);
                  return u ? <Avatar user={u} size={32} /> : null;
                })()}
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tr-md bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-slate-400"
                      style={{ animation: "typing-bounce 1.2s infinite", animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* scroll to bottom */}
      <AnimatePresence>
        {showJump && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 end-3 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-600 shadow-lg transition-transform hover:scale-110 active:scale-90 dark:border-slate-700 dark:bg-slate-800 sm:end-5"
            title="النزول للأسفل"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
