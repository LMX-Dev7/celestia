# Celestia Lash Studio

Landing page de **Celestia Lash Studio**, estudio de extensiones de pestañas en Barranquilla (Alameda). Sitio estático de una sola página con secciones de inicio, sobre el estudio, servicios (Soft, Signature, Glam y Celestia Volume), galería, métricas, testimonios y contacto.

## Estructura

```
index.html            Página principal (HTML + CSS + JS inline)
assets/instagram/      Fotos de perfil y publicaciones usadas en el sitio
favicon-16.png, favicon-32.png, apple-touch-icon.png   Iconos del sitio
og-image.jpg           Imagen para previews en redes sociales
generate-assets.js     Genera favicons y og-image a partir de las fotos de Instagram
scrape.js              Extrae datos/fotos de un perfil de Instagram (Playwright)
screenshot.js          Toma capturas de QA del sitio en desktop y mobile (Playwright)
```

## Requisitos

Los scripts de Node usan [`sharp`](https://www.npmjs.com/package/sharp) y [`playwright`](https://www.npmjs.com/package/playwright), que deben instalarse antes de ejecutarlos:

```bash
npm install sharp playwright
npx playwright install chromium
```

## Uso

```bash
# Regenerar favicons y og-image desde assets/instagram/post-2.jpg
node generate-assets.js

# Descargar fotos y datos de un perfil de Instagram
node scrape.js <usuario>

# Capturas de pantalla (QA) del sitio en desktop y mobile
node screenshot.js
```

## Despliegue

El sitio se despliega como estático en [Vercel](https://vercel.com). `.vercelignore` excluye los scripts de Node (`scrape.js`, `screenshot.js`, `generate-assets.js`) del despliegue.

## Licencia

[MIT](LICENSE)
