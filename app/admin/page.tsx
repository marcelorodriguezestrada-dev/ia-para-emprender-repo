"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { guardarPost, listarPosts, borrarPost, type PostGenerado } from "@/lib/posts";

const TEMAS_SUGERIDOS = [
  "Anuncio: clase gratuita en vivo",
  "Clase 1 - Estrategia y contenido con IA",
  "Clase 3 - Productos digitales",
  "Testimonio / resultado de un alumno",
  "Últimos cupos antes de que abra la venta",
];

const TONOS = ["Entusiasta y cercano", "Urgencia (cupos limitados)", "Educativo / valor", "Historia personal"];

export default function AdminPostsPage() {
  const [tema, setTema] = useState("");
  const [tono, setTono] = useState(TONOS[0]);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [historial, setHistorial] = useState<PostGenerado[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    setCargandoHistorial(true);
    try {
      setHistorial(await listarPosts());
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setCargandoHistorial(false);
    }
  }

  async function handleGenerar() {
    if (!tema.trim()) return;
    setGenerando(true);
    setError(null);
    setResultado("");
    try {
      const res = await fetch("/api/generar-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, tono }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      setResultado(data.contenido);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el post");
    } finally {
      setGenerando(false);
    }
  }

  async function handleGuardar() {
    if (!resultado) return;
    try {
      await guardarPost({
        tema,
        tono,
        contenido: resultado,
        autorEmail: auth.currentUser?.email ?? "desconocido",
      });
      await cargarHistorial();
    } catch (err) {
      console.error("Error guardando post:", err);
      setError("Se generó el post pero no se pudo guardar en el historial.");
    }
  }

  function handleCopiar(texto: string) {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  async function handleBorrar(id: string) {
    try {
      await borrarPost(id);
      setHistorial((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error borrando post:", err);
    }
  }

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Generador de posts
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-6">
          Generá el texto con IA, copialo, y publicalo a mano en la Página de Facebook (por ahora — la
          publicación automática se suma cuando tengamos la Página y los permisos de Meta aprobados).
        </p>

        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Tema del post
            </label>
            <input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ej: Clase 2 - automatizar WhatsApp"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {TEMAS_SUGERIDOS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTema(t)}
                  className="text-xs font-mono border border-[var(--line)] rounded-full px-3 py-1.5 text-[var(--paper-dim)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Tono
            </label>
            <select
              value={tono}
              onChange={(e) => setTono(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            >
              {TONOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerar}
            disabled={!tema.trim() || generando}
            className="w-full bg-[var(--gold)] text-[#201502] font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {generando ? "Generando..." : "Generar post"}
          </button>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          {resultado && (
            <div className="bg-[var(--bg)] border border-[var(--teal-dim)] rounded-lg p-4 space-y-3">
              <p className="whitespace-pre-wrap text-sm">{resultado}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCopiar(resultado)}
                  className="text-xs font-mono border border-[var(--line)] rounded-full px-4 py-2 hover:border-[var(--teal)] hover:text-[var(--teal)]"
                >
                  {copiado ? "¡Copiado!" : "Copiar texto"}
                </button>
                <button
                  onClick={handleGuardar}
                  className="text-xs font-mono border border-[var(--line)] rounded-full px-4 py-2 hover:border-[var(--teal)] hover:text-[var(--teal)]"
                >
                  Guardar en historial
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Historial
        </h2>
        {cargandoHistorial ? (
          <p className="text-[var(--paper-dim)] text-sm font-mono">Cargando...</p>
        ) : historial.length === 0 ? (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no guardaste ningún post.</p>
        ) : (
          <div className="space-y-3">
            {historial.map((p) => (
              <div key={p.id} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[var(--gold)]">{p.tema}</span>
                  <span className="text-xs font-mono text-[var(--paper-dim)]">
                    {new Date(p.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap mb-3">{p.contenido}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopiar(p.contenido)}
                    className="text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--teal)]"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => handleBorrar(p.id)}
                    className="text-xs font-mono text-[var(--paper-dim)] hover:text-red-400"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
