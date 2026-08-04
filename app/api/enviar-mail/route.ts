import { NextResponse } from "next/server";
import { enviarMailMasivo, type DestinatarioMail } from "@/lib/email";

// Protección liviana: quien llame a este endpoint tiene que mandar un mail
// que esté en la lista de admins — no es una verificación criptográfica
// real (para eso haría falta Firebase Admin SDK verificando el ID token),
// pero evita que cualquiera que encuentre la URL mande mails con tu cuenta.
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: Request) {
  const body = await request.json();
  const { destinatarios, asunto, cuerpoHtml, variablesExtra, solicitanteEmail } = body as {
    destinatarios: DestinatarioMail[];
    asunto: string;
    cuerpoHtml: string;
    variablesExtra?: Record<string, string>;
    solicitanteEmail?: string;
  };

  if (!solicitanteEmail || !ADMIN_EMAILS.includes(solicitanteEmail.toLowerCase())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (!destinatarios?.length || !asunto || !cuerpoHtml) {
    return NextResponse.json({ error: "Faltan destinatarios, asunto o cuerpo" }, { status: 400 });
  }

  try {
    const resultados = await enviarMailMasivo(destinatarios, asunto, cuerpoHtml, variablesExtra);
    return NextResponse.json({ resultados });
  } catch (err) {
    console.error("Error enviando mails:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo enviar el mail" },
      { status: 502 }
    );
  }
}
