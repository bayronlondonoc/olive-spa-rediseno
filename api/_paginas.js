// Genera todas las páginas del sitio a partir del contenido ya validado (api/_sitio.js).
// renderizar(c) devuelve { "ruta/archivo": texto }: index.html, nosotros/index.html, una página por cada
// sección de servicios (masajes/index.html, …), contacto/index.html y sitemap.xml.
// Las secciones ocultas dejan una página que redirige al inicio, para que los enlaces viejos no fallen.
"use strict";

const {
  SITIO_URL, SECCIONES_SERVICIOS, PAGINAS, rutasDeFotos,
  esc, parrafo, formatoPrecio, enlaceWhatsapp, telefonoVisible, embedVideo, posterVideo
} = require("./_util");

// Versión de styles.css y main.js (cambiarla cuando cambien esos archivos, para que los navegadores los recarguen).
const VERSION_ARCHIVOS = "2026110701";

// Cómo se presenta cada sección de servicios en el inicio.
const BLOQUE_INICIO = { masajes: "carrusel", faciales: "dividido", capilar: "lista", programas: "galeria", postquirurgico: "dividido-inverso" };

/* =====================================================================
   Íconos
   ===================================================================== */
const ICONO_WHATSAPP = '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.66 15L2 22l5.16-1.32A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.06.78.82-2.98-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.13c-.25-.12-1.47-.72-1.7-.8s-.39-.13-.56.12-.64.8-.78.97-.29.19-.54.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.33a.45.45 0 0 0-.02-.43c-.06-.12-.56-1.34-.76-1.84s-.4-.42-.56-.43h-.48a.93.93 0 0 0-.67.31 2.81 2.81 0 0 0-.87 2.09 4.89 4.89 0 0 0 1.02 2.58 11.16 11.16 0 0 0 4.27 3.77 14.3 14.3 0 0 0 1.42.53 3.42 3.42 0 0 0 1.57.1 2.57 2.57 0 0 0 1.68-1.19 2.08 2.08 0 0 0 .14-1.19c-.06-.1-.23-.17-.48-.29Z"/>';
const ICONOS_REDES = {
  instagram: '<path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.26.07 1.64.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.26.06-1.64.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.74 0 8.33 0 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05 0 8.33 0 8.74 0 12s0 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 24 8.74 24 12 24s3.67 0 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.07-1.28.07-1.69.07-4.95s0-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67 0 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.15A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm7.85-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z"/>',
  facebook: '<path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07Z"/>',
  tiktok: '<path fill="currentColor" d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>'
};
const FLECHA = '<svg class="flecha" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 12h17m-6-6.5L20.5 12 14 18.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const icono = (contenido, tamano) => '<svg viewBox="0 0 24 24" width="' + tamano + '" height="' + tamano + '" aria-hidden="true">' + contenido + "</svg>";

// Redes en el orden en que se muestran. La primera con enlace es la principal y lleva su @usuario.
const REDES = ["instagram", "facebook", "tiktok"];
const NOMBRE_RED = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok" };
function usuarioRed(red, url) {
  let u;
  try { u = new URL(url); } catch (_) { return ""; }
  const parte = u.pathname.split("/").filter(Boolean)[0] || "";
  if (red === "instagram" && /^[\w.]{1,30}$/.test(parte) && !/^(p|reel|reels|tv|stories|explore)$/i.test(parte)) return "@" + parte;
  if (red === "tiktok" && /^@[\w.]{1,30}$/.test(parte)) return parte;
  return "";
}

/* =====================================================================
   Piezas comunes
   ===================================================================== */
const dos = (n) => String(n).padStart(2, "0");
const minusculaInicial = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const titulo = (t, destacado, salto) => [t && esc(t), destacado && "<em>" + esc(destacado) + "</em>"].filter(Boolean).join(salto ? "<br />" : " ");
const conRetorno = (lineas, sangria) => lineas.filter((l) => l !== null && l !== undefined && l !== false).map((l) => sangria + l).join("\n");

// Lo que cada página necesita saber: el contenido, cuántas carpetas subir para llegar a la raíz y la página actual.
function contexto(c, actual) {
  const base = actual === "inicio" ? "" : "../";
  const visibles = SECCIONES_SERVICIOS.filter((k) => c[k].visible && c[k].servicios.length);
  return {
    c,
    base,
    actual,
    visibles,
    reservar: enlaceWhatsapp(c.contacto.whatsapp, c.contacto.mensaje),
    ruta: (p) => base + p,
    pagina: (clave) => (clave === "inicio" ? base || "./" : base + PAGINAS[clave] + "/")
  };
}
const waServicio = (ctx, s) => enlaceWhatsapp(ctx.c.contacto.whatsapp, (ctx.c.general.mensaje_servicio + " " + s.nombre).trim());
const enlaceVer = (ctx, clave) => ctx.c.general.ver + " " + minusculaInicial(ctx.c[clave].menu);

function imagen(ctx, foto, clase, extra) {
  if (!foto) return "";
  return '<img' + (clase ? ' class="' + clase + '"' : "") + ' src="' + esc(ctx.ruta(foto.grande)) + '" alt="' + esc(foto.alt || "") + '"' + (extra || ' loading="lazy" decoding="async"') + " />";
}
const primeraFoto = (s) => s.medios.find((m) => m.tipo === "foto") || null;

function enlacesRedes(ctx, tamano) {
  const ct = ctx.c.contacto;
  return REDES.filter((red) => ct[red]).map((red, i) => {
    const usuario = i === 0 ? usuarioRed(red, ct[red]) : "";
    return '<a class="red' + (usuario ? " red-usuario" : "") + '" href="' + esc(ct[red]) + '" target="_blank" rel="noopener" aria-label="' +
      NOMBRE_RED[red] + " de " + esc(ctx.c.marca.nombre) + (usuario ? ": " + esc(usuario) : "") + '">' + icono(ICONOS_REDES[red], tamano || 18) + (usuario ? "<span>" + esc(usuario) + "</span>" : "") + "</a>";
  });
}

function cabezaSeccion(s, opciones) {
  const o = opciones || {};
  const lineas = [];
  if (s.etiqueta) lineas.push('<p class="etiqueta' + (o.clara ? " etiqueta-clara" : "") + ' reveal">' + esc(s.etiqueta) + "</p>");
  if (s.titulo || s.destacado) lineas.push("<" + (o.h || "h2") + ' class="titulo-seccion" data-dividir>' + titulo(s.titulo, s.destacado) + "</" + (o.h || "h2") + ">");
  return lineas;
}
const regalo = (s) => (s.regalo ? '<p class="regalo reveal">' + (s.regalo_intro ? esc(s.regalo_intro) + " " : "") + "<strong>" + esc(s.regalo) + "</strong></p>" : null);
const horarioCorto = (h) => (h.corto || h.dias) + " · " + h.horas;

// Dónde abrir el mapa: el enlace que pegaron en el panel o una búsqueda del lugar.
function lugar(ct) {
  const consulta = [ct.ubicacion, ct.direccion].filter(Boolean).join(", ");
  if (!consulta) return null;
  return {
    consulta,
    enlace: ct.mapa || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta),
    embed: "https://maps.google.com/maps?q=" + encodeURIComponent(consulta) + "&z=16&output=embed"
  };
}

// Fotos y videos de un servicio: una portada que se desliza si hay varias; al tocarla se abre en grande.
function galeria(ctx, s) {
  if (!s.medios.length) return "";
  const items = s.medios.map((m) => {
    if (m.tipo === "video") {
      const poster = posterVideo(m);
      return '<span class="media media-video" data-video="' + esc(embedVideo(m)) + '" data-plataforma="' + m.plataforma + '"' +
        (m.vertical ? ' data-vertical="1"' : "") + ' role="img" aria-label="Video: ' + esc(s.nombre) + '"' +
        (poster ? ' style="background-image: url(\'' + esc(poster) + '\')"' : "") + "></span>";
    }
    return '<img class="media" src="' + esc(ctx.ruta(m.grande)) + '" data-grande="' + esc(ctx.ruta(m.grande)) + '" alt="' + esc(m.alt || s.nombre) + '" loading="lazy" decoding="async" />';
  }).join("");
  return '<div class="galeria" data-galeria="' + esc(s.id) + '" data-cantidad="' + s.medios.length + '" role="button" tabindex="0" aria-label="Ver fotos: ' + esc(s.nombre) + '" data-cursor="' + esc(ctx.c.general.ver) + '">' + items + "</div>";
}

/* =====================================================================
   Documento, cabecera, menú y pie
   ===================================================================== */
function documento(ctx, p) {
  const { c } = ctx;
  const ruta = p.ruta ? p.ruta + "/" : "";
  const url = SITIO_URL + ruta;
  const tituloPagina = p.titulo ? p.titulo + " · " + c.marca.nombre : c.sitio.titulo;
  const descripcion = p.descripcion || c.sitio.descripcion;
  const aviso = c.aviso.visible && c.aviso.texto;
  const L = [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '  <meta charset="utf-8" />',
    // Antes de pintar: «movimiento» activa las animaciones; «quieto» si el teléfono pide reducir el movimiento.
    '  <script>document.documentElement.className = matchMedia("(prefers-reduced-motion: reduce)").matches ? "quieto" : "movimiento";</script>',
    '  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
    "  <title>" + esc(tituloPagina) + "</title>",
    '  <meta name="description" content="' + esc(descripcion) + '" />',
    '  <link rel="canonical" href="' + url + '" />',
    '  <meta name="theme-color" content="#2d3a30" />',
    '  <meta property="og:type" content="website" />',
    '  <meta property="og:site_name" content="' + esc(c.marca.nombre) + '" />',
    '  <meta property="og:title" content="' + esc(p.titulo ? tituloPagina : c.sitio.compartir_titulo || c.sitio.titulo) + '" />',
    '  <meta property="og:description" content="' + esc(p.titulo ? descripcion : c.sitio.compartir_descripcion || c.sitio.descripcion) + '" />',
    '  <meta property="og:url" content="' + url + '" />',
    p.imagen ? '  <meta property="og:image" content="' + SITIO_URL + esc(p.imagen.grande) + '" />' : null,
    '  <meta property="og:locale" content="es_CO" />',
    '  <link rel="icon" type="image/png" sizes="32x32" href="' + esc(ctx.ruta(c.sitio.icono.mini || c.sitio.icono.grande)) + '" />',
    '  <link rel="apple-touch-icon" sizes="180x180" href="' + esc(ctx.ruta(c.sitio.icono.grande)) + '" />',
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" />',
    p.imagen ? '  <link rel="preload" as="image" href="' + esc(ctx.ruta(p.imagen.grande)) + '" fetchpriority="high" />' : null,
    '  <link rel="stylesheet" href="' + ctx.ruta("styles.css?v=" + VERSION_ARCHIVOS) + '" />',
    p.datos ? '  <script type="application/ld+json">' + JSON.stringify(p.datos).replace(/</g, "\\u003c") + "</script>" : null,
    "</head>",
    '<body class="pagina-' + ctx.actual + (aviso ? " con-aviso" : "") + (p.portadaOscura ? " con-portada-oscura" : "") + '">',
    '  <a class="saltar" href="#contenido">Saltar al contenido</a>',
    cabecera(ctx, aviso),
    menuMovil(ctx),
    '  <main id="contenido">',
    p.cuerpo,
    "  </main>",
    pie(ctx),
    flotantes(ctx),
    '  <script defer src="' + ctx.ruta("lib/gsap.min.js") + '"></script>',
    '  <script defer src="' + ctx.ruta("lib/ScrollTrigger.min.js") + '"></script>',
    '  <script defer src="' + ctx.ruta("lib/lenis.min.js") + '"></script>',
    '  <script defer src="' + ctx.ruta("main.js?v=" + VERSION_ARCHIVOS) + '"></script>',
    "</body>",
    "</html>",
    ""
  ];
  return L.filter((l) => l !== null).join("\n");
}

// Páginas del menú, en orden: Nosotros, cada sección de servicios visible y Contacto.
function entradasMenu(ctx) {
  const { c } = ctx;
  return [
    { clave: "nosotros", nombre: c.nosotros.menu },
    ...ctx.visibles.map((k) => ({ clave: k, nombre: c[k].menu })),
    { clave: "contacto", nombre: c.reserva.menu }
  ];
}
const actualAttr = (ctx, clave) => (ctx.actual === clave ? ' aria-current="page"' : "");

function marcaHtml(ctx) {
  const { c } = ctx;
  return '<a class="marca" href="' + ctx.pagina("inicio") + '"' + (ctx.actual === "inicio" ? ' aria-current="page"' : "") + '><span class="marca-nombre">' + esc(c.marca.nombre) + "</span>" +
    (c.marca.lema ? '<span class="marca-lema">' + esc(c.marca.lema) + "</span>" : "") + "</a>";
}

function cabecera(ctx, aviso) {
  const { c } = ctx;
  return conRetorno([
    '<header class="cabecera" data-cabecera>',
    aviso ? '  <p class="aviso">' + esc(c.aviso.texto) + "</p>" : null,
    '  <div class="cabecera-barra">',
    "    " + marcaHtml(ctx),
    '    <nav class="cabecera-menu" aria-label="Principal">',
    ...entradasMenu(ctx).map((e) => '      <a href="' + ctx.pagina(e.clave) + '"' + actualAttr(ctx, e.clave) + ">" + esc(e.nombre) + "</a>"),
    "    </nav>",
    '    <a class="boton boton-cabecera" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener">' + esc(c.contacto.boton_menu) + "</a>",
    '    <button class="cabecera-abrir" type="button" data-menu-abrir aria-expanded="false" aria-controls="menu-movil">',
    '      <span class="cabecera-abrir-texto">' + esc(c.general.menu) + "</span>",
    '      <span class="cabecera-abrir-lineas" aria-hidden="true"><span></span><span></span></span>',
    "    </button>",
    "  </div>",
    "</header>"
  ], "  ");
}

function menuMovil(ctx) {
  const { c } = ctx;
  const ct = c.contacto;
  const entradas = [{ clave: "inicio", nombre: c.general.inicio }, ...entradasMenu(ctx)];
  const redes = enlacesRedes(ctx, 20);
  return conRetorno([
    '<div class="menu-movil" id="menu-movil" data-menu inert aria-label="' + esc(c.general.menu) + '">',
    '  <div class="menu-movil-cabeza">',
    "    " + marcaHtml(ctx),
    '    <button class="menu-cerrar" type="button" data-menu-cerrar>' + esc(c.general.cerrar) + "</button>",
    "  </div>",
    '  <nav class="menu-movil-enlaces">',
    ...entradas.map((e, i) => '    <a href="' + ctx.pagina(e.clave) + '"' + actualAttr(ctx, e.clave) + ' style="--i:' + i + '"><span class="menu-num">' + dos(i + 1) + "</span><span>" + esc(e.nombre) + "</span></a>"),
    "  </nav>",
    '  <div class="menu-movil-pie">',
    '    <a class="boton boton-oscuro" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener">' + icono(ICONO_WHATSAPP, 18) + esc(c.portada.boton) + "</a>",
    ct.email ? '    <a class="menu-movil-dato" href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a>" : null,
    redes.length ? '    <div class="redes">' + redes.join("") + "</div>" : null,
    "  </div>",
    "</div>"
  ], "  ");
}

function pie(ctx) {
  const { c } = ctx;
  const ct = c.contacto;
  const sitio = lugar(ct);
  const redes = enlacesRedes(ctx, 18);
  const conCreditos = [...rutasDeFotos(c)].some((r) => r.startsWith("assets/img/") && !r.startsWith("assets/img/panel/"));
  const entradas = [{ clave: "inicio", nombre: c.general.inicio }, ...entradasMenu(ctx)];
  return conRetorno([
    '<footer class="pie">',
    '  <div class="contenedor">',
    '    <div class="pie-marca reveal">',
    // El logo ya trae el nombre escrito; su texto alternativo es el nombre del spa.
    '      <img class="pie-logo" src="' + esc(ctx.ruta(c.marca.logo.grande)) + '" alt="' + esc(c.marca.nombre) + '" width="168" height="168" loading="lazy" decoding="async" />',
    c.marca.lema ? '      <p class="pie-lema">' + esc(c.marca.lema) + "</p>" : null,
    c.marca.mision ? '      <p class="pie-mision">' + parrafo(c.marca.mision) + "</p>" : null,
    "    </div>",
    '    <div class="pie-columnas">',
    '      <div class="pie-columna">',
    "        <h2>" + esc(c.marca.titulo_paginas) + "</h2>",
    "        <ul>",
    ...entradas.map((e) => '          <li><a href="' + ctx.pagina(e.clave) + '">' + esc(e.nombre) + "</a></li>"),
    "        </ul>",
    "      </div>",
    '      <div class="pie-columna">',
    "        <h2>" + esc(c.marca.titulo_contacto) + "</h2>",
    "        <ul>",
    '          <li><a href="' + esc(enlaceWhatsapp(ct.whatsapp)) + '" target="_blank" rel="noopener">+57 ' + telefonoVisible(ct.whatsapp) + "</a></li>",
    ct.whatsapp_2 ? '          <li><a href="' + esc(enlaceWhatsapp(ct.whatsapp_2)) + '" target="_blank" rel="noopener">+57 ' + telefonoVisible(ct.whatsapp_2) + "</a></li>" : null,
    ct.email ? '          <li><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></li>" : null,
    "        </ul>",
    "      </div>",
    ct.horarios.length ? '      <div class="pie-columna">' : null,
    ct.horarios.length ? "        <h2>" + esc(c.marca.titulo_horarios) + "</h2>" : null,
    ct.horarios.length ? "        <ul>" + ct.horarios.map((h) => "<li>" + esc(h.dias) + "<br />" + esc(h.horas) + "</li>").join("") + "</ul>" : null,
    ct.horarios.length ? "      </div>" : null,
    sitio ? '      <div class="pie-columna">' : null,
    sitio ? "        <h2>" + esc(c.marca.titulo_ubicacion) + "</h2>" : null,
    sitio ? "        <ul>" + (ct.ubicacion ? "<li>" + esc(ct.ubicacion) + "</li>" : "") + (ct.direccion ? "<li>" + esc(ct.direccion) + "</li>" : "") +
      '<li><a class="enlace-linea" href="' + esc(sitio.enlace) + '" target="_blank" rel="noopener">' + esc(c.general.como_llegar) + "</a></li></ul>" : null,
    sitio ? "      </div>" : null,
    "    </div>",
    redes.length ? '    <div class="redes pie-redes">' + redes.join("") + "</div>" : null,
    '    <div class="pie-final">',
    "      <p>© <span data-year>2026</span> " + esc(c.marca.nombre) + (c.marca.derechos ? " · " + esc(c.marca.derechos) : "") + "</p>",
    // Los créditos solo hacen falta mientras quede alguna foto de repositorios gratuitos (las subidas desde el panel son propias).
    conCreditos ? '      <p><a href="' + ctx.ruta("creditos.html") + '">Créditos fotográficos</a></p>' : null,
    "    </div>",
    "  </div>",
    "</footer>"
  ], "  ");
}

function flotantes(ctx) {
  const { c } = ctx;
  return conRetorno([
    '<a class="wa-flotante" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener" aria-label="' + esc(c.portada.boton) + '" data-flotante>' + icono(ICONO_WHATSAPP, 26) + "</a>",
    '<div class="barra-movil" data-barra-movil>',
    '  <a class="boton boton-oscuro" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener">' + icono(ICONO_WHATSAPP, 18) + esc(c.portada.boton) + "</a>",
    "</div>"
  ], "  ");
}

/* =====================================================================
   Secciones del inicio
   ===================================================================== */
function seccionPortada(ctx) {
  const { c } = ctx;
  const p = c.portada;
  const fotos = [p.foto, p.foto_2, p.foto_3].filter(Boolean);
  // El buscador arma el mensaje de WhatsApp con el servicio que se elija.
  const grupos = ctx.visibles.map((k) => '<optgroup label="' + esc(c[k].menu) + '">' +
    c[k].servicios.map((s) => '<option value="' + esc(waServicio(ctx, s)) + '">' + esc(s.nombre) + "</option>").join("") + "</optgroup>");
  return conRetorno([
    '<section class="portada" id="inicio" data-portada>',
    '  <div class="portada-fotos">',
    ...fotos.map((f, i) => '    <img class="portada-foto' + (i === 0 ? " activa" : "") + '" src="' + esc(ctx.ruta(f.grande)) + '" alt="' + (i === 0 ? esc(f.alt) : "") + '"' +
      (i === 0 ? ' fetchpriority="high"' : ' fetchpriority="low"') + ' decoding="async" />'),
    "  </div>",
    '  <div class="portada-velo" aria-hidden="true"></div>',
    '  <div class="contenedor portada-contenido">',
    p.etiqueta ? '    <p class="etiqueta etiqueta-clara portada-etiqueta">' + esc(p.etiqueta) + "</p>" : null,
    '    <h1 class="portada-titulo"><span class="linea"><span>' + esc(p.titulo) + "</span></span>" + (p.destacado ? '<span class="linea"><em>' + esc(p.destacado) + "</em></span>" : "") + "</h1>",
    p.texto ? '    <p class="portada-texto">' + parrafo(p.texto) + "</p>" : null,
    '    <div class="portada-acciones">',
    '      <a class="boton boton-claro" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener">' + icono(ICONO_WHATSAPP, 18) + esc(p.boton) + "</a>",
    '      <a class="enlace enlace-claro" href="#experiencias">' + esc(p.boton_2) + "</a>",
    "    </div>",
    "  </div>",
    grupos.length ? '  <div class="buscador" data-buscador>' : null,
    grupos.length ? '    <label class="buscador-campo"><span class="buscador-etiqueta">' + esc(c.general.elige) + '</span><select data-buscador-lista>' + grupos.join("") + "</select></label>" : null,
    grupos.length ? '    <a class="boton boton-claro" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener" data-buscador-ir>' + esc(c.general.reservar) + "</a>" : null,
    grupos.length ? "  </div>" : null,
    c.general.desliza ? '  <a class="portada-bajar" href="#nosotros"><span>' + esc(c.general.desliza) + '</span><i aria-hidden="true"></i></a>' : null,
    fotos.length > 1 ? '  <p class="portada-contador" aria-hidden="true"><span data-portada-actual>01</span> / ' + dos(fotos.length) + "</p>" : null,
    "</section>"
  ], "    ");
}

function cifras(ctx) {
  const n = ctx.c.nosotros;
  if (!n.cifras.length) return null;
  const total = ctx.visibles.reduce((t, k) => t + ctx.c[k].servicios.length, 0);
  return '<ul class="cifras reveal">' + n.cifras.map((cifra) => {
    const numero = cifra.auto ? total : cifra.numero;
    return "<li" + (cifra.mas ? ' class="mas"' : "") + '><strong data-count-to="' + numero + '">' + numero + "</strong><span>" + esc(cifra.texto) + "</span></li>";
  }).join("") + "</ul>";
}

function seccionEsencia(ctx) {
  const n = ctx.c.nosotros;
  return conRetorno([
    '<section class="esencia seccion" id="nosotros">',
    '  <div class="contenedor contenedor-estrecho">',
    ...cabezaSeccion(n).map((l) => "    " + l),
    '    <p class="esencia-texto" data-texto-progresivo>' + parrafo(n.texto) + "</p>",
    "    " + (cifras(ctx) || ""),
    '    <a class="enlace reveal" href="' + ctx.pagina("nosotros") + '">' + esc(n.boton) + "</a>",
    "  </div>",
    "</section>"
  ], "    ");
}

// Tarjetas grandes, una por sección de servicios (en el inicio y al final de cada página).
function seccionExperiencias(ctx, opciones) {
  const { c } = ctx;
  const o = opciones || {};
  const claves = ctx.visibles.filter((k) => k !== o.excluir);
  if (!claves.length) return "";
  const cabeza = o.titulo ? ['<h2 class="titulo-seccion" data-dividir>' + esc(o.titulo) + "</h2>"] : cabezaSeccion(c.inicio);
  return conRetorno([
    '<section class="experiencias seccion' + (o.clase ? " " + o.clase : "") + '" id="' + (o.id || "experiencias") + '">',
    '  <div class="contenedor">',
    '    <header class="cabeza cabeza-centrada">',
    ...cabeza.map((l) => "      " + l),
    "    </header>",
    '    <div class="pilares" data-deslizable style="--n: ' + claves.length + '">',
    ...claves.map((k, i) => {
      const s = c[k];
      return conRetorno([
        '<a class="pilar reveal" href="' + ctx.pagina(k) + '" data-cursor="' + esc(c.general.ver) + '">',
        '  <figure class="pilar-foto">' + imagen(ctx, s.foto) + "</figure>",
        '  <div class="pilar-texto">',
        '    <span class="pilar-num">' + dos(i + 1) + "</span>",
        '    <h3 class="pilar-nombre">' + esc(s.menu) + "</h3>",
        s.resumen ? '    <p class="pilar-resumen">' + esc(s.resumen) + "</p>" : null,
        '    <span class="pilar-ir">' + esc(enlaceVer(ctx, k)) + FLECHA + "</span>",
        "  </div>",
        "</a>"
      ], "      ");
    }),
    "    </div>",
    "  </div>",
    "</section>"
  ], "    ");
}

function seccionCinta(ctx) {
  const frases = ctx.c.cinta.frases;
  // Cada mitad repite las frases hasta tener al menos 8, para que no quede un hueco en pantallas anchas.
  const vueltas = Math.ceil(8 / frases.length);
  const mitad = frases.map((f) => "<span>" + esc(f) + '</span><i aria-hidden="true"></i>').join("").repeat(vueltas);
  return conRetorno([
    '<div class="cinta" aria-hidden="true">',
    '  <div class="cinta-pista" style="animation-duration: ' + 7 * frases.length * vueltas + 's">' + mitad + mitad + "</div>",
    "</div>"
  ], "    ");
}

function cabezaConEnlace(ctx, clave, clara) {
  const s = ctx.c[clave];
  return [
    '<header class="cabeza cabeza-con-enlace">',
    "  <div>",
    ...cabezaSeccion(s, { clara }).map((l) => "    " + l),
    "  </div>",
    '  <a class="enlace' + (clara ? " enlace-claro" : "") + ' reveal" href="' + ctx.pagina(clave) + '">' + esc(enlaceVer(ctx, clave)) + "</a>",
    "</header>"
  ];
}

function tarjetaServicio(ctx, clave, s, clase) {
  const foto = primeraFoto(s);
  return conRetorno([
    '<a class="tarjeta' + (clase ? " " + clase : "") + (foto ? "" : " tarjeta-sin-foto") + '" href="' + ctx.pagina(clave) + "#" + esc(s.id) + '" data-cursor="' + esc(ctx.c.general.ver) + '">',
    '  <figure class="tarjeta-foto">' + (foto ? imagen(ctx, foto) : '<span class="tarjeta-inicial" aria-hidden="true">' + esc(s.nombre.charAt(0)) + "</span>") + "</figure>",
    '  <div class="tarjeta-texto">',
    "    <h3>" + esc(s.nombre) + "</h3>",
    s.detalle ? "    <p>" + esc(s.detalle) + "</p>" : null,
    "  </div>",
    "</a>"
  ], "");
}

function bloqueCarrusel(ctx, clave) {
  const s = ctx.c[clave];
  return conRetorno([
    '<section class="bloque bloque-carrusel seccion seccion-crema" id="' + clave + '">',
    '  <div class="contenedor">',
    ...cabezaConEnlace(ctx, clave).map((l) => "    " + l),
    s.regalo ? "    " + regalo(s) : null,
    "  </div>",
    '  <div class="carrusel" data-carrusel>',
    '    <div class="carrusel-pista" data-carrusel-pista data-lenis-prevent-touch tabindex="0" aria-label="' + esc(s.menu) + '">',
    ...s.servicios.map((srv) => tarjetaServicio(ctx, clave, srv).split("\n").map((l) => "      " + l).join("\n")),
    "    </div>",
    '    <div class="contenedor carrusel-control">',
    '      <div class="carrusel-barra" aria-hidden="true"><span data-carrusel-avance></span></div>',
    '      <div class="carrusel-flechas">',
    '        <button class="flecha-boton flecha-atras" type="button" data-carrusel-ant aria-label="Anteriores">' + FLECHA + "</button>",
    '        <button class="flecha-boton" type="button" data-carrusel-sig aria-label="Siguientes">' + FLECHA + "</button>",
    "      </div>",
    "    </div>",
    "  </div>",
    "</section>"
  ], "    ");
}

function bloqueDividido(ctx, clave, invertido) {
  const s = ctx.c[clave];
  return conRetorno([
    '<section class="bloque bloque-dividido seccion' + (invertido ? " dividido-inverso" : "") + '" id="' + clave + '">',
    '  <div class="contenedor dividido">',
    '    <figure class="dividido-foto reveal-foto" data-paralaje>' + imagen(ctx, s.foto) + "</figure>",
    '    <div class="dividido-texto">',
    ...cabezaSeccion(s).map((l) => "      " + l),
    s.intro ? '      <p class="texto reveal">' + parrafo(s.intro) + "</p>" : null,
    s.regalo ? "      " + regalo(s) : null,
    '      <ul class="nombres reveal">',
    ...s.servicios.map((srv) => '        <li><a href="' + ctx.pagina(clave) + "#" + esc(srv.id) + '"><span>' + esc(srv.nombre) + "</span>" + (srv.detalle ? "<small>" + esc(srv.detalle) + "</small>" : "") + "</a></li>"),
    "      </ul>",
    '      <a class="enlace reveal" href="' + ctx.pagina(clave) + '">' + esc(enlaceVer(ctx, clave)) + "</a>",
    "    </div>",
    "  </div>",
    "</section>"
  ], "    ");
}

function bloqueLista(ctx, clave) {
  const s = ctx.c[clave];
  return conRetorno([
    '<section class="bloque bloque-lista seccion seccion-oscura" id="' + clave + '">',
    '  <div class="contenedor lista-grid">',
    '    <div class="lista-cabeza">',
    ...cabezaSeccion(s, { clara: true }).map((l) => "      " + l),
    s.intro ? '      <p class="texto reveal">' + parrafo(s.intro) + "</p>" : null,
    s.regalo ? "      " + regalo(s) : null,
    '      <a class="enlace enlace-claro reveal" href="' + ctx.pagina(clave) + '">' + esc(enlaceVer(ctx, clave)) + "</a>",
    "    </div>",
    '    <ol class="lista-servicios" data-lista-fotos>',
    ...s.servicios.map((srv, i) => {
      const foto = primeraFoto(srv);
      return '      <li class="reveal"><a href="' + ctx.pagina(clave) + "#" + esc(srv.id) + '"' + (foto ? ' data-foto="' + esc(ctx.ruta(foto.mini || foto.grande)) + '"' : "") + ">" +
        '<span class="lista-num">' + dos(i + 1) + '</span><span class="lista-cuerpo"><span class="lista-nombre">' + esc(srv.nombre) + "</span>" +
        (srv.descripcion ? '<span class="lista-desc">' + esc(srv.descripcion) + "</span>" : "") + "</span>" + FLECHA + "</a></li>";
    }),
    "    </ol>",
    "  </div>",
    "</section>"
  ], "    ");
}

function bloqueGaleria(ctx, clave) {
  const s = ctx.c[clave];
  return conRetorno([
    '<section class="bloque bloque-galeria seccion seccion-crema" id="' + clave + '">',
    '  <div class="contenedor">',
    ...cabezaConEnlace(ctx, clave).map((l) => "    " + l),
    s.intro ? '    <p class="texto texto-cabeza reveal">' + parrafo(s.intro) + "</p>" : null,
    '    <div class="fila-tarjetas" data-deslizable>',
    ...s.servicios.slice(0, 3).map((srv) => tarjetaServicio(ctx, clave, srv, "tarjeta-alta reveal").split("\n").map((l) => "      " + l).join("\n")),
    "    </div>",
    "  </div>",
    "</section>"
  ], "    ");
}

function bloqueInicio(ctx, clave) {
  const tipo = BLOQUE_INICIO[clave] || "dividido";
  if (tipo === "carrusel") return bloqueCarrusel(ctx, clave);
  if (tipo === "lista") return bloqueLista(ctx, clave);
  if (tipo === "galeria") return bloqueGaleria(ctx, clave);
  return bloqueDividido(ctx, clave, tipo === "dividido-inverso");
}

function seccionVideos(ctx) {
  const v = ctx.c.videos;
  if (!v.visible || !v.lista.length) return "";
  return conRetorno([
    '<section class="videos seccion" id="videos">',
    '  <div class="contenedor">',
    '    <header class="cabeza cabeza-centrada">',
    ...cabezaSeccion(v).map((l) => "      " + l),
    v.intro ? '      <p class="texto reveal">' + parrafo(v.intro) + "</p>" : null,
    "    </header>",
    '    <div class="videos-grilla">',
    ...v.lista.map((vid) => {
      const poster = posterVideo(vid);
      return '      <button class="video-card reveal" type="button" data-video="' + esc(embedVideo(vid)) + '" data-plataforma="' + vid.plataforma + '"' +
        (vid.vertical ? ' data-vertical="1"' : "") + (poster ? ' style="background-image: url(\'' + esc(poster) + '\')"' : "") +
        ' aria-label="Video' + (vid.titulo ? ": " + esc(vid.titulo) : "") + '" data-cursor="▶">' + (vid.titulo ? '<span class="video-titulo">' + esc(vid.titulo) + "</span>" : "") + "</button>";
    }),
    "    </div>",
    "  </div>",
    "</section>"
  ], "    ");
}

function seccionPasos(ctx) {
  const p = ctx.c.pasos;
  if (!p.visible) return "";
  return conRetorno([
    '<section class="pasos seccion seccion-salvia">',
    '  <div class="contenedor">',
    '    <header class="cabeza cabeza-centrada">',
    ...cabezaSeccion(p, { clara: true }).map((l) => "      " + l),
    "    </header>",
    '    <ol class="pasos-lista" data-pasos>',
    ...p.lista.map((paso, i) => '      <li class="reveal"><span class="paso-num">' + dos(i + 1) + "</span><h3>" + esc(paso.titulo) + "</h3>" + (paso.texto ? "<p>" + parrafo(paso.texto) + "</p>" : "") + "</li>"),
    "    </ol>",
    "  </div>",
    "</section>"
  ], "    ");
}

function seccionPreguntas(ctx) {
  const p = ctx.c.preguntas;
  if (!p.visible || !p.lista.length) return "";
  return conRetorno([
    '<section class="preguntas seccion" id="preguntas">',
    '  <div class="contenedor preguntas-grid">',
    '    <header class="preguntas-cabeza">',
    ...cabezaSeccion(p).map((l) => "      " + l),
    "    </header>",
    '    <div class="preguntas-lista">',
    ...p.lista.map((q, i) => conRetorno([
      '<details class="pregunta reveal" name="preguntas">',
      '  <summary><span class="pregunta-num">' + dos(i + 1) + '</span><span class="pregunta-texto">' + esc(q.pregunta) + '</span><span class="pregunta-signo" aria-hidden="true"></span></summary>',
      '  <div class="pregunta-respuesta"><p>' + parrafo(q.respuesta) + "</p></div>",
      "</details>"
    ], "      ")),
    "    </div>",
    "  </div>",
    "</section>"
  ], "    ");
}

function botonesWhatsapp(ctx, clase) {
  const ct = ctx.c.contacto;
  return [
    '<a class="boton ' + clase + '" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener">' + icono(ICONO_WHATSAPP, 18) + "WhatsApp · " + telefonoVisible(ct.whatsapp) + "</a>",
    ct.whatsapp_2 ? '<a class="boton boton-linea' + (clase === "boton-claro" ? " boton-linea-clara" : "") + '" href="' + esc(enlaceWhatsapp(ct.whatsapp_2, ct.mensaje)) + '" target="_blank" rel="noopener">WhatsApp · ' + telefonoVisible(ct.whatsapp_2) + "</a>" : null
  ].filter(Boolean);
}

function seccionCierre(ctx) {
  const { c } = ctx;
  const r = c.reserva;
  const redes = enlacesRedes(ctx, 18);
  return conRetorno([
    '<section class="cierre" id="contacto">',
    '  <div class="cierre-fondo" data-paralaje-fondo>' + imagen(ctx, Object.assign({}, r.foto, { alt: "" })) + "</div>",
    '  <div class="cierre-velo" aria-hidden="true"></div>',
    '  <div class="contenedor contenedor-estrecho cierre-contenido">',
    r.etiqueta ? '    <p class="etiqueta etiqueta-clara reveal">' + esc(r.etiqueta) + "</p>" : null,
    '    <h2 class="cierre-titulo" data-dividir>' + titulo(r.titulo, r.destacado, true) + "</h2>",
    r.texto ? '    <p class="cierre-texto reveal">' + parrafo(r.texto) + "</p>" : null,
    '    <div class="cierre-acciones reveal">' + botonesWhatsapp(ctx, "boton-claro").join("") + "</div>",
    c.contacto.horarios.length ? '    <p class="cierre-horario reveal">' + c.contacto.horarios.map((h) => esc(horarioCorto(h))).join('<span aria-hidden="true"> · </span>') + "</p>" : null,
    redes.length ? '    <div class="redes redes-claras reveal">' + (r.redes ? '<p class="redes-titulo">' + esc(r.redes) + "</p>" : "") + redes.join("") + "</div>" : null,
    "  </div>",
    "</section>"
  ], "    ");
}

/* =====================================================================
   Páginas interiores
   ===================================================================== */
function portadaPagina(ctx, p) {
  const { c } = ctx;
  return conRetorno([
    '<section class="pagina-portada">',
    '  <div class="contenedor pagina-portada-grid">',
    '    <div class="pagina-portada-texto">',
    '      <nav class="migas" aria-label="Ruta"><a href="' + ctx.pagina("inicio") + '">' + esc(c.general.inicio) + '</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(p.nombre) + "</span></nav>",
    p.etiqueta ? '      <p class="etiqueta">' + esc(p.etiqueta) + "</p>" : null,
    '      <h1 class="pagina-titulo" data-dividir>' + p.titulo + "</h1>",
    p.intro ? '      <p class="pagina-intro">' + parrafo(p.intro) + "</p>" : null,
    ...(p.extra || []).map((l) => "      " + l),
    "    </div>",
    p.foto ? '    <figure class="pagina-portada-foto reveal-foto" data-paralaje>' + imagen(ctx, p.foto, "", ' fetchpriority="high" decoding="async"') + "</figure>" : null,
    "  </div>",
    "</section>"
  ], "    ");
}

function articuloServicio(ctx, clave, s, i) {
  const { c } = ctx;
  const medios = galeria(ctx, s);
  return conRetorno([
    '<article class="servicio reveal' + (medios ? "" : " servicio-sin-medios") + '" id="' + esc(s.id) + '">',
    medios ? '  <div class="servicio-medios">' + medios + "</div>" : null,
    '  <div class="servicio-cuerpo">',
    '    <p class="servicio-meta"><span class="servicio-num">' + dos(i + 1) + "</span>" + (s.etiqueta ? '<span class="servicio-etiqueta">' + esc(s.etiqueta) + "</span>" : "") + "</p>",
    '    <h2 class="servicio-nombre">' + esc(s.nombre) + "</h2>",
    s.detalle ? '    <p class="servicio-detalle">' + esc(s.detalle) + "</p>" : null,
    s.descripcion ? '    <p class="servicio-desc">' + parrafo(s.descripcion) + "</p>" : null,
    '    <div class="servicio-pie">',
    s.precio ? '      <p class="servicio-precio">' + formatoPrecio(s.precio) + (s.nota ? " <small>" + esc(s.nota) + "</small>" : "") + "</p>" : null,
    '      <a class="enlace" href="' + esc(waServicio(ctx, s)) + '" target="_blank" rel="noopener">' + esc(c.general.reservar) + "</a>",
    "    </div>",
    "  </div>",
    "</article>"
  ], "        ");
}

function paginaServicios(ctx, clave) {
  const { c } = ctx;
  const s = c[clave];
  const ct = c.contacto;
  const filas = clave === "programas"; // los programas, con descripciones largas, van en filas alternadas
  const cuerpo = [
    portadaPagina(ctx, {
      nombre: s.menu,
      etiqueta: s.etiqueta,
      titulo: titulo(s.titulo, s.destacado),
      intro: s.intro,
      extra: [regalo(s), '<div class="pagina-acciones reveal"><a class="boton boton-oscuro" href="' + esc(enlaceWhatsapp(ct.whatsapp, s.mensaje || ct.mensaje)) + '" target="_blank" rel="noopener">' + icono(ICONO_WHATSAPP, 18) + esc(s.boton) + "</a></div>"].filter(Boolean),
      foto: s.foto
    }),
    conRetorno([
      '<section class="servicios seccion" aria-label="' + esc(s.menu) + '">',
      '  <div class="contenedor">',
      '    <div class="' + (filas ? "servicios-filas" : "servicios-grilla") + '">',
      ...s.servicios.map((srv, i) => articuloServicio(ctx, clave, srv, i)),
      "    </div>",
      "  </div>",
      "</section>"
    ], "    "),
    seccionExperiencias(ctx, { excluir: clave, titulo: c.general.otras, id: "otras", clase: "seccion-crema" }),
    seccionCierre(ctx)
  ];
  return documento(ctx, { ruta: PAGINAS[clave], titulo: s.menu, descripcion: s.intro || s.resumen, imagen: s.foto, cuerpo: cuerpo.filter(Boolean).join("\n\n") });
}

function seccionUbicacion(ctx) {
  const { c } = ctx;
  const ct = c.contacto;
  const sitio = lugar(ct);
  if (!sitio) return "";
  const foto = c.nosotros.foto_2;
  return conRetorno([
    '<section class="bloque bloque-dividido seccion' + (foto ? "" : " dividido-sin-foto") + '" id="ubicacion">',
    '  <div class="contenedor dividido">',
    foto ? '    <figure class="dividido-foto reveal-foto" data-paralaje>' + imagen(ctx, foto) + "</figure>" : null,
    '    <div class="dividido-texto">',
    '      <p class="etiqueta reveal">' + esc(c.marca.titulo_ubicacion) + "</p>",
    '      <h2 class="titulo-seccion" data-dividir>' + esc(ct.ubicacion || ct.direccion) + "</h2>",
    ct.ubicacion && ct.direccion ? '      <p class="texto reveal">' + esc(ct.direccion) + "</p>" : null,
    ct.horarios.length ? '      <ul class="nombres nombres-horarios reveal">' + ct.horarios.map((h) => "<li><span>" + esc(h.dias) + "</span><small>" + esc(h.horas) + "</small></li>").join("") + "</ul>" : null,
    '      <div class="acciones reveal">' + botonesWhatsapp(ctx, "boton-oscuro")[0] + '<a class="enlace" href="' + esc(sitio.enlace) + '" target="_blank" rel="noopener">' + esc(c.general.como_llegar) + "</a></div>",
    "    </div>",
    "  </div>",
    "</section>"
  ], "    ");
}

function paginaNosotros(ctx) {
  const { c } = ctx;
  const n = c.nosotros;
  const cuerpo = [
    portadaPagina(ctx, {
      nombre: n.menu,
      etiqueta: n.etiqueta,
      titulo: n.titulo || n.destacado ? titulo(n.titulo, n.destacado) : esc(n.menu),
      intro: n.texto,
      extra: [cifras(ctx)].filter(Boolean),
      foto: n.foto
    }),
    n.frase ? conRetorno([
      '<section class="frase seccion seccion-crema">',
      '  <div class="contenedor contenedor-estrecho">',
      '    <p class="frase-texto" data-texto-progresivo>' + parrafo(n.frase) + "</p>",
      "  </div>",
      "</section>"
    ], "    ") : "",
    seccionPasos(ctx),
    seccionUbicacion(ctx),
    seccionExperiencias(ctx),
    seccionCierre(ctx)
  ];
  return documento(ctx, { ruta: PAGINAS.nosotros, titulo: n.menu, descripcion: n.texto, imagen: n.foto, cuerpo: cuerpo.filter(Boolean).join("\n\n") });
}

function paginaContacto(ctx) {
  const { c } = ctx;
  const ct = c.contacto;
  const r = c.reserva;
  const sitio = lugar(ct);
  const redes = enlacesRedes(ctx, 22);
  const bloques = [
    conRetorno([
      '<div class="contacto-bloque reveal">',
      '  <h2 class="etiqueta">' + esc(c.marca.titulo_contacto) + "</h2>",
      '  <a class="contacto-dato" href="' + esc(ctx.reservar) + '" target="_blank" rel="noopener">+57 ' + telefonoVisible(ct.whatsapp) + "</a>",
      ct.whatsapp_2 ? '  <a class="contacto-dato" href="' + esc(enlaceWhatsapp(ct.whatsapp_2, ct.mensaje)) + '" target="_blank" rel="noopener">+57 ' + telefonoVisible(ct.whatsapp_2) + "</a>" : null,
      ct.email ? '  <a class="contacto-dato contacto-correo" href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a>" : null,
      "</div>"
    ], "        "),
    ct.horarios.length ? conRetorno([
      '<div class="contacto-bloque reveal">',
      '  <h2 class="etiqueta">' + esc(c.marca.titulo_horarios) + "</h2>",
      '  <ul class="contacto-horarios">' + ct.horarios.map((h) => "<li><strong>" + esc(h.dias) + "</strong><span>" + esc(h.horas) + "</span></li>").join("") + "</ul>",
      "</div>"
    ], "        ") : null,
    sitio ? conRetorno([
      '<div class="contacto-bloque reveal">',
      '  <h2 class="etiqueta">' + esc(c.marca.titulo_ubicacion) + "</h2>",
      ct.ubicacion ? '  <p class="contacto-dato">' + esc(ct.ubicacion) + "</p>" : null,
      ct.direccion ? '  <p class="texto">' + esc(ct.direccion) + "</p>" : null,
      '  <a class="enlace" href="' + esc(sitio.enlace) + '" target="_blank" rel="noopener">' + esc(c.general.como_llegar) + "</a>",
      "</div>"
    ], "        ") : null
  ].filter(Boolean);
  const cuerpo = [
    portadaPagina(ctx, {
      nombre: r.menu,
      etiqueta: r.etiqueta,
      titulo: titulo(r.titulo, r.destacado),
      intro: r.texto,
      extra: ['<div class="pagina-acciones reveal">' + botonesWhatsapp(ctx, "boton-oscuro").join("") + "</div>"],
      foto: r.foto
    }),
    conRetorno([
      '<section class="contacto seccion seccion-crema">',
      '  <div class="contenedor">',
      '    <div class="contacto-grid">',
      ...bloques,
      "    </div>",
      sitio ? '    <div class="mapa reveal"><iframe title="' + esc(sitio.consulta) + '" src="' + esc(sitio.embed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>' : null,
      redes.length ? '    <div class="redes redes-grandes reveal">' + (r.redes ? '<p class="redes-titulo">' + esc(r.redes) + "</p>" : "") + redes.join("") + "</div>" : null,
      "  </div>",
      "</section>"
    ], "    "),
    seccionPreguntas(ctx)
  ];
  return documento(ctx, { ruta: PAGINAS.contacto, titulo: r.menu, descripcion: r.texto, imagen: r.foto, cuerpo: cuerpo.filter(Boolean).join("\n\n") });
}

function paginaInicio(ctx) {
  const { c } = ctx;
  const ct = c.contacto;
  const sitio = lugar(ct);
  const datos = {
    "@context": "https://schema.org",
    "@type": "DaySpa",
    name: c.marca.nombre,
    url: SITIO_URL,
    image: SITIO_URL + c.portada.foto.grande,
    telephone: "+" + ct.whatsapp,
    ...(ct.email ? { email: ct.email } : {}),
    ...(sitio ? { address: { "@type": "PostalAddress", streetAddress: ct.ubicacion || ct.direccion, ...(ct.ubicacion && ct.direccion ? { addressLocality: ct.direccion } : {}) } } : {}),
    sameAs: REDES.map((red) => ct[red]).filter(Boolean)
  };
  const cuerpo = [
    seccionPortada(ctx),
    seccionEsencia(ctx),
    seccionExperiencias(ctx),
    seccionCinta(ctx),
    ...ctx.visibles.map((k) => bloqueInicio(ctx, k)),
    seccionVideos(ctx),
    seccionPasos(ctx),
    seccionPreguntas(ctx),
    seccionCierre(ctx)
  ];
  return documento(ctx, { ruta: "", imagen: c.portada.foto, datos, portadaOscura: true, cuerpo: cuerpo.filter(Boolean).join("\n\n") });
}

// Página de una sección oculta: lleva al inicio (los enlaces que ya se compartieron siguen funcionando).
function redireccion(c) {
  return [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '  <meta charset="utf-8" />',
    "  <title>" + esc(c.marca.nombre) + "</title>",
    '  <meta name="robots" content="noindex" />',
    '  <meta http-equiv="refresh" content="0; url=../" />',
    '  <link rel="canonical" href="' + SITIO_URL + '" />',
    "</head>",
    '<body><p><a href="../">' + esc(c.marca.nombre) + "</a></p></body>",
    "</html>",
    ""
  ].join("\n");
}

function renderizar(c) {
  const archivos = {};
  const inicio = contexto(c, "inicio");
  archivos["index.html"] = paginaInicio(inicio);
  archivos[PAGINAS.nosotros + "/index.html"] = paginaNosotros(contexto(c, "nosotros"));
  for (const clave of SECCIONES_SERVICIOS) {
    archivos[PAGINAS[clave] + "/index.html"] = inicio.visibles.includes(clave) ? paginaServicios(contexto(c, clave), clave) : redireccion(c);
  }
  archivos[PAGINAS.contacto + "/index.html"] = paginaContacto(contexto(c, "contacto"));
  const rutas = ["", PAGINAS.nosotros, ...inicio.visibles.map((k) => PAGINAS[k]), PAGINAS.contacto];
  archivos["sitemap.xml"] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rutas.map((r) => "  <url><loc>" + SITIO_URL + (r ? r + "/" : "") + "</loc></url>"),
    "</urlset>",
    ""
  ].join("\n");
  return archivos;
}

module.exports = { renderizar, VERSION_ARCHIVOS };
