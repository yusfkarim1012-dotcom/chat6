import type React from "react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft, Camera, X, Mic, Zap, ShieldCheck } from "lucide-react";
import { useStore } from "../store";
import { Avatar } from "../ui";

export default function Login() {
  const login = useStore((s) => s.login);
  const groupName = useStore((s) => s.groupName);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من ٤ ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("الرجاء إدخال اسم (حرفان على الأقل)");
      return;
    }
    login(trimmed, avatarUrl);
  };

  const features = [
    { icon: <Zap className="h-3.5 w-3.5" />, label: "دردشة فورية" },
    { icon: <Mic className="h-3.5 w-3.5" />, label: "رسائل صوتية" },
    { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "آمن وخاص" },
  ];

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-100 p-4 dark:bg-slate-950">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="animate-float-slow pointer-events-none absolute -top-24 -end-24 h-80 w-80 rounded-full bg-brand-400/30 blur-3xl" />
      <div className="animate-float-slower pointer-events-none absolute -bottom-24 -start-24 h-96 w-96 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 start-1/2 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-2xl shadow-slate-300/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40">
          {/* header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-fuchsia-500 px-8 pb-12 pt-10 text-center">
            <div className="pointer-events-none absolute -end-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -start-8 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.12, type: "spring", stiffness: 200, damping: 14 }}
              className="relative mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md ring-1 ring-white/40"
            >
              <Users className="h-9 w-9 text-white" strokeWidth={2.4} />
            </motion.div>
            <h1 className="group-title relative text-[28px] leading-tight drop-shadow-lg">{groupName}</h1>
            <p className="relative mt-1.5 text-sm text-white/80">منصة التواصل بين الأعضاء</p>
          </div>

          <div className="space-y-5 px-7 py-7">
            {/* avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar user={{ name: name.trim() || "؟", avatarUrl }} size={84} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-brand-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 dark:border-slate-900"
                  title="تغيير الصورة"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => setAvatarUrl(null)}
                    className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white shadow"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />

            <div>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="اكتب اسمك للدخول..."
                autoFocus
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-base text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-center text-sm font-medium text-rose-500"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              onClick={submit}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98]"
            >
              انضم إلينا
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </button>

            {/* features */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {features.map((f, i) => (
                <motion.span
                  key={f.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <span className="text-brand-500">{f.icon}</span>
                  {f.label}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">بدخولك أنت توافق على قوانين وآداب المجتمع.</p>
      </motion.div>
    </div>
  );
}
