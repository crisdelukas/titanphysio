# titanphysio.ch

Web estática (HTML + CSS + JS, sin dependencias) para GitHub Pages.

```
index.html          ← página (borrador v0.1, en inglés)
css/style.css       ← estilos (colores y tipografías arriba del todo, en :root)
js/main.js          ← scroll, acordeones, menú móvil, formulario
assets/logo/        ← logos limpios (se colorean con CSS)
assets/img/         ← fotos (las de ahora son provisionales, recortadas del mockup)
CONTENIDO.md        ← datos de contacto, textos actuales y lo que hay que confirmar
```

## Subir a GitHub
1. Crea un repo (por ejemplo `titanphysio`) → **Add file → Upload files** → arrastra todo el contenido de esta carpeta (no la carpeta en sí) → **Commit**.
2. **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)` → **Save**.
3. En 1–2 minutos estará en `https://TU-USUARIO.github.io/titanphysio/`.

## Más adelante
- Formulario: crear un formulario en Formspree y sustituir `YOUR_FORM_ID` en `index.html`.
- Idiomas: `/` (DE), `/en/`, `/fr/`, `/it/`. Se generan cuando el diseño esté cerrado.
- Dominio: añadir un archivo `CNAME` con `titanphysio.ch` y cambiar el DNS (te guío en su momento).
