"use client";

import { useEffect, useState } from "react";
import {
  crearCampana,
  listarCampanas,
  borrarCampana,
  construirUrlConUtm,
  type Campana,
} from "@/lib/campanas";
import { DESTINOS_SUGERIDOS } from "@/lib/config";

const FUENTES = ["facebook", "whatsapp", "instagram", "google", "otro"];
const MEDIOS = ["social", "cpc", "referral", "organic", "email"];

export default function UtmPage() {
  const [origin, setOrigin] = useState("");
  const [nombre, setNombre] = useState("");
  const [urlDestino, setUrlDestino] = useState("");
  const [utmSource, setUtmSource] = useState(FUENTES[0]);
  const [utmMedium, setUtmMedium] = useState(MEDIOS[0]);
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [cargando, setCargando] = useState(true);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      setCampanas(await listarCampanas());
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear() {
    if (!nombre.trim() || !urlDestino.trim() || !utmCampaign.trim()) {
      setError("Completá al menos nombre, URL destino y nombre de campaña.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      new URL(urlDestino, origin || "https://placeholder.com"); // valida que sea una URL o path bien formado
      await crearCampana({
        nombre,
        urlDestino,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent: utmContent || undefined,
      });
      setNombre("");
      setUtmCampaign("");
      setUtmContent("");
      await cargar();
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("Invalid URL")
          ? "La URL destino no es válida. Tiene que empezar con https://"
          : "No se pudo crear la campaña."
      );
    } finally {
      setGuardando(false);
    }
  }

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 1800);
  }

  async function handleBorrar(id: string) {
    try {
      await borrarCampana(id);
      setCampanas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Links UTM
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-6">
          Creá una campaña por cada lugar donde compartís el link (post de Facebook, historia de
          Instagram, mensaje de WhatsApp). Compartís el <b>link corto que te genera acá</b> — ese es el
          que cuenta los clics. El link UTM largo también queda disponible por si lo necesitás para
          pautar en Meta Ads directamente.
        </p>

        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Nombre de la campaña (para reconocerla en la lista)
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Difusión día 1 - post Facebook"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              URL destino
            </label>
            <input
              value={urlDestino}
              onChange={(e) => setUrlDestino(e.target.value)}
              placeholder="/registro (o una URL completa si es externa)"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {DESTINOS_SUGERIDOS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setUrlDestino(d.url)}
                  className="text-xs font-mono border border-[var(--line)] rounded-full px-3 py-1.5 text-[var(--paper-dim)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Fuente (utm_source)
              </label>
              <select
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              >
                {FUENTES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Medio (utm_medium)
              </label>
              <select
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              >
                {MEDIOS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Campaña (utm_campaign)
              </label>
              <input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="lanzamiento-diciembre"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Contenido (opcional)
              </label>
              <input
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                placeholder="post-clase1"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
          </div>

          <button
            onClick={handleCrear}
            disabled={guardando}
            className="w-full bg-[var(--gold)] text-[#201502] font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {guardando ? "Creando..." : "Crear campaña y generar link"}
          </button>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Tus campañas
        </h2>
        {cargando ? (
          <p className="text-[var(--paper-dim)] text-sm font-mono">Cargando...</p>
        ) : campanas.length === 0 ? (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no creaste ninguna campaña.</p>
        ) : (
          <div className="space-y-3">
            {campanas.map((c) => {
              const linkCorto = `${origin}/go/${c.id}`;
              const linkLargo = construirUrlConUtm(c, origin);
              return (
                <div key={c.id} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{c.nombre}</span>
                    <span className="font-mono text-xs bg-[var(--teal)] text-[#06201A] rounded-full px-3 py-1">
                      {c.clics} {c.clics === 1 ? "clic" : "clics"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded px-3 py-2 truncate">
                        {linkCorto}
                      </code>
                      <button
                        onClick={() => copiar(linkCorto, c.id + "-corto")}
                        className="text-xs font-mono border border-[var(--line)] rounded-full px-3 py-2 hover:border-[var(--teal)] hover:text-[var(--teal)] whitespace-nowrap"
                      >
                        {copiadoId === c.id + "-corto" ? "¡Copiado!" : "Copiar link corto"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-[var(--paper-dim)] bg-[var(--bg)] border border-[var(--line)] rounded px-3 py-2 truncate">
                        {linkLargo}
                      </code>
                      <button
                        onClick={() => copiar(linkLargo, c.id + "-largo")}
                        className="text-xs font-mono border border-[var(--line)] rounded-full px-3 py-2 hover:border-[var(--teal)] hover:text-[var(--teal)] whitespace-nowrap"
                      >
                        {copiadoId === c.id + "-largo" ? "¡Copiado!" : "Copiar link UTM"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBorrar(c.id)}
                    className="text-xs font-mono text-[var(--paper-dim)] hover:text-red-400 mt-3"
                  >
                    Borrar campaña
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
