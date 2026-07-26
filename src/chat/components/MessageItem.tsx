import type React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SmilePlus,
  Reply,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";
import type { Message, Reaction, User } from "../types";
import { useStore } from "../store";
import { Avatar } from "../ui";
import { ALL_REACTIONS, formatTime, gradientFor } from "../lib";
import VoicePlayer from "./VoicePlayer";
import { cn } from "../utils/cn";

interface Props {
  message: Message;
  user?: User;
  isMine: boolean;
  isGrouped: boolean;
  getMessage: (id: number) => Message | undefined;
  getUser: (id: string) => User | undefined;
  onScrollTo: (id: number) => void;
}

export default function MessageItem({
  message,
  user,
  isMine,
  isGrouped,
  getMessage,
  getUser,
  onScrollTo,
}: Props) {
  const {
    currentUser,
    isAdmin,
    highlightId,
    toggleReaction,
    setReply,
    setEditing,
    togglePin,
    deleteMessage,
    adminDeleteMessage,
  } = useStore();

  const [showToolbar, setShowToolbar] = useState(false);
  const [reactOpen, setReactOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const replyMsg = message.replyToId ? getMessage(message.replyToId) : undefined;
  const replyUser = replyMsg ? getUser(replyMsg.userId) : undefined;
  const me = currentUser?.id;
  const highlighted = highlightId === message.id;
  const canModerate = isAdmin;

  const react = (emoji: Reaction) => {
    toggleReaction(message.id, emoji);
    setReactOpen(false);
  };

  const reactionEntries = Object.entries(message.reactions) as [Reaction, string[]][];
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => {
        setShowToolbar(false);
        setReactOpen(false);
        setConfirmDel(false);
      }}
      onClick={() => setShowToolbar((v) => !v)}
      className={cn(
        "relative flex w-full items-end gap-2 rounded-lg px-2 transition-colors sm:px-4",
        isMine ? "justify-end" : "justify-start",
        isGrouped ? "mt-0.5" : "mt-3",
        highlighted && "bg-brand-500/10"
      )}
    >
      {!isMine && (
        <div className="w-8 shrink-0 self-end">
          {!isGrouped && user && <Avatar user={user} size={32} />}
        </div>
      )}

      <div className={cn("relative flex max-w-[84%] flex-col sm:max-w-[70%]", isMine ? "items-end" : "items-start")}>
        {!isMine && !isGrouped && user && (
          <span
            className={cn(
              "mb-1 ps-2 text-xs font-bold bg-linear-to-r bg-clip-text text-transparent",
              gradientFor(user.name)
            )}
          >
            {user.name}
          </span>
        )}

        {/* floating action bar */}
        <AnimatePresence>
          {(showToolbar || confirmDel) && !message.deleted && (
            <motion.div
              data-toolbar
              onClick={stop}
              initial={{ opacity: 0, scale: 0.8, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 6 }}
              transition={{ duration: 0.14 }}
              className={cn(
                "absolute -top-4 z-30 flex items-center gap-0.5 rounded-full border border-slate-200 bg-white/95 p-1 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95",
                isMine ? "start-0" : "end-0"
              )}
            >
              {confirmDel ? (
                <div className="flex items-center gap-1 px-1">
                  <span className="px-1 text-xs font-semibold text-slate-500">حذف؟</span>
                  <ToolBtn danger onClick={() => (isMine ? deleteMessage(message.id) : adminDeleteMessage(message.id))}>
                    نعم
                  </ToolBtn>
                  <ToolBtn onClick={() => setConfirmDel(false)}>لا</ToolBtn>
                </div>
              ) : reactOpen ? (
                <div className="flex items-center gap-0.5 px-0.5">
                  {ALL_REACTIONS.map((e, i) => (
                    <motion.button
                      key={e}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => react(e)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {e}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <>
                  <ToolBtn onClick={() => setReactOpen(true)} title="تفاعل">
                    <SmilePlus className="h-4 w-4" />
                  </ToolBtn>
                  <ToolBtn onClick={() => setReply(message)} title="رد">
                    <Reply className="h-4 w-4" />
                  </ToolBtn>
                  {isAdmin && (
                    <ToolBtn onClick={() => togglePin(message.id)} title={message.pinned ? "إلغاء التثبيت" : "تثبيت"}>
                      {message.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </ToolBtn>
                  )}
                  {isMine && message.type === "text" && (
                    <ToolBtn onClick={() => setEditing({ id: message.id, text: message.text ?? "" })} title="تعديل">
                      <Pencil className="h-4 w-4" />
                    </ToolBtn>
                  )}
                  {(isMine || canModerate) && (
                    <ToolBtn danger onClick={() => setConfirmDel(true)} title="حذف">
                      <Trash2 className="h-4 w-4" />
                    </ToolBtn>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-3 py-2 text-[14.5px] leading-relaxed shadow-sm",
            isMine
              ? "rounded-tl-md bg-linear-to-br from-brand-600 to-brand-500 text-white"
              : "rounded-tr-md bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100",
            isGrouped && (isMine ? "rounded-tl-2xl" : "rounded-tr-2xl"),
            message.type === "image" && "overflow-hidden p-1"
          )}
        >
          {replyMsg && (
            <button
              onClick={(e) => {
                stop(e);
                onScrollTo(replyMsg.id);
              }}
              className={cn(
                "mb-1.5 flex w-full flex-col items-start gap-0.5 rounded-lg border-s-2 px-2 py-1 text-start text-xs",
                isMine ? "border-white/70 bg-white/15" : "border-brand-400 bg-brand-500/10 dark:bg-brand-400/10"
              )}
            >
              <span className={cn("font-bold", isMine ? "text-white" : "text-brand-600 dark:text-brand-300")}>
                {replyUser?.name ?? "غير معروف"}
              </span>
              <span className={cn("line-clamp-1", isMine ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
                {replyMsg.deleted ? "رسالة محذوفة" : replyMsg.text || (replyMsg.type === "voice" ? "🎙️ رسالة صوتية" : "📷 صورة")}
              </span>
            </button>
          )}

          {message.deleted ? (
            <span className={cn("italic", isMine ? "text-white/70" : "text-slate-400 dark:text-slate-500")}>
              🚫 تم حذف هذه الرسالة
            </span>
          ) : message.type === "image" ? (
            <img src={message.imageUrl} alt="صورة" className="max-h-72 w-full rounded-xl object-cover" />
          ) : message.type === "voice" ? (
            <div className="min-w-[190px]">
              <VoicePlayer url={message.voiceUrl} duration={message.duration ?? 0} seed={message.id} mine={isMine} />
            </div>
          ) : (
            <p className="chat-message-text whitespace-pre-wrap break-words leading-relaxed">
              {message.text}
            </p>
          )}

          {!message.deleted && message.type !== "image" && (
            <div className={cn("mt-0.5 flex items-center justify-end gap-1", message.type === "voice" && "ps-1")}>
              {message.pinned && <Pin className={cn("h-3 w-3", isMine ? "text-white/80" : "text-amber-500")} />}
              {message.edited && (
                <span className={cn("text-[10px]", isMine ? "text-white/70" : "text-slate-400")}>تم التعديل</span>
              )}
              <span className={cn("text-[10px]", isMine ? "text-white/70" : "text-slate-400")}>{formatTime(message.createdAt)}</span>
              {isMine && !message.deleted && (message.status === "seen" ? <CheckCheck className="h-3.5 w-3.5 text-sky-200" /> : <Check className="h-3.5 w-3.5 text-white/70" />)}
            </div>
          )}
          {message.type === "image" && (
            <div className="flex items-center justify-end gap-1 px-2 pt-1 pb-0.5">
              {message.pinned && <Pin className="h-3 w-3 text-white/80" />}
              <span className="text-[10px] text-white/90 drop-shadow">{formatTime(message.createdAt)}</span>
              {isMine && (message.status === "seen" ? <CheckCheck className="h-3.5 w-3.5 text-sky-100" /> : <Check className="h-3.5 w-3.5 text-white/80" />)}
            </div>
          )}
        </div>

        {reactionEntries.length > 0 && (
          <div className={cn("mt-1 flex flex-wrap gap-1", isMine ? "pe-1 justify-end" : "ps-1")}>
            {reactionEntries.map(([emoji, ids]) => {
              const reacted = me ? ids.includes(me) : false;
              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    stop(e);
                    react(emoji);
                  }}
                  className={cn(
                    "animate-pop-in flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs shadow-sm transition-all active:scale-90",
                    reacted
                      ? "border-brand-300 bg-brand-500/15 dark:border-brand-500/50"
                      : "border-slate-200 bg-white hover:border-brand-200 dark:border-slate-700 dark:bg-slate-800"
                  )}
                >
                  <span className="text-sm leading-none">{emoji}</span>
                  <span className={cn("font-bold tabular-nums", reacted ? "text-brand-600 dark:text-brand-300" : "text-slate-500 dark:text-slate-400")}>{ids.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ToolBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-7 items-center justify-center gap-1 rounded-full px-2 text-xs font-semibold transition-all active:scale-90",
        danger
          ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15"
          : "text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-brand-300"
      )}
    >
      {children}
    </button>
  );
}
