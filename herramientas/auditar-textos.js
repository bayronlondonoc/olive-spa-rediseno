// Uso: node herramientas/auditar-textos.js
// Busca en todas las páginas lo visible que NO sale de contenido.json (y por eso no se puede cambiar desde el panel).
// Marca cada texto del contenido con una ficha, genera las páginas y lista lo que queda sin ficha.
const fs = require("fs");
const path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const sitio = require(path.join(RAIZ, "api", "_sitio.js"));

const NO_TEXTO = new Set(["grande", "mini", "url", "plataforma", "id", "forma", "whatsapp", "whatsapp_2", "email", "instagram", "facebook", "tiktok", "mapa"]);
let n = 0;
function marcar(v, clave) {
  if (Array.isArray(v)) return v.map((x) => marcar(x, clave));
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = marcar(x, k);
    return o;
  }
  if (typeof v === "string" && v && !NO_TEXTO.has(clave)) return "⟦" + ++n + "⟧";
  return v;
}
const contenido = JSON.parse(fs.readFileSync(path.join(RAIZ, "contenido.json"), "utf8"));
const paginas = sitio.renderizar(marcar(contenido));
const rutas = sitio.rutasDeFotos(contenido);
const sueltos = new Map(); // texto → páginas donde aparece
const anotar = (texto, pagina) => {
  if (!sueltos.has(texto)) sueltos.set(texto, new Set());
  sueltos.get(texto).add(pagina);
};
for (const [pagina, html] of Object.entries(paginas)) {
  if (!pagina.endsWith(".html") || !html.includes("<main")) continue; // las páginas de redirección no muestran nada
  const cuerpo = html.slice(html.indexOf("<body"));
  // Textos entre etiquetas
  cuerpo.replace(/<script[\s\S]*?<\/script>/g, "").replace(/>([^<]+)</g, (_, t) => {
    t.split(/⟦\d+⟧/).map((s) => s.replace(/&nbsp;|·|[\s,.:/]+/g, " ").trim()).filter((s) => s && /[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(s)).forEach((s) => anotar("texto: " + s, pagina));
  });
  // Atributos que se leen o se ven (textos alternativos, etiquetas para lectores de pantalla, títulos, el cursor)
  cuerpo.replace(/\s(alt|aria-label|title|placeholder|data-cursor)="([^"]*)"/g, (_, a, t) => {
    const resto = t.split(/⟦\d+⟧/).map((s) => s.trim()).filter((s) => /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(s));
    if (resto.length) anotar(a + ": " + t, pagina);
  });
  // Imágenes que no vienen del contenido
  html.replace(/(?:src|href)="(?:\.\.\/)?([^"]+\.(?:png|jpg|jpeg|webp|svg|ico))"/g, (_, r) => { if (!rutas.has(r)) anotar("imagen: " + r, pagina); });
}
const nombre = (p) => (p === "index.html" ? "inicio" : p.replace("/index.html", ""));
console.log([...sueltos].map(([texto, en]) => texto + "   [" + [...en].map(nombre).join(", ") + "]").join("\n"));
