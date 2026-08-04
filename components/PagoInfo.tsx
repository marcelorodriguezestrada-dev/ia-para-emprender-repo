"use client";

import { useSearchParams } from "next/navigation";
import { DATOS_PAGO } from "@/lib/config";

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[var(--line)] last:border-none">
      <div>
        <p className="font-mono text-[0.68rem] text-[var(--paper-dim)] uppercase tracking-wide">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(value)}
        className="text-xs font-mono border border-[var(--line)] rounded-full px-3 py-1.5 text-[var(--paper-dim)] hover:border-[var(--teal)] hover:text-[var(--teal)] flex-shrink-0"
      >
        Copiar
      </button>
    </div>
  );
}

export default function PagoInfo() {
  const searchParams = useSearchParams();
  const nombre = searchParams.get("nombre") ?? "";

  const mensajeWhatsapp = encodeURIComponent(
    `Hola! Soy ${nombre || "[tu nombre]"}, ya hice la transferencia para IA para Emprender. Te paso el comprobante 👇`
  );
  const linkWhatsapp = `https://wa.me/${DATOS_PAGO.whatsappComprobante}?text=${mensajeWhatsapp}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="max-w-[540px] w-full">
        <span className="font-mono text-[var(--teal)] text-xs uppercase tracking-widest block mb-4 text-center">
          Último paso
        </span>
        <h1
          className="font-bold text-[1.6rem] leading-tight mb-3 text-center"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          {nombre ? `${nombre}, hacé la transferencia y avisanos` : "Hacé la transferencia y avisanos"}
        </h1>
        <p className="text-[var(--paper-dim)] text-sm mb-7 text-center">
          Con estos datos transferís el pago del curso. Ni bien nos llegue el comprobante, confirmamos tu
          cupo.
        </p>

        <div className="bg-[var(--panel)] border border-[var(--teal-dim)] rounded-2xl p-6 mb-6">
          <CopyField label="Banco" value={DATOS_PAGO.banco} />
          <CopyField label="Titular" value={DATOS_PAGO.titular} />
          <CopyField label="CUIT" value={DATOS_PAGO.cuit} />
          <CopyField label="CBU" value={DATOS_PAGO.cbu} />
          <CopyField label="Alias" value={DATOS_PAGO.alias} />
        </div>

        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[var(--teal)] text-[#06201A] font-bold py-4 rounded-xl text-base mb-4"
        >
          ✅ Ya transferí, mando el comprobante
        </a>

        <p className="font-mono text-[0.7rem] text-[var(--paper-dim)] text-center">
          Vas a recibir la confirmación y los accesos por mail y WhatsApp una vez validado el pago.
        </p>
      </div>
    </div>
  );
}
