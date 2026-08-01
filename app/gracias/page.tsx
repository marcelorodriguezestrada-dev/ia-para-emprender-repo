// Reemplazá este link por el de invitación real de tu Comunidad/Grupo de WhatsApp
const LINK_GRUPO_WHATSAPP = "https://chat.whatsapp.com/Eg9RBYPZclCAFNNuz2PJgl";

// Mismo celular que usás en el resto del sitio, para el "si tenés problemas, escribinos"
const WHATSAPP_AYUDA = "5491167076678";

export default function GraciasPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 text-center">
      <div className="max-w-[560px] w-full">
        <div
          className="font-bold text-[1.5rem] text-[var(--gold)] mb-2.5"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          Solo falta 1 paso...
        </div>
        <h1 className="font-semibold text-[1.3rem] mb-7" style={{ fontFamily: "Unbounded, sans-serif" }}>
          ¡Ya casi termina tu registro!
        </h1>

        <div className="h-3.5 bg-[var(--panel)] border border-[var(--line)] rounded-full overflow-hidden mb-9">
          <div className="h-full w-[90%] bg-gradient-to-r from-[var(--teal-dim)] to-[var(--teal)] rounded-full" />
        </div>

        <p className="text-[1.02rem] leading-relaxed mb-7">
          Los enlaces y materiales de apoyo se enviarán únicamente a través del{" "}
          <b className="text-[var(--gold)]">GRUPO EXCLUSIVO de WhatsApp</b>. Hacé clic en el botón para
          unirte.
        </p>

        <a
          href={LINK_GRUPO_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 w-full bg-[var(--teal)] text-[#06201A] font-bold py-4 px-8 rounded-xl text-[1.05rem] mb-6"
        >
          ¡Unirme al grupo de WhatsApp! →
        </a>

        <p className="text-[0.9rem] text-[var(--paper-dim)] mb-9">
          Si tenés problemas para ingresar al grupo, escribinos a{" "}
          <a
            href={`https://wa.me/${WHATSAPP_AYUDA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--gold)] font-semibold"
          >
            este número
          </a>
        </p>

        <hr className="border-[var(--line)] mb-7" />

        <p className="font-semibold text-[1.05rem] mb-3.5" style={{ fontFamily: "Unbounded, sans-serif" }}>
          En el grupo vas a recibir el enlace de la clase gratuita
        </p>
        <p className="font-mono text-[0.82rem] text-[var(--gold)]">
          Si salís del grupo, perdés acceso al material exclusivo
        </p>
      </div>
    </div>
  );
}
