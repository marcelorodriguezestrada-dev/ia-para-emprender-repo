"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { listarLeads, guardarLead, type Lead } from "@/lib/leads";
import { listarAlumnos, type Alumno } from "@/lib/alumnos";
import { listarMateriales, type Material } from "@/lib/materiales";

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

const EMOJI_TIPO: Record<string, string> = {
  diapositivas: "📊",
  video: "🎥",
  acceso: "🔗",
  otro: "📎",
};

type Audiencia = "leads" | "alumnos";
type PlantillaId = "invitacion" | "postclase" | "materiales";
type Persona = { id: string; nombre: string; email: string; estado?: string };

function CopyBtn({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className={`text-xs font-mono border rounded-full px-3 py-1.5 whitespace-nowrap ${
        copied ? "border-green-500/40 text-green-400" : "border-[var(--line)] text-[var(--paper-dim)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
      }`}
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
}

export default function MailPage() {
  const [audiencia, setAudiencia] = useState<Audiencia>("leads");
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const [plantilla, setPlantilla] = useState<PlantillaId>("invitacion");
  const [asunto, setAsunto] = useState(PLANTILLA_INVITACION_ASUNTO);
  const [cuerpo, setCuerpo] = useState(PLANTILLA_INVITACION_CUERPO);
  const [fechaISO, setFechaISO] = useState("");
  const [horaISO, setHoraISO] = useState("");
  const [link, setLink] = useState("");
  const [grupoWhatsapp, setGrupoWhatsapp] = useState("");
  const [linkCurso1, setLinkCurso1] = useState("");
  const [linkCurso2, setLinkCurso2] = useState("");

  // Para la plantilla de materiales
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [claseElegida, setClaseElegida] = useState("");

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

  const [mostrarFormManual, setMostrarFormManual] = useState(false);
  const [nombreManual, setNombreManual] = useState("");
  const [emailManual, setEmailManual] = useState("");
  const [agregandoManual, setAgregandoManual] = useState(false);
  const [errorManual, setErrorManual] = useState<string | null>(null);

  useEffect(() => {
    cargarPersonas("leads");
    cargarMateriales();
  }, []);

  async function cargarPersonas(quien: Audiencia) {
    setCargando(true);
    try {
      if (quien === "leads") {
        const data = await listarLeads();
        const mapeadas = data.map((l) => ({ id: l.id, nombre: l.nombre, email: l.email }));
        setPersonas(mapeadas);
        setSeleccionados(new Set(mapeadas.map((p) => p.id)));
      } else {
        const data = await listarAlumnos();
        const mapeadas = data.map((a) => ({ id: a.id, nombre: a.nombre, email: a.email, estado: a.estado }));
        setPersonas(mapeadas);
        // Por seguridad, para alumnos solo se preseleccionan los que ya pagaron
        setSeleccionados(new Set(mapeadas.filter((p) => p.estado === "pagado").map((p) => p.id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function cargarMateriales() {
    try {
      setMateriales(await listarMateriales());
    } catch (err) {
      console.error(err);
    }
  }

  function cambiarAudiencia(nueva: Audiencia) {
    setAudiencia(nueva);
    cargarPersonas(nueva);
  }

  function elegirPlantilla(nueva: PlantillaId) {
    setPlantilla(nueva);
    if (nueva === "invitacion") {
      setAsunto(PLANTILLA_INVITACION_ASUNTO);
      setCuerpo(PLANTILLA_INVITACION_CUERPO);
    } else if (nueva === "postclase") {
      setAsunto(PLANTILLA_POSTCLASE_ASUNTO);
      setCuerpo(PLANTILLA_POSTCLASE_CUERPO);
    } else {
      setAsunto("");
      setCuerpo("");
    }
  }

  const clasesDisponibles = Array.from(new Set(materiales.map((m) => m.clase)));
  const materialesDeLaClase = materiales.filter((m) => m.clase === claseElegida);

  function generarHtmlMateriales(): string {
    const items = materialesDeLaClase
      .map((m) => `<li>${EMOJI_TIPO[m.tipo] ?? "📎"} <a href="${m.url}">${m.titulo}</a>${m.notas ? ` — ${m.notas}` : ""}</li>`)
      .join("\n");
    return `<p>Hola {{nombre}},</p>
<p>Acá tenés el material de <b>${claseElegida}</b>:</p>
<ul>
${items}
</ul>
<p>Cualquier duda, respondé este mail o escribinos por el grupo.</p>
<p>— IA para Emprender</p>`;
  }

  function generarTextoWhatsapp(): string {
    const items = materialesDeLaClase
      .map((m) => `${EMOJI_TIPO[m.tipo] ?? "📎"} ${m.titulo}: ${m.url}${m.notas ? ` (${m.notas})` : ""}`)
      .join("\n");
    return `📚 Material de ${claseElegida}\n\n${items}\n\nCualquier duda, la charlamos acá mismo.`;
  }

  function handleCargarMaterialesEnMail() {
    if (!claseElegida) return;
    setAsunto(`Material de ${claseElegida} — IA para Emprender`);
    setCuerpo(generarHtmlMateriales());
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
    setSeleccionados((prev) => (prev.size === personas.length ? new Set() : new Set(personas.map((p) => p.id))));
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
      if (audiencia === "leads") await cargarPersonas("leads");
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

    const destinatarios = personas
      .filter((p) => seleccionados.has(p.id))
      .map((p) => ({ email: p.email, nombre: p.nombre }));

    if (destinatarios.length === 0) {
      setError("Seleccioná al menos una persona.");
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
          Enviar mail
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-4">
          {cargando ? "Cargando..." : `${personas.length} personas en esta lista.`}
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => cambiarAudiencia("leads")}
            className={`text-sm font-semibold px-4 py-2 rounded-lg border ${
              audiencia === "leads"
                ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10"
                : "border-[var(--line)] text-[var(--paper-dim)]"
            }`}
          >
            🎓 Inscriptos a la clase gratuita
          </button>
          <button
            onClick={() => cambiarAudiencia("alumnos")}
            className={`text-sm font-semibold px-4 py-2 rounded-lg border ${
              audiencia === "alumnos"
                ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10"
                : "border-[var(--line)] text-[var(--paper-dim)]"
            }`}
          >
            💼 Alumnos del curso pago
          </button>
        </div>

        {audiencia === "leads" && (
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
                  <button onClick={() => setMostrarFormManual(false)} className="text-xs font-mono text-[var(--paper-dim)] px-4 py-2">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!cargando && personas.length === 0 && (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no hay nadie en esta lista.</p>
        )}

        {!cargando && personas.length > 0 && (
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg)] border-b border-[var(--line)]">
              <input type="checkbox" checked={seleccionados.size === personas.length} onChange={toggleTodos} className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)]">
                {seleccionados.size} de {personas.length} seleccionados
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {personas.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--line)] last:border-none text-sm cursor-pointer hover:bg-[var(--bg)]"
                >
                  <input type="checkbox" checked={seleccionados.has(p.id)} onChange={() => toggleUno(p.id)} className="w-4 h-4" />
                  <span className="flex-1">{p.nombre}</span>
                  {p.estado && (
                    <span
                      className={`text-[0.65rem] font-mono px-2 py-0.5 rounded-full ${
                        p.estado === "pagado" ? "text-green-400 bg-green-500/10" : "text-[var(--gold)] bg-[var(--gold)]/10"
                      }`}
                    >
                      {p.estado === "pagado" ? "Pagado" : "Pendiente"}
                    </span>
                  )}
                  <span className="text-[var(--paper-dim)] text-xs">{p.email}</span>
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
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => elegirPlantilla("invitacion")}
            className={`text-sm font-semibold px-4 py-2.5 rounded-lg border ${
              plantilla === "invitacion" ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10" : "border-[var(--line)] text-[var(--paper-dim)]"
            }`}
          >
            📩 Invitación a la clase (antes)
          </button>
          <button
            onClick={() => elegirPlantilla("postclase")}
            className={`text-sm font-semibold px-4 py-2.5 rounded-lg border ${
              plantilla === "postclase" ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10" : "border-[var(--line)] text-[var(--paper-dim)]"
            }`}
          >
            🚀 Oferta de los cursos (después)
          </button>
          <button
            onClick={() => elegirPlantilla("materiales")}
            className={`text-sm font-semibold px-4 py-2.5 rounded-lg border ${
              plantilla === "materiales" ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10" : "border-[var(--line)] text-[var(--paper-dim)]"
            }`}
          >
            📚 Materiales de una clase
          </button>
        </div>

        {plantilla === "invitacion" && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Fecha</label>
              <input
                type="date"
                value={fechaISO}
                onChange={(e) => setFechaISO(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)] [color-scheme:dark]"
              />
              {fechaFormateada && <p className="text-xs text-[var(--teal)] mt-1.5">Se va a ver así: {fechaFormateada}</p>}
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Hora</label>
              <input
                type="time"
                value={horaISO}
                onChange={(e) => setHoraISO(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)] [color-scheme:dark]"
              />
              {horaFormateada && <p className="text-xs text-[var(--teal)] mt-1.5">Se va a ver así: {horaFormateada}</p>}
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Link de acceso</label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Grupo WhatsApp (en vivo)</label>
              <input
                value={grupoWhatsapp}
                onChange={(e) => setGrupoWhatsapp(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
          </div>
        )}

        {plantilla === "postclase" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Link — IA para Emprender</label>
              <input
                value={linkCurso1}
                onChange={(e) => setLinkCurso1(e.target.value)}
                placeholder="https://.../registro o el link de venta"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Link — De la Idea al Negocio</label>
              <input
                value={linkCurso2}
                onChange={(e) => setLinkCurso2(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
          </div>
        )}

        {plantilla === "materiales" && (
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5 mb-6 space-y-4">
            {clasesDisponibles.length === 0 ? (
              <p className="text-sm text-[var(--paper-dim)]">
                Todavía no cargaste ningún material. Andá a la pestaña <b>Materiales</b> primero.
              </p>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Clase</label>
                  <select
                    value={claseElegida}
                    onChange={(e) => setClaseElegida(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
                  >
                    <option value="">Elegí una clase...</option>
                    {clasesDisponibles.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {claseElegida && materialesDeLaClase.length > 0 && (
                  <div className="space-y-2">
                    {materialesDeLaClase.map((m) => (
                      <div key={m.id} className="text-sm text-[var(--paper-dim)] flex items-center gap-2">
                        <span>{EMOJI_TIPO[m.tipo] ?? "📎"}</span>
                        <span>{m.titulo}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCargarMaterialesEnMail}
                    disabled={!claseElegida}
                    className="text-xs font-mono bg-[var(--teal)] text-[#06201A] font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
                  >
                    Cargar en el mail de abajo
                  </button>
                  {claseElegida && materialesDeLaClase.length > 0 && (
                    <CopyBtn text={generarTextoWhatsapp()} label="📋 Copiar para el grupo de WhatsApp" />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">Asunto</label>
          <input
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
          />
        </div>

        <div className="mb-2">
          <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
            Cuerpo del mail (HTML) — usá {"{{nombre}}"}
            {plantilla === "invitacion" && <>, {"{{fecha}}"}, {"{{hora}}"}, {"{{link}}"}, {"{{grupo}}"}</>}
            {plantilla === "postclase" && <>, {"{{curso1}}"}, {"{{curso2}}"}</>}
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
