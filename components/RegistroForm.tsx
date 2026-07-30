"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    setEnviando(true);
    setError(null);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          // Si el link tenía utm_source/utm_medium/utm_campaign (viene de una
          // campaña de /admin/utm), lo guardamos junto con el lead.
          utmSource: searchParams.get("utm_source") ?? undefined,
          utmMedium: searchParams.get("utm_medium") ?? undefined,
          utmCampaign: searchParams.get("utm_campaign") ?? undefined,
        }),
      });

      if (!res.ok) throw new Error("No se pudo guardar el registro");

      router.push("/gracias");
    } catch (err) {
      console.error(err);
      setError("Hubo un problema. Probá de nuevo o escribinos por WhatsApp.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="max-w-[480px] w-full bg-[var(--panel)] border border-[var(--line)] rounded-[20px] p-11 text-center">
        <span
          className="font-mono text-[var(--teal)] text-xs uppercase tracking-widest block mb-4"
        >
          Clase gratuita en vivo
        </span>
        <h1
          className="font-bold text-[1.7rem] leading-tight mb-3.5"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          Reservá tu lugar en la <span className="text-[var(--gold)]">clase gratuita</span>
        </h1>
        <p className="text-[var(--paper-dim)] text-[0.98rem] mb-7">
          Dejanos tu nombre y mail para guardarte el cupo. Después te llevamos al grupo exclusivo de
          WhatsApp donde vas a recibir el link.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
          <div>
            <label className="block font-mono text-xs text-[var(--paper-dim)] uppercase tracking-wide mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] rounded-[10px] px-4 py-3.5 text-base focus:outline-none focus:border-[var(--teal)]"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-[var(--paper-dim)] uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@mail.com"
              className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] rounded-[10px] px-4 py-3.5 text-base focus:outline-none focus:border-[var(--teal)]"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-2.5 bg-[var(--teal)] text-[#06201A] font-bold py-4 rounded-[10px] text-base disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Reservar mi lugar →"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        <p className="font-mono text-[0.68rem] text-[var(--paper-dim)] mt-4.5">
          Tu mail solo se usa para avisarte de esta clase y del curso. Nada de spam.
        </p>
      </div>
    </div>
  );
}
