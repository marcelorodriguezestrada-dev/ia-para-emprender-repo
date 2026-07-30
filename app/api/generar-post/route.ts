import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Sos un community manager especializado en cursos de emprendimiento digital
en Argentina y Bolivia. Escribís posts de Facebook para "IA para Emprender", un curso de 7 clases
que enseña a usar inteligencia artificial para crear contenido, automatizar redes/WhatsApp, vender
productos digitales, armar páginas de venta y conseguir clientes.

Reglas:
- Tono cercano, directo, sin sonar a infoproducto genérico ni promesas exageradas de dinero fácil.
- Máximo 120 palabras.
- Terminá siempre con una pregunta o llamado a la acción claro.
- No uses más de 3 emojis.
- Escribí en español rioplatense/latinoamericano neutro, sin tecnicismos.`;

export async function POST(request: Request) {
  const { tema, tono } = await request.json();

  if (!tema || typeof tema !== "string") {
    return NextResponse.json({ error: "Falta el tema del post" }, { status: 400 });
  }
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar GROQ_API_KEY en el servidor" },
      { status: 500 }
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Escribí un post de Facebook sobre: "${tema}". Tono: ${tono || "entusiasta y cercano"}.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 400,
    });

    const contenido = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!contenido) {
      throw new Error("Groq no devolvió contenido");
    }

    return NextResponse.json({ contenido });
  } catch (err) {
    console.error("Error generando post con Groq:", err);
    return NextResponse.json(
      { error: "No se pudo generar el post. Probá de nuevo." },
      { status: 502 }
    );
  }
}
