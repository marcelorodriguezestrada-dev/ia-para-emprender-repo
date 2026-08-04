"use client";

import { useEffect, useState } from "react";

/* ============================================================
   CONFIGURACIÓN — editá solo esto para dejar la página lista
   ============================================================ */
type Country = "ar" | "bo";

const CONFIG = {
  whatsapp: {
    ar: "5491167076678", // tu WhatsApp con código de país, sin + ni espacios
    bo: "59100000000", // WhatsApp para Bolivia (puede ser el mismo número)
  },
  precios: {
    ar: { simbolo: "$", valor: "39.900", moneda: "ARS" },
    bo: { simbolo: "Bs", valor: "189", moneda: "BOB" },
  },
  mensajeWhatsapp: "Hola! quiero anotarme en IA para Emprender",
  // Fecha y hora en que ABRE la inscripción (fin de los 3 días de difusión).
  // Formato: "YYYY-MM-DDTHH:MM:SS-03:00" (-03:00 es el huso horario de Argentina)
  fechaApertura: "2026-08-03T19:00:00-03:00",
};
/* ============================================================ */

const CLASES = [
  {
    n: "01",
    label: "Clase 1 — Estrategia",
    title: "Estrategia ganadora con IA",
    desc: "Generación de contenido en video, imágenes y avatares con inteligencia artificial. Salís con tu primera tanda de contenido lista.",
  },
  {
    n: "02",
    label: "Clase 2 — Automatización",
    title: "Automatizá redes sociales y tu WhatsApp",
    desc: "Configurás respuestas automáticas e inteligentes en tus redes y tu WhatsApp para no perder ni un contacto.",
  },
  {
    n: "03",
    label: "Clase 3 — Producto",
    title: "Generá ingresos con productos digitales",
    desc: "Armás tu primer producto digital con ayuda de IA: algo concreto que podés empezar a vender esa misma semana.",
  },
  {
    n: "04",
    label: "Clase 4 — Venta",
    title: "Creá tu página de venta",
    desc: "Armás tu página de venta con inteligencia artificial y copiás nuestros embudos probados, paso a paso.",
  },
  {
    n: "05",
    label: "Clase 5 — Clientes",
    title: "Tu primera campaña publicitaria",
    desc: "Armás, paso a paso, tu campaña publicitaria para empezar a conseguir clientes reales.",
  },
  {
    n: "06",
    label: "Clase 6 — Rentabilidad",
    title: "Una IA para conseguir clientes sin invertir en publicidad",
    desc: "Y cómo saber, con números concretos, si tu negocio es rentable antes de escalarlo.",
  },
  {
    n: "07",
    label: "Clase 7 — Cierre",
    title: "Los 4 caminos para vivir 100% de internet",
    desc: "Salís del curso con un camino elegido y claro para sostener tu negocio online.",
  },
] as const;

const CRONOGRAMA = [
  { semana: "Semana 1", dias: "Día 1 y Día 2", clases: "Clase 1 (Estrategia) + Clase 2 (Automatización)" },
  { semana: "Semana 2", dias: "Día 3 y Día 4", clases: "Clase 3 (Producto) + Clase 4 (Venta)" },
  { semana: "Semana 3", dias: "Día 5 y Día 6", clases: "Clase 5 (Clientes) + Clase 6 (Rentabilidad)" },
  { semana: "Semana 4", dias: "Día 7 y Día 8", clases: "Clase 7 (Caminos) + Cierre y certificado" },
] as const;

const FAQS = [
  {
    q: "¿Necesito saber de tecnología o programación?",
    a: "No. Todo se enseña con herramientas de IA que se usan sin escribir código. Si sabés usar el celular y WhatsApp, podés seguir el curso.",
  },
  {
    q: "¿Y si me pierdo una clase?",
    a: "Todas las clases quedan grabadas para que las veas cuando puedas.",
  },
  {
    q: "¿Ya tengo que tener un negocio armado?",
    a: "No, sirve tanto si ya vendés algo como si todavía estás por arrancar. La ruta funciona para los dos casos.",
  },
  {
    q: "¿Cómo me anoto?",
    a: "Escribinos por WhatsApp con el botón de esta página y te pasamos los datos para reservar tu lugar.",
  },
] as const;

function waLink(numero: string, texto: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export default function IAParaEmprenderLanding() {
  const [country, setCountry] = useState<Country>("ar");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Empieza vacío y se calcula en useEffect (solo en el cliente) para evitar
  // que el texto no coincida entre el render del servidor y el del browser.
  const [bannerTexto, setBannerTexto] = useState("");

  useEffect(() => {
    const apertura = new Date(CONFIG.fechaApertura).getTime();
    const msRestantes = apertura - Date.now();

    if (msRestantes <= 0) {
      setBannerTexto("🚀 ¡Ya abrimos inscripciones! Anotate antes de que se llene el cupo");
      return;
    }

    const dias = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
    setBannerTexto(
      dias <= 1
        ? "⏳ Abrimos inscripciones HOY — quedate atento"
        : `⏳ Abrimos inscripciones en ${dias} días — cupos limitados`
    );
  }, []);

  const precio = CONFIG.precios[country];

  // Los botones de arriba (nav, hero, flotante) usan siempre el WhatsApp de
  // Argentina porque aparecen antes de que el visitante elija país en la
  // sección de precio. Si vendés solo en Bolivia, cambiá acá el default.
  const ctaTopHref = waLink(CONFIG.whatsapp.ar, CONFIG.mensajeWhatsapp);

  return (
    <div className="landing">
      <style jsx global>{`
        :root {
          --bg: #0a0f0f;
          --bg-soft: #0f1717;
          --panel: #121c1c;
          --line: #223030;
          --teal: #2fe0b8;
          --teal-dim: #1c8a70;
          --gold: #f0b429;
          --paper: #edf3f1;
          --paper-dim: #a9b8b5;
          --display: "Unbounded", sans-serif;
          --body: "Inter", sans-serif;
          --mono: "JetBrains Mono", monospace;
        }
        @import url("https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap");

        .landing * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        .landing {
          background: var(--bg);
          color: var(--paper);
          font-family: var(--body);
          line-height: 1.5;
          overflow-x: hidden;
          position: relative;
        }
        .landing img {
          max-width: 100%;
          display: block;
        }
        .landing a {
          color: inherit;
          text-decoration: none;
        }
        .landing ul {
          list-style: none;
        }
        .landing .wrap {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .landing section {
          position: relative;
        }
        .landing .bg-glow {
          position: fixed;
          inset: 0;
          background: radial-gradient(600px 400px at 12% 0%, rgba(47, 224, 184, 0.1), transparent 60%),
            radial-gradient(500px 500px at 90% 20%, rgba(240, 180, 41, 0.08), transparent 55%);
          pointer-events: none;
          z-index: 0;
        }

        .landing header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10, 15, 15, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line);
        }
        .landing .launch-banner {
          background: var(--gold);
          color: #201502;
          text-align: center;
          font-family: var(--mono);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 10px 16px;
          letter-spacing: 0.02em;
        }
        .landing .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          max-width: 1160px;
          margin: 0 auto;
        }
        .landing .logo {
          font-family: var(--display);
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.01em;
        }
        .landing .logo span {
          color: var(--teal);
        }
        .landing .nav-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .landing .nav-link {
          font-family: var(--mono);
          font-size: 0.8rem;
          color: var(--paper-dim);
          white-space: nowrap;
        }
        .landing .nav-link:hover {
          color: var(--teal);
        }
        .landing .nav-cta {
          background: var(--teal);
          color: #06201a;
          font-family: var(--mono);
          font-weight: 600;
          font-size: 0.8rem;
          padding: 10px 18px;
          border-radius: 999px;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .landing .hero {
          padding: 88px 0 64px;
          position: relative;
          z-index: 1;
        }
        .landing .eyebrow {
          font-family: var(--mono);
          color: var(--teal);
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
        }
        .landing .eyebrow::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 12px 2px rgba(47, 224, 184, 0.8);
        }
        .landing h1 {
          font-family: var(--display);
          font-weight: 700;
          font-size: clamp(2.1rem, 5.4vw, 3.6rem);
          line-height: 1.08;
          max-width: 780px;
          letter-spacing: -0.01em;
        }
        .landing h1 em {
          font-style: normal;
          color: var(--teal);
        }
        .landing .hero-sub {
          margin-top: 22px;
          font-size: 1.1rem;
          color: var(--paper-dim);
          max-width: 560px;
        }
        .landing .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
          align-items: center;
        }
        .landing .btn-primary {
          background: var(--gold);
          color: #201502;
          font-weight: 700;
          padding: 16px 28px;
          border-radius: 10px;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .landing .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -8px rgba(240, 180, 41, 0.5);
        }
        .landing .btn-secondary {
          background: transparent;
          color: var(--teal);
          font-weight: 600;
          padding: 15px 26px;
          border-radius: 10px;
          border: 1px solid var(--teal-dim);
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .landing .btn-secondary:hover {
          border-color: var(--teal);
          background: rgba(47, 224, 184, 0.06);
        }
        .landing .hero-meta {
          font-family: var(--mono);
          font-size: 0.82rem;
          color: var(--paper-dim);
        }
        .landing .hero-stats {
          display: flex;
          gap: 36px;
          margin-top: 56px;
          flex-wrap: wrap;
          border-top: 1px solid var(--line);
          padding-top: 28px;
        }
        .landing .stat b {
          font-family: var(--display);
          font-size: 1.7rem;
          display: block;
          color: var(--paper);
        }
        .landing .stat span {
          font-family: var(--mono);
          font-size: 0.72rem;
          color: var(--paper-dim);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .landing .sec-head {
          max-width: 620px;
          margin-bottom: 48px;
        }
        .landing .sec-eyebrow {
          font-family: var(--mono);
          color: var(--gold);
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 14px;
          display: block;
        }
        .landing h2 {
          font-family: var(--display);
          font-size: clamp(1.6rem, 3.4vw, 2.3rem);
          line-height: 1.15;
        }
        .landing .sec-desc {
          margin-top: 14px;
          color: var(--paper-dim);
          font-size: 1.02rem;
        }

        .landing .ruta {
          padding: 90px 0 40px;
          position: relative;
          z-index: 1;
        }
        .landing .path-rail {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .landing .path-track {
          position: absolute;
          left: 27px;
          top: 30px;
          bottom: 30px;
          width: 2px;
          background: repeating-linear-gradient(to bottom, var(--teal-dim) 0 6px, transparent 6px 12px);
        }
        .landing .stop {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 24px;
          padding: 26px 0;
          position: relative;
        }
        .landing .node {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--panel);
          border: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-weight: 600;
          color: var(--teal);
          position: relative;
          z-index: 2;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .landing .stop:hover .node {
          border-color: var(--teal);
          box-shadow: 0 0 0 6px rgba(47, 224, 184, 0.08);
        }
        .landing .stop-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 22px 26px;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .landing .stop:hover .stop-card {
          border-color: rgba(47, 224, 184, 0.35);
          transform: translateX(4px);
        }
        .landing .stop-label {
          font-family: var(--mono);
          font-size: 0.72rem;
          color: var(--gold);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .landing .stop-card h3 {
          font-family: var(--display);
          font-weight: 600;
          font-size: 1.12rem;
          margin-bottom: 8px;
          color: var(--paper);
        }
        .landing .stop-card p {
          color: var(--paper-dim);
          font-size: 0.95rem;
        }

        .landing .split {
          padding: 90px 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          position: relative;
          z-index: 1;
        }
        .landing .cronograma {
          padding: 20px 0 40px;
          position: relative;
          z-index: 1;
        }
        .landing .cron-table {
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
        }
        .landing .cron-row {
          display: grid;
          grid-template-columns: 0.8fr 0.9fr 1.6fr;
          gap: 16px;
          padding: 16px 22px;
          border-bottom: 1px solid var(--line);
          font-size: 0.92rem;
        }
        .landing .cron-row:last-child {
          border-bottom: none;
        }
        .landing .cron-head {
          background: var(--panel);
          font-family: var(--mono);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .landing .cron-row:not(.cron-head) span:first-child {
          font-family: var(--display);
          font-weight: 600;
          color: var(--teal);
        }
        .landing .cron-row:not(.cron-head) {
          color: var(--paper-dim);
        }
        .landing .check-list li {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
          font-size: 0.98rem;
          color: var(--paper);
        }
        .landing .check-list li::before {
          content: "→";
          color: var(--teal);
          font-family: var(--mono);
          flex-shrink: 0;
        }
        .landing .no-list li {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--line);
          font-size: 0.98rem;
          color: var(--paper-dim);
        }
        .landing .no-list li::before {
          content: "×";
          color: #6b5030;
          font-family: var(--mono);
          flex-shrink: 0;
        }
        .landing .col-title {
          font-family: var(--mono);
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: block;
        }
        .landing .col-title.yes {
          color: var(--teal);
        }
        .landing .col-title.no {
          color: var(--paper-dim);
        }

        .landing .instructores {
          padding: 40px 0 90px;
          position: relative;
          z-index: 1;
        }
        .landing .instr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        .landing .instr-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 30px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .landing .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--teal-dim), var(--teal));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--display);
          font-weight: 700;
          color: #06201a;
          font-size: 1.2rem;
        }
        .landing .instr-card h4 {
          font-family: var(--display);
          font-size: 1.05rem;
          margin-bottom: 4px;
        }
        .landing .instr-role {
          font-family: var(--mono);
          font-size: 0.72rem;
          color: var(--gold);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .landing .instr-card p {
          margin-top: 10px;
          color: var(--paper-dim);
          font-size: 0.92rem;
        }
        .landing .edit-note {
          font-family: var(--mono);
          font-size: 0.68rem;
          color: #6b6b3a;
          margin-top: 10px;
          display: block;
        }

        .landing .pricing {
          padding: 40px 0 100px;
          position: relative;
          z-index: 1;
        }
        .landing .price-card {
          background: linear-gradient(160deg, var(--panel), #0d1616);
          border: 1px solid var(--teal-dim);
          border-radius: 22px;
          padding: 48px;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .landing .price-left h3 {
          font-family: var(--display);
          font-size: 1.5rem;
          margin-bottom: 14px;
        }
        .landing .price-left p {
          color: var(--paper-dim);
        }
        .landing .price-right {
          text-align: center;
          border-left: 1px solid var(--line);
          padding-left: 40px;
        }
        .landing .country-toggle {
          display: inline-flex;
          background: var(--bg-soft);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 20px;
        }
        .landing .ctoggle {
          font-family: var(--mono);
          font-size: 0.75rem;
          color: var(--paper-dim);
          background: none;
          border: none;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .landing .ctoggle.active {
          background: var(--teal);
          color: #06201a;
          font-weight: 600;
        }
        .landing .price-tag {
          font-family: var(--display);
          font-weight: 900;
          font-size: 3rem;
          color: var(--gold);
        }
        .landing .price-note {
          font-family: var(--mono);
          font-size: 0.75rem;
          color: var(--paper-dim);
          margin-top: 6px;
        }
        .landing .btn-block {
          display: block;
          width: 100%;
          text-align: center;
          background: var(--teal);
          color: #06201a;
          font-weight: 700;
          padding: 16px;
          border-radius: 10px;
          margin-top: 22px;
        }
        .landing .includes {
          margin-top: 26px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .landing .includes li {
          font-size: 0.9rem;
          color: var(--paper);
          display: flex;
          gap: 10px;
        }
        .landing .includes li::before {
          content: "✓";
          color: var(--teal);
        }

        .landing .faq {
          padding: 40px 0 110px;
          position: relative;
          z-index: 1;
          max-width: 760px;
          margin: 0 auto;
        }
        .landing .faq-item {
          border-bottom: 1px solid var(--line);
        }
        .landing .faq-q {
          width: 100%;
          background: none;
          border: none;
          padding: 22px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-family: var(--display);
          font-weight: 600;
          font-size: 1rem;
          color: var(--paper);
          text-align: left;
        }
        .landing .faq-q .icon {
          font-family: var(--mono);
          font-size: 1.3rem;
          color: var(--teal);
          transition: transform 0.2s ease;
          flex-shrink: 0;
          margin-left: 12px;
        }
        .landing .faq-item.open .faq-q .icon {
          transform: rotate(45deg);
        }
        .landing .faq-a {
          overflow: hidden;
          transition: max-height 0.25s ease;
          color: var(--paper-dim);
          font-size: 0.95rem;
          max-height: 0;
        }
        .landing .faq-item.open .faq-a {
          max-height: 200px;
          padding-bottom: 22px;
        }

        .landing .final-cta {
          padding: 90px 0 110px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .landing .final-cta h2 {
          max-width: 640px;
          margin: 0 auto;
        }
        .landing .final-cta .btn-primary {
          margin-top: 30px;
        }

        .landing footer {
          border-top: 1px solid var(--line);
          padding: 30px 0;
          font-family: var(--mono);
          font-size: 0.75rem;
          color: var(--paper-dim);
        }

        .landing .wa-float {
          position: fixed;
          bottom: 22px;
          right: 22px;
          z-index: 60;
          background: var(--teal);
          color: #06201a;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(47, 224, 184, 0.35);
        }
        .landing .wa-float svg {
          width: 26px;
          height: 26px;
        }

        @media (max-width: 760px) {
          .landing .cron-row {
            grid-template-columns: 1fr;
            gap: 4px;
          }
          .landing .cron-row span:not(:first-child) {
            font-size: 0.85rem;
          }
          .landing .split {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .landing .instr-grid {
            grid-template-columns: 1fr;
          }
          .landing .price-card {
            grid-template-columns: 1fr;
          }
          .landing .price-right {
            border-left: none;
            border-top: 1px solid var(--line);
            padding-left: 0;
            padding-top: 24px;
          }
          .landing .stop {
            grid-template-columns: 40px 1fr;
          }
          .landing .node {
            width: 40px;
            height: 40px;
            font-size: 0.8rem;
          }
          .landing .path-track {
            left: 19px;
          }
        }

        @media (max-width: 480px) {
          .landing .nav-link {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="bg-glow" />

      {bannerTexto && <div className="launch-banner">{bannerTexto}</div>}

      <header>
        <div className="nav">
          <div className="logo">
            IA para <span>Emprender</span>
          </div>
          <div className="nav-right">
            <a className="nav-link" href="/registro">
              Clase gratis
            </a>
            <a className="nav-cta" href={ctaTopHref} target="_blank" rel="noopener noreferrer">
              Quiero anotarme →
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">7 clases · Cupo reducido · En vivo</span>
          <h1>
            Aprendé a usar la <em>inteligencia artificial</em> para crear, vender y conseguir clientes — sin saber
            programar.
          </h1>
          <p className="hero-sub">
            Un recorrido de 7 clases prácticas donde salís con contenido hecho, tu WhatsApp automatizado, un
            producto digital propio, tu página de venta, tu primera campaña, y un camino claro para vivir de tu
            negocio.
          </p>
          <div className="hero-actions">
            <a className="btn-primary" href={ctaTopHref} target="_blank" rel="noopener noreferrer">
              Reservar mi lugar por WhatsApp
            </a>
            <a className="btn-secondary" href="/registro">
              🎁 Ver la clase gratuita primero
            </a>
            <span className="hero-meta">Cupos limitados por grupo</span>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <b>07</b>
              <span>Clases en vivo</span>
            </div>
            <div className="stat">
              <b>100%</b>
              <span>Práctico, con IA en mano</span>
            </div>
            <div className="stat">
              <b>2</b>
              <span>Profesores guiando el proceso</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ruta">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-eyebrow">Tu ruta de aprendizaje</span>
            <h2>Siete clases, un negocio funcionando de punta a punta</h2>
            <p className="sec-desc">
              Cada clase te deja algo terminado y usable — no son apuntes, son herramientas que quedan trabajando
              para vos.
            </p>
          </div>

          <div className="path-rail">
            <div className="path-track" />
            {CLASES.map((c) => (
              <div className="stop" key={c.n}>
                <div className="node">{c.n}</div>
                <div className="stop-card">
                  <span className="stop-label">{c.label}</span>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cronograma">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-eyebrow">Cuándo se dicta</span>
            <h2>4 semanas, 2 encuentros en vivo por semana</h2>
            <p className="sec-desc">
              90 minutos por encuentro. Entre clase y clase, 2-3 días para aplicar lo que viste con tu propio
              negocio.
            </p>
          </div>
          <div className="cron-table">
            <div className="cron-row cron-head">
              <span>Semana</span>
              <span>Encuentros</span>
              <span>Clases</span>
            </div>
            {CRONOGRAMA.map((c) => (
              <div className="cron-row" key={c.semana}>
                <span>{c.semana}</span>
                <span>{c.dias}</span>
                <span>{c.clases}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="split">
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
          <div>
            <span className="col-title yes">Es para vos si...</span>
            <ul className="check-list">
              <li>Tenés una idea de negocio y no sabés por dónde arrancar</li>
              <li>Ya vendés algo pero hacés todo a mano, sin herramientas</li>
              <li>Querés aprender IA aplicada a resultados, no teoría suelta</li>
              <li>Preferís aprender haciendo, con ayuda en vivo</li>
            </ul>
          </div>
          <div>
            <span className="col-title no">No es para vos si...</span>
            <ul className="no-list">
              <li>Buscás un curso técnico de programación</li>
              <li>Esperás resultados sin poner tiempo entre clases</li>
              <li>Ya tenés un equipo de marketing armado y funcionando</li>
              <li>Buscás una fórmula mágica sin trabajo real</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="instructores">
        <div className="wrap">
          <div className="sec-head">
            <span className="sec-eyebrow">Quiénes lo dan</span>
            <h2>Dos personas que van a estar en vivo, clase a clase</h2>
          </div>
          <div className="instr-grid">
            <div className="instr-card">
              <div className="avatar">D</div>
              <div>
                <h4>Daniel Camacho</h4>
                <span className="instr-role">Profesor · 🇧🇴 La Paz, Bolivia</span>
                <p>
                  Ingeniero de Sistemas con más de 18 años de experiencia en datos, Business Intelligence y
                  seguridad de la información. Docente universitario y expositor del seminario "Criptomonedas y
                  Tokenización" — el que te va a mostrar en qué casos blockchain realmente le suma a un negocio,
                  y en cuáles no.
                </p>
              </div>
            </div>
            <div className="instr-card">
              <div className="avatar">M</div>
              <div>
                <h4>Marcelo Rodríguez Estrada</h4>
                <span className="instr-role">Profesor · 🇦🇷 Buenos Aires, Argentina</span>
                <p>
                  Ingeniero de Datos Senior con más de 15 años de experiencia trabajando con equipos como
                  Mercado Libre, y doble maestría en Data Mining (UBA) y Finanzas (UTDT). Construyó con sus
                  propias manos las herramientas de IA que vas a usar en este curso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing">
        <div className="wrap">
          <div className="price-card">
            <div className="price-left">
              <h3>IA para Emprender</h3>
              <p>
                7 clases en vivo con Daniel Camacho y Marcelo Rodríguez Estrada. Grupo reducido para que cada uno salga con su
                contenido, su producto, su página de venta y su plan de rentabilidad hechos, no solo con la
                teoría.
              </p>
              <ul className="includes">
                <li>7 clases en vivo (quedan grabadas)</li>
                <li>Grupo de acompañamiento entre clases</li>
                <li>Plantillas y embudos listos para copiar</li>
                <li>Certificado de finalización</li>
              </ul>
            </div>
            <div className="price-right">
              <div className="country-toggle">
                <button
                  type="button"
                  className={`ctoggle ${country === "ar" ? "active" : ""}`}
                  onClick={() => setCountry("ar")}
                >
                  🇦🇷 Argentina
                </button>
                <button
                  type="button"
                  className={`ctoggle ${country === "bo" ? "active" : ""}`}
                  onClick={() => setCountry("bo")}
                >
                  🇧🇴 Bolivia
                </button>
              </div>
              <div className="price-tag">
                {precio.simbolo}
                {precio.valor}
              </div>
              <div className="price-note">pago único · {precio.moneda} · precio de lanzamiento</div>
              <a className="btn-block" href="/inscripcion-curso">
                Anotarme al curso →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="sec-head" style={{ maxWidth: "none" }}>
          <span className="sec-eyebrow">Preguntas frecuentes</span>
          <h2>Antes de anotarte</h2>
        </div>

        {FAQS.map((f, i) => (
          <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={f.q}>
            <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {f.q}
              <span className="icon">+</span>
            </button>
            <div className="faq-a">
              <p>{f.a}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="final-cta">
        <div className="wrap">
          <h2>Tu negocio con IA empieza en la Clase 1.</h2>
          <a className="btn-primary" href={ctaTopHref} target="_blank" rel="noopener noreferrer">
            Reservar mi lugar por WhatsApp
          </a>
        </div>
      </section>

      <footer>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span>IA PARA EMPRENDER — 2026</span>
          <span>Dictado por Daniel Camacho &amp; Marcelo Rodríguez Estrada</span>
        </div>
      </footer>

      <a className="wa-float" href={ctaTopHref} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.4a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.02.24-3.42-.71-2.9-1.16-4.76-4.08-4.9-4.27-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.8 2 .87 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.93.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
        </svg>
      </a>
    </div>
  );
}
