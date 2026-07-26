import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "مجتمع لا أبرح",
  description: "منصة تواصل وتعارف بين الأعضاء",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-200/60 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
