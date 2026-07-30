import { NextResponse } from "next/server";
import { guardarLead } from "@/lib/leads";

export async function POST(request: Request) {
  const body = await request.json();
  const { nombre, email, utmSource, utmMedium, utmCampaign } = body;

  if (!nombre || !email) {
    return NextResponse.json({ error: "Falta nombre o email" }, { status: 400 });
  }

  try {
    await guardarLead({ nombre, email, utmSource, utmMedium, utmCampaign });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error guardando lead:", err);
    return NextResponse.json({ error: "No se pudo guardar el registro" }, { status: 500 });
  }
}
