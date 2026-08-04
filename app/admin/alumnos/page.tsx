"use client";

import { useEffect, useState } from "react";
import {
  listarAlumnos,
  actualizarEstadoAlumno,
  actualizarNotasAlumno,
  type Alumno,
} from "@/lib/alumnos";

function TarjetaAlumno({ alumno, onCambio }: { alumno: Alumno; onCambio: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [notas, setNotas] = useState(alumno.notas);
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const [notasGuardadas, setNotasGuardadas] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  async function handleGuardarNotas() {
    setGuardandoNotas(true);
    try {
      await actualizarNotasAlumno(alumno.id, notas);
      setNotasGuardadas(true);
    } catch (err) {
      console.error(err);
    } finally {
      setGuardandoNotas(false);
    }
  }

  async function handleToggleEstado() {
    setCambiandoEstado(true);
    try {
      await actualizarEstadoAlumno(alumno.id, alumno.estado === "pagado" ? "pendiente_pago" : "pagado");
      onCambio();
    } catch (err) {
      console.error(err);
    } finally {
      setCambiandoEstado(false);
    }
  }

  return (
    <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`text-[0.65rem] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0 ${
              alumno.estado === "pagado"
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30"
            }`}
          >
            {alumno.estado === "pagado" ? "Pagado" : "Pendiente de pago"}
          </span>
          <span className="font-semibold text-sm truncate">{alumno.nombre}</span>
          <span className="text-xs text-[var(--paper-dim)] truncate hidden sm:inline">{alumno.email}</span>
        </div>
        <span className="text-[var(--paper-dim)] text-xs flex-shrink-0">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--line)] pt-4">
          <div className="flex flex-wrap gap-3 text-xs text-[var(--paper-dim)]">
            <span>📧 {alumno.email}</span>
            {alumno.whatsapp && <span>📱 {alumno.whatsapp}</span>}
            <span>🗓️ {new Date(alumno.created_at).toLocaleDateString("es-AR")}</span>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-[var(--gold)] mb-2">
              Su idea de negocio
            </p>
            <p className="text-sm bg-[var(--bg)] border border-[var(--line)] rounded-lg p-3 whitespace-pre-wrap">
              {alumno.idea || "No contó nada todavía."}
            </p>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-[var(--gold)] mb-2">
              Tus notas (privadas, para acompañarlo clase a clase)
            </p>
            <textarea
              value={notas}
              onChange={(e) => {
                setNotas(e.target.value);
                setNotasGuardadas(false);
              }}
              rows={4}
              placeholder="Ej: sugerirle enfocar en un solo producto para la Clase 3. Ya tiene Instagram armado, falta automatizar WhatsApp..."
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleGuardarNotas}
                disabled={guardandoNotas || notasGuardadas}
                className="text-xs font-mono border border-[var(--teal)] text-[var(--teal)] px-3 py-1.5 rounded-lg disabled:opacity-40"
              >
                {guardandoNotas ? "Guardando..." : notasGuardadas ? "Guardado ✓" : "Guardar notas"}
              </button>
            </div>
          </div>

          <button
            onClick={handleToggleEstado}
            disabled={cambiandoEstado}
            className="text-xs font-mono border border-[var(--line)] px-4 py-2 rounded-lg text-[var(--paper-dim)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
          >
            {alumno.estado === "pagado" ? "↺ Marcar como pendiente" : "✓ Marcar como pagado"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "pendiente_pago" | "pagado">("todos");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      setAlumnos(await listarAlumnos());
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  const filtrados = alumnos.filter((a) => filtro === "todos" || a.estado === filtro);
  const pendientes = alumnos.filter((a) => a.estado === "pendiente_pago").length;
  const pagados = alumnos.filter((a) => a.estado === "pagado").length;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Alumnos
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-6">
          {cargando
            ? "Cargando..."
            : `${alumnos.length} inscriptos al curso pago — ${pagados} pagaron, ${pendientes} pendientes.`}
        </p>

        <div className="flex gap-2 mb-6">
          {(
            [
              ["todos", "Todos"],
              ["pendiente_pago", "Pendientes de pago"],
              ["pagado", "Pagados"],
            ] as const
          ).map(([valor, label]) => (
            <button
              key={valor}
              onClick={() => setFiltro(valor)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border ${
                filtro === valor
                  ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10"
                  : "border-[var(--line)] text-[var(--paper-dim)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className="text-[var(--paper-dim)] text-sm font-mono">Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-[var(--paper-dim)] text-sm">No hay alumnos en este filtro todavía.</p>
        ) : (
          <div className="space-y-3">
            {filtrados.map((a) => (
              <TarjetaAlumno key={a.id} alumno={a} onCambio={cargar} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
