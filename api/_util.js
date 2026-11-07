// Utilidades compartidas por la validación (api/_sitio.js) y la generación de páginas (api/_paginas.js).
"use strict";

const SITIO_URL = "https://olivespamedellin.com/";

// Secciones con lista de servicios, en el orden en que aparecen en la página.
const SECCIONES_SERVICIOS = ["masajes", "faciales", "capilar", "programas", "postquirurgico"];

// Carpeta de cada página del sitio (olivespamedellin.com/<carpeta>/).
const PAGINAS = {
  nosotros: "nosotros",
  masajes: "masajes",
  faciales: "faciales",
  capilar: "cuidado-capilar",
  programas: "programas",
  postquirurgico: "post-quirurgico",
  contacto: "contacto"
};

// Todas las rutas de fotos que aparecen en un contenido (para permitirlas al guardar).
function rutasDeFotos(contenido) {
  const rutas = new Set();
  const visitar = (v) => {
    if (Array.isArray(v)) v.forEach(visitar);
    else if (v && typeof v === "object") {
      if (typeof v.grande === "string") rutas.add(v.grande);
      if (typeof v.mini === "string") rutas.add(v.mini);
      Object.values(v).forEach(visitar);
    }
  };
  visitar(contenido);
  return rutas;
}

function esc(texto) {
  return String(texto == null ? "" : texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const parrafo = (texto) => esc(texto).replace(/\n/g, "<br>");
const formatoPrecio = (n) => "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const enlaceWhatsapp = (numero, mensaje) => "https://wa.me/" + numero + (mensaje ? "?text=" + encodeURIComponent(mensaje) : "");
function telefonoVisible(numero) {
  const local = String(numero).replace(/^57(?=\d{10}$)/, "");
  return local.length === 10 ? local.slice(0, 3) + " " + local.slice(3, 6) + " " + local.slice(6) : local;
}
function slug(texto) {
  return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "servicio";
}

// Reconoce un enlace de video y devuelve plataforma, id y si es vertical.
function analizarVideo(url) {
  let u;
  try { u = new URL(String(url || "").trim()); } catch (_) { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, "");
  const yt = (id, vertical) => (/^[\w-]{6,20}$/.test(id || "") ? { plataforma: "youtube", id, vertical } : null);
  let m;
  if (host === "youtu.be") return yt(u.pathname.slice(1).split("/")[0], false);
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if ((m = /^\/shorts\/([\w-]+)/.exec(u.pathname))) return yt(m[1], true);
    if ((m = /^\/(?:embed|live)\/([\w-]+)/.exec(u.pathname))) return yt(m[1], false);
    return yt(u.searchParams.get("v"), false);
  }
  if ((host === "vimeo.com" || host === "player.vimeo.com") && (m = /\/(\d{5,})/.exec(u.pathname))) return { plataforma: "vimeo", id: m[1], vertical: false };
  if (host === "instagram.com" && (m = /^\/(p|reel|reels|tv)\/([\w-]+)/.exec(u.pathname))) {
    return { plataforma: "instagram", id: m[2], forma: m[1] === "reels" ? "reel" : m[1], vertical: true };
  }
  if (host === "tiktok.com" && (m = /\/video\/(\d{6,})/.exec(u.pathname))) return { plataforma: "tiktok", id: m[1], vertical: true };
  if (host === "facebook.com" || host === "web.facebook.com") {
    if ((m = /^\/reel\/(\d{6,})/.exec(u.pathname))) return { plataforma: "facebook", id: m[1], forma: "reel", vertical: true };
    if ((m = /\/videos\/(?:[\w.-]+\/)?(\d{6,})/.exec(u.pathname))) return { plataforma: "facebook", id: m[1], vertical: false };
    if (/^\/watch\/?$/.test(u.pathname) && /^\d{6,}$/.test(u.searchParams.get("v") || "")) return { plataforma: "facebook", id: u.searchParams.get("v"), vertical: false };
  }
  return null;
}
function urlVideo(v) {
  if (v.plataforma === "youtube") return "https://www.youtube.com/" + (v.vertical ? "shorts/" + v.id : "watch?v=" + v.id);
  if (v.plataforma === "vimeo") return "https://vimeo.com/" + v.id;
  if (v.plataforma === "instagram") return "https://www.instagram.com/" + (v.forma || "p") + "/" + v.id + "/";
  if (v.plataforma === "facebook") return "https://www.facebook.com/" + (v.forma === "reel" ? "reel/" + v.id : "watch/?v=" + v.id);
  return "https://www.tiktok.com/@/video/" + v.id;
}
function embedVideo(v) {
  if (v.plataforma === "youtube") return "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0&playsinline=1";
  if (v.plataforma === "vimeo") return "https://player.vimeo.com/video/" + v.id + "?autoplay=1";
  if (v.plataforma === "instagram") return "https://www.instagram.com/" + (v.forma || "p") + "/" + v.id + "/embed";
  if (v.plataforma === "facebook") return "https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(urlVideo(v)) + "&show_text=false&autoplay=1";
  return "https://www.tiktok.com/embed/v2/" + v.id;
}
const posterVideo = (v) => (v.plataforma === "youtube" ? "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg" : "");

module.exports = {
  SITIO_URL, SECCIONES_SERVICIOS, PAGINAS, rutasDeFotos,
  esc, parrafo, formatoPrecio, enlaceWhatsapp, telefonoVisible, slug, analizarVideo, urlVideo, embedVideo, posterVideo
};
