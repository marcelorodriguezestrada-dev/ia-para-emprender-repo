<<<<<<< HEAD
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
| `/admin` | Generador de posts de Facebook con IA | Privada — requiere login |
| `/admin/utm` | Campañas UTM + contador de clics | Privada — requiere login |
| `/go/[id]` | Link corto que cuenta el clic y redirige (lo genera `/admin/utm`) | Pública (pero no se navega a mano, se comparte el link generado) |

## Antes de publicarla — completar esto

### 1. Firebase

1. https://console.firebase.google.com → creá un proyecto
2. Activá **Authentication → Sign-in method → Google**
3. Activá **Firestore Database** (modo producción)
4. **Reglas de Firestore**: pegá el contenido de `firestore.rules` (Firestore Database → Reglas → publicar). Sin este paso, ni el conteo de clics ni los registros de `/registro` van a funcionar.
5. Configuración del proyecto → Tus apps → agregá una app web, copiá las credenciales

### 2. Groq

https://console.groq.com/keys → generá una API key.

### 3. WhatsApp y grupo

- En `app/gracias/page.tsx`: reemplazá `LINK_GRUPO_WHATSAPP` por el link de invitación real de tu Comunidad/Grupo de WhatsApp
- El celular de contacto (Argentina) ya está cargado en los botones de WhatsApp de la landing. El de Bolivia todavía es un placeholder — buscá `59100000000` en `components/IAParaEmprenderLanding.tsx` y reemplazalo por el número real de Daniel cuando lo tengas

### 4. Variables de entorno

Copiá `.env.example` a `.env.local` y completá Firebase, Groq, y `NEXT_PUBLIC_ADMIN_EMAILS` (los mails de Google con los que vos y Daniel entran a `/admin`).

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
=======
# IA para Emprender — landing de venta

Landing page de una sola página (`index.html`) para vender el curso "IA para Emprender" (7 clases). Sin build, sin dependencias — es HTML + CSS + JS plano. Se edita y se sube tal cual.

## Antes de publicarla — 3 cosas para completar

Todo está agrupado arriba del todo en el archivo, dentro de `index.html`, en un bloque que dice `CONFIGURACIÓN`. Buscalo (Ctrl+F "CONFIGURACIÓN") y completá:

1. **WhatsApp**: los números de Argentina y Bolivia, con código de país, sin `+` ni espacios.
   - Ojo: además de ese bloque, hay 3 botones más arriba en la página (nav, hero, botón flotante) que también apuntan a WhatsApp — están escritos directo en el HTML como `https://wa.me/5491100000000...`. Buscá y reemplazá ese número también ahí (Ctrl+F `5491100000000`).
2. **Precios**: valor en pesos argentinos y en bolivianos. El selector 🇦🇷/🇧🇴 de la sección de precio ya cambia el número automáticamente.
3. **Instructores**: reemplazá "Daniel [Apellido]" y "Tu nombre" por los nombres y bios reales, en la sección "Quiénes lo dan".
4. **Fecha de apertura**: el campo `fechaApertura` dentro de `CONFIG` controla el banner de cuenta regresiva de arriba de todo ("Abrimos inscripciones en X días"). Poné ahí la fecha y hora real en que termina la difusión gratuita de 3 días y abrís la venta. Una vez que pasa esa fecha, el banner cambia solo a "¡Ya abrimos inscripciones!".

## Cómo publicarla (elegí una)

**Opción más simple — Netlify Drop** (gratis, sin cuenta de GitHub necesaria):
1. Entrá a https://app.netlify.com/drop
2. Arrastrá la carpeta completa (o el archivo `index.html`) a la página
3. Te da una URL pública al instante

**GitHub Pages** (gratis, si ya tenés o querés cuenta de GitHub):
1. Creá un repo nuevo en GitHub y subí este contenido (con `git push`, ver abajo, o arrastrando los archivos desde la web de GitHub)
2. En el repo: Settings → Pages → Source: rama `main`, carpeta `/root`
3. GitHub te da la URL pública (algo como `tuusuario.github.io/nombre-repo`)

**Vercel**: importá el repo desde vercel.com/new, no necesita configuración, detecta que es estático solo.

## Subir este repo a tu GitHub

Ya está inicializado como repositorio git local con el primer commit hecho. Para subirlo a tu cuenta:

```bash
# 1. Creá un repo vacío en GitHub (sin README, sin licencia) desde github.com/new
# 2. Conectalo y subí:
git remote add origin https://github.com/TU-USUARIO/NOMBRE-DEL-REPO.git
git branch -M main
git push -u origin main
```

## Flujo de captura: registro.html → gracias.html

Para la clase gratuita, el recorrido es: **landing → `registro.html` (nombre + mail) → `gracias.html` (botón al grupo de WhatsApp)**.

El formulario usa **Formspree** (gratis) para guardar los datos y redirigir automáticamente — no hace falta backend propio. Pasos para dejarlo funcionando (5 minutos):

1. Entrá a **https://formspree.io** y create una cuenta gratis
2. Creá un formulario nuevo (botón "New Form"), ponele un nombre (ej: "Registro clase gratuita")
3. Formspree te da un ID de formulario, algo como `f/xayzabcd`. Copiá esa URL completa
4. En `registro.html`, buscá esta línea y pegá tu URL real:
   ```html
   <form id="form-registro" action="https://formspree.io/f/TU_FORM_ID" method="POST">
   ```
5. En la misma sección, buscá el campo `_redirect` y poné la URL real de `gracias.html` una vez que esté publicada (ej: `https://tuusuario.github.io/ia-para-emprender/gracias.html`):
   ```html
   <input type="hidden" name="_redirect" value="https://TU-DOMINIO/gracias.html">
   ```
6. En `gracias.html`, reemplazá el link de invitación al grupo de WhatsApp (`TU-LINK-DE-INVITACION`) por el real — lo generás desde WhatsApp al crear tu Comunidad o Grupo (ver instrucciones más abajo en esta conversación / o en el chat donde armamos esto)

**Dónde ver las inscripciones:** entrás a tu cuenta de Formspree → tu formulario → pestaña "Submissions". Ahí tenés la lista de nombre + mail de todos los que se anotaron, exportable a CSV.

**Nota sobre el plan gratuito de Formspree:** el free tier tiene un límite de envíos por mes (alcanza de sobra para lanzar y probar). Si tu lista crece mucho, revisá los planes pagos en su web.


>>>>>>> 0a4a0cd1280317453f51561d4a27f7459a75db7c

## Estructura

```
<<<<<<< HEAD
app/
├── page.tsx                    → landing pública (usa components/IAParaEmprenderLanding.tsx)
├── registro/page.tsx           → formulario nombre + mail
├── gracias/page.tsx            → "solo falta 1 paso" + botón al grupo de WhatsApp
├── admin/
│   ├── layout.tsx              → guardia de acceso (lista blanca) + tabs
│   ├── page.tsx                → generador de posts + historial
│   └── utm/page.tsx            → campañas UTM + contador de clics
├── go/[id]/route.ts            → link corto: cuenta el clic y redirige
├── login/page.tsx              → login con Google (para /admin)
└── api/
    ├── generar-post/route.ts   → llama a Groq
    └── registro/route.ts       → guarda el lead de /registro en Firestore
components/
└── IAParaEmprenderLanding.tsx  → toda la landing pública
lib/
├── firebase.ts   → conexión a Firebase
├── auth.ts       → lista blanca de emails admin
├── posts.ts       → guardar/listar/borrar posts en Firestore
├── campanas.ts   → CRUD de campañas UTM + registro de clics
├── leads.ts      → guardar/listar los registros de /registro
└── config.ts     → destinos sugeridos para armar campañas UTM
firestore.rules   → reglas: leads y clics son públicos en escritura, todo lo demás requiere login
```

## Precios y cronograma

Siguen embebidos como datos dentro de `components/IAParaEmprenderLanding.tsx` (bloque `CONFIG` y arrays `CLASES`/`CRONOGRAMA`), igual que en la versión anterior — buscalos ahí si necesitás ajustarlos.

## Próximos pasos sugeridos

1. Crear la Página de Facebook del curso
2. Publicación automática desde `/admin` una vez que tengas la Página + permisos de Meta aprobados
3. Una vista de "Leads" dentro de `/admin` para ver la lista de gente registrada en `/registro` sin tener que entrar a la consola de Firebase (la función `listarLeads()` en `lib/leads.ts` ya está lista para esto, solo falta la pantalla)
=======
index.html                    → landing principal de venta (estática)
IAParaEmprenderLanding.tsx    → landing principal en React/Next.js
registro.html                 → formulario de registro (nombre + mail) para la clase gratuita
gracias.html                  → página "solo falta 1 paso", con el botón al grupo de WhatsApp
README.md                     → este archivo
```

## Sobre la versión TSX

`IAParaEmprenderLanding.tsx` es un componente de React pensado para Next.js (App Router). Usa `styled-jsx`, que ya viene integrado en Next.js — no hace falta instalar nada extra.

**Cómo usarlo:**
1. Copiá el archivo a tu proyecto, por ejemplo a `components/IAParaEmprenderLanding.tsx`
2. Import y uso en tu página, por ejemplo en `app/page.tsx`:
   ```tsx
   import IAParaEmprenderLanding from "@/components/IAParaEmprenderLanding";

   export default function Page() {
     return <IAParaEmprenderLanding />;
   }
   ```
3. Editá el mismo bloque `CONFIG` que en la versión HTML (está arriba del todo del archivo) con tus WhatsApp y precios reales.

Si tu proyecto usa Vite/CRA en vez de Next.js, funciona igual — `styled-jsx` no es exclusivo de Next, solo asegurate de tener `styled-jsx` en tus dependencias (`npm i styled-jsx`) si tu setup no lo trae por defecto.

## Próximos pasos sugeridos

- Clase 1 gratis (masterclass) como puerta de entrada, con CTA propio hacia esta landing
- Testimonios reales después de la primera cohorte
- Curso 2 ("De la Idea al Negocio", con validación de idea + blockchain) como upsell para quien termine este
# ia-para-emprender-repo
>>>>>>> 0a4a0cd1280317453f51561d4a27f7459a75db7c
