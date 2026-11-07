/* Olivé Spa — interacciones y animaciones del sitio.
   Todo es opcional: si algo falla, la página se ve completa igual (cada parte va en safe()).
   html.movimiento / html.quieto lo pone el <head>; html.is-ready, este archivo al arrancar. */
(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Efectos que siguen al puntero (cursor, imán, foto flotante, desplazamiento suave): solo con mouse.
  var conMouse = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hayGsap = function () { return !!(window.gsap && window.ScrollTrigger); };
  var lenis = null;
  var menuAbierto = false;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }
  function alturaCabecera() {
    var c = $("[data-cabecera]");
    return c ? c.offsetHeight : 76;
  }
  function bloquearScroll(si) {
    if (lenis) { if (si) lenis.stop(); else lenis.start(); }
    document.documentElement.style.overflow = si ? "hidden" : "";
  }
  function refrescar() {
    if (hayGsap()) ScrollTrigger.refresh();
  }

  /* ---------- Franja de aviso: su alto real (puede ocupar dos líneas en el celular) ---------- */
  function initAviso() {
    var aviso = $(".aviso");
    if (!aviso) return;
    var medir = function () { document.documentElement.style.setProperty("--aviso-h", aviso.offsetHeight + "px"); };
    medir();
    window.addEventListener("resize", medir, { passive: true });
  }

  /* ---------- Desplazamiento suave con la rueda del mouse (Lenis) ---------- */
  function initLenis() {
    if (reduced || !conMouse || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95 });
    if (hayGsap()) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var bucle = function (t) { lenis.raf(t); requestAnimationFrame(bucle); };
      requestAnimationFrame(bucle);
    }
  }

  /* ---------- Cabecera: se vuelve sólida al bajar y se esconde; vuelve al subir ---------- */
  function initCabecera() {
    var cab = $("[data-cabecera]");
    if (!cab) return;
    var ultimo = window.scrollY;
    var conFoco = function () {
      try { return !!cab.querySelector(":focus-visible"); } catch (_) { return false; }
    };
    var alBajar = function () {
      var y = window.scrollY;
      cab.classList.toggle("solida", y > 40);
      if (!reduced && !menuAbierto && !conFoco()) {
        if (y > 260 && y > ultimo + 6) cab.classList.add("oculta");
        else if (y < 260 || y < ultimo - 6) cab.classList.remove("oculta");
      }
      if (Math.abs(y - ultimo) > 6 || y < 260) ultimo = y;
    };
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
  }

  /* ---------- Menú a pantalla completa ---------- */
  function initMenu() {
    var menu = $("[data-menu]");
    var abrir = $("[data-menu-abrir]");
    var cerrar = $("[data-menu-cerrar]");
    if (!menu || !abrir) return;
    var poner = function (si) {
      menuAbierto = si;
      menu.classList.toggle("abierto", si);
      if (si) menu.removeAttribute("inert"); else menu.setAttribute("inert", "");
      abrir.setAttribute("aria-expanded", si ? "true" : "false");
      bloquearScroll(si);
      document.body.classList.toggle("con-menu", si);
      if (si) {
        // El foco entra al menú (a la lista de enlaces), sin marcar ningún enlace en particular.
        var enlaces = $(".menu-movil-enlaces", menu);
        if (enlaces) { enlaces.setAttribute("tabindex", "-1"); setTimeout(function () { enlaces.focus({ preventScroll: true }); }, 350); }
      } else {
        abrir.focus({ preventScroll: true });
      }
    };
    abrir.addEventListener("click", function () { poner(true); });
    if (cerrar) cerrar.addEventListener("click", function () { poner(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuAbierto) poner(false); });
    menu.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && a.getAttribute("href").charAt(0) === "#") poner(false);
    });
    // Si se vuelve atrás desde otra página, el menú no queda abierto.
    window.addEventListener("pageshow", function () { if (menuAbierto) poner(false); });
  }

  /* ---------- Enlaces a una parte de la misma página: bajan suave, sin quedar debajo de la cabecera ---------- */
  function initAnclas() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      var el = document.getElementById(id.slice(1));
      if (!el) return;
      e.preventDefault();
      var margen = id === "#contenido" ? 0 : alturaCabecera() + 12;
      if (lenis) lenis.scrollTo(el, { offset: -margen, duration: 1.4 });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - margen, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* Envuelve cada palabra de un elemento (respeta <em> y <br>). */
  function envolverPalabras(el, alCrear) {
    var n = 0;
    var recorrer = function (nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (hijo) {
        if (hijo.nodeType === 3) {
          var trozo = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach(function (parte) {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { trozo.appendChild(document.createTextNode(parte)); return; }
            trozo.appendChild(alCrear(parte, n++));
          });
          nodo.replaceChild(trozo, hijo);
        } else if (hijo.nodeType === 1 && hijo.tagName !== "BR") {
          recorrer(hijo);
        }
      });
    };
    recorrer(el);
    return n;
  }
  /* Títulos: cada palabra sube desde una máscara. */
  function dividirPalabras(el) {
    envolverPalabras(el, function (texto, n) {
      var mascara = document.createElement("span");
      var palabra = document.createElement("span");
      mascara.className = "palabra";
      palabra.textContent = texto;
      palabra.style.setProperty("--j", n);
      mascara.appendChild(palabra);
      return mascara;
    });
    el.setAttribute("data-split", "");
  }

  /* ---------- Apariciones al bajar ---------- */
  function initReveals() {
    var targets = $$(".reveal, [data-dividir], .reveal-foto");
    if (!targets.length) return;
    if (!reduced) $$("[data-dividir]").forEach(dividirPalabras);
    // Al terminar de aparecer, se suelta la animación (así funcionan los efectos al pasar el mouse).
    $$(".reveal").forEach(function (el) {
      el.addEventListener("animationend", function fin(e) {
        if (e.target !== el || e.animationName !== "aparecer") return;
        el.classList.add("revelado");
        el.removeEventListener("animationend", fin);
      });
    });
    var mostrar = function (el, orden) {
      el.style.setProperty("--retraso", Math.min(orden, 6) * 110 + "ms");
      el.classList.add("is-visible");
    };
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { mostrar(el, 0); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var orden = 0; // los que aparecen al mismo tiempo entran uno tras otro
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        mostrar(entry.target, orden++);
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });

    /* Red de seguridad: lo que ya está en pantalla (o más arriba) y siga oculto, se muestra. */
    var revisar = function () {
      $$(".reveal:not(.is-visible), [data-dividir]:not(.is-visible), .reveal-foto:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) mostrar(el, 0);
      });
    };
    setTimeout(revisar, 2500);
    window.addEventListener("beforeprint", function () { targets.forEach(function (el) { mostrar(el, 0); }); });
  }

  /* ---------- Texto que se ilumina palabra por palabra al bajar ---------- */
  function initTextoProgresivo() {
    if (reduced || !hayGsap()) return;
    $$("[data-texto-progresivo]").forEach(function (el) {
      var palabras = [];
      envolverPalabras(el, function (texto) {
        var s = document.createElement("span");
        s.className = "pp";
        s.textContent = texto;
        palabras.push(s);
        return s;
      });
      el.classList.add("preparado");
      var total = palabras.length;
      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        end: "bottom 48%",
        onUpdate: function (self) {
          var avance = self.progress * (total + 2);
          for (var i = 0; i < total; i++) {
            var o = 0.16 + 0.84 * Math.max(0, Math.min(1, avance - i));
            palabras[i].style.setProperty("--o", o.toFixed(3));
          }
        }
      });
    });
  }

  /* ---------- Cifras que cuentan hasta su número ---------- */
  function initContadores() {
    var els = $$("[data-count-to]");
    if (!els.length || reduced || !("IntersectionObserver" in window)) return;
    var animar = function (el) {
      var meta = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      var inicio = null;
      var paso = function (t) {
        if (!inicio) inicio = t;
        var p = Math.min((t - inicio) / 1700, 1);
        el.textContent = Math.round(meta * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animar(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) {
      // El número real ya está en la página; solo se pone en 0 justo antes de contar.
      el.textContent = "0";
      io.observe(el);
    });
    setTimeout(function () {
      els.forEach(function (el) { if (el.textContent === "0") el.textContent = el.getAttribute("data-count-to"); });
    }, 7000);
  }

  /* ---------- Portada del inicio: las fotos se turnan suavemente ---------- */
  function initPortada() {
    var portada = $("[data-portada]");
    if (!portada) return;
    var fotos = $$(".portada-foto", portada);
    var contador = $("[data-portada-actual]", portada);
    if (fotos.length < 2 || reduced) return;
    var actual = 0;
    var enPantalla = true;
    var cambiar = function () {
      if (!enPantalla || document.hidden) return;
      var vieja = fotos[actual];
      actual = (actual + 1) % fotos.length;
      var nueva = fotos[actual];
      vieja.classList.add("saliendo");
      vieja.classList.remove("activa");
      nueva.classList.add("activa");
      if (contador) contador.textContent = String(actual + 1).padStart(2, "0");
      setTimeout(function () { vieja.classList.remove("saliendo"); }, 2000);
    };
    setInterval(cambiar, 6500);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { enPantalla = e[0].isIntersecting; }).observe(portada);
    }
  }

  /* ---------- Buscador de la portada: el botón abre WhatsApp con el servicio elegido ---------- */
  function initBuscador() {
    var lista = $("[data-buscador-lista]");
    var ir = $("[data-buscador-ir]");
    if (!lista || !ir) return;
    var poner = function () { if (lista.value) ir.href = lista.value; };
    poner();
    lista.addEventListener("change", poner);
  }

  /* ---------- Carrusel: flechas, barra de avance y arrastrar con el mouse ---------- */
  function initCarruseles() {
    $$("[data-carrusel]").forEach(function (car) {
      var pista = $("[data-carrusel-pista]", car);
      var ant = $("[data-carrusel-ant]", car);
      var sig = $("[data-carrusel-sig]", car);
      var barra = $("[data-carrusel-avance]", car);
      if (!pista) return;
      // Cada flecha avanza casi una pantalla de tarjetas.
      var paso = function () {
        var t = $(".tarjeta", pista);
        return Math.max(pista.clientWidth * 0.75, t ? t.offsetWidth : 280);
      };
      var pintar = function () {
        var max = pista.scrollWidth - pista.clientWidth;
        var visible = pista.scrollWidth ? pista.clientWidth / pista.scrollWidth : 1;
        var avance = max > 0 ? pista.scrollLeft / max : 1;
        if (barra) barra.parentNode.style.setProperty("--avance", Math.min(1, visible + (1 - visible) * avance).toFixed(3));
        if (ant) ant.disabled = pista.scrollLeft < 4;
        if (sig) sig.disabled = pista.scrollLeft > max - 4;
      };
      if (ant) ant.addEventListener("click", function () { pista.scrollBy({ left: -paso(), behavior: reduced ? "auto" : "smooth" }); });
      if (sig) sig.addEventListener("click", function () { pista.scrollBy({ left: paso(), behavior: reduced ? "auto" : "smooth" }); });
      pista.addEventListener("scroll", function () { requestAnimationFrame(pintar); }, { passive: true });
      window.addEventListener("resize", pintar, { passive: true });
      pintar();

      // Arrastrar con el mouse (en el celular se desliza con el dedo, de forma nativa)
      var inicioX = 0;
      var inicioScroll = 0;
      var presionado = false;
      var movido = false;
      pista.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        presionado = true;
        movido = false;
        inicioX = e.clientX;
        inicioScroll = pista.scrollLeft;
      });
      window.addEventListener("pointermove", function (e) {
        if (!presionado) return;
        var dx = e.clientX - inicioX;
        if (!movido && Math.abs(dx) > 6) { movido = true; pista.classList.add("arrastrando"); }
        if (movido) { pista.scrollLeft = inicioScroll - dx; e.preventDefault(); }
      });
      var soltar = function () {
        if (!presionado) return;
        presionado = false;
        setTimeout(function () { pista.classList.remove("arrastrando"); }, 0);
      };
      window.addEventListener("pointerup", soltar);
      window.addEventListener("pointercancel", soltar);
      pista.addEventListener("dragstart", function (e) { e.preventDefault(); });
      pista.addEventListener("click", function (e) { if (movido) { e.preventDefault(); e.stopPropagation(); movido = false; } }, true);
    });
  }

  /* ---------- Lista oscura (cuidado capilar): con mouse, la foto de cada tratamiento sigue al puntero ---------- */
  function initListaFotos() {
    if (reduced || !conMouse) return;
    $$("[data-lista-fotos]").forEach(function (lista) {
      var enlaces = $$("a[data-foto]", lista);
      if (!enlaces.length) return;
      var marco = document.createElement("figure");
      marco.className = "lista-flotante";
      marco.setAttribute("aria-hidden", "true");
      var imgs = enlaces.map(function (a) {
        var img = document.createElement("img");
        img.alt = "";
        img.decoding = "async";
        img.setAttribute("data-src", a.getAttribute("data-foto"));
        marco.appendChild(img);
        return img;
      });
      document.body.appendChild(marco);
      var x = 0, y = 0, cx = 0, cy = 0, activo = false, corriendo = false;
      var mover = function () {
        cx += (x - cx) * 0.14;
        cy += (y - cy) * 0.14;
        var w = marco.offsetWidth;
        var h = marco.offsetHeight;
        marco.style.transform = "translate3d(" + (cx - w / 2).toFixed(1) + "px," + (cy - h / 2).toFixed(1) + "px,0) rotate(" + ((x - cx) * 0.03).toFixed(2) + "deg)";
        if (activo || Math.abs(x - cx) > 0.5) requestAnimationFrame(mover);
        else corriendo = false;
      };
      enlaces.forEach(function (a, i) {
        a.addEventListener("pointerenter", function (e) {
          imgs.forEach(function (img, j) {
            if (j === i && !img.src) img.src = img.getAttribute("data-src");
            img.classList.toggle("activa", j === i);
          });
          if (!activo) { x = cx = e.clientX; y = cy = e.clientY; }
          activo = true;
          marco.classList.add("visible");
          if (!corriendo) { corriendo = true; requestAnimationFrame(mover); }
        });
        a.addEventListener("pointermove", function (e) { x = e.clientX; y = e.clientY; });
      });
      lista.addEventListener("pointerleave", function () { activo = false; marco.classList.remove("visible"); });
      window.addEventListener("scroll", function () { if (activo) { activo = false; marco.classList.remove("visible"); } }, { passive: true });
    });
  }

  /* ---------- Fotos y videos de cada servicio: puntos para deslizar y visor en grande ---------- */
  function initGalerias() {
    var galerias = $$("[data-galeria]");
    var tarjetasVideo = $$(".video-card");
    if (!galerias.length && !tarjetasVideo.length) return;
    var fotosDe = function (g) { return $$(".media", g); };
    var actual = function (g) { return g.clientWidth ? Math.round(g.scrollLeft / g.clientWidth) : 0; };

    galerias.forEach(function (g) {
      if (fotosDe(g).length < 2) return;
      var puntos = document.createElement("div");
      puntos.className = "galeria-puntos";
      fotosDe(g).forEach(function (_, i, lista) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Ver foto " + (i + 1) + " de " + lista.length);
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          g.scrollTo({ left: i * g.clientWidth, behavior: reduced ? "auto" : "smooth" });
        });
        puntos.appendChild(b);
      });
      g.insertAdjacentElement("afterend", puntos);
      var marcar = function () {
        var i = actual(g);
        $$("button", puntos).forEach(function (b, j) { b.classList.toggle("activo", j === i); });
      };
      g.addEventListener("scroll", marcar, { passive: true });
      marcar();
    });

    var visor = document.createElement("div");
    visor.className = "visor";
    visor.hidden = true;
    visor.setAttribute("role", "dialog");
    visor.setAttribute("aria-modal", "true");
    visor.setAttribute("aria-label", "Fotos y videos");
    visor.innerHTML =
      '<img alt="" />' +
      '<iframe hidden title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>' +
      '<button class="visor-cerrar" type="button" aria-label="Cerrar">×</button>' +
      '<button class="visor-ant" type="button" aria-label="Anterior">‹</button>' +
      '<button class="visor-sig" type="button" aria-label="Siguiente">›</button>' +
      '<p class="visor-pie" aria-live="polite"></p>';
    document.body.appendChild(visor);
    var imagen = $("img", visor);
    var marco = $("iframe", visor);
    var pie = $(".visor-pie", visor);
    var lista = [];
    var indice = 0;
    var previo = null;

    // Cada elemento es una foto (img con data-grande) o un video (data-video con la dirección para incrustar).
    function mostrarFoto(i) {
      indice = (i + lista.length) % lista.length;
      var f = lista[indice];
      var video = f.getAttribute("data-video");
      var texto = f.getAttribute("alt") || f.getAttribute("aria-label") || "";
      if (video) {
        imagen.hidden = true;
        imagen.removeAttribute("src");
        marco.className = (f.hasAttribute("data-vertical") ? "vertical " : "") + (f.getAttribute("data-plataforma") || "");
        if (marco.getAttribute("src") !== video) marco.src = video;
        marco.hidden = false;
      } else {
        marco.hidden = true;
        marco.removeAttribute("src");
        imagen.src = f.getAttribute("data-grande") || f.getAttribute("src");
        imagen.alt = texto;
        imagen.hidden = false;
      }
      pie.textContent = texto.replace(/^(Ver )?video:?\s*/i, "") + (lista.length > 1 ? " · " + (indice + 1) + " / " + lista.length : "");
    }
    function abrir(fotos, i) {
      lista = fotos;
      previo = document.activeElement;
      visor.toggleAttribute("data-una", fotos.length < 2);
      mostrarFoto(i);
      visor.hidden = false;
      bloquearScroll(true);
      $(".visor-cerrar", visor).focus();
    }
    function cerrar() {
      visor.hidden = true;
      imagen.removeAttribute("src");
      marco.removeAttribute("src"); // detiene el video
      bloquearScroll(false);
      if (previo && previo.focus) previo.focus({ preventScroll: true });
    }

    tarjetasVideo.forEach(function (tarjeta, i) {
      tarjeta.addEventListener("click", function () { abrir(tarjetasVideo, i); });
    });
    galerias.forEach(function (g) {
      var abrirDesde = function () {
        var fotos = fotosDe(g);
        if (fotos.length) abrir(fotos, actual(g));
      };
      g.addEventListener("click", abrirDesde);
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDesde(); }
      });
    });
    $(".visor-cerrar", visor).addEventListener("click", cerrar);
    $(".visor-ant", visor).addEventListener("click", function () { mostrarFoto(indice - 1); });
    $(".visor-sig", visor).addEventListener("click", function () { mostrarFoto(indice + 1); });
    visor.addEventListener("click", function (e) { if (e.target === visor) cerrar(); });
    document.addEventListener("keydown", function (e) {
      if (visor.hidden) return;
      if (e.key === "Escape") cerrar();
      else if (e.key === "ArrowLeft") mostrarFoto(indice - 1);
      else if (e.key === "ArrowRight") mostrarFoto(indice + 1);
    });
    var inicioX = null;
    visor.addEventListener("touchstart", function (e) { inicioX = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", function (e) {
      if (inicioX === null || lista.length < 2) return;
      var dx = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(dx) > 40) mostrarFoto(indice + (dx < 0 ? 1 : -1));
      inicioX = null;
    });
  }

  /* ---------- Preguntas: la respuesta se despliega suave y solo queda una abierta ---------- */
  function initPreguntas() {
    var preguntas = $$(".pregunta");
    if (!preguntas.length) return;
    var grupo = function (d) { return d.getAttribute("data-grupo") || ""; };
    // El navegador cerraría las demás de golpe; se hace aquí, con animación.
    preguntas.forEach(function (d) {
      if (d.hasAttribute("name")) { d.setAttribute("data-grupo", d.getAttribute("name")); d.removeAttribute("name"); }
    });
    var animar = function (d, abrir) {
      var r = $(".pregunta-respuesta", d);
      if (reduced || !r || !r.animate) { d.open = abrir; return; }
      if (abrir) {
        d.open = true;
        var alto = r.offsetHeight;
        r.animate([{ height: "0px", opacity: 0 }, { height: alto + "px", opacity: 1 }], { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)" })
          .onfinish = refrescar;
      } else {
        var desde = r.offsetHeight;
        var a = r.animate([{ height: desde + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 420, easing: "cubic-bezier(0.65, 0, 0.35, 1)" });
        a.onfinish = function () { d.open = false; refrescar(); };
      }
    };
    preguntas.forEach(function (d) {
      $("summary", d).addEventListener("click", function (e) {
        e.preventDefault();
        if (d.open) { animar(d, false); return; }
        if (grupo(d)) preguntas.forEach(function (o) { if (o !== d && o.open && grupo(o) === grupo(d)) animar(o, false); });
        animar(d, true);
      });
    });
  }

  /* ---------- Año en el pie de página ---------- */
  function initYear() {
    var el = $("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Profundidad: las fotos se mueven a otra velocidad que la página (GSAP) ---------- */
  function initParalaje() {
    if (reduced || !hayGsap()) return;
    $$("[data-paralaje]").forEach(function (marco) {
      var img = $("img", marco);
      if (!img) return;
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: marco, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
    $$("[data-paralaje-fondo]").forEach(function (fondo) {
      gsap.fromTo(fondo, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: fondo.parentNode, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
    var portada = $("[data-portada]");
    if (portada) {
      gsap.to($(".portada-fotos", portada), { yPercent: 14, ease: "none", scrollTrigger: { trigger: portada, start: "top top", end: "bottom top", scrub: true } });
      gsap.to($(".portada-contenido", portada), { yPercent: -12, opacity: 0.15, ease: "none", scrollTrigger: { trigger: portada, start: "top top", end: "bottom top", scrub: true } });
    }
  }

  /* ---------- Barra fina arriba que muestra cuánto falta de la página ---------- */
  function initProgreso() {
    if (reduced) return;
    var barra = document.createElement("div");
    barra.className = "progreso";
    barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);
    var pendiente = false;
    var pintar = function () {
      pendiente = false;
      var maximo = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = "scaleX(" + (maximo > 0 ? Math.min(1, window.scrollY / maximo) : 0) + ")";
    };
    window.addEventListener("scroll", function () {
      if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener("resize", pintar, { passive: true });
    pintar();
  }

  /* ---------- Cinta de palabras: se acelera al bajar y cambia de sentido al subir ---------- */
  function initCinta() {
    var pista = $(".cinta-pista");
    if (!pista || reduced || !hayGsap()) return;
    var segundos = parseFloat(getComputedStyle(pista).animationDuration) || 30;
    pista.style.animation = "none";
    var mitad = pista.scrollWidth / 2;
    var x = 0;
    var sentido = -1;
    var impulso = 0;
    var enPantalla = true;
    window.addEventListener("resize", function () { mitad = pista.scrollWidth / 2; }, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { enPantalla = e[0].isIntersecting; }).observe(pista);
    }
    ScrollTrigger.create({
      onUpdate: function (self) {
        impulso = Math.min(Math.abs(self.getVelocity()) / 260, 6);
        sentido = self.direction === 1 ? -1 : 1;
      }
    });
    gsap.ticker.add(function (tiempo, delta) {
      impulso *= 0.94;
      if (!enPantalla || !mitad) return;
      x += sentido * (mitad / segundos) * (1 + impulso) * (delta / 1000);
      if (x <= -mitad) x += mitad;
      if (x > 0) x -= mitad;
      pista.style.transform = "translate3d(" + x.toFixed(2) + "px, 0, 0)";
    });
  }

  /* ---------- «Cómo funciona»: una línea une los pasos y se dibuja al bajar ---------- */
  function initPasos() {
    var lista = $("[data-pasos]");
    if (!lista || reduced || !hayGsap()) return;
    var pasos = $$("li", lista);
    if (pasos.length < 2) return;
    var linea = document.createElement("span");
    linea.className = "pasos-linea";
    linea.setAttribute("aria-hidden", "true");
    lista.appendChild(linea);
    // Va del centro del primer número al centro del último (en el celular, hacia abajo; en el computador, de lado).
    // Se mide con offset* (posición de diseño), que no cambia mientras los pasos hacen su animación de entrada.
    var medir = function () {
      var centro = function (li) {
        var n = $(".paso-num", li);
        return { x: li.offsetLeft + n.offsetLeft + n.offsetWidth / 2, y: li.offsetTop + n.offsetTop + n.offsetHeight / 2 };
      };
      var a = centro(pasos[0]);
      var b = centro(pasos[pasos.length - 1]);
      var vertical = Math.abs(b.y - a.y) > Math.abs(b.x - a.x);
      lista.classList.toggle("pasos-vertical", vertical);
      linea.style.left = a.x + "px";
      linea.style.top = a.y + "px";
      linea.style.width = vertical ? "" : b.x - a.x + "px";
      linea.style.height = vertical ? b.y - a.y + "px" : "";
    };
    medir();
    ScrollTrigger.addEventListener("refresh", medir);
    ScrollTrigger.create({
      trigger: lista,
      start: "top 78%",
      end: "bottom 55%",
      onUpdate: function (self) {
        linea.style.setProperty("--avance", self.progress.toFixed(3));
        pasos.forEach(function (li, i) { li.classList.toggle("paso-activo", self.progress >= i / (pasos.length - 1) - 0.02); });
      }
    });
  }

  /* ---------- Botón flotante de WhatsApp (computador) y barra para reservar (celular) ---------- */
  function initFlotantes() {
    var flotantes = $$("[data-flotante], [data-barra-movil]");
    if (!flotantes.length) return;
    var cercaDelFinal = false;
    var finales = $$(".cierre, .pie");
    if ("IntersectionObserver" in window && finales.length) {
      // Cerca del cierre o del pie de página ya hay botones de WhatsApp: los flotantes se esconden.
      var vistos = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) vistos.add(e.target); else vistos.delete(e.target); });
        cercaDelFinal = vistos.size > 0;
        pintar();
      });
      finales.forEach(function (el) { io.observe(el); });
    }
    var pintar = function () {
      var mostrar = window.scrollY > window.innerHeight * 0.6 && !cercaDelFinal && !menuAbierto;
      flotantes.forEach(function (el) { el.classList.toggle("visible", mostrar); });
    };
    window.addEventListener("scroll", pintar, { passive: true });
    pintar();
  }

  /* ---------- Con mouse: cursor propio y botones que se acercan al puntero ---------- */
  function initPuntero() {
    if (reduced || !conMouse) return;
    $$(".boton-claro, .boton-oscuro, .wa-flotante").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 10 + "px");
        b.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 8 + "px");
      });
      b.addEventListener("pointerleave", function () {
        b.style.removeProperty("--mx");
        b.style.removeProperty("--my");
      });
    });

    var cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = "<span></span>";
    document.body.appendChild(cursor);
    var texto = $("span", cursor);
    var x = -100, y = -100, cx = -100, cy = -100;
    var bucle = function () {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!cursor.classList.contains("activo")) { cx = x; cy = y; cursor.classList.add("activo"); }
    }, { passive: true });
    document.addEventListener("pointerover", function (e) {
      var conTexto = e.target.closest("[data-cursor]");
      var enlace = e.target.closest("a, button, select, summary, label, [role='button']");
      cursor.classList.toggle("con-texto", !!conTexto);
      cursor.classList.toggle("sobre-enlace", !conTexto && !!enlace);
      texto.textContent = conTexto ? conTexto.getAttribute("data-cursor") : "";
      cursor.classList.toggle("oculto", !!e.target.closest("iframe, .visor, .menu-movil"));
    });
    document.documentElement.addEventListener("pointerleave", function () { cursor.classList.remove("activo"); });
  }

  function boot() {
    safe(initAviso, "initAviso");
    if (hayGsap()) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }
    safe(initLenis, "initLenis");
    safe(initCabecera, "initCabecera");
    safe(initMenu, "initMenu");
    safe(initAnclas, "initAnclas");
    safe(initReveals, "initReveals");
    safe(initContadores, "initContadores");
    safe(initPortada, "initPortada");
    safe(initBuscador, "initBuscador");
    safe(initCarruseles, "initCarruseles");
    safe(initListaFotos, "initListaFotos");
    safe(initGalerias, "initGalerias");
    safe(initPreguntas, "initPreguntas");
    safe(initYear, "initYear");
    safe(initProgreso, "initProgreso");
    safe(initFlotantes, "initFlotantes");
    safe(initPuntero, "initPuntero");
    if (hayGsap()) {
      safe(initTextoProgresivo, "initTextoProgresivo");
      safe(initParalaje, "initParalaje");
      safe(initCinta, "initCinta");
      safe(initPasos, "initPasos");
      // Las fuentes y las fotos cambian las medidas: se recalculan las posiciones al terminar de cargar.
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refrescar);
      window.addEventListener("load", refrescar);
    }
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
