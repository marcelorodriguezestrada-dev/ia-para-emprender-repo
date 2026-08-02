import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// El remitente tiene que ser de un dominio que vos verificaste en Resend
// (ver README) — no puede ser un mail de Gmail suelto ni un subdominio de
// vercel.app que no controlás.
const REMITENTE = process.env.RESEND_FROM_EMAIL ?? "IA para Emprender <onboarding@resend.dev>";

export interface DestinatarioMail {
  email: string;
  nombre: string;
}

export interface ResultadoEnvio {
  email: string;
  ok: boolean;
  error?: string;
}

function personalizar(texto: string, datos: Record<string, string>): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (match, clave) => datos[clave] ?? match);
}

export async function enviarMailMasivo(
  destinatarios: DestinatarioMail[],
  asuntoPlantilla: string,
  cuerpoHtmlPlantilla: string,
  variablesExtra: Record<string, string> = {}
): Promise<ResultadoEnvio[]> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Falta configurar RESEND_API_KEY en el servidor");
  }
  if (destinatarios.length === 0) {
    throw new Error("No hay destinatarios seleccionados");
  }
  if (destinatarios.length > 100) {
    throw new Error("Máximo 100 destinatarios por envío (límite del lote de Resend)");
  }

  const lote = destinatarios.map((d) => ({
    from: REMITENTE,
    to: d.email,
    subject: personalizar(asuntoPlantilla, { nombre: d.nombre, ...variablesExtra }),
    html: personalizar(cuerpoHtmlPlantilla, { nombre: d.nombre, ...variablesExtra }),
  }));

  const { data, error } = await resend.batch.send(lote);

  if (error) {
    throw new Error(error.message ?? "Error desconocido enviando los mails");
  }

  return destinatarios.map((d, i) => ({
    email: d.email,
    ok: !!data?.data?.[i],
  }));
}