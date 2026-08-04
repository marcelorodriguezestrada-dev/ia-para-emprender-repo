"use client";

import { useEffect, useState } from "react";
import { guardarMaterial, listarMateriales, borrarMaterial, type Material, type TipoMaterial } from "@/lib/materiales";

const TIPOS: { valor: TipoMaterial; label: string; emoji: string }[] = [
  { valor: "diapositivas", label: "Diapositivas", emoji: "📊" },
  { valor: "video", label: "Video", emoji: "🎥" },
  { valor: "acceso", label: "Acceso/Link", emoji: "🔗" },
  { valor: "otro", label: "Otro", emoji: "📎" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`text-xs font-mono border rounded-full px-3 py-1 whitespace-nowrap ${
        copied ? "border-green-500/40 text-green-400" : "border-[var(--line)] text-[var(--paper-dim)]"
      }`}
    >
      {copied ? "¡Copiado!" : "Copiar link"}
    </button>
  );
}

export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [cargando, setCargando] = useState(true);

  const [clase, setClase] = useState("Clase gratuita");
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoMaterial>("diapositivas");
  const [url, setUrl] = useState("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      setMateriales(await listarMateriales());
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function handleGuardar() {
    if (!titulo.trim() || !url.trim()) {
      setError("Completá al menos título y link.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await guardarMaterial({ clase, titulo, tipo, url, notas });
      setTitulo("");
      setUrl("");
      setNotas("");
      await cargar();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleBorrar(id: string) {
    try {
      await borrarMaterial(id);
      setMateriales((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // Agrupa por clase para que se vea ordenado (Clase gratuita, Clase 1, Clase 2...)
  const agrupados = materiales.reduce<Record<string, Material[]>>((acc, m) => {
    (acc[m.clase] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Materiales de las clases
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-6">
          Diapositivas, videos y accesos, todo en un solo lugar — para copiar el link y pasarlo cuando lo
          necesites, sin andar buscando en carpetas.
        </p>

        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Clase
              </label>
              <input
                value={clase}
                onChange={(e) => setClase(e.target.value)}
                placeholder="Clase gratuita / Clase 1 / General"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoMaterial)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--teal)]"
              >
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.emoji} {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Título
            </label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Diapositivas - Estrategia con IA"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Link
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-[var(--paper-dim)] mb-2">
              Notas (opcional)
            </label>
            <input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: contraseña, vence el..., etc."
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--teal)]"
            />
          </div>

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full bg-[var(--gold)] text-[#201502] font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar material"}
          </button>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Todo lo guardado
        </h2>
        {cargando ? (
          <p className="text-[var(--paper-dim)] text-sm font-mono">Cargando...</p>
        ) : materiales.length === 0 ? (
          <p className="text-[var(--paper-dim)] text-sm">Todavía no guardaste nada.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(agrupados).map(([nombreClase, items]) => (
              <div key={nombreClase}>
                <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--gold)] mb-2">
                  {nombreClase}
                </h3>
                <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden">
                  {items.map((m) => {
                    const tipoInfo = TIPOS.find((t) => t.valor === m.tipo);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-[var(--line)] last:border-none text-sm"
                      >
                        <span className="flex-shrink-0">{tipoInfo?.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{m.titulo}</p>
                          {m.notas && <p className="text-xs text-[var(--paper-dim)] truncate">{m.notas}</p>}
                        </div>
                        <CopyBtn text={m.url} />
                        <button
                          onClick={() => handleBorrar(m.id)}
                          className="text-xs font-mono text-[var(--paper-dim)] hover:text-red-400"
                        >
                          Borrar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
