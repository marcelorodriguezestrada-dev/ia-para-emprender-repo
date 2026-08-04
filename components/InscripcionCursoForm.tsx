"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InscripcionCursoForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [idea, setIdea] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !idea.trim()) return;

    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/inscripcion-curso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, whatsapp, idea }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la inscripción");
      router.push(`/pago?nombre=${encodeURIComponent(nombre)}`);
    } catch (err) {
      console.error(err);
      setError("Hubo un problema. Probá de nuevo o escribinos por WhatsApp.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="max-w-[540px] w-full bg-[var(--panel)] border border-[var(--line)] rounded-[20px] p-10">
        <span className="font-mono text-[var(--teal)] text-xs uppercase tracking-widest block mb-4">
          Inscripción al curso
        </span>
        <h1
          className="font-bold text-[1.6rem] leading-tight mb-3"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          Ya casi arrancás <span className="text-[var(--gold)]">IA para Emprender</span>
        </h1>
        <p className="text-[var(--paper-dim)] text-[0.95rem] mb-7">
          Completá esto y en el siguiente paso te pasamos los datos para hacer la transferencia.
          Contanos tu idea así ya la vamos viendo antes de la Clase 1.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
                className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-[var(--paper-dim)] uppercase tracking-wide mb-1.5">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="11 6707 6678"
                className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs text-[var(--paper-dim)] uppercase tracking-wide mb-1.5">
              Contanos tu idea de negocio
            </label>
            <textarea
              required
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              placeholder="Aunque sea en 2-3 líneas: qué querés armar, a quién le vendés, o qué negocio ya tenés..."
              className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 bg-[var(--teal)] text-[#06201A] font-bold py-4 rounded-[10px] text-base disabled:opacity-60"
          >
            {enviando ? "Guardando..." : "Continuar al pago →"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        <p className="font-mono text-[0.68rem] text-[var(--paper-dim)] mt-4">
          En el siguiente paso te mostramos los datos para transferir. Nada se cobra automático.
        </p>
      </div>
    </div>
  );
}
