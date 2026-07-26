# IA para Emprender — landing de venta

Landing page de una sola página (`index.html`) para vender el curso "IA para Emprender" (7 clases). Sin build, sin dependencias — es HTML + CSS + JS plano. Se edita y se sube tal cual.

## Antes de publicarla — 3 cosas para completar

Todo está agrupado arriba del todo en el archivo, dentro de `index.html`, en un bloque que dice `CONFIGURACIÓN`. Buscalo (Ctrl+F "CONFIGURACIÓN") y completá:

1. **WhatsApp**: los números de Argentina y Bolivia, con código de país, sin `+` ni espacios.
   - Ojo: además de ese bloque, hay 3 botones más arriba en la página (nav, hero, botón flotante) que también apuntan a WhatsApp — están escritos directo en el HTML como `https://wa.me/5491100000000...`. Buscá y reemplazá ese número también ahí (Ctrl+F `5491100000000`).
2. **Precios**: valor en pesos argentinos y en bolivianos. El selector 🇦🇷/🇧🇴 de la sección de precio ya cambia el número automáticamente.
3. **Instructores**: reemplazá "Daniel [Apellido]" y "Tu nombre" por los nombres y bios reales, en la sección "Quiénes lo dan".

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

## Estructura

```
index.html                    → versión estática (HTML + CSS + JS en un solo archivo)
IAParaEmprenderLanding.tsx    → versión React/Next.js (mismo diseño, con estado)
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
