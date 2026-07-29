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



## Estructura

```
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
