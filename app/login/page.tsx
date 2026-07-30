"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { esAdminAutorizado } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleLogin() {
    setError(null);
    setCargando(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;

      if (!esAdminAutorizado(email)) {
        await signOut(auth);
        setError(
          `El mail ${email} no tiene acceso a este panel. Pedile a Marcelo que lo agregue a NEXT_PUBLIC_ADMIN_EMAILS.`
        );
        return;
      }

      router.replace("/admin");
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-10 text-center">
        <p className="font-mono text-xs text-[var(--teal)] uppercase tracking-widest mb-3">
          Panel interno
        </p>
        <h1 className="font-bold text-2xl mb-2" style={{ fontFamily: "Unbounded, sans-serif" }}>
          IA para Emprender
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-8">
          Solo para Marcelo y Daniel. Iniciá sesión con el Google que usaste para que te demos acceso.
        </p>

        <button
          onClick={handleLogin}
          disabled={cargando}
          className="w-full bg-[var(--teal)] text-[#06201A] font-semibold py-3 rounded-lg disabled:opacity-60"
        >
          {cargando ? "Ingresando..." : "Ingresar con Google"}
        </button>

        {error && <p className="text-red-400 text-xs mt-5">{error}</p>}
      </div>
    </div>
  );
}
