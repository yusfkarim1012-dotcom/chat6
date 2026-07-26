import type React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send,
  Mic,
  Smile,
  Paperclip,
  X,
  Image as ImageIcon,
  MapPin,
  FileText,
  Trash2,
  Square,
  Pencil,
} from "lucide-react";
import { useStore } from "../store";
import { autoResize } from "../lib";
import EmojiPicker from "./EmojiPicker";
import { cn } from "../utils/cn";

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toAr(n: number) {
  return String(n).replace(/\d/g, (d) => AR_DIGITS[+d]);
}

export default function Composer() {
  const {
    replyTo,
    setReply,
    editing,
    setEditing,
    sendText,
    sendVoice,
    sendImage,
    editMessage,
    toast,
  } = useStore();

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef(0);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setText(editing.text);
      requestAnimationFrame(() => taRef.current && autoResize(taRef.current));
      taRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (text === "" && taRef.current) taRef.current.style.height = "auto";
  }, [text]);

  const replyUser = replyTo ? useStore.getState().users.find((u) => u.id === replyTo.userId) : null;
  const hasText = text.trim().length > 0;

  const onChange = (v: string) => {
    setText(v);
    if (taRef.current) autoResize(taRef.current);
  };

  const insertEmoji = (e: string) => {
    setText((t) => t + e);
    taRef.current?.focus();
    requestAnimationFrame(() => taRef.current && autoResize(taRef.current));
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      toast("error", "حجم الصورة كبير جداً");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => sendImage(reader.result as string);
    reader.readAsDataURL(file);
    setShowAttach(false);
    e.target.value = "";
  };

  const submit = () => {
    if (editing) {
      if (hasText) editMessage(editing.id, text.trim());
      setText("");
      return;
    }
    if (hasText) {
      sendText(text);
      setText("");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape") {
      if (editing) setEditing(null);
      else if (replyTo) setReply(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => stream.getTracks().forEach((t) => t.stop());
      mr.start();
      mrRef.current = mr;
      startTsRef.current = Date.now();
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast("error", "تعذّر بدء التسجيل. اسمح باستخدام الميكروفون.");
    }
  };

  const finishRecording = (send: boolean) => {
    const mr = mrRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => {
        if (mr.stream) mr.stream.getTracks().forEach((t) => t.stop());
        if (send) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          const duration = Math.max(1, Math.round((Date.now() - startTsRef.current) / 1000));
          sendVoice(url, duration);
        }
      };
      mr.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRecording(false);
    setSeconds(0);
  };

  return (
    <div className="relative z-20 border-t border-slate-200/80 bg-white/85 px-2 py-2.5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 sm:px-4">
      <AnimatePresence>
        {showEmoji && (
          <div className="absolute bottom-full start-2 mb-2 sm:start-4">
            <div className="fixed inset-0 z-30" onClick={() => setShowEmoji(false)} />
            <div className="relative z-40">
              <EmojiPicker onSelect={insertEmoji} />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAttach && (
          <div className="absolute bottom-full start-2 mb-2 sm:start-4">
            <div className="fixed inset-0 z-30" onClick={() => setShowAttach(false)} />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative z-40 grid w-44 grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            >
              <AttachItem icon={<ImageIcon className="h-5 w-5" />} label="صورة" color="bg-sky-500" onClick={() => fileRef.current?.click()} />
              <AttachItem icon={<FileText className="h-5 w-5" />} label="ملف" color="bg-violet-500" onClick={() => { toast("info", "سيتم إضافته قريباً"); setShowAttach(false); }} />
              <AttachItem icon={<MapPin className="h-5 w-5" />} label="موقع" color="bg-emerald-500" onClick={() => { toast("info", "سيتم إضافته قريباً"); setShowAttach(false); }} />
              <AttachItem icon={<Mic className="h-5 w-5" />} label="تسجيل" color="bg-rose-500" onClick={() => { setShowAttach(false); startRecording(); }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />

      <AnimatePresence>
        {(replyTo || editing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border-s-4 border-brand-500 bg-slate-100 px-3 py-2 dark:bg-slate-800">
              {editing ? <Pencil className="h-4 w-4 shrink-0 text-brand-500" /> : <ReplyIcon />}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-600 dark:text-brand-300">
                  {editing ? "تعديل الرسالة" : `رد على: ${replyUser?.name ?? ""}`}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {editing ? editing.text : replyTo?.text || (replyTo?.type === "voice" ? "🎙️ رسالة صوتية" : "📷 صورة")}
                </p>
              </div>
              <button
                onClick={() => (editing ? setEditing(null) : setReply(null))}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {recording ? (
          <motion.div
            key="rec"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-3 py-2 dark:border-rose-500/30 dark:bg-rose-500/10"
          >
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
            <span className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {toAr(Math.floor(seconds / 60))}:{toAr(seconds % 60).padStart(2, "٠")}
            </span>
            <span className="flex-1 text-xs text-rose-500/80">جارٍ التسجيل…</span>
            <button
              onClick={() => finishRecording(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-rose-500 transition-transform hover:scale-110 active:scale-90 dark:bg-white/10"
              title="إلغاء"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => finishRecording(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-md transition-transform hover:scale-110 active:scale-90"
              title="إرسال"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-1.5"
          >
            <div className="flex items-center">
              <button
                onClick={() => { setShowAttach((v) => !v); setShowEmoji(false); }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-200/70 hover:text-brand-600 active:scale-90 dark:text-slate-400 dark:hover:bg-slate-700",
                  showAttach && "bg-brand-500/15 text-brand-600"
                )}
                title="مرفق"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 items-end rounded-2xl border border-slate-200 bg-slate-50 pe-1 transition-colors focus-within:border-brand-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">
              <textarea
                ref={taRef}
                rows={1}
                value={text}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={editing ? "عدّل الرسالة..." : "اكتب رسالة..."}
                className="scrollbar-thin max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <button
                onClick={() => { setShowEmoji((v) => !v); setShowAttach(false); }}
                className={cn(
                  "mb-1 me-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-200/70 hover:text-brand-600 active:scale-90 dark:text-slate-400 dark:hover:bg-slate-700",
                  showEmoji && "text-brand-600"
                )}
                title="إيموجي"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center">
              <AnimatePresence mode="wait" initial={false}>
                {hasText || editing ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.18 }}
                    onClick={submit}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/40 transition-transform hover:scale-105 active:scale-90"
                    title="إرسال"
                  >
                    <Send className="h-5 w-5 -translate-x-px -rotate-180" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="mic"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={startRecording}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm transition-all hover:bg-brand-500 hover:text-white active:scale-90 dark:bg-slate-700 dark:text-slate-300"
                    title="رسالة صوتية"
                  >
                    <Mic className="h-5 w-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AttachItem({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-full text-white", color)}>{icon}</span>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
    </button>
  );
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-brand-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 14 4 9 9 4" />
      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
