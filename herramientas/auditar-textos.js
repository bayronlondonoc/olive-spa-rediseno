// Uso: node herramientas/auditar-textos.js
// Busca en la página todo lo visible que NO sale de contenido.json (y por eso no se puede cambiar desde el panel).
// Marca cada texto del contenido con una ficha, genera la página y lista lo que queda sin ficha.
const fs = require("fs");
const path = require("path");
const RAIZ = path.resolve(__dirname, "..");
const sitio = require(path.join(RAIZ, "api", "_sitio.js"));

const NO_TEXTO = new Set(["grande", "mini", "url", "plataforma", "id", "forma", "whatsapp", "whatsapp_2", "email", "instagram", "facebook", "tiktok"]);
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
const html = sitio.renderizar(marcar(contenido));

const cuerpo = html.slice(html.indexOf("<body"));
const sueltos = new Set();
// Textos entre etiquetas
cuerpo.replace(/<script[\s\S]*?<\/script>/g, "").replace(/>([^<]+)</g, (_, t) => {
  t.split(/⟦\d+⟧/).map((s) => s.replace(/&nbsp;|·|[\s,.:]+/g, " ").trim()).filter((s) => s && /[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(s)).forEach((s) => sueltos.add("texto: " + s));
});
// Atributos que se leen o se ven (textos alternativos, etiquetas para lectores de pantalla, títulos)
cuerpo.replace(/\s(alt|aria-label|title|placeholder)="([^"]*)"/g, (_, a, t) => {
  const resto = t.split(/⟦\d+⟧/).map((s) => s.trim()).filter((s) => /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(s));
  if (resto.length) sueltos.add(a + ": " + t);
});
// Imágenes que no vienen del contenido
const rutas = sitio.rutasDeFotos(contenido);
html.replace(/(?:src|href)="([^"]+\.(?:png|jpg|jpeg|webp|svg|ico))"/g, (_, r) => { if (!rutas.has(r)) sueltos.add("imagen: " + r); });
console.log([...sueltos].join("\n"));
