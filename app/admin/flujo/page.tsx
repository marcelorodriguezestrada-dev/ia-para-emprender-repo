import type { ReactNode } from "react";

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[var(--teal)]/10 border border-[var(--teal)]/30 text-[var(--teal)] flex items-center justify-center font-mono text-sm flex-shrink-0">
        {n}
      </div>
      <div className="flex-1 pb-6 border-l border-[var(--line)] pl-4 -ml-4">
        <h3 className="font-semibold text-sm mb-2">{titulo}</h3>
        <div className="text-sm text-[var(--paper-dim)] space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Mensaje({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="bg-[var(--bg)] border border-[var(--line)] rounded-lg p-3">
      <span className="text-[0.68rem] font-mono uppercase tracking-wide text-[var(--gold)] block mb-1.5">
        {etiqueta}
      </span>
      <p className="text-[var(--paper)] whitespace-pre-line">{children}</p>
    </div>
  );
}

export default function FlujoPage() {
  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "Unbounded, sans-serif" }}>
          Flujo completo
        </h1>
        <p className="text-[var(--paper-dim)] text-sm">
          Todo el proceso de punta a punta, con los mensajes exactos para cada momento. Esta página es
          solo de referencia — no hace nada, es para que no se te pierda nada en el camino.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-mono uppercase tracking-wide text-[var(--teal)] mb-5">
          A. Alguien te escribe por WhatsApp
        </h2>

        <Paso n={1} titulo="Te escriben: 'hola quiero anotarme en IA para Emprender'">
          <Mensaje etiqueta="Respondés esto">
            ¡Hola! 🙌 Antes de anotarte al curso completo, te recomiendo arrancar por la clase gratuita
            en vivo — ahí te muestro en tiempo real cómo se arma una app funcionando con IA, sin
            diapositivas ni vueltas. Así conocés cómo trabajamos antes de decidir el curso completo.
            {"\n\n"}
            Para guardarte el lugar, completá esto (30 segundos): [LINK A /registro]
            {"\n\n"}
            Ahí me dejás tu nombre y mail y automáticamente te llega la invitación 👇
          </Mensaje>
        </Paso>

        <Paso n={2} titulo="Te contestan el nombre y mail ahí mismo (en vez de llenar el formulario)">
          <p>Va a pasar seguido — la gente prefiere tipear en el chat antes que abrir un link.</p>
          <Mensaje etiqueta="Respondés esto">
            Genial, ¡ya quedás anotado! Te lo cargo ahora mismo de mi lado ✅
            {"\n\n"}
            En breve te llega toda la info de la clase (fecha, hora y el link de acceso) a [repetís el
            mail que te dieron, para confirmar que lo escribiste bien].
          </Mensaje>
          <p>
            👉 Vas a <b>Mail a inscriptos</b> → botón "Agregar alguien que te escribió por WhatsApp" → lo
            cargás con nombre y mail.
          </p>
        </Paso>

        <Paso n={3} titulo="Ya lo cargaste en el sistema">
          <Mensaje etiqueta="Respondés esto (la felicitación)">
            Recién te sumé a la lista 🎉 Te va a llegar la confirmación con todos los datos. Me alegra
            que te sumes — es de las mejores decisiones que podés tomar si querés dejar de tener la idea
            solo en la cabeza. Nos vemos en la clase 🚀
          </Mensaje>
        </Paso>
      </section>

      <section>
        <h2 className="text-sm font-mono uppercase tracking-wide text-[var(--teal)] mb-5">
          B. Antes de la clase — el mail con los datos
        </h2>

        <Paso n={4} titulo="Cuando ya tenés fecha y hora confirmadas de la próxima clase">
          <p>
            Vas a <b>Mail a inscriptos</b>, seleccionás a todos (o a los que corresponda), completás
            fecha, hora, el link de Meet, y el link del grupo de WhatsApp para seguir en vivo — el mail ya
            tiene la plantilla armada con los 4 datos. Revisás la vista previa de fecha/hora (aparece en
            verde abajo de cada campo) y enviás.
          </p>
        </Paso>
      </section>

      <section>
        <h2 className="text-sm font-mono uppercase tracking-wide text-[var(--teal)] mb-5">
          C. Durante y después de la clase
        </h2>

        <Paso n={5} titulo="Al arrancar la clase (mensaje en el grupo de WhatsApp)">
          <Mensaje etiqueta="Mandás al grupo">
            ¡Arrancamos! 🎬 Dejo acá el link para sumarse a la clase en vivo: [LINK DE MEET]
            {"\n\n"}
            Cualquier problema para entrar, avisen acá mismo.
          </Mensaje>
        </Paso>

        <Paso n={6} titulo="Al cerrar la clase (mensaje en el grupo + mail con la oferta)">
          <Mensaje etiqueta="Mandás al grupo">
            ¡Gracias por venir! 🙌 Si te quedaste con ganas de más, esto es lo que sigue:
            {"\n\n"}
            → Si lo que te frenaba era no saber vender o conseguir clientes: IA para Emprender [LINK]
            {"\n"}
            → Si lo que te frenaba era no saber si tu idea sirve, o querés ir más a fondo con la
            tecnología: De la Idea al Negocio [LINK]
            {"\n\n"}
            Cupo limitado porque es grupo reducido, no por apurarlos. Cualquier duda, este grupo sigue
            abierto.
          </Mensaje>
          <p>
            👉 Además del WhatsApp, mandás el mismo mensaje por mail: <b>Mail a inscriptos</b> → arriba
            elegís la plantilla <b>"🚀 Oferta de los cursos (después)"</b>, completás los 2 links, y
            enviás a todos.
          </p>
        </Paso>
      </section>

      <section>
        <h2 className="text-sm font-mono uppercase tracking-wide text-[var(--teal)] mb-5">
          D. Las 2 plantillas de mail que tenés disponibles
        </h2>
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden text-sm">
          <div className="grid grid-cols-[auto_1fr] gap-3 px-4 py-3 border-b border-[var(--line)]">
            <span className="text-[var(--teal)]">📩 Invitación a la clase</span>
            <span className="text-[var(--paper-dim)]">Antes de la clase — fecha, hora, link de Meet, grupo de WhatsApp</span>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3 px-4 py-3">
            <span className="text-[var(--teal)]">🚀 Oferta de los cursos</span>
            <span className="text-[var(--paper-dim)]">Después de la clase — links a IA para Emprender y De la Idea al Negocio</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-mono uppercase tracking-wide text-[var(--teal)] mb-5">
          Mapa rápido: dónde se hace cada cosa
        </h2>
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden text-sm">
          {[
            ["Alguien se registra solo (formulario web)", "Aparece solo en Panel y Mail a inscriptos"],
            ["Alguien te escribe por WhatsApp", "Mail a inscriptos → Agregar alguien que te escribió por WhatsApp"],
            ["Mandar el mail con fecha/hora/links de la clase", "Mail a inscriptos"],
            ["Ver cuánta gente se anotó y de dónde vino", "Panel"],
            ["Armar posts para redes con IA", "Campañas IA"],
            ["Armar un link para trackear una campaña puntual", "Links UTM"],
          ].map(([izq, der], i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-3 px-4 py-3 border-b border-[var(--line)] last:border-none"
            >
              <span className="text-[var(--paper-dim)]">{izq}</span>
              <span className="text-[var(--teal)]">{der}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
