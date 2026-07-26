import type React from "react";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Users,
  Pin,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldX,
  Volume2,
  VolumeX,
  Crown,
  Moon,
  Sun,
  Camera,
  Ban,
  KeyRound,
  Lock,
  MessageSquare,
  UserPlus,
  ChevronLeft,
  Trash2,
  ImageOff,
  Save,
  Type,
} from "lucide-react";
import { useStore } from "../store";
import { Avatar, Badge, Segmented } from "../ui";
import { formatTime, lastSeenLabel, ROLE_LABEL, dayLabel } from "../lib";
import type { Message } from "../types";
import { cn } from "../utils/cn";

/* ============== shared shell ============== */
function PanelShell({
  icon,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto">{children}</div>
      {footer}
    </div>
  );
}

/* ============== members ============== */
function MembersPanel({ onClose }: { onClose: () => void }) {
  const { users, groupName, groupLogo, groupDescription, isAdmin, currentUser, toast, blockUser, unblockUser, muteUser, unmuteUser } = useStore();
  const online = users.filter((u) => u.online);
  const offline = users.filter((u) => !u.online);

  const Row = ({ id }: { id: string }) => {
    const u = users.find((x) => x.id === id)!;
    const isSelf = u.id === currentUser?.id;
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
        <Avatar user={u} size={44} online={u.online} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{u.name}</span>
            {u.role === "owner" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
            {(u.role === "owner" || u.role === "admin") && <Badge tone="brand">{ROLE_LABEL[u.role]}</Badge>}
            {u.muted && <VolumeX className="h-3.5 w-3.5 text-rose-400" />}
            {isSelf && <Badge tone="slate">أنت</Badge>}
          </div>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {u.online ? "متصل الآن" : u.blocked ? "محظور" : lastSeenLabel(u.lastSeen ?? Date.now())}
          </p>
        </div>
        {isAdmin && !isSelf && u.role !== "owner" && (
          <div className="flex items-center gap-1">
            <MiniBtn title={u.muted ? "إلغاء الكتم" : "كتم"} active={u.muted} onClick={() => { u.muted ? unmuteUser(u.id) : muteUser(u.id); toast("success", u.muted ? `تم إلغاء كتم ${u.name}` : `تم كتم ${u.name}`); }}>
              {u.muted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </MiniBtn>
            <MiniBtn title={u.blocked ? "رفع الحظر" : "حظر"} danger={!u.blocked} onClick={() => { u.blocked ? unblockUser(u.id) : blockUser(u.id); toast("success", u.blocked ? `تم رفع الحظر عن ${u.name}` : `تم حظر ${u.name}`); }}>
              {u.blocked ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
            </MiniBtn>
          </div>
        )}
      </div>
    );
  };

  return (
    <PanelShell icon={<Users className="h-5 w-5" />} title={groupName} subtitle={`${users.length} عضو · ${online.length} متصل`} onClose={onClose}
      footer={<button className="m-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-slate-600"><UserPlus className="h-4 w-4" /> دعوة صديق</button>}>
      {/* group info */}
      <div className="flex flex-col items-center gap-2 border-b border-slate-100 bg-gradient-to-b from-brand-500/5 to-transparent px-5 py-6 text-center dark:border-slate-800">
        <div className="h-20 w-20 overflow-hidden rounded-2xl ring-4 ring-white shadow-lg dark:ring-slate-900">
          {groupLogo ? (
            <img src={groupLogo} alt={groupName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-brand-500 to-fuchsia-500 text-white"><Users className="h-9 w-9" /></div>
          )}
        </div>
        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{groupName}</h4>
        <p className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">{groupDescription}</p>
        <div className="mt-1 flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span>{users.length} عضو</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1 text-emerald-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {online.length} متصل</span>
        </div>
      </div>

      <Section label={`متصل — ${online.length}`}>{online.map((u) => <Row key={u.id} id={u.id} />)}</Section>
      {offline.length > 0 && <Section label={`غير متصل — ${offline.length}`}>{offline.map((u) => <Row key={u.id} id={u.id} />)}</Section>}
    </PanelShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-4 py-2 text-xs font-bold text-brand-600 dark:text-brand-300">{label}</p>
      {children}
    </div>
  );
}

function MiniBtn({
  children,
  onClick,
  title,
  danger,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90",
        danger
          ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15"
          : active
            ? "bg-brand-500/15 text-brand-600 hover:bg-brand-500/25"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
      )}
    >
      {children}
    </button>
  );
}

/* ============== pinned ============== */
function PinnedPanel({ onClose }: { onClose: () => void }) {
  const { messages, users, isAdmin, togglePin } = useStore();
  const pinned = messages.filter((m) => m.pinned);
  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <PanelShell icon={<Pin className="h-5 w-5" />} title="الرسائل المثبتة" subtitle={`${pinned.length} رسالة`} onClose={onClose}>
      {pinned.length === 0 ? (
        <Empty icon="📌" text="لا توجد رسائل مثبتة" />
      ) : (
        <div className="space-y-2 p-3">
          {pinned.map((m) => {
            const u = getUser(m.userId);
            return (
              <div key={m.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mb-1.5 flex items-center gap-2">
                  {u && <Avatar user={u} size={24} />}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{u?.name}</span>
                  <span className="text-[10px] text-slate-400">{formatTime(m.createdAt)}</span>
                  {isAdmin && <button onClick={() => togglePin(m.id)} className="ms-auto text-xs font-semibold text-rose-500 hover:underline">إزالة</button>}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{m.deleted ? "🚫 رسالة محذوفة" : m.text || "🎙️ رسالة صوتية / 📷 صورة"}</p>
              </div>
            );
          })}
        </div>
      )}
    </PanelShell>
  );
}

/* ============== search ============== */
function SearchPanel({ onClose }: { onClose: () => void }) {
  const { messages, users, searchQuery, setSearch, setPendingScrollId } = useStore();
  const q = searchQuery.trim();
  const results: Message[] = q ? messages.filter((m) => !m.deleted && m.text?.toLowerCase().includes(q.toLowerCase())) : [];
  const getUser = (id: string) => users.find((u) => u.id === id);
  const open = (id: number) => { setPendingScrollId(id); onClose(); };

  return (
    <PanelShell icon={<SearchIcon className="h-5 w-5" />} title="البحث في الرسائل" onClose={onClose}>
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800">
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <input autoFocus value={searchQuery} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن رسالة..." className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
          {q && <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>}
        </div>
      </div>
      {q && <p className="px-4 pb-2 text-xs text-slate-500">{results.length} نتيجة</p>}
      {q && results.length === 0 && <Empty icon="🔍" text="لا توجد نتائج" />}
      <div className="space-y-1 px-2 pb-3">
        {results.map((m) => {
          const u = getUser(m.userId);
          return (
            <button key={m.id} onClick={() => open(m.id)} className="flex w-full items-start gap-3 rounded-xl p-2.5 text-start transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              {u && <Avatar user={u} size={36} />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{u?.name}</span>
                  <span className="shrink-0 text-[10px] text-slate-400">{dayLabel(m.createdAt)}</span>
                </div>
                <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{m.text}</p>
              </div>
            </button>
          );
        })}
      </div>
    </PanelShell>
  );
}

/* ============== settings ============== */
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { theme, toggleTheme, fontScale, setFontScale } = useStore();
  return (
    <PanelShell icon={<SettingsIcon className="h-5 w-5" />} title="الإعدادات" onClose={onClose}>
      <div className="space-y-1 p-4">
        <GroupTitle>المظهر</GroupTitle>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 dark:bg-slate-800/60">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">{theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</span>
            الوضع
          </span>
          <Segmented value={theme} onChange={(v) => { if (v !== theme) toggleTheme(); }} options={[{ value: "light", label: "فاتح" }, { value: "dark", label: "داكن" }]} />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 dark:bg-slate-800/60">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500"><Type className="h-4 w-4" /></span>
            حجم الخط
          </span>
          <Segmented value={String(fontScale)} onChange={(v) => setFontScale(parseFloat(v))} options={[{ value: "14", label: "صغير" }, { value: "17", label: "عادي" }, { value: "20", label: "كبير" }]} />
        </div>
      </div>
      <p className="px-4 pb-5 text-center text-xs text-slate-400">مجتمع لا أبرح • الإصدار ١.٠</p>
    </PanelShell>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1 pt-3 text-xs font-bold text-slate-400">{children}</p>;
}



/* ============== admin ============== */
function AdminPanel({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const logoRef = useRef<HTMLInputElement | null>(null);

  if (!store.isAdmin) {
    const submit = () => {
      if (store.adminLogin(password)) setError("");
      else setError("كلمة المرور غير صحيحة");
    };
    return (
      <PanelShell icon={<ShieldCheck className="h-5 w-5" />} title="دخول لوحة الإدارة" onClose={onClose}>
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500"><Lock className="h-8 w-8" /></div>
          <p className="text-center text-sm text-slate-500">للدخول كمشرف، يرجى إدخال كلمة المرور.</p>
          <div className="w-full">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800">
              <KeyRound className="h-4 w-4 text-slate-400" />
              <input type="password" value={password} autoFocus onKeyDown={(e) => e.key === "Enter" && submit()} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="كلمة المرور" className="flex-1 bg-transparent py-2.5 text-sm outline-none dark:text-white" />
            </div>
            {error && <p className="mt-2 text-sm font-medium text-rose-500">{error}</p>}
          </div>
          <button onClick={submit} className="w-full rounded-xl bg-linear-to-r from-brand-600 to-brand-500 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition-transform active:scale-95">دخول</button>
        </div>
      </PanelShell>
    );
  }

  const blocked = store.users.filter((u) => u.blocked);
  const muted = store.users.filter((u) => u.muted);

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { store.toast("error", "حجم الصورة كبير جداً"); return; }
    const reader = new FileReader();
    reader.onload = () => { store.setGroupLogo(reader.result as string); store.toast("success", "تم تحديث شعار المجموعة"); };
    reader.readAsDataURL(file);
  };

  const Stat = ({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: string }) => (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-800/60">
      <span className={cn("mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full", tone)}>{icon}</span>
      <p className="text-xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );

  return (
    <PanelShell icon={<ShieldCheck className="h-5 w-5" />} title="لوحة الإدارة" subtitle="إدارة المجموعة" onClose={onClose}
      footer={<button onClick={() => store.adminLogout()} className="m-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"><ShieldX className="h-4 w-4" /> خروج من الإدارة</button>}>
      <div className="space-y-4 p-4">
        {/* group settings */}
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"><Save className="h-4 w-4 text-brand-500" /> إعدادات المجموعة</p>

          <div className="mb-3 flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-slate-200 dark:ring-slate-700">
              {store.groupLogo ? <img src={store.groupLogo} alt="logo" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-brand-500 to-fuchsia-500 text-white"><Users className="h-6 w-6" /></div>}
            </div>
            <div className="flex flex-col gap-2">
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={onLogo} />
              <button onClick={() => logoRef.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-600"><Camera className="h-3.5 w-3.5" /> تغيير الشعار</button>
              {store.groupLogo && <button onClick={() => { store.setGroupLogo(null); store.toast("info", "تمت إزالة الشعار"); }} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"><ImageOff className="h-3.5 w-3.5" /> إزالة</button>}
            </div>
          </div>

          <label className="mb-1 block text-xs font-semibold text-slate-500">اسم المجموعة</label>
          <input value={store.groupName} onChange={(e) => store.setGroupName(e.target.value)} className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          <label className="mb-1 block text-xs font-semibold text-slate-500">وصف المجموعة</label>
          <textarea value={store.groupDescription} onChange={(e) => store.setGroupDescription(e.target.value)} rows={2} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>

        <div className="flex gap-2">
          <Stat icon={<Users className="h-4 w-4 text-white" />} value={store.users.length} label="أعضاء" tone="bg-sky-500" />
          <Stat icon={<MessageSquare className="h-4 w-4 text-white" />} value={store.messages.length} label="رسائل" tone="bg-brand-500" />
          <Stat icon={<Pin className="h-4 w-4 text-white" />} value={store.messages.filter((m) => m.pinned).length} label="مثبتة" tone="bg-amber-500" />
        </div>

        {/* clear chat */}
        <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="flex-1 text-sm font-medium text-slate-600 dark:text-slate-300">مسح كل الرسائل؟</span>
              <button onClick={() => { store.clearMessages(); setConfirmClear(false); store.toast("success", "تم مسح المحادثة"); }} className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white">تأكيد</button>
              <button onClick={() => setConfirmClear(false)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">إلغاء</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /> مسح المحادثة بالكامل</button>
          )}
        </div>

        {blocked.length > 0 && (
          <div>
            <p className="mb-2 px-1 text-xs font-bold text-rose-500">المحظورون ({blocked.length})</p>
            <div className="space-y-1">
              {blocked.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-xl bg-rose-500/5 p-2 dark:bg-rose-500/10">
                  <Avatar user={u} size={32} />
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                  <button onClick={() => { store.unblockUser(u.id); store.toast("success", `تم رفع الحظر عن ${u.name}`); }} className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600">رفع الحظر</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {muted.length > 0 && (
          <div>
            <p className="mb-2 px-1 text-xs font-bold text-amber-500">مكتومون ({muted.length})</p>
            <div className="space-y-1">
              {muted.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-xl bg-amber-500/5 p-2 dark:bg-amber-500/10">
                  <Avatar user={u} size={32} />
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                  <button onClick={() => { store.unmuteUser(u.id); store.toast("success", `تم إلغاء كتم ${u.name}`); }} className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600">إلغاء الكتم</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {blocked.length === 0 && muted.length === 0 && <Empty icon="✅" text="لا توجد قيود. المجتمع بحالة جيدة!" />}
      </div>
    </PanelShell>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

/* ============== pinned preview bar ============== */
export function PinnedBar() {
  const { messages, users, setPendingScrollId } = useStore();
  const pinned = messages.filter((m) => m.pinned);
  const [idx, setIdx] = useState(0);
  if (pinned.length === 0) return null;
  const current = pinned[Math.min(idx, pinned.length - 1)];
  const u = users.find((x) => x.id === current.userId);

  return (
    <motion.button layout initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} onClick={() => setPendingScrollId(current.id)} className="flex w-full items-center gap-2 border-b border-slate-200/80 bg-brand-500/5 px-3 py-2 text-start transition-colors hover:bg-brand-500/10 dark:border-slate-800 sm:px-4">
      <Pin className="h-4 w-4 shrink-0 text-brand-500" />
      <div className="min-w-0 flex-1 border-s-2 border-brand-500 ps-2">
        <p className="truncate text-xs font-bold text-brand-700 dark:text-brand-300">{u?.name}</p>
        <p className="truncate text-xs text-slate-600 dark:text-slate-300">{current.deleted ? "رسالة محذوفة" : current.text || "🎙️ رسالة صوتية"}</p>
      </div>
      {pinned.length > 1 && <span className="shrink-0 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold text-brand-600">{idx + 1}/{pinned.length}</span>}
      {pinned.length > 1 && <span onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % pinned.length); }} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-brand-500 hover:bg-brand-500/15"><ChevronLeft className="h-4 w-4" /></span>}
    </motion.button>
  );
}

/* ============== wrapper ============== */
export function SidePanels() {
  const { activePanel, setPanel } = useStore();
  const close = () => setPanel(null);

  return (
    <AnimatePresence>
      {activePanel && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" />
          <motion.aside initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }} transition={{ type: "spring", stiffness: 360, damping: 34 }} className="fixed inset-y-0 end-0 z-50 flex w-full max-w-[400px] flex-col shadow-2xl">
            {activePanel === "members" && <MembersPanel onClose={close} />}
            {activePanel === "pinned" && <PinnedPanel onClose={close} />}
            {activePanel === "search" && <SearchPanel onClose={close} />}
            {activePanel === "settings" && <SettingsPanel onClose={close} />}
            {activePanel === "admin" && <AdminPanel onClose={close} />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
