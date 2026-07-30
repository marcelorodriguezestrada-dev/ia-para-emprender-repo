import { NextResponse } from "next/server";
import { registrarClicYObtenerDestino } from "@/lib/campanas";

// GET /go/[id] — este es el link que compartís en Facebook/WhatsApp/etc en vez
// del link directo. Suma 1 clic a la campaña en Firestore y redirige al
// destino real con los parámetros utm_* ya puestos.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const origin = new URL(request.url).origin;
    const destino = await registrarClicYObtenerDestino(params.id, origin);

    if (!destino) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    return NextResponse.redirect(destino, { status: 302 });
  } catch (err) {
    console.error("Error registrando clic:", err);
    return NextResponse.json({ error: "No se pudo procesar el link" }, { status: 500 });
  }
}
