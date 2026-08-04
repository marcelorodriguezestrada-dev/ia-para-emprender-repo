"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { listarLeads, guardarLead, type Lead } from "@/lib/leads";

const PLANTILLA_INVITACION_ASUNTO = "Tu clase gratuita de IA para Emprender 🎓";
const PLANTILLA_INVITACION_CUERPO = `<p>Hola {{nombre}},</p>
<p>¡Confirmado! Ya tenés tu lugar reservado en la clase gratuita de <b>IA para Emprender</b>.</p>
<p>
  📅 Fecha: {{fecha}}<br/>
  🕐 Hora: {{hora}}<br/>
  🔗 Link de acceso (Meet): <a href="{{link}}">{{link}}</a>
</p>
<p>
  💬 Para seguir en vivo y no perderte nada (avisos, cambios de horario, material extra),
  sumate también al grupo de WhatsApp: <a href="{{grupo}}">{{grupo}}</a>
</p>
<p>Te esperamos ahí. Cualquier duda, respondé este mail.</p>
<p>— IA para Emprender</p>`;

const PLANTILLA_POSTCLASE_ASUNTO = "¿Seguimos? Esto es lo que viene después de la clase 🚀";
const PLANTILLA_POSTCLASE_CUERPO = `<p>Hola {{nombre}},</p>
<p>¡Gracias por venir a la clase! Si te quedaste con ganas de más, esto es lo que sigue:</p>
<p>
  → Si lo que te frenaba era no saber vender o conseguir clientes:<br/>
  <b>IA para Emprender</b> — <a href="{{curso1}}">{{curso1}}</a>
</p>
<p>
  → Si lo que te frenaba era no saber si tu idea sirve, o querés ir más a fondo con la tecnología:<br/>
  <b>De la Idea al Negocio</b> — <a href="{{curso2}}">{{curso2}}</a>
</p>
<p>Cupo limitado porque es grupo reducido, no por apurarte. Cualquier duda, respondé este mail.</p>
<p>— IA para Emprender</p>`;

export default function MailPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const [plantilla, setPlantilla] = useState<"invitacion" | "postclase">("invitacion");
  const [asunto, setAsunto] = useState(PLANTILLA_INVITACION_ASUNTO);
  const [cuerpo, setCuerpo] = useState(PLANTILLA_INVITACION_CUERPO);
  const [fechaISO, setFechaISO] = useState(""); // ej: "2026-08-08", lo que da <input type="date">
  const [horaISO, setHoraISO] = useState(""); // ej: "19:00", lo que da <input type="time">
  const [link, setLink] = useState("");
  const [grupoWhatsapp, setGrupoWhatsapp] = useState("");
  const [linkCurso1, setLinkCurso1] = useState(""); // IA para Emprender
  const [linkCurso2, setLinkCurso2] = useState(""); // De la Idea al Negocio

  function elegirPlantilla(nueva: "invitacion" | "postclase") {
    setPlantilla(nueva);
    if (nueva === "invitacion") {
      setAsunto(PLANTILLA_INVITACION_ASUNTO);
      setCuerpo(PLANTILLA_INVITACION_CUERPO);
    } else {
      setAsunto(PLANTILLA_POSTCLASE_ASUNTO);
      setCuerpo(PLANTILLA_POSTCLASE_CUERPO);
    }
  }
  // Convierte "2026-08-08" en "sábado, 8 de agosto" para que el mail se lea
  // natural, aunque la persona haya elegido la fecha con el selector.
  const fechaFormateada = fechaISO
    ? (() => {
        const texto = new Date(`${fechaISO}T00:00:00`).toLocaleDateString("es-AR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        return texto.charAt(0).toUpperCase() + texto.slice(1);
      })()
    : "";
  const horaFormateada = horaISO ? `${horaISO} hs (Argentina)` : "";

  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ enviados: number; fallidos: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Para cargar a mano a la gente que te escribe directo por WhatsApp,
  // en vez de completar el formulario de /registro.
  const [mostrarFormManual, setMostrarFormManual] = useState(false);
  const [nombreManual, setNombreManual] = useState("");
  const [emailManual, setEmailManual] = useState("");
  const [agregandoManual, setAgregandoManual] = useState(false);
  const [errorManual, setErrorManual] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await listarLeads();
      setLeads(data);
      setSeleccionados(new Set(data.map((l) => l.id))); // todos seleccionados por default
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  function toggleUno(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTodos() {
    setSeleccionados((prev) => (prev.size === leads.length ? new Set() : new Set(leads.map((l) => l.id))));
  }

  async function handleAgregarManual() {
    setErrorManual(null);
    if (!nombreManual.trim() || !emailManual.trim()) {
      setErrorManual("Completá nombre y mail.");
      return;
    }
    setAgregandoManual(true);
    try {
      await guardarLead({
        nombre: nombreManual.trim(),
        email: emailManual.trim(),
        utmSource: "whatsapp",
        utmMedium: "manual",
      });
      setNombreManual("");
      setEmailManual("");
      setMostrarFormManual(false);
      await cargar();
    } catch (err) {
      console.error(err);
      setErrorManual("No se pudo agregar. Probá de nuevo.");
    } finally {
      setAgregandoManual(false);
    }
  }

  async function handleEnviar() {
    setError(null);
    setResultado(null);

    const destinatarios = leads
      .filter((l) => seleccionados.has(l.id))
      .map((l) => ({ email: l.email, nombre: l.nombre }));

    if (destinatarios.length === 0) {
      setError("Seleccioná al menos un inscripto.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/enviar-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatarios,
          asunto,
          cuerpoHtml: cuerpo,
          variablesExtra: {
            fecha: fechaFormateada,
            hora: horaFormateada,
            link,
            grupo: grupoWhatsapp,
            curso1: linkCurso1,
            curso2: linkCurso2,
          },
          solicitanteEmail: auth.currentUser?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");

      const enviados = data.resultados.filter((r: { ok: boolean }) => r.ok).length;
      const fallidos = data.resultados.length - enviados;
      setResultado({ enviados, fallidos });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el mail");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Enviar mail a inscriptos
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-6">
          {cargando ? "Cargando..." : `${leads.length} personas registradas en total.`}
        </p>

        <div className="mb-4">
          {!mostrarFormManual ? (
            <button
              onClick={() => setMostrarFormManual(true)}
              className="text-xs font-mono border border-[var(--line)] text-[var(--paper-dim)] px-4 py-2 rounded-lg hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              💬 Agregar alguien que te escribió por WhatsApp
            </button>
          ) : (
            <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4 space-y-3">
              <p className="text-xs text-[var(--paper-dim)]">
                Para cuando alguien te pide anotarse directo por WhatsApp, sin pasar por el formulario.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={nombreManual}
                  onChange={(e) => setNombreManual(e.target.value)}
                  placeholder="Nombre"
                  className="bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
                />
                <input
                  value={emailManual}
                  onChange={(e) => setEmailManual(e.target.value)}
                  placeholder="Mail"
                  type="email"
                  className="bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
                />
              </div>
              {errorManual && <p className="text-red-400 text-xs">{errorManual}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleAgregarManual}
                  disabled={agregandoManual}
                  className="text-xs font-mono bg-[var(--teal)] text-[#06201A] font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {agregandoManual ? "Agregando..." : "Agregar a la lista"}
                </button>
                <button
                  onClick={() => setMostrarFormManual(false)}
                  className="text-xs font-mono text-[var(--paper-dim)] px-4 py-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {!cargando && leads.length === 0 && (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no hay nadie registrado en /registro.</p>
        )}

        {!cargando && leads.length > 0 && (
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg)] border-b border-[var(--line)]">
              <input
                type="checkbox"
                checked={seleccionados.size === leads.length}
                onChange={toggleTodos}
                className="w-4 h-4"
              />
              <span className="text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)]">
                {seleccionados.size} de {leads.length} seleccionados
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {leads.map((lead) => (
                <label
                  key={lead.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--line)] last:border-none text-sm cursor-pointer hover:bg-[var(--bg)]"
                >
                  <input
                    type="checkbox"
                    checked={seleccionados.has(lead.id)}
                    onChange={() => toggleUno(lead.id)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">{lead.nombre}</span>
                  <span className="text-[var(--paper-dim)] text-xs">{lead.email}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Qué mail mandás
        </h2>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => elegirPlantilla("invitacion")}
            className={`text-sm font-semibold px-4 py-2.5 rounded-lg border ${
              plantilla === "invitacion"
                ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10"
                : "border-[var(--line)] text-[var(--paper-dim)]"
            }`}
          >
            📩 Invitación a la clase (antes)
          </button>
          <button
            onClick={() => elegirPlantilla("postclase")}
            className={`text-sm font-semibold px-4 py-2.5 rounded-lg border ${
              plantilla === "postclase"
                ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10"
                : "border-[var(--line)] text-[var(--paper-dim)]"
            }`}
          >
            🚀 Oferta de los cursos (después)
          </button>
        </div>

        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Datos de la clase
        </h2>
        {plantilla === "invitacion" ? (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={fechaISO}
                onChange={(e) => setFechaISO(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)] [color-scheme:dark]"
              />
              {fechaFormateada && (
                <p className="text-xs text-[var(--teal)] mt-1.5">Se va a ver así: {fechaFormateada}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Hora
              </label>
              <input
                type="time"
                value={horaISO}
                onChange={(e) => setHoraISO(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)] [color-scheme:dark]"
              />
              {horaFormateada && (
                <p className="text-xs text-[var(--teal)] mt-1.5">Se va a ver así: {horaFormateada}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Link de acceso
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Grupo WhatsApp (en vivo)
              </label>
              <input
                value={grupoWhatsapp}
                onChange={(e) => setGrupoWhatsapp(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Link — IA para Emprender
              </label>
              <input
                value={linkCurso1}
                onChange={(e) => setLinkCurso1(e.target.value)}
                placeholder="https://.../registro o el link de venta"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Link — De la Idea al Negocio
              </label>
              <input
                value={linkCurso2}
                onChange={(e) => setLinkCurso2(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
            Asunto
          </label>
          <input
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
          />
        </div>

        <div className="mb-2">
          <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
            Cuerpo del mail (HTML) — usá {"{{nombre}}"}
            {plantilla === "invitacion"
              ? <>, {"{{fecha}}"}, {"{{hora}}"}, {"{{link}}"}, {"{{grupo}}"}</>
              : <>, {"{{curso1}}"}, {"{{curso2}}"}</>}
          </label>
          <textarea
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            rows={10}
            className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--teal)]"
          />
        </div>

        <button
          onClick={handleEnviar}
          disabled={enviando || seleccionados.size === 0}
          className="w-full bg-[var(--gold)] text-[#201502] font-bold py-3 rounded-lg disabled:opacity-50 mt-4"
        >
          {enviando ? "Enviando..." : `✉️ Enviar a ${seleccionados.size} ${seleccionados.size === 1 ? "persona" : "personas"}`}
        </button>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        {resultado && (
          <p className="text-sm mt-3">
            <span className="text-green-400">{resultado.enviados} enviados</span>
            {resultado.fallidos > 0 && <span className="text-red-400"> · {resultado.fallidos} fallidos</span>}
          </p>
        )}
      </section>
    </div>
  );
}
