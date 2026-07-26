export type Role = "owner" | "admin" | "member";

export interface User {
  id: string;
  name: string;
  avatarUrl?: string | null;
  /** explicit gradient override; otherwise derived from name */
  color?: string;
  role: Role;
  online: boolean;
  lastSeen?: number;
  bio?: string;
  muted?: boolean;
  blocked?: boolean;
}

export type Reaction = "❤️" | "👍" | "🔥" | "👏" | "😮" | "😢" | "🎉";

export type MessageType = "text" | "voice" | "image";

export interface Message {
  id: number;
  userId: string;
  type: MessageType;
  text?: string;
  voiceUrl?: string;
  imageUrl?: string;
  duration?: number;
  createdAt: number;
  replyToId?: number | null;
  edited?: boolean;
  reactions: Partial<Record<Reaction, string[]>>;
  pinned?: boolean;
  deleted?: boolean;
  status?: "sending" | "sent" | "seen";
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

export type PanelType =
  | "members"
  | "pinned"
  | "admin"
  | "settings"
  | "search"
  | null;

export interface EditingState {
  id: number;
  text: string;
}
