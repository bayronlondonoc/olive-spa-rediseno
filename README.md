# Olivé Spa — Sitio web

Spa en un ambiente de lujo, diseñado para tu relajación, bienestar y recuperación, en el Hotel Dann Carlton Belfort (Medellín).

## Sitio web

Sitio estático de varias páginas (HTML + CSS + JS vanilla, sin build step): inicio, nosotros, una página por cada sección de servicios (masajes, faciales, cuidado capilar, programas spa y, si se vuelve a mostrar, post-quirúrgico) y contacto.

- **Sitio oficial:** https://olivespamedellin.com
- Desplegado en Vercel desde la rama `main`; cada push a `main` actualiza el sitio en vivo automáticamente. Las otras ramas generan una vista previa.

## Estructura

```
contenido.json    ← TODO el contenido del sitio (textos, servicios, fotos, videos, preguntas, contacto, SEO)
index.html        ← inicio                              ┐
nosotros/ masajes/ faciales/ cuidado-capilar/            │ GENERADAS a partir de contenido.json
programas/ post-quirurgico/ contacto/  (index.html)      │ (no editar a mano)
sitemap.xml       ← páginas visibles, para Google       ┘
creditos.html     ← créditos fotográficos (licencias Creative Commons)
robots.txt        ← indica a Google dónde está el sitemap
styles.css        ← estilos
main.js           ← interacciones y movimiento (ver «Animaciones»), galerías y visor de fotos/videos
lib/              ← GSAP + ScrollTrigger y Lenis (desplazamiento suave con mouse)
assets/img/       ← fotografías (repositorios gratuitos, ver créditos)
assets/img/servicios/ ← fotos de servicios de repositorios gratuitos (ver créditos)
assets/img/panel/ ← fotos subidas desde el panel
panel/            ← panel privado de administración (se abre en /tarifas)
api/panel.js      ← función de Vercel: acceso al panel y publicación de los cambios
api/_sitio.js     ← qué se puede editar (esquema) y validación
api/_paginas.js   ← generación de todas las páginas
api/_util.js      ← utilidades compartidas (videos, WhatsApp, rutas de cada página)
herramientas/generar.js ← regenera todas las páginas desde contenido.json
vercel.json       ← muestra panel/ en la dirección /tarifas
```

Las fotografías de repositorios provienen de fuentes gratuitas bajo licencias Creative Commons / dominio público (vía Openverse); la atribución completa está en `creditos.html`.

## Cómo funciona el contenido

Todo lo que se ve en el sitio vive en `contenido.json`, y las páginas se generan a partir de él con `api/_paginas.js`. Así la dueña puede cambiar cualquier parte desde el panel sin tocar código:

- **Cambios de contenido** (textos, servicios, fotos, videos, preguntas, contacto): desde el panel `/tarifas`, o editando `contenido.json` y corriendo `node herramientas/generar.js`. Si lo editas a mano, súbele 1 a `version`: así, si la dueña tiene el panel abierto, el panel le pide recargar en vez de pisar tu cambio.
- **Cambios de diseño** (estructura del HTML): en `api/_paginas.js`. Después corre `node herramientas/generar.js` y sube las páginas junto con el cambio.
- **Estilos e interacciones**: en `styles.css` y `main.js`. Si cambian, sube `VERSION_ARCHIVOS` en `api/_paginas.js` (para que los navegadores no usen la copia vieja) y regenera las páginas.
- **Agregar un campo editable**: decláralo en `ESQUEMA` (o en `CAMPOS_SERVICIO`) de `api/_sitio.js`, agrégalo a `contenido.json` y úsalo en `api/_paginas.js`. El panel arma sus formularios a partir del esquema, no hay que tocarlo.
- **Precios**: son opcionales. Un servicio sin precio se muestra sin valor (así están ahora, por pedido de la dueña).

El panel también hace commits en `main`: haz `git pull` antes de editar en local.

## Animaciones

El sitio tiene movimiento moderno, pensado primero para el celular (`main.js` + `styles.css`, con GSAP, ScrollTrigger y Lenis en `lib/`):

- Portada del inicio a pantalla completa: hasta 3 fotos que se turnan con un acercamiento lento; el título entra línea por línea.
- Buscador en la portada (computador): se elige un servicio y el botón abre WhatsApp con ese mensaje.
- Cambio de página suave (View Transitions, en los navegadores que lo permiten).
- Los bloques aparecen al bajar; los títulos suben palabra por palabra y las fotos grandes se destapan.
- El texto de «Nuestra esencia» se ilumina palabra por palabra al bajar.
- Tarjetas de cada experiencia; en el celular se deslizan de lado.
- Carrusel de masajes con flechas, barra de avance y arrastre con el mouse.
- Cuidado capilar: con mouse, la foto de cada tratamiento sigue al puntero.
- Fotos con profundidad (se mueven a otra velocidad que la página).
- La cinta de palabras se acelera al bajar y cambia de sentido al subir.
- En «Cómo funciona», una línea une los pasos y se dibuja al bajar.
- Preguntas frecuentes que se despliegan suave (solo una abierta a la vez).
- Cabecera transparente sobre la portada que se vuelve sólida al bajar, se esconde al bajar y vuelve al subir; menú a pantalla completa en celular y tableta.
- Botón flotante de WhatsApp (computador) y barra para reservar abajo (celular).
- Con mouse: desplazamiento suave, cursor propio que muestra «Ver» sobre las tarjetas y botones con imán.

Si el teléfono tiene activado «reducir movimiento», el sitio se muestra quieto (el `<head>` pone la clase `quieto` en vez de `movimiento`). Sin JavaScript, todo se ve igual, sin animaciones.

## Panel de administración

`/tarifas` es un panel privado (no enlazado desde el sitio y marcado `noindex`) para que la dueña administre el sitio desde el celular:

- Nombres, descripciones, etiquetas, duraciones y precios (opcionales) de cada servicio.
- Agregar, eliminar y reordenar servicios en cada sección.
- Hasta 3 fotos o videos por servicio (el primero es el principal).
- Foto de la portada de cada página (y de su tarjeta en el inicio); hasta 3 fotos en la portada del inicio.
- Sección de videos (hasta 12) con enlaces de Instagram, TikTok, YouTube, Facebook o Vimeo. Los videos no se suben al sitio: se muestran desde la red social, así el sitio sigue liviano.
- Preguntas frecuentes (hasta 12).
- Franja de aviso o promoción arriba de todas las páginas.
- Mostrar u ocultar secciones (cada sección de servicios con su página, videos, pasos, preguntas).
- Textos de todas las secciones, cifras (de 0 a 3), pasos, cinta de palabras.
- Nombres del menú, textos de los botones y textos pequeños que se repiten, títulos del pie de página, logo e ícono de la pestaña (en PNG, para conservar la transparencia).
- WhatsApp, correo, horarios, ubicación (lugar, dirección y enlace de Google Maps) y redes sociales (se actualizan en todas las páginas).
- Título y descripción para Google y para cuando se comparte el enlace.

El enlace a los créditos fotográficos del pie de página aparece solo mientras quede alguna foto de repositorios gratuitos (las que están en `assets/img/` fuera de `panel/`); las fotos que sube la dueña son propias. `node herramientas/auditar-textos.js` lista lo visible que no sale de `contenido.json`.

Al tocar **Guardar y publicar**, el panel muestra un resumen; al confirmar, `api/panel.js` valida todo, sube las fotos nuevas (JPEG liviano: grande máx. 1400 px y miniatura máx. 480 px), genera todas las páginas y publica `contenido.json` + páginas + fotos en **un solo commit** en la rama del sitio (`main` en el sitio real). Vercel lo publica solo en 1–2 minutos.

- Cada guardado sube el número `version` de `contenido.json`. Si alguien guardó antes desde otro celular, el panel pide recargar en vez de pisar esos cambios.
- Si el navegador se cierra antes de guardar, el panel ofrece recuperar los cambios la próxima vez (se guardan en ese mismo celular, sin las fotos nuevas).
- Para volver a una versión anterior del sitio: revierte el commit del panel en GitHub (cada guardado es un commit con la lista de cambios).
- Si se agrega una foto de un repositorio gratuito, su crédito va en `creditos.html` y `assets/credits.json`.
- Una sección oculta deja en su carpeta una página que lleva al inicio, para que los enlaces ya compartidos sigan funcionando.

**Panel de demostración:** `node herramientas/panel-demo.js` genera `panel-demo/index.html`, el mismo panel sin contraseña, que simula el servidor en el navegador con el contenido real y no publica nada. No se sube al sitio real (`panel-demo/` está excluido); se publica solo en la copia pública de GitHub Pages (`bayronlondonoc/olive-spa-rediseno`, rama `demo` del repositorio local) para mostrar cómo funciona el panel: https://bayronlondonoc.github.io/olive-spa-rediseno/panel-demo/

Variables de entorno en Vercel (Settings → Environment Variables, entorno Production):

| Variable | Contenido |
|---|---|
| `PANEL_USUARIO` | usuario del panel |
| `PANEL_CLAVE` | contraseña del panel |
| `GITHUB_TOKEN` | token *fine-grained* de GitHub con acceso solo a este repositorio y permiso **Contents: Read and write** |

Para cambiar la contraseña o renovar el token vencido: edita la variable en Vercel y vuelve a desplegar (Deployments → Redeploy). Cambiar cualquiera de las dos cierra las sesiones abiertas del panel.
