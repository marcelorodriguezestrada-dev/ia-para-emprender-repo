import { NextResponse } from "next/server";
import { guardarAlumno } from "@/lib/alumnos";

export async function POST(request: Request) {
  const body = await request.json();
  const { nombre, email, whatsapp, idea } = body;

  if (!nombre || !email || !idea) {
    return NextResponse.json({ error: "Faltan nombre, email o la idea del negocio" }, { status: 400 });
  }

  try {
    await guardarAlumno({ nombre, email, whatsapp, idea });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error guardando alumno:", err);
    return NextResponse.json({ error: "No se pudo guardar la inscripción" }, { status: 500 });
  }
}
