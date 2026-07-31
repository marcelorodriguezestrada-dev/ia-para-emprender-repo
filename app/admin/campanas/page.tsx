"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { crearCampana } from "@/lib/campanas";
import { DESTINOS_SUGERIDOS } from "@/lib/config";
import {
  guardarCampanaGenerada,
  listarCampanasGeneradas,
  borrarCampanaGenerada,
  type CampanaGenerada,
  type PostGenerado,
} from "@/lib/campanasGeneradas";

const REDES = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "facebook", label: "Facebook", emoji: "👥" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "whatsapp", label: "WhatsApp", emoji: "💬" },
];
const OBJETIVOS = [
  "Anotar gente a la clase gratuita",
  "Vender el curso completo",
  "Generar awareness de la marca",
  "Últimos cupos antes de que cierre",
];
const TONOS = ["Motivacional", "Educativo/valor", "Urgencia", "Historia personal"];

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className={`text-xs font-mono border rounded-full px-3 py-1.5 whitespace-nowrap ${
        copied
          ? "border-green-500/40 text-green-400"
          : "border-[var(--line)] text-[var(--paper-dim)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
      }`}
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

function PostCard({ post, idx }: { post: PostGenerado; idx: number }) {
  return (
    <div className="bg-[var(--bg)] border border-[var(--line)] rounded-lg p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.68rem] font-mono uppercase tracking-wide text-[var(--paper-dim)]">
          Post {idx + 1} · {post.formato}
        </span>
        <div className="flex items-center gap-2">
          {post.hora_optima && (
            <span className="text-[0.68rem] bg-[var(--panel)] px-2 py-0.5 rounded-full text-[var(--paper-dim)]">
              🕐 {post.hora_optima}
            </span>
          )}
          <CopyBtn text={`${post.texto}\n\n${post.hashtags}`} />
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap">{post.texto}</p>
      {post.hashtags && <p className="text-xs text-[var(--teal)]">{post.hashtags}</p>}
      {post.cta && (
        <p className="text-xs text-[var(--paper-dim)] bg-[var(--panel)] border border-[var(--line)] rounded px-2.5 py-1.5">
          CTA: {post.cta}
        </p>
      )}
      {post.tip_visual && (
        <p className="text-xs text-[var(--paper-dim)]">🎨 Visual: {post.tip_visual}</p>
      )}
    </div>
  );
}

export default function CampanasPage() {
  const [origin, setOrigin] = useState("");
  const [red, setRed] = useState("instagram");
  const [objetivo, setObjetivo] = useState(OBJETIVOS[0]);
  const [tono, setTono] = useState(TONOS[0]);
  const [cantPosts, setCantPosts] = useState(5);
  const [oferta, setOferta] = useState("");
  const [destino, setDestino] = useState(DESTINOS_SUGERIDOS[1]); // "Registro clase gratuita" por defecto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campana, setCampana] = useState<any>(null);
  const [linksConSeguimiento, setLinksConSeguimiento] = useState<
    { label: string; url: string; campanaUtmId: string }[]
  >([]);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [historial, setHistorial] = useState<CampanaGenerada[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  useEffect(() => {
    setOrigin(window.location.origin);
    cargarHistorial();
  }, []);

  async function cargarHistorial() {
    setCargandoHistorial(true);
    try {
      setHistorial(await listarCampanasGeneradas());
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoHistorial(false);
    }
  }

  async function handleGenerar() {
    setLoading(true);
    setError(null);
    setCampana(null);
    setLinksConSeguimiento([]);
    setGuardado(false);

    const slugCampana = slugify(`${objetivo}-${red}-${Date.now().toString().slice(-4)}`);
    const esRedDeBio = red === "instagram" || red === "tiktok";

    try {
      const res = await fetch("/api/generar-campana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ red, objetivo, tono, cantPosts, oferta, destinoLabel: destino.label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");

      const links: { label: string; url: string; campanaUtmId: string }[] = [];

      if (esRedDeBio) {
        // Instagram/TikTok: un único link de bio para toda la campaña
        // (no se puede clickear un link distinto en cada post).
        const bioLink = await crearCampana({
          nombre: `${data.titulo_campana} — Link de bio (${red})`,
          urlDestino: destino.url,
          utmSource: red,
          utmMedium: "bio",
          utmCampaign: slugCampana,
        });
        links.push({ label: "Link de bio", url: `${origin}/go/${bioLink.id}`, campanaUtmId: bioLink.id });
        // Los posts ya vienen con "👆 Link en bio" en el texto, no hace falta tocar nada.
      } else {
        // Facebook/WhatsApp: un link por post, y lo insertamos DENTRO del
        // texto reemplazando el placeholder {{LINK}} — así el post queda
        // 100% listo para copiar y pegar tal cual, con el link ya adentro.
        for (let i = 0; i < (data.posts?.length ?? 0); i++) {
          const nueva = await crearCampana({
            nombre: `${data.titulo_campana} — Post ${i + 1} (${red})`,
            urlDestino: destino.url,
            utmSource: red,
            utmMedium: "post",
            utmCampaign: slugCampana,
            utmContent: `post-${i + 1}`,
          });
          const url = `${origin}/go/${nueva.id}`;
          links.push({ label: `Post ${i + 1}`, url, campanaUtmId: nueva.id });

          if (data.posts?.[i]?.texto) {
            data.posts[i].texto = data.posts[i].texto.replace("{{LINK}}", url);
          }
        }
      }

      setCampana(data);
      setLinksConSeguimiento(links);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la campaña");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuardar() {
    if (!campana) return;
    setGuardando(true);
    try {
      await guardarCampanaGenerada({
        titulo_campana: campana.titulo_campana,
        concepto: campana.concepto,
        publico_objetivo: campana.publico_objetivo,
        red,
        objetivo,
        tono,
        posts: campana.posts ?? [],
        calendario: campana.calendario ?? [],
        utm_links: linksConSeguimiento,
        kpis: campana.kpis ?? [],
        presupuesto_sugerido: campana.presupuesto_sugerido ?? "",
        autorEmail: auth.currentUser?.email ?? "desconocido",
      });
      setGuardado(true);
      await cargarHistorial();
    } catch (err) {
      console.error(err);
      setError("Se generó la campaña pero no se pudo guardar en el historial.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleBorrarHistorial(id: string) {
    try {
      await borrarCampanaGenerada(id);
      setHistorial((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const redActual = REDES.find((r) => r.id === red);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Campañas con IA
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-6">
          Generá una campaña completa (varios posts + calendario + links con seguimiento de clics) de una
          sola vez, en vez de post por post.
        </p>

        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Red social
            </label>
            <div className="flex flex-wrap gap-2">
              {REDES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRed(r.id)}
                  className={`text-sm font-semibold px-3 py-2 rounded-lg border ${
                    red === r.id
                      ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10"
                      : "border-[var(--line)] text-[var(--paper-dim)]"
                  }`}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Objetivo
              </label>
              <select
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              >
                {OBJETIVOS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Tono
              </label>
              <select
                value={tono}
                onChange={(e) => setTono(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              >
                {TONOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Cant. posts
              </label>
              <select
                value={cantPosts}
                onChange={(e) => setCantPosts(Number(e.target.value))}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} posts
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              A dónde apunta el link
            </label>
            <div className="flex flex-wrap gap-2">
              {DESTINOS_SUGERIDOS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDestino(d)}
                  className={`text-xs font-mono border rounded-full px-3 py-1.5 ${
                    destino.label === d.label
                      ? "border-[var(--teal)] text-[var(--teal)]"
                      : "border-[var(--line)] text-[var(--paper-dim)]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Oferta especial (opcional)
            </label>
            <input
              value={oferta}
              onChange={(e) => setOferta(e.target.value)}
              placeholder="Ej: precio de lanzamiento por tiempo limitado"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
          </div>

          <button
            onClick={handleGenerar}
            disabled={loading}
            className="w-full bg-[var(--gold)] text-[#201502] font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? `Generando campaña para ${redActual?.label}...` : `🚀 Generar campaña para ${redActual?.label}`}
          </button>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </section>

      {campana && (
        <section className="space-y-5">
          <div className="bg-[var(--panel)] border border-[var(--teal-dim)] rounded-2xl p-6">
            <h2 className="text-lg font-bold" style={{ fontFamily: "Unbounded, sans-serif" }}>
              {campana.titulo_campana}
            </h2>
            <p className="text-[var(--paper-dim)] text-sm mt-1">{campana.concepto}</p>
            <p className="text-[var(--paper-dim)] text-xs mt-1">👥 {campana.publico_objetivo}</p>
            {campana.kpis?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {campana.kpis.map((k: string) => (
                  <span
                    key={k}
                    className="text-xs px-3 py-1 rounded-full bg-[var(--teal)]/10 border border-[var(--teal)]/20 text-[var(--teal)]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
            {campana.presupuesto_sugerido && (
              <p className="text-xs text-[var(--paper-dim)] mt-3">
                💰 Presupuesto: {campana.presupuesto_sugerido}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-mono uppercase tracking-wide text-[var(--gold)] mb-3">
              📝 {campana.posts?.length} posts generados
            </h3>
            <div className="space-y-3">
              {campana.posts?.map((post: PostGenerado, i: number) => (
                <PostCard key={i} post={post} idx={i} />
              ))}
            </div>
          </div>

          {campana.calendario?.length > 0 && (
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
              <h3 className="text-sm font-mono uppercase tracking-wide text-[var(--gold)] mb-3">
                📅 Calendario sugerido
              </h3>
              <div className="space-y-2">
                {campana.calendario.map((c: { dia: number; post_idx: number; nota: string }, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-[var(--line)] last:border-none text-sm"
                  >
                    <span className="bg-[var(--teal)]/10 border border-[var(--teal)]/20 text-[var(--teal)] px-2.5 py-0.5 rounded-full text-xs font-mono flex-shrink-0">
                      Día {c.dia}
                    </span>
                    <span className="text-[var(--paper-dim)] flex-1">
                      Post {c.post_idx + 1} — {c.nota}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {linksConSeguimiento.length > 0 && (
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
              <h3 className="text-sm font-mono uppercase tracking-wide text-[var(--gold)] mb-3">
                🔗 {red === "instagram" || red === "tiktok" ? "Link de bio" : "Links de seguimiento (uno por post)"}
              </h3>
              <p className="text-xs text-[var(--paper-dim)] mb-3">
                {red === "instagram" || red === "tiktok"
                  ? "Pegá este único link en tu bio — cada post ya dice \"link en bio\", y acá abajo ves cuántos clics trajo en total."
                  : "Cada post de arriba ya tiene su link insertado en el texto — copialo y pegalo tal cual. Estos links son los mismos, por si los necesitás sueltos."}
              </p>
              <div className="space-y-2">
                {linksConSeguimiento.map((l) => (
                  <div key={l.campanaUtmId} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--paper-dim)] w-20 flex-shrink-0">{l.label}</span>
                    <code className="flex-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded px-3 py-2 truncate">
                      {l.url}
                    </code>
                    <CopyBtn text={l.url} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleGenerar}
              disabled={loading}
              className="text-sm font-mono border border-[var(--line)] text-[var(--paper-dim)] px-5 py-2.5 rounded-lg hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              ↺ Regenerar campaña
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando || guardado}
              className={`text-sm font-mono px-5 py-2.5 rounded-lg border ${
                guardado
                  ? "border-green-500/40 text-green-400"
                  : "border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)]/10"
              }`}
            >
              {guardado ? "✓ Campaña guardada" : guardando ? "Guardando..." : "💾 Guardar campaña"}
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Historial de campañas
        </h2>
        {cargandoHistorial ? (
          <p className="text-[var(--paper-dim)] text-sm font-mono">Cargando...</p>
        ) : historial.length === 0 ? (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no guardaste ninguna campaña.</p>
        ) : (
          <div className="space-y-3">
            {historial.map((c) => (
              <div key={c.id} className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{c.titulo_campana}</span>
                  <span className="text-xs font-mono text-[var(--paper-dim)]">
                    {REDES.find((r) => r.id === c.red)?.emoji} {c.red} ·{" "}
                    {new Date(c.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <p className="text-xs text-[var(--paper-dim)] mb-2">{c.concepto}</p>
                <p className="text-xs text-[var(--paper-dim)] mb-3">
                  {c.posts?.length ?? 0} posts · {c.utm_links?.length ?? 0} links con seguimiento
                </p>
                <button
                  onClick={() => handleBorrarHistorial(c.id)}
                  className="text-xs font-mono text-[var(--paper-dim)] hover:text-red-400"
                >
                  Borrar del historial
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
