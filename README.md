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

## Estructura

```
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
