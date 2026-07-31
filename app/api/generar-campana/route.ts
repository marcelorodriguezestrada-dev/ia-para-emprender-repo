import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const REDES: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

export async function POST(request: Request) {
  const body = await request.json();
  const { red, objetivo, tono, cantPosts, oferta, destinoLabel } = body;

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Falta configurar GROQ_API_KEY en el servidor" }, { status: 500 });
  }
  if (!red || !REDES[red]) {
    return NextResponse.json({ error: "Red social inválida" }, { status: 400 });
  }

  const redLabel = REDES[red];
  const n = Math.min(Math.max(Number(cantPosts) || 5, 3), 10);
  const esRedDeBio = red === "instagram" || red === "tiktok";

  // OJO: acá NO ponemos todavía el link real. Cada post recién tiene su
  // link corto (con seguimiento de clics) DESPUÉS de esta llamada a Groq.
  // Por eso le pedimos a la IA que deje un placeholder exacto, que
  // reemplazamos por el link real en el frontend antes de mostrar el post.
  const reglaLink = esRedDeBio
    ? `- El campo "texto" DEBE terminar con "👆 Link en bio" (NUNCA escribas una URL dentro del texto, en ${redLabel} no se puede hacer clic en links dentro del posteo).`
    : `- El campo "texto" DEBE terminar EXACTAMENTE con el texto "👉 {{LINK}}" (así, literal, con esas llaves dobles — es un marcador que reemplazamos después por el link real. NO inventes ninguna URL vos.)`;

  const prompt = `Creá una campaña de ${n} posts para ${redLabel} promocionando "IA para Emprender", un curso de 7 clases en vivo que enseña a emprendedores sin conocimientos técnicos a usar inteligencia artificial para crear contenido, automatizar WhatsApp/redes, vender productos digitales, armar páginas de venta y conseguir clientes.

CONTEXTO DE LA CAMPAÑA:
- Objetivo: ${objetivo}
- Red social: ${redLabel}
- Tono: ${tono}
- A dónde apunta: ${destinoLabel}
${oferta ? `- Oferta especial: ${oferta}` : ""}

REGLA OBLIGATORIA sobre el link (no te la saltees):
${reglaLink}

Reglas generales:
- Español rioplatense/latinoamericano neutro, cercano, sin sonar a infoproducto genérico ni promesas de "hacete rico ya".
- Cada post tiene que poder publicarse tal cual, sin edición.
- Variá el formato entre Feed, Story, Reel y Carrusel según lo que tenga sentido en ${redLabel}.
- El calendario tiene que distribuir los ${n} posts en un lapso razonable (por ejemplo, día 1, 3, 5, 7... no todos el mismo día).

Respondé ÚNICAMENTE con este JSON, sin markdown, sin texto extra:
{
  "titulo_campana": "nombre corto de la campaña",
  "concepto": "idea central de la campaña en 1 oración",
  "publico_objetivo": "descripción del público al que apunta",
  "posts": [
    {
      "formato": "Feed|Story|Reel|Carrusel",
      "texto": "copy completo del post, listo para publicar, con emojis",
      "hashtags": "#hashtag1 #hashtag2 ...",
      "cta": "llamada a la acción específica de este post",
      "hora_optima": "HH:MM",
      "tip_visual": "descripción breve de qué imagen o video usar"
    }
  ],
  "calendario": [
    { "dia": 1, "post_idx": 0, "nota": "por qué este día tiene sentido para este post" }
  ],
  "kpis": ["KPI 1 a medir", "KPI 2 a medir"],
  "presupuesto_sugerido": "rango sugerido en pesos argentinos si se pauta con ads, o 'no hace falta pauta' si es orgánico"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 3000,
      temperature: 0.85,
      messages: [
        {
          role: "system",
          content:
            "Sos un experto en marketing digital para cursos online de emprendimiento en Argentina y Bolivia. Respondés ÚNICAMENTE con JSON válido, sin markdown, sin texto extra, sin \\`\\`\\`.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error generando campaña con Groq:", err);
    return NextResponse.json(
      { error: "No se pudo generar la campaña. Probá de nuevo." },
      { status: 502 }
    );
  }
}
