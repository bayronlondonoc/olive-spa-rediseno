// Genera panel-demo/index.html: el mismo panel de /tarifas en modo demostración, para mostrar cómo funciona
// en una copia estática del sitio (por ejemplo, GitHub Pages). No pide contraseña y NO publica nada:
// las respuestas del servidor se simulan en el navegador con el contenido real (../contenido.json).
//   node herramientas/panel-demo.js
// No se sube al sitio real: se usa en la copia pública de vista previa (ver README).
"use strict";
const fs = require("fs");
const path = require("path");
const sitio = require("../api/_sitio");
const { resumirCambios } = require("../api/panel");

const raiz = path.resolve(__dirname, "..");
// En Windows, git puede dejar el archivo con saltos de línea \r\n: se normalizan.
let html = fs.readFileSync(path.join(raiz, "panel", "index.html"), "utf8").replace(/\r\n/g, "\n");

// Cambios sobre el panel real; si alguno ya no existe en el panel, se avisa en vez de generar algo a medias.
const cambios = [
  ["<title>Panel · Olivé Spa</title>", "<title>Panel (demostración) · Olivé Spa</title>"],
  ['href="/assets/brand/favicon-32.png"', 'href="../assets/brand/favicon-32.png"'],
  ['href="/assets/brand/apple-touch-icon.png"', 'href="../assets/brand/apple-touch-icon.png"'],
  ['<a href="/" target="_blank" rel="noopener">Ver la página</a>', '<a href="../" target="_blank" rel="noopener">Ver la página</a>'],
  ['|| "/" + ruta;', '|| "../" + ruta;'],
  ['var BORRADOR = "olive-panel-borrador";', 'var BORRADOR = "olive-panel-demo-borrador";'],
  ['"Guardado ✓ Publicando en la página…"', '"Demostración ✓ En el panel real, aquí se estaría publicando en la página…"'],
  ['"Publicado ✓ Los cambios ya están en la página."', '"Demostración ✓ En el panel real, los cambios ya estarían en la página."'],
  ['"Guardado ✓ Puede tardar unos minutos más en verse en la página."', '"Demostración ✓ En el panel real, los cambios ya estarían en la página."'],
  ["<body>", "<body>\n  " + aviso()],
  ["  <script>\n", "  <script>\n" + simulacion() + "\n  </script>\n  <script>\n"]
];
for (const [antes, despues] of cambios) {
  if (!html.includes(antes)) {
    console.error("El panel cambió y ya no tiene:\n  " + antes + "\nRevisa herramientas/panel-demo.js.");
    process.exit(1);
  }
  html = html.replace(antes, despues);
}

function aviso() {
  return '<div style="position:sticky;top:0;z-index:1000;padding:10px 16px;background:#5b6241;color:#f7f2e9;text-align:center;font:500 14px/1.45 system-ui,sans-serif">' +
    "Modo demostración: puedes probar todo sin contraseña. Nada se publica ni cambia la página real.</div>";
}

// Servidor simulado: responde como /api/panel, pero guarda los cambios solo en esta pestaña.
function simulacion() {
  const esquema = JSON.stringify(sitio.ESQUEMA);
  const campos = JSON.stringify(sitio.CAMPOS_SERVICIO);
  return `    (function () {
      "use strict";
      var sitio = { ESQUEMA: ${esquema}, CAMPOS_SERVICIO: ${campos} };
      var canonico = function (v) {
        if (Array.isArray(v)) return v.map(canonico);
        if (v && typeof v === "object") return Object.keys(v).sort().reduce(function (o, k) { o[k] = canonico(v[k]); return o; }, {});
        return v;
      };
      var igual = function (a, b) { return JSON.stringify(canonico(a)) === JSON.stringify(canonico(b)); };
      var formatoPrecio = function (n) { return "$" + String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, "."); };
      var slug = function (t) {
        return String(t).normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "servicio";
      };
      var resumirCambios = ${resumirCambios.toString()};
      var fetchReal = window.fetch.bind(window);
      var guardado = null; // contenido «publicado» en esta demostración
      var leer = function () {
        if (guardado) return Promise.resolve(guardado);
        return fetchReal("../contenido.json?v=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (c) { guardado = c; return c; });
      };
      var copia = function (v) { return JSON.parse(JSON.stringify(v)); };
      var responder = function (estado, cuerpo) { return new Response(JSON.stringify(cuerpo), { status: estado, headers: { "Content-Type": "application/json" } }); };
      window.fetch = function (url, opciones) {
        url = String(url);
        if (url.indexOf("/contenido.json") === 0) return leer().then(function (c) { return responder(200, c); });
        if (url.indexOf("/api/panel") !== 0) return fetchReal(url, opciones);
        var accion = (url.split("accion=")[1] || "").split("&")[0];
        var metodo = (opciones && opciones.method) || "GET";
        var cuerpo = opciones && opciones.body ? JSON.parse(opciones.body) : {};
        return new Promise(function (r) { setTimeout(r, 400); }).then(leer).then(function (actual) {
          if (accion === "entrar" || accion === "salir") return responder(200, { ok: true });
          if (metodo === "GET") return responder(200, { contenido: copia(actual), esquema: sitio.ESQUEMA, camposServicio: sitio.CAMPOS_SERVICIO });
          if (Number(cuerpo.version_base) !== actual.version) return responder(409, { error: "Alguien guardó cambios hace un momento. Recarga la página." });
          var lineas = resumirCambios(actual, cuerpo.contenido);
          if (accion === "revisar") return responder(200, { ok: true, cambios: lineas });
          if (accion !== "guardar") return responder(405, { error: "Acción no válida." });
          if (!lineas.length) return responder(200, { ok: true, cambios: 0, version: actual.version, contenido: actual, fotos: {} });
          // Las fotos nuevas reciben una ruta inventada; el panel las sigue mostrando desde este navegador.
          var fotos = {};
          var n = 0;
          var ids = {};
          var poner = function (v) {
            if (Array.isArray(v)) return v.map(poner);
            if (v && typeof v === "object") {
              if (v.nueva) {
                fotos[v.nueva] = { grande: "assets/img/panel/demo-" + ++n + ".jpg" };
                var foto = copia(v);
                delete foto.nueva;
                foto.grande = fotos[v.nueva].grande;
                return foto;
              }
              var o = {};
              Object.keys(v).forEach(function (k) { o[k] = poner(v[k]); });
              if (Array.isArray(o.servicios)) o.servicios.forEach(function (s) {
                if (!s.id) { var id = slug(s.nombre); for (var i = 2; ids[id]; i++) id = slug(s.nombre) + "-" + i; s.id = id; }
                ids[s.id] = true;
              });
              return o;
            }
            return v;
          };
          var nuevo = poner(cuerpo.contenido);
          nuevo.version = actual.version + 1;
          guardado = nuevo;
          return responder(200, { ok: true, cambios: lineas.length, version: nuevo.version, contenido: copia(nuevo), fotos: fotos });
        });
      };
    })();`;
}

fs.mkdirSync(path.join(raiz, "panel-demo"), { recursive: true });
fs.writeFileSync(path.join(raiz, "panel-demo", "index.html"), html);
console.log("panel-demo/index.html generado (panel en modo demostración).");
