"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { esAdminAutorizado } from "@/lib/auth";
import Link from "next/link";

const TABS = [
  { href: "/admin/campanas", label: "Campañas IA" },
  { href: "/admin", label: "Post rápido" },
  { href: "/admin/utm", label: "Links UTM" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u || !esAdminAutorizado(u.email)) {
        router.replace("/login");
        return;
      }
      setUser(u);
      setVerificando(false);
    });
    return () => unsub();
  }, [router]);

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--paper-dim)] font-mono text-sm">
        Verificando acceso...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] px-6 py-4 flex items-center justify-between">
        <div className="font-bold" style={{ fontFamily: "Unbounded, sans-serif" }}>
          IA para <span className="text-[var(--teal)]">Emprender</span>{" "}
          <span className="text-[var(--paper-dim)] font-mono text-xs font-normal">/ admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--paper-dim)] font-mono hidden sm:inline">{user?.email}</span>
          <button
            onClick={() => signOut(auth)}
            className="text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--teal)] border border-[var(--line)] rounded-full px-3 py-1.5"
          >
            Salir
          </button>
        </div>
      </header>
      <nav className="border-b border-[var(--line)] px-6 flex gap-1 max-w-3xl mx-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-sm font-mono px-4 py-3 border-b-2 -mb-px ${
              pathname === tab.href
                ? "border-[var(--teal)] text-[var(--teal)]"
                : "border-transparent text-[var(--paper-dim)] hover:text-[var(--paper)]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
