// Contenido editable del sitio de Olivé Spa: esquema (qué se puede editar y con qué límites),
// validación de lo que llega del panel y generación de las páginas a partir de contenido.json.
// Lo usan api/panel.js (al guardar desde /tarifas) y herramientas/generar.js (para regenerar a mano).
// Las páginas (inicio, nosotros, una por cada sección de servicios y contacto) se arman en api/_paginas.js.
"use strict";

const { SECCIONES_SERVICIOS, PAGINAS, rutasDeFotos, slug, analizarVideo, urlVideo } = require("./_util");
const paginas = require("./_paginas");

const MAX_FOTOS_SERVICIO = 3;
const MAX_SERVICIOS = 40;
const MAX_VIDEOS = 12;
const MAX_PREGUNTAS = 12;

/* =====================================================================
   Esquema: describe cada parte del sitio para el panel y la validación.
   Tipos: texto, parrafo, interruptor, foto, precio, telefono, email, url, lista,
   horarios, cifras, pasos, preguntas, servicios, videos.
   Una foto con `opcional: true` puede quedar vacía.
   ===================================================================== */

// Las secciones de servicios comparten los mismos textos; cambia la lista de campos de cada servicio.
function seccionServicios(clave, titulo, nombreLista, campos) {
  return { clave, titulo, servicios: true, pagina: PAGINAS[clave], ayuda: "Tiene su propia página en olivespamedellin.com/" + PAGINAS[clave] + "/ y una tarjeta en el inicio.", campos: [
    { k: "visible", tipo: "interruptor", etiqueta: "Mostrar esta sección y su página" },
    { k: "menu", tipo: "texto", etiqueta: "Nombre en el menú", max: 24, obligatorio: true },
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 60 },
    { k: "titulo", tipo: "texto", etiqueta: "Título", max: 60, obligatorio: true },
    { k: "destacado", tipo: "texto", etiqueta: "Parte en cursiva del título", max: 60 },
    { k: "intro", tipo: "parrafo", etiqueta: "Texto de introducción", max: 400 },
    { k: "resumen", tipo: "texto", etiqueta: "Frase corta para su tarjeta en el inicio", max: 110 },
    { k: "regalo_intro", tipo: "texto", etiqueta: "Frase antes del regalito", max: 40 },
    { k: "regalo", tipo: "texto", etiqueta: "Regalito, en negrilla (vacío = no se muestra)", max: 120 },
    { k: "boton", tipo: "texto", etiqueta: "Botón de reserva de la página", max: 40, obligatorio: true },
    { k: "mensaje", tipo: "texto", etiqueta: "Mensaje de WhatsApp de ese botón", max: 160 },
    { k: "foto", tipo: "foto", etiqueta: "Foto de la portada de su página y de su tarjeta en el inicio" },
    { k: "servicios", tipo: "servicios", etiqueta: nombreLista, campos }
  ] };
}
const CAMPOS_BASICOS = ["nombre", "etiqueta", "detalle", "descripcion", "precio", "medios"];

const ESQUEMA = [
  { clave: "aviso", titulo: "Aviso o promoción", ayuda: "Una franja arriba de todas las páginas, siempre visible. Ideal para promociones.", campos: [
    { k: "visible", tipo: "interruptor", etiqueta: "Mostrar el aviso" },
    { k: "texto", tipo: "texto", etiqueta: "Texto del aviso", max: 140, ejemplo: "Promo de octubre: 10% en masajes en pareja" }
  ] },
  { clave: "portada", titulo: "Inicio: portada (lo primero que se ve)", ayuda: "Si pones 2 o 3 fotos, se van turnando suavemente.", campos: [
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 90 },
    { k: "titulo", tipo: "texto", etiqueta: "Título", max: 60, obligatorio: true },
    { k: "destacado", tipo: "texto", etiqueta: "Título en cursiva (segunda línea)", max: 60 },
    { k: "texto", tipo: "parrafo", etiqueta: "Texto", max: 400 },
    { k: "boton", tipo: "texto", etiqueta: "Texto del botón de WhatsApp", max: 40, obligatorio: true },
    { k: "boton_2", tipo: "texto", etiqueta: "Texto del segundo botón (baja a las experiencias)", max: 30, obligatorio: true },
    { k: "foto", tipo: "foto", etiqueta: "Foto principal" },
    { k: "foto_2", tipo: "foto", etiqueta: "Segunda foto (opcional)", opcional: true },
    { k: "foto_3", tipo: "foto", etiqueta: "Tercera foto (opcional)", opcional: true }
  ] },
  { clave: "nosotros", titulo: "Nuestra esencia (Nosotros)", pagina: PAGINAS.nosotros, ayuda: "Se ve en el inicio, debajo de la portada, y en la página olivespamedellin.com/nosotros/.", campos: [
    { k: "menu", tipo: "texto", etiqueta: "Nombre en el menú", max: 24, obligatorio: true },
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 60 },
    { k: "titulo", tipo: "texto", etiqueta: "Título (vacío = no se muestra)", max: 60 },
    { k: "destacado", tipo: "texto", etiqueta: "Parte en cursiva del título", max: 60 },
    { k: "texto", tipo: "parrafo", etiqueta: "Texto", max: 600, obligatorio: true },
    { k: "cifras", tipo: "cifras", etiqueta: "Cifras" },
    { k: "boton", tipo: "texto", etiqueta: "Enlace del inicio a la página Nosotros", max: 30, obligatorio: true },
    { k: "frase", tipo: "parrafo", etiqueta: "Frase grande en cursiva (página Nosotros)", max: 200 },
    { k: "foto", tipo: "foto", etiqueta: "Foto de la portada de la página Nosotros" },
    { k: "foto_2", tipo: "foto", etiqueta: "Foto junto a la ubicación (opcional)", opcional: true }
  ] },
  { clave: "inicio", titulo: "Inicio: título de «Nuestras experiencias»", ayuda: "Va encima de las tarjetas de cada sección (Masajes, Faciales…). Cada tarjeta usa la foto y la frase corta de su sección.", campos: [
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 60 },
    { k: "titulo", tipo: "texto", etiqueta: "Título", max: 60, obligatorio: true },
    { k: "destacado", tipo: "texto", etiqueta: "Parte en cursiva del título", max: 60 }
  ] },
  { clave: "cinta", titulo: "Cinta de palabras (inicio)", campos: [
    { k: "frases", tipo: "lista", etiqueta: "Frases que se mueven", max: 40, maxItems: 8, minItems: 1 }
  ] },
  seccionServicios("masajes", "Masajes", "Masajes", CAMPOS_BASICOS),
  seccionServicios("faciales", "Faciales", "Tratamientos", CAMPOS_BASICOS),
  seccionServicios("capilar", "Cuidado capilar", "Tratamientos", CAMPOS_BASICOS),
  seccionServicios("programas", "Programas spa", "Programas", ["nombre", "etiqueta", "detalle", "descripcion", "precio", "nota", "medios"]),
  seccionServicios("postquirurgico", "Post-quirúrgico", "Terapias", CAMPOS_BASICOS),
  { clave: "videos", titulo: "Videos (inicio)", ayuda: "Pega el enlace de un video de Instagram, TikTok, YouTube, Facebook o Vimeo. La sección aparece en el inicio cuando hay al menos un video.", campos: [
    { k: "visible", tipo: "interruptor", etiqueta: "Mostrar esta sección" },
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 60 },
    { k: "titulo", tipo: "texto", etiqueta: "Título", max: 60, obligatorio: true },
    { k: "destacado", tipo: "texto", etiqueta: "Parte en cursiva del título", max: 60 },
    { k: "intro", tipo: "parrafo", etiqueta: "Texto de introducción", max: 400 },
    { k: "lista", tipo: "videos", etiqueta: "Videos" }
  ] },
  { clave: "pasos", titulo: "Cómo funciona (pasos)", ayuda: "Se ven en el inicio y en la página Nosotros.", campos: [
    { k: "visible", tipo: "interruptor", etiqueta: "Mostrar esta sección" },
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 60 },
    { k: "titulo", tipo: "texto", etiqueta: "Título", max: 60, obligatorio: true },
    { k: "destacado", tipo: "texto", etiqueta: "Parte en cursiva del título", max: 60 },
    { k: "lista", tipo: "pasos", etiqueta: "Pasos" }
  ] },
  { clave: "preguntas", titulo: "Preguntas frecuentes", ayuda: "Se ven en el inicio y en la página de contacto. Al tocar una pregunta se abre la respuesta.", campos: [
    { k: "visible", tipo: "interruptor", etiqueta: "Mostrar esta sección" },
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 60 },
    { k: "titulo", tipo: "texto", etiqueta: "Título", max: 60, obligatorio: true },
    { k: "destacado", tipo: "texto", etiqueta: "Parte en cursiva del título", max: 60 },
    { k: "lista", tipo: "preguntas", etiqueta: "Preguntas" }
  ] },
  { clave: "reserva", titulo: "Cierre: «Reserva tu experiencia»", pagina: PAGINAS.contacto, ayuda: "Va al final de cada página y es la portada de la página de contacto (olivespamedellin.com/contacto/).", campos: [
    { k: "menu", tipo: "texto", etiqueta: "Nombre de la página de contacto en el menú", max: 24, obligatorio: true },
    { k: "etiqueta", tipo: "texto", etiqueta: "Frase pequeña de arriba", max: 60 },
    { k: "titulo", tipo: "texto", etiqueta: "Título", max: 60, obligatorio: true },
    { k: "destacado", tipo: "texto", etiqueta: "Parte en cursiva del título", max: 60 },
    { k: "texto", tipo: "parrafo", etiqueta: "Texto", max: 300 },
    { k: "redes", tipo: "texto", etiqueta: "Texto encima de las redes sociales (vacío = no se muestra)", max: 40 },
    { k: "foto", tipo: "foto", etiqueta: "Foto de fondo" }
  ] },
  { clave: "contacto", titulo: "Contacto, horarios y ubicación", ayuda: "Se actualizan en todas las páginas donde aparecen.", campos: [
    { k: "whatsapp", tipo: "telefono", etiqueta: "WhatsApp principal", obligatorio: true },
    { k: "whatsapp_2", tipo: "telefono", etiqueta: "Segundo WhatsApp (opcional)" },
    { k: "mensaje", tipo: "texto", etiqueta: "Mensaje que llega por WhatsApp", max: 160 },
    { k: "boton_menu", tipo: "texto", etiqueta: "Botón de reservar del menú de arriba", max: 24, obligatorio: true },
    { k: "email", tipo: "email", etiqueta: "Correo" },
    { k: "horarios", tipo: "horarios", etiqueta: "Horarios" },
    { k: "ubicacion", tipo: "texto", etiqueta: "Lugar donde atienden", max: 80, ejemplo: "Hotel Dann Carlton Belfort" },
    { k: "direccion", tipo: "texto", etiqueta: "Dirección o ciudad", max: 120, ejemplo: "Medellín, Colombia" },
    { k: "mapa", tipo: "url", etiqueta: "Enlace de Google Maps (opcional; si está vacío, el mapa busca el lugar)" },
    { k: "instagram", tipo: "url", etiqueta: "Instagram (enlace)" },
    { k: "facebook", tipo: "url", etiqueta: "Facebook (enlace)" },
    { k: "tiktok", tipo: "url", etiqueta: "TikTok (enlace)" }
  ] },
  { clave: "marca", titulo: "Nombre, logo y pie de página", campos: [
    { k: "nombre", tipo: "texto", etiqueta: "Nombre del spa", max: 40, obligatorio: true },
    { k: "lema", tipo: "texto", etiqueta: "Frase corta debajo del nombre (vacío = no se muestra)", max: 40 },
    { k: "logo", tipo: "foto", etiqueta: "Logo (pie de página)", formato: "png", lado: 512, fondo: "#efe7d9" },
    { k: "mision", tipo: "parrafo", etiqueta: "Frase del pie de página", max: 200 },
    { k: "titulo_paginas", tipo: "texto", etiqueta: "Título de la lista de páginas", max: 30, obligatorio: true },
    { k: "titulo_contacto", tipo: "texto", etiqueta: "Título «Contacto»", max: 30, obligatorio: true },
    { k: "titulo_horarios", tipo: "texto", etiqueta: "Título «Horarios»", max: 30, obligatorio: true },
    { k: "titulo_ubicacion", tipo: "texto", etiqueta: "Título «Ubicación»", max: 30, obligatorio: true },
    { k: "derechos", tipo: "texto", etiqueta: "Texto junto al año, abajo del todo", max: 80 }
  ] },
  { clave: "general", titulo: "Botones y textos pequeños", ayuda: "Textos cortos que se repiten en varias partes del sitio.", campos: [
    { k: "reservar", tipo: "texto", etiqueta: "Botón para reservar cada servicio", max: 24, obligatorio: true },
    { k: "mensaje_servicio", tipo: "texto", etiqueta: "Mensaje de WhatsApp al reservar un servicio (al final se agrega el nombre del servicio)", max: 120, obligatorio: true },
    { k: "elige", tipo: "texto", etiqueta: "Buscador de la portada: texto de la lista de servicios", max: 40, obligatorio: true },
    { k: "ver", tipo: "texto", etiqueta: "Palabra de los enlaces a cada página (ej.: «Ver» masajes)", max: 20, obligatorio: true },
    { k: "otras", tipo: "texto", etiqueta: "Título de las otras experiencias, al final de cada página", max: 60, obligatorio: true },
    { k: "inicio", tipo: "texto", etiqueta: "Nombre de la página de inicio en el menú", max: 24, obligatorio: true },
    { k: "menu", tipo: "texto", etiqueta: "Botón del menú en el celular", max: 20, obligatorio: true },
    { k: "cerrar", tipo: "texto", etiqueta: "Botón para cerrar el menú", max: 20, obligatorio: true },
    { k: "desliza", tipo: "texto", etiqueta: "Aviso para bajar, en la portada (vacío = no se muestra)", max: 24 },
    { k: "como_llegar", tipo: "texto", etiqueta: "Enlace al mapa", max: 30, obligatorio: true }
  ] },
  { clave: "sitio", titulo: "Google, redes e ícono", ayuda: "Cómo aparece el inicio en Google y cuando se comparte por WhatsApp o redes, y el ícono pequeño de la pestaña del navegador. Las demás páginas usan su nombre en el menú y su texto de introducción.", campos: [
    { k: "titulo", tipo: "texto", etiqueta: "Título en Google", max: 90, obligatorio: true },
    { k: "descripcion", tipo: "parrafo", etiqueta: "Descripción en Google", max: 300 },
    { k: "compartir_titulo", tipo: "texto", etiqueta: "Título al compartir", max: 90 },
    { k: "compartir_descripcion", tipo: "parrafo", etiqueta: "Descripción al compartir", max: 300 },
    { k: "icono", tipo: "foto", etiqueta: "Ícono de la pestaña del navegador (cuadrado)", formato: "png", cuadrado: true, lado: 180, ladoMini: 32 }
  ] }
];

// Campos de un servicio (cada sección usa los que necesita).
const CAMPOS_SERVICIO = {
  nombre: { tipo: "texto", etiqueta: "Nombre", max: 90, obligatorio: true },
  etiqueta: { tipo: "texto", etiqueta: "Etiqueta (ej.: favorito, nuevo)", max: 20 },
  detalle: { tipo: "texto", etiqueta: "Duración / detalle (ej.: 1 hora)", max: 90 },
  descripcion: { tipo: "parrafo", etiqueta: "Descripción", max: 700 },
  precio: { tipo: "precio", etiqueta: "Precio (vacío = no se muestra)" },
  nota: { tipo: "texto", etiqueta: "Nota del precio (ej.: por persona)", max: 30 },
  medios: { tipo: "medios", etiqueta: "Fotos y videos (máximo 3; el primero es el principal)" }
};

/* =====================================================================
   Validación: limpia lo que llega del panel. Las fotos que ya existían solo
   pueden venir de `rutasPermitidas` (las del contenido guardado); las nuevas
   llegan como { tipo: "foto", nueva: "clave" } y se reemplazan al subirlas.
   ===================================================================== */
function error(mensaje) {
  const e = new Error(mensaje);
  e.estado = 400;
  return e;
}

function limpiarTexto(valor, max, variasLineas, nombre, obligatorio) {
  let t = String(valor == null ? "" : valor).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "");
  t = variasLineas
    ? t.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim()
    : t.replace(/\s+/g, " ").trim();
  if (obligatorio && !t) throw error("Falta llenar «" + nombre + "».");
  if (t.length > max) throw error("«" + nombre + "» es muy largo (máximo " + max + " caracteres).");
  return t;
}

function validar(entrada, opciones) {
  const { rutasPermitidas, fotosNuevas } = opciones; // Set de rutas existentes; Set de claves de fotos nuevas
  const esObjeto = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (!esObjeto(entrada)) throw error("Datos inválidos.");
  const salida = { version: Number(entrada.version) || 0 };
  const idsVistos = new Set();

  function foto(valor, nombre, permitirVacia) {
    if (!valor && permitirVacia) return null;
    if (!esObjeto(valor)) throw error("Falta la foto «" + nombre + "».");
    if (valor.nueva) {
      if (!fotosNuevas.has(valor.nueva)) throw error("Falta subir una foto de «" + nombre + "».");
      return { nueva: String(valor.nueva), alt: limpiarTexto(valor.alt, 150, false, nombre) };
    }
    if (!rutasPermitidas.has(valor.grande)) throw error("Una foto de «" + nombre + "» ya no existe. Recarga la página.");
    const resultado = { grande: valor.grande, alt: limpiarTexto(valor.alt, 150, false, nombre) };
    if (valor.mini && rutasPermitidas.has(valor.mini)) resultado.mini = valor.mini;
    return resultado;
  }

  function video(valor, nombre) {
    if (!esObjeto(valor)) throw error("Hay un video no válido en «" + nombre + "».");
    const datos = analizarVideo(valor.url);
    if (!datos) throw error("No reconozco el enlace de video en «" + nombre + "». Usa un enlace de Instagram, TikTok, YouTube, Facebook o Vimeo.");
    const resultado = { url: urlVideo(datos), ...datos };
    if (valor.titulo !== undefined) resultado.titulo = limpiarTexto(valor.titulo, 90, false, "título del video");
    return resultado;
  }

  function campo(def, valor, nombre) {
    const titulo = nombre + " · " + def.etiqueta;
    switch (def.tipo) {
      case "texto": return limpiarTexto(valor, def.max, false, titulo, def.obligatorio);
      case "parrafo": return limpiarTexto(valor, def.max, true, titulo, def.obligatorio);
      case "interruptor": return valor === true;
      case "foto": return foto(valor, titulo, def.opcional === true);
      case "precio": {
        // Sin precio (vacío) es válido: el servicio se muestra sin valor.
        if (valor === null || valor === undefined || valor === "" || valor === 0) return null;
        const n = Number(valor);
        if (!Number.isInteger(n) || n < 1000 || n > 50000000) throw error("El precio de «" + nombre + "» no es válido.");
        return n;
      }
      case "telefono": {
        const d = String(valor == null ? "" : valor).replace(/\D/g, "");
        if (!d && !def.obligatorio) return "";
        if (!/^57\d{10}$/.test(d)) throw error("«" + def.etiqueta + "» debe tener los 10 números del celular.");
        return d;
      }
      case "email": {
        const t = limpiarTexto(valor, 120, false, titulo);
        if (t && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) throw error("El correo no es válido.");
        return t;
      }
      case "url": {
        const t = limpiarTexto(valor, 500, false, titulo);
        if (!t) return "";
        let u;
        try { u = new URL(t); } catch (_) { throw error("«" + def.etiqueta + "» no es un enlace válido."); }
        if (u.protocol !== "https:") throw error("«" + def.etiqueta + "» debe empezar por https://");
        return u.href;
      }
      case "lista": {
        if (!Array.isArray(valor)) throw error("Datos inválidos en «" + titulo + "».");
        const lista = valor.map((v) => limpiarTexto(v, def.max, false, titulo)).filter(Boolean);
        if (lista.length > def.maxItems) throw error("«" + titulo + "» admite máximo " + def.maxItems + ".");
        if (def.minItems && lista.length < def.minItems) throw error("«" + titulo + "» necesita al menos " + def.minItems + ".");
        return lista;
      }
      case "horarios": {
        if (!Array.isArray(valor) || valor.length > 4) throw error("Revisa los horarios (máximo 4 líneas).");
        return valor.map((h) => ({
          dias: limpiarTexto(h && h.dias, 40, false, "Días", true),
          corto: limpiarTexto(h && h.corto, 24, false, "Días en corto"),
          horas: limpiarTexto(h && h.horas, 40, false, "Horas", true)
        }));
      }
      case "cifras": {
        if (!Array.isArray(valor) || valor.length > 3) throw error("Las cifras son máximo 3.");
        return valor.map((c) => {
          const n = Number(c && c.numero);
          if (!esObjeto(c)) throw error("Revisa las cifras.");
          if (!c.auto && (!Number.isInteger(n) || n < 0 || n > 99999)) throw error("Revisa los números de las cifras.");
          return { numero: c.auto ? 0 : n, texto: limpiarTexto(c.texto, 40, false, "Texto de la cifra", true), mas: c.mas === true, auto: c.auto === true };
        });
      }
      case "pasos": {
        if (!Array.isArray(valor) || valor.length < 1 || valor.length > 4) throw error("Los pasos deben ser entre 1 y 4.");
        return valor.map((p) => ({ titulo: limpiarTexto(p && p.titulo, 40, false, "Título del paso", true), texto: limpiarTexto(p && p.texto, 200, true, "Texto del paso") }));
      }
      case "preguntas": {
        if (!Array.isArray(valor) || valor.length > MAX_PREGUNTAS) throw error("Máximo " + MAX_PREGUNTAS + " preguntas.");
        return valor.map((p) => ({
          pregunta: limpiarTexto(p && p.pregunta, 140, false, "Pregunta", true),
          respuesta: limpiarTexto(p && p.respuesta, 700, true, "Respuesta", true)
        }));
      }
      case "videos": {
        if (!Array.isArray(valor) || valor.length > MAX_VIDEOS) throw error("Máximo " + MAX_VIDEOS + " videos.");
        return valor.map((v) => video(v, titulo));
      }
      case "servicios": {
        if (!Array.isArray(valor) || valor.length > MAX_SERVICIOS) throw error("Máximo " + MAX_SERVICIOS + " servicios por sección.");
        return valor.map((s) => {
          if (!esObjeto(s)) throw error("Hay un servicio no válido.");
          const nombreServicio = limpiarTexto(s.nombre, 90, false, "Nombre del servicio", true);
          let id = /^[a-z0-9-]{1,60}$/.test(s.id || "") ? s.id : slug(nombreServicio);
          for (let n = 2; idsVistos.has(id); n++) id = slug(nombreServicio) + "-" + n;
          idsVistos.add(id);
          const resultado = { id };
          for (const k of def.campos) {
            const sub = CAMPOS_SERVICIO[k];
            if (k === "medios") {
              const medios = Array.isArray(s.medios) ? s.medios : [];
              if (medios.length > MAX_FOTOS_SERVICIO) throw error("«" + nombreServicio + "» puede tener máximo " + MAX_FOTOS_SERVICIO + " fotos o videos.");
              resultado.medios = medios.map((m) => (m && m.tipo === "video"
                ? { tipo: "video", ...video(m, nombreServicio) }
                : { tipo: "foto", ...foto(m, nombreServicio, false) }));
            } else {
              const v = campo(sub, s[k], nombreServicio);
              if (v !== null) resultado[k] = v; // sin precio: no se guarda
            }
          }
          return resultado;
        });
      }
      default: throw new Error("Tipo de campo desconocido: " + def.tipo);
    }
  }

  for (const seccion of ESQUEMA) {
    const valor = entrada[seccion.clave];
    if (!esObjeto(valor)) throw error("Falta la sección «" + seccion.titulo + "».");
    salida[seccion.clave] = {};
    for (const def of seccion.campos) salida[seccion.clave][def.k] = campo(def, valor[def.k], seccion.titulo);
  }
  // Alt de las fotos de servicios: el nombre del servicio.
  for (const clave of SECCIONES_SERVICIOS) {
    for (const s of salida[clave].servicios) for (const m of s.medios) if (m.tipo === "foto" && !m.alt) m.alt = s.nombre;
  }
  return salida;
}

module.exports = {
  ESQUEMA, CAMPOS_SERVICIO, SECCIONES_SERVICIOS, PAGINAS, MAX_FOTOS_SERVICIO, MAX_SERVICIOS, MAX_VIDEOS, MAX_PREGUNTAS,
  validar, rutasDeFotos, analizarVideo, slug,
  // Devuelve { "ruta/del/archivo": contenido } con todas las páginas del sitio (y sitemap.xml).
  renderizar: paginas.renderizar
};
