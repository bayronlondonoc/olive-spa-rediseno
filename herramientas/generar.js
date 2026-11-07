// Regenera todas las páginas a partir de contenido.json (lo mismo que hace el panel al guardar).
// Úsalo si editas contenido.json a mano o si cambias el diseño en api/_paginas.js:
//   node herramientas/generar.js
"use strict";
const fs = require("fs");
const path = require("path");
const sitio = require("../api/_sitio");

const raiz = path.resolve(__dirname, "..");
const contenido = JSON.parse(fs.readFileSync(path.join(raiz, "contenido.json"), "utf8"));
const limpio = sitio.validar(contenido, { rutasPermitidas: sitio.rutasDeFotos(contenido), fotosNuevas: new Set() });

const faltan = [...sitio.rutasDeFotos(limpio)].filter((ruta) => !fs.existsSync(path.join(raiz, ruta)));
if (faltan.length) {
  console.error("Estas fotos no existen en el proyecto:\n  " + faltan.join("\n  "));
  process.exit(1);
}

const archivos = sitio.renderizar(limpio);
for (const [ruta, texto] of Object.entries(archivos)) {
  const destino = path.join(raiz, ruta);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, texto);
}
console.log(Object.keys(archivos).length + " archivos generados desde contenido.json (versión " + limpio.version + "):\n  " + Object.keys(archivos).join("\n  "));
