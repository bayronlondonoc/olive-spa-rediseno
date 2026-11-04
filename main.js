(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Efectos que siguen al puntero (botones con imán, brillo en tarjetas): solo con mouse, no en pantallas táctiles.
  var conMouse = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hayGsap = function () { return !!(window.gsap && window.ScrollTrigger); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- Nav: solidificar al hacer scroll + menú móvil ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    // Alto real de la franja de aviso (puede ocupar dos líneas en el celular).
    var aviso = $(".aviso", nav);
    if (aviso) {
      var medir = function () { document.documentElement.style.setProperty("--aviso-h", aviso.offsetHeight + "px"); };
      medir();
      window.addEventListener("resize", medir, { passive: true });
    }
    // Al bajar, la barra se esconde para dejar más espacio; al subir, vuelve a aparecer.
    var ultimo = window.scrollY;
    var conFoco = function () {
      try { return !!nav.querySelector(":focus-visible"); } catch (_) { return false; }
    };
    var onScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle("is-solid", y > 24);
      if (!reduced && !nav.classList.contains("is-open") && !conFoco()) {
        if (y > 160 && y > ultimo + 6) nav.classList.add("nav-oculta");
        else if (y < 160 || y < ultimo - 6) nav.classList.remove("nav-oculta");
      }
      if (Math.abs(y - ultimo) > 6 || y < 160) ultimo = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $("[data-burger]");
    var links = $("[data-nav-links]");
    if (burger && links) {
      // Los enlaces del menú del celular entran uno tras otro
      $$("a", links).forEach(function (a, i) { a.style.setProperty("--k", i); });
      burger.addEventListener("click", function () {
        nav.classList.remove("nav-oculta");
        var open = nav.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          nav.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  /* ---------- Scroll suave con offset del nav ---------- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var nav = $("[data-nav]");
      var top = el.getBoundingClientRect().top + window.scrollY - (nav ? nav.offsetHeight - 8 : 70);
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* Divide un título en palabras para que suban una por una desde una máscara (respeta <em> y <br>). */
  function dividirPalabras(el) {
    var n = 0;
    var recorrer = function (nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (hijo) {
        if (hijo.nodeType === 3) {
          var trozo = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach(function (parte) {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { trozo.appendChild(document.createTextNode(parte)); return; }
            var mascara = document.createElement("span");
            var palabra = document.createElement("span");
            mascara.className = "palabra";
            palabra.textContent = parte;
            palabra.style.setProperty("--j", n++);
            mascara.appendChild(palabra);
            trozo.appendChild(mascara);
          });
          nodo.replaceChild(trozo, hijo);
        } else if (hijo.nodeType === 1 && hijo.tagName !== "BR") {
          recorrer(hijo);
        }
      });
    };
    recorrer(el);
    el.setAttribute("data-split", "");
  }

  /* ---------- Apariciones al bajar ---------- */
  function initReveals() {
    var targets = $$(".reveal");
    if (!targets.length) return;
    if (!reduced) {
      $$(".hero-title, .section-title, .cta h2").forEach(dividirPalabras);
      // Las fotos grandes se destapan; al terminar, quedan normales (para el zoom al pasar el mouse)
      $$(".hero-figure img, .about-figure img, .split-figure img").forEach(function (img) {
        img.classList.add("foto-revelar");
        img.addEventListener("animationend", function () { img.classList.remove("foto-revelar"); }, { once: true });
      });
    }
    var mostrar = function (el, orden) {
      el.style.setProperty("--retraso", Math.min(orden, 6) * 110 + "ms");
      el.classList.add("is-visible");
    };
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { mostrar(el, 0); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      // Los que aparecen al mismo tiempo entran uno tras otro
      var orden = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        mostrar(entry.target, orden++);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });

    /* Red de seguridad: lo que ya está en pantalla (o más arriba) y siga oculto, se muestra */
    var revisar = function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) mostrar(el, 0);
      });
    };
    setTimeout(revisar, 2500);
    window.addEventListener("beforeprint", function () { targets.forEach(function (el) { mostrar(el, 0); }); });
  }

  /* ---------- Contadores animados ---------- */
  function initCountUp() {
    var els = $$("[data-count-to]");
    if (!els.length) return;
    var animate = function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      if (reduced) { el.textContent = target; return; }
      var start = null;
      var dur = 1600;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute("data-count-to"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) {
        if (el.textContent === "0") el.textContent = el.getAttribute("data-count-to");
      });
    }, 6000);
  }

  /* ---------- Fotos y videos por servicio: puntos en las portadas + visor en grande ---------- */
  function initGalerias() {
    var galerias = $$("[data-galeria]");
    var tarjetasVideo = $$(".video-card");
    if (!galerias.length && !tarjetasVideo.length) return;
    var fotosDe = function (g) { return $$(".media", g); };
    var actual = function (g) { return g.clientWidth ? Math.round(g.scrollLeft / g.clientWidth) : 0; };

    galerias.forEach(function (g) {
      if (!g.classList.contains("galeria-portada") || fotosDe(g).length < 2) return;
      var puntos = document.createElement("div");
      puntos.className = "galeria-puntos";
      fotosDe(g).forEach(function (_, i, lista) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Ver foto " + (i + 1) + " de " + lista.length);
        b.addEventListener("click", function () {
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
      pie.textContent = texto.replace(/^Ver video:?\s*/, "") + (lista.length > 1 ? " · " + (indice + 1) + " / " + lista.length : "");
    }
    function abrir(fotos, i) {
      lista = fotos;
      previo = document.activeElement;
      visor.toggleAttribute("data-una", fotos.length < 2);
      mostrarFoto(i);
      visor.hidden = false;
      document.documentElement.style.overflow = "hidden";
      $(".visor-cerrar", visor).focus();
    }
    function cerrar() {
      visor.hidden = true;
      imagen.removeAttribute("src");
      marco.removeAttribute("src"); // detiene el video
      document.documentElement.style.overflow = "";
      if (previo && previo.focus) previo.focus();
    }

    tarjetasVideo.forEach(function (tarjeta, i) {
      tarjeta.addEventListener("click", function () { abrir(tarjetasVideo, i); });
    });
    galerias.forEach(function (g) {
      var abrirDesde = function (objetivo) {
        var fotos = fotosDe(g);
        if (!fotos.length) return;
        var i = g.classList.contains("galeria-portada") ? actual(g) : Math.max(0, fotos.indexOf(objetivo));
        abrir(fotos, i);
      };
      g.addEventListener("click", function (e) { abrirDesde(e.target.closest(".media")); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirDesde(null); }
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

  /* ---------- Año en el footer ---------- */
  function initYear() {
    var el = $("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Profundidad: fotos y adornos se mueven a otra velocidad que la página (GSAP) ---------- */
  function initParallax() {
    if (reduced || !hayGsap()) return;
    var mover = function (selector, desde, hasta, disparador, inicio) {
      $$(selector).forEach(function (el) {
        gsap.fromTo(el, { yPercent: desde }, {
          yPercent: hasta,
          ease: "none",
          scrollTrigger: { trigger: disparador || el, start: inicio || "top bottom", end: "bottom top", scrub: 0.6 }
        });
      });
    };
    mover(".hero-figure img", 0, 8, ".hero", "top top");
    mover(".hero-blob", 0, 18, ".hero", "top top");
    mover(".about-media", 7, -7);
    mover(".split-media", 7, -7);
    mover(".cta-bg", -9, 9, ".cta");
    mover(".squiggle", 60, -60);
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
    var pista = $(".marquee-track");
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
        impulso = Math.min(Math.abs(self.getVelocity()) / 280, 6);
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
    var lista = $(".steps-grid");
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
        var n = $(".step-num", li);
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
    ScrollTrigger.addEventListener("refresh", medir); // también al cambiar el tamaño de la pantalla o al terminar de cargar
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

  /* ---------- Con mouse: botones que se acercan al puntero y tarjetas con un brillo que lo sigue ---------- */
  function initPuntero() {
    if (reduced || !conMouse) return;
    $$(".btn-primary, .btn-light, .wa-float").forEach(function (b) {
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
    $$(".program-card, .post-card").forEach(function (t) {
      t.addEventListener("pointermove", function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty("--x", e.clientX - r.left + "px");
        t.style.setProperty("--y", e.clientY - r.top + "px");
      });
    });
  }

  function boot() {
    document.documentElement.classList.remove("no-js");
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initGalerias, "initGalerias");
    safe(initYear, "initYear");
    safe(initProgreso, "initProgreso");
    safe(initPuntero, "initPuntero");
    if (hayGsap()) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initParallax, "initParallax");
      safe(initCinta, "initCinta");
      safe(initPasos, "initPasos");
    }
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
