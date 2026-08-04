# IA para Emprender

Proyecto único de Next.js con dos partes:

- **Pública**: landing de venta, registro a la clase gratuita, y la página de "unite al grupo de WhatsApp"
- **Privada** (`/admin`): generador de posts con IA (Groq) y campañas UTM con conteo real de clics — solo para vos y Daniel, con login de Google. No hay ningún link visible desde las páginas públicas que lleve a `/admin`; quien no conoce la URL, no la encuentra.

## Rutas

| Ruta | Qué es | Quién la ve |
|---|---|---|
| `/` | Landing principal de venta (7 clases, precios AR/BO, cronograma) | Pública |
| `/registro` | Formulario de nombre + mail para la clase gratuita | Pública |
| `/gracias` | "Solo falta 1 paso" — botón para unirse al grupo de WhatsApp | Pública (se llega solo después de `/registro`) |
| `/admin/panel` | **Panel de control**: cuántos leads, cuántos clics, qué campaña rinde más | Privada — requiere login |
| `/admin/campanas` | Campañas completas generadas por IA (varios posts + calendario + links con seguimiento) | Privada — requiere login |
| `/admin/mail` | Mandar mail masivo a los inscriptos (con los datos de la clase) | Privada — requiere login |
| `/admin` | Generador de un post suelto con IA (más rápido, para algo puntual) | Privada — requiere login |
| `/admin/utm` | Campañas UTM manuales + contador de clics | Privada — requiere login |
| `/inscripcion-curso` | Anotarse al curso pago (nombre, mail, WhatsApp, idea de negocio) | Pública |
| `/pago` | Datos bancarios (CBU/alias) + botón para mandar el comprobante por WhatsApp | Pública (se llega solo después de `/inscripcion-curso`) |
| `/admin/alumnos` | Ver alumnos, su idea, marcar pagos, y dejarles notas de seguimiento | Privada — requiere login |
| `/go/[id]` | Link corto que cuenta el clic y redirige (lo genera `/admin/utm` y `/admin/campanas`) | Pública (pero no se navega a mano, se comparte el link generado) |

## Antes de publicarla — completar esto

### 1. Firebase

1. https://console.firebase.google.com → creá un proyecto
2. Activá **Authentication → Sign-in method → Google**
3. Activá **Firestore Database** (modo producción)
4. **Reglas de Firestore**: pegá el contenido de `firestore.rules` (Firestore Database → Reglas → publicar). Sin este paso, ni el conteo de clics ni los registros de `/registro` van a funcionar.
5. Configuración del proyecto → Tus apps → agregá una app web, copiá las credenciales

### 2. Groq

https://console.groq.com/keys → generá una API key.

### 2.5 Resend (para poder mandar mails a los inscriptos) — leé esto con atención

Sin este paso, la pestaña **"Mail a inscriptos"** no va a funcionar. Y hay una limitación real que tenés que conocer antes de armar tu expectativa:

**No podés mandar mails "de verdad" (a cualquier inscripto) sin verificar un dominio propio.** Resend, como todo servicio de mail serio, no te deja mandar mails masivos desde un dominio que no controlás — ni siquiera desde tu Gmail personal, ni desde un subdominio de `vercel.app` (ese dominio no es tuyo, es compartido). Sin verificar un dominio, Resend solo te deja mandar mails de prueba a tu propia cuenta, no a tus inscriptos reales.

**Lo que necesitás:**
1. Un dominio propio (vos mencionaste `ezeti.pro` en otra conversación — serviría perfecto, por ejemplo con un subdominio tipo `mail.ezeti.pro`)
2. En https://resend.com → **Domains** → **Add Domain** → seguís los pasos, que consisten en agregar 2-3 registros DNS (tipo TXT y MX) en el panel donde compraste ese dominio
3. La verificación puede tardar de minutos a un par de horas en propagar
4. Una vez verificado, armás el remitente como `IA para Emprender <hola@mail.ezeti.pro>` y lo cargás en `RESEND_FROM_EMAIL`

**Mientras tanto (para probar ya):** podés dejar `RESEND_FROM_EMAIL` sin configurar — usa por defecto `onboarding@resend.dev`, que Resend te deja usar SIN verificar nada, pero **solo te permite mandarte mails a vos mismo** (el mail con el que te registraste en Resend), no a tus inscriptos reales. Sirve para probar que el flujo funciona antes de meterte con el DNS.

Pasos para la API key:
1. https://resend.com → creás cuenta
2. **API Keys** → **Create API Key** → copiás el valor

### 3. WhatsApp y grupo

- En `app/gracias/page.tsx`: reemplazá `LINK_GRUPO_WHATSAPP` por el link de invitación real de tu Comunidad/Grupo de WhatsApp
- El celular de contacto (Argentina) ya está cargado en los botones de WhatsApp de la landing. El de Bolivia todavía es un placeholder — buscá `59100000000` en `components/IAParaEmprenderLanding.tsx` y reemplazalo por el número real de Daniel cuando lo tengas

### 3.5 Datos bancarios (para cobrar el curso pago) — completar antes de publicar

En `lib/config.ts`, buscá el bloque `DATOS_PAGO` y reemplazá con tus datos reales:

```typescript
export const DATOS_PAGO = {
  banco: "Banco [tu banco]",
  titular: "Marcelo Rodríguez Estrada",
  cbu: "0000000000000000000000",
  alias: "IA.PARA.EMPRENDER",
  cuit: "20-00000000-0",
  whatsappComprobante: "5491167076678",
};
```

Estos son los datos que ve cualquiera que se anote en `/inscripcion-curso` y llegue a `/pago` — si los dejás con los valores de ejemplo, nadie te va a poder pagar de verdad.

### 4. Variables de entorno

Copiá `.env.example` a `.env.local` y completá Firebase, Groq, Resend, y `NEXT_PUBLIC_ADMIN_EMAILS` (los mails de Google con los que vos y Daniel entran a `/admin`).

### 5. Instalar y correr local

```bash
npm install
npm run dev
```

`http://localhost:3000` → landing pública. `http://localhost:3000/admin` → te pide login.

### 6. Deploy

**Este proyecto ya NO sirve para GitHub Pages** (Pages solo sirve archivos estáticos, y acá hay API routes + autenticación server-side). Usá **Vercel** (gratis, y lo hizo justamente la gente de Next.js, así que no hay fricción):

1. https://vercel.com/new → importás este mismo repo de GitHub
2. Vercel detecta que es Next.js solo, no hay que configurar nada
3. Cargás las variables de entorno de `.env.local` en el panel de Vercel (Settings → Environment Variables)
4. Deploy — te da una URL tipo `ia-para-emprender.vercel.app` (o conectás tu dominio propio)

Podés seguir usando el mismo repo de GitHub que ya tenías — solo cambia dónde lo desplegás.

## Estructura

```
app/
├── page.tsx                    → landing pública (usa components/IAParaEmprenderLanding.tsx)
├── registro/page.tsx           → formulario nombre + mail
├── gracias/page.tsx            → "solo falta 1 paso" + botón al grupo de WhatsApp
├── admin/
│   ├── layout.tsx              → guardia de acceso (lista blanca) + tabs
│   ├── panel/page.tsx          → panel de control: leads + clics por campaña
│   ├── campanas/page.tsx       → campañas completas con IA (varios posts + calendario)
│   ├── mail/page.tsx           → mandar mail masivo a los inscriptos
│   ├── page.tsx                → generador de un post suelto + historial
│   └── utm/page.tsx            → campañas UTM manuales + contador de clics
├── go/[id]/route.ts            → link corto: cuenta el clic y redirige
├── login/page.tsx              → login con Google (para /admin)
└── api/
    ├── enviar-mail/route.ts     → manda el mail masivo con Resend
    ├── generar-campana/route.ts → llama a Groq para armar la campaña completa
    ├── generar-post/route.ts   → llama a Groq para un post suelto
    └── registro/route.ts       → guarda el lead de /registro en Firestore
components/
└── IAParaEmprenderLanding.tsx  → toda la landing pública
lib/
├── firebase.ts          → conexión a Firebase
├── auth.ts              → lista blanca de emails admin
├── email.ts             → envío de mails masivos personalizados con Resend
├── posts.ts             → guardar/listar/borrar posts sueltos en Firestore
├── campanas.ts          → CRUD de links UTM + registro de clics
├── campanasGeneradas.ts → CRUD de campañas completas generadas por IA
├── leads.ts             → guardar/listar los registros de /registro
└── config.ts            → destinos sugeridos para armar campañas
firestore.rules   → reglas: leads y clics son públicos en escritura, todo lo demás requiere login
```

## Precios y cronograma

Siguen embebidos como datos dentro de `components/IAParaEmprenderLanding.tsx` (bloque `CONFIG` y arrays `CLASES`/`CRONOGRAMA`), igual que en la versión anterior — buscalos ahí si necesitás ajustarlos.

## Próximos pasos sugeridos

1. Crear la Página de Facebook del curso
2. Publicación automática desde `/admin` una vez que tengas la Página + permisos de Meta aprobados
3. Una vista de "Leads" dentro de `/admin` para ver la lista de gente registrada en `/registro` sin tener que entrar a la consola de Firebase (la función `listarLeads()` en `lib/leads.ts` ya está lista para esto, solo falta la pantalla)
