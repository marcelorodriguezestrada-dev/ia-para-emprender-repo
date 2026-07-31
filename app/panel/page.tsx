"use client";

import { useEffect, useState } from "react";
import { listarLeads, type Lead } from "@/lib/leads";
import { listarCampanas, type Campana } from "@/lib/campanas";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-5">
      <p className="text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ fontFamily: "Unbounded, sans-serif" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--paper-dim)] mt-1">{sub}</p>}
    </div>
  );
}

export default function PanelPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [l, c] = await Promise.all([listarLeads(), listarCampanas()]);
      setLeads(l);
      setCampanas(c);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el panel. Revisá que las reglas de Firestore estén actualizadas.");
    } finally {
      setCargando(false);
    }
  }

  const totalClics = campanas.reduce((acc, c) => acc + (c.clics ?? 0), 0);
  const campanasConClics = [...campanas].sort((a, b) => (b.clics ?? 0) - (a.clics ?? 0));
  const tasaRegistro =
    totalClics > 0 ? ((leads.length / totalClics) * 100).toFixed(1) : "—";

  if (cargando) {
    return <p className="text-[var(--paper-dim)] text-sm font-mono">Cargando panel...</p>;
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Panel de control
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-6">
          Quiénes vieron tus campañas (clics) y quiénes efectivamente se registraron (leads).
        </p>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Personas registradas" value={leads.length} sub="Nombre + mail en /registro" />
          <StatCard label="Clics totales" value={totalClics} sub={`En ${campanas.length} campañas`} />
          <StatCard
            label="Clic → registro"
            value={tasaRegistro === "—" ? "—" : `${tasaRegistro}%`}
            sub="De los que vieron, cuántos se anotaron"
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Campañas con más clics
        </h2>
        {campanasConClics.length === 0 ? (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no hay campañas con clics.</p>
        ) : (
          <div className="space-y-2">
            {campanasConClics.slice(0, 10).map((c) => {
              const maxClics = campanasConClics[0]?.clics || 1;
              const pct = Math.max(4, ((c.clics ?? 0) / maxClics) * 100);
              return (
                <div key={c.id} className="bg-[var(--panel)] border border-[var(--line)] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <span className="text-sm truncate">{c.nombre}</span>
                    <span className="text-xs font-mono text-[var(--teal)] flex-shrink-0">{c.clics ?? 0} clics</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--teal)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Últimos registros
        </h2>
        {leads.length === 0 ? (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no hay nadie registrado en /registro.</p>
        ) : (
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1.3fr_0.8fr_0.7fr] gap-3 px-4 py-3 bg-[var(--bg)] text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)]">
              <span>Nombre</span>
              <span>Email</span>
              <span>Origen</span>
              <span>Fecha</span>
            </div>
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-[1fr_1.3fr_0.8fr_0.7fr] gap-3 px-4 py-3 border-t border-[var(--line)] text-sm"
              >
                <span className="truncate">{lead.nombre}</span>
                <span className="truncate text-[var(--paper-dim)]">{lead.email}</span>
                <span className="text-xs text-[var(--paper-dim)]">
                  {lead.utmSource ? `${lead.utmSource} / ${lead.utmCampaign ?? "s/campaña"}` : "orgánico/directo"}
                </span>
                <span className="text-xs text-[var(--paper-dim)]">
                  {new Date(lead.created_at).toLocaleDateString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
