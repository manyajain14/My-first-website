/* The Midnight Library — front desk
   Screen flow: landing window -> details -> shelf of lives ->
   reading a volume -> the epilogue under your name in stars. */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  var state = {
    name: "",
    age: 25,
    wish: "",
    lives: [],
    lastRead: null,   // index into lives
    page: 0,
    headings: LivesEngine.chapterHeadings
  };

  var STORE_KEY = "midnight-library-visit";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function roman(n) {
    var table = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    var out = "";
    for (var i = 0; i < table.length; i++) {
      while (n >= table[i][0]) { out += table[i][1]; n -= table[i][0]; }
    }
    return out;
  }

  function clampAge(v) {
    var n = parseInt(v, 10);
    if (isNaN(n)) n = 25;
    return Math.max(8, Math.min(120, n));
  }

  /* ------------------------- screens ------------------------- */

  function show(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
    var el = document.getElementById(id);
    void el.offsetWidth; // restart the fade transition
    el.classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------------------- welcome back ----------------------- */

  function restore() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!saved) return;
      if (saved.name) $("#f-name").value = saved.name;
      if (saved.age) $("#f-age").value = saved.age;
      if (saved.wish) $("#f-wish").value = saved.wish;
      var wb = $("#welcome-back");
      wb.textContent = "Welcome back, " + saved.name + " — the library kept your seat.";
      wb.hidden = false;
    } catch (e) { /* private mode etc. — the library forgives */ }
  }

  /* ------------------------ landing -------------------------- */

  function initWindow() {
    var win = $("#window-door");
    var scene = win.closest(".scene");
    var hint = $("#window-hint");

    win.addEventListener("click", function () {
      if (win.classList.contains("open")) return;
      win.classList.add("open");
      win.setAttribute("aria-expanded", "true");
      scene.classList.add("open");
      hint.classList.add("gone");
      scene.querySelector(".floor-light").classList.add("on");
      if (window.SoundFX) SoundFX.open();
      setTimeout(function () { show("screen-form"); }, 1500);
    });

    /* gentle Blender-style parallax tilt on the window */
    var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var tilt = win.querySelector(".window-tilt");

    if (finePointer && !reducedMotion) {
      var raf = null;
      scene.addEventListener("mousemove", function (e) {
        var rect = scene.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          tilt.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
          tilt.style.setProperty("--rx", (-py * 6).toFixed(2) + "deg");
          raf = null;
        });
      });
      scene.addEventListener("mouseleave", function () {
        tilt.style.setProperty("--rx", "0deg");
        tilt.style.setProperty("--ry", "0deg");
      });
    }
  }

  /* -------------------------- form --------------------------- */

  function initForm() {
    $("#library-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#f-name").value.trim() || "Wanderer";
      var age = clampAge($("#f-age").value);
      var wish = $("#f-wish").value.trim();

      state.name = name;
      state.age = age;
      state.wish = wish;
      state.lives = LivesEngine.build(name, age, wish);

      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ name: name, age: age, wish: wish }));
      } catch (err) { /* fine */ }

      renderShelf();
      show("screen-library");
    });

    $("#btn-edit").addEventListener("click", function () {
      show("screen-form");
    });
  }

  /* -------------------------- shelf -------------------------- */

  function renderShelf() {
    $("#library-title").textContent = "Welcome, " + state.name + ".";
    $("#library-lede").textContent =
      "Three volumes have been pulled for you, from the shelf nearest your wishing heart.";

    var shelf = $("#shelf");
    shelf.innerHTML = "";

    state.lives.forEach(function (life, i) {
      var book = document.createElement("button");
      book.className = "book";
      book.style.setProperty("--c1", life.colors[0]);
      book.style.setProperty("--c2", life.colors[1]);
      book.setAttribute("aria-label", "Read " + life.title + ": " + life.role);
      book.innerHTML =
        '<span class="vol">Volume ' + life.volume + "</span>" +
        '<span class="btitle">' + esc(life.title) + "</span>" +
        '<span class="brole">' + esc(life.tagline) + "</span>";
      book.addEventListener("click", function () {
        if (window.SoundFX) SoundFX.book();
        openReader(i);
      });
      shelf.appendChild(book);
    });
  }

  /* ------------------------- reader -------------------------- */

  function totalPages(life) { return life.chapters.length + 1; } // cover + chapters

  function openReader(i) {
    state.lastRead = i;
    state.page = 0;
    renderPage();
    $("#reader").hidden = false;
    document.body.style.overflow = "hidden";
    $("#pg-next").focus();
  }

  function closeReader() {
    $("#reader").hidden = true;
    document.body.style.overflow = "";
  }

  function renderPage() {
    var life = state.lives[state.lastRead];
    var total = totalPages(life);
    var pageEl = $("#page");

    $("#reader-crumb").textContent =
      "Volume " + life.volume + " · " + life.title;

    var html = "";
    if (state.page === 0) {
      html =
        '<p class="p-vol">The Midnight Library Press</p>' +
        "<h3>" + esc(life.title) + "</h3>" +
        '<p class="p-role">' + esc(life.role) + "</p>" +
        '<div class="cover-ornament">&#10022; &#10022; &#10022;</div>' +
        '<hr class="rule">' +
        '<p class="belongs">This copy belongs to<br><strong>' + esc(state.name) +
        ", age " + state.age + "</strong><br>borrowed tonight, beneath these exact stars.</p>" +
        '<button class="dl-link" id="dl-life">&#8681; Keep this volume as a text file</button>';
    } else {
      html =
        '<p class="chapter-label">' + esc(state.headings[state.page - 1]) + "</p>" +
        '<div class="p-body"><p>' + esc(life.chapters[state.page - 1]) + "</p></div>";
    }

    pageEl.innerHTML = '<div class="p-scroll">' + html + "</div>";
    pageEl.classList.remove("swap");
    void pageEl.offsetWidth;
    pageEl.classList.add("swap");
    pageEl.scrollTop = 0;

    $("#pg-count").textContent =
      "Page " + roman(state.page + 1) + " of " + roman(total);
    $("#pg-prev").disabled = state.page === 0;
    $("#pg-prev").style.visibility = state.page === 0 ? "hidden" : "visible";
    $("#pg-next").textContent = state.page === total - 1 ? "Close the book" : "Next &rarr;";

    var dl = $("#dl-life");
    if (dl) dl.addEventListener("click", function () { downloadLife(state.lastRead); });
  }

  function step(d) {
    var life = state.lives[state.lastRead];
    var total = totalPages(life);
    var next = state.page + d;
    if (next < 0) return;
    if (next >= total) {
      if (window.SoundFX) SoundFX.close();
      closeReader();
      return;
    }
    state.page = next;
    if (window.SoundFX) SoundFX.page();
    renderPage();
  }

  function initReader() {
    $("#pg-prev").addEventListener("click", function () { step(-1); });
    $("#pg-next").addEventListener("click", function () { step(1); });
    $("#reader-close").addEventListener("click", closeReader);

    document.addEventListener("keydown", function (e) {
      if ($("#reader").hidden) return;
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") closeReader();
    });

    $("#btn-own-life").addEventListener("click", function () {
      if (window.SoundFX) SoundFX.click();
      renderEpilogue();
      show("screen-epilogue");
    });
  }

  /* ------------------------ epilogue ------------------------- */

  function renderEpilogue() {
    var parts = LivesEngine.epilogue(state.name, state.age);
    var box = $("#epi-text");
    box.innerHTML = "";
    parts.forEach(function (p, i) {
      var el = document.createElement("p");
      if (i === parts.length - 1) el.style.textAlign = "center";
      el.textContent = p;
      box.appendChild(el);
    });
    requestAnimationFrame(function () { drawConstellation(); });
    if (window.SoundFX) SoundFX.shimmer();
  }

  function drawConstellation() {
    var cv = $("#constellation");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var text = (state.name || "You").toUpperCase();
    var fontSize = Math.min(46, Math.max(24, w / (text.length * 0.72)));
    ctx.font = 'italic ' + fontSize + 'px "Times New Roman", Times, serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    var gap = Math.max(12, fontSize * 0.28);
    var widths = [];
    for (var i = 0; i < text.length; i++) widths.push(ctx.measureText(text[i]).width);
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + gap * (text.length - 1);
    var x = (w - total) / 2;
    var baseY = h * 0.66;

    var pts = [];
    for (var j = 0; j < text.length; j++) {
      var cw = widths[j];
      var cx = x + cw / 2;
      var cy = baseY - (j % 2 === 0 ? 16 : 6) + Math.sin(j * 1.3) * 5;
      pts.push([cx, cy + 14]);               // node sits under the letter
      ctx.fillStyle = "rgba(238,242,255,0.96)";
      ctx.fillText(text[j], cx, cy);
      x += cw + gap;
    }

    // gold thread between the letters
    ctx.strokeStyle = "rgba(230,197,132,0.8)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    pts.forEach(function (p, k) { if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
    ctx.stroke();

    // star-nodes
    pts.forEach(function (p) {
      ctx.fillStyle = "#e6c584";
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(230,197,132,0.25)";
      ctx.beginPath();
      ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ------------------------ downloads ------------------------ */

  function journalText(lifeOrNull) {
    var lines = [];
    lines.push("THE MIDNIGHT LIBRARY — an aspirational journal");
    lines.push("borrowed by " + state.name + ", age " + state.age);
    lines.push("wishing: \"" + state.wish + "\"");
    lines.push("");

    var lives = lifeOrNull === null ? state.lives : [state.lives[lifeOrNull]];
    lives.forEach(function (life) {
      lines.push("--------------------------------------------------");
      lines.push("VOLUME " + life.volume + " · " + life.title.toUpperCase());
      lines.push(life.role);
      lines.push("");
      life.chapters.forEach(function (ch, i) {
        lines.push(state.headings[i]);
        lines.push(ch);
        lines.push("");
      });
    });

    lines.push("==================================================");
    lines.push("EPILOGUE — THE MOST PERFECT ROLE");
    lines.push("");
    LivesEngine.epilogue(state.name, state.age).forEach(function (p) {
      lines.push(p);
      lines.push("");
    });
    return lines.join("\n");
  }

  function downloadText(filename, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 150);
  }

  function safeName() {
    return (state.name || "wanderer").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "wanderer";
  }

  function downloadLife(i) {
    downloadText("midnight-library-volume-" + state.lives[i].volume + ".txt", journalText(i));
  }

  function initActions() {
    /* sound toggle reflects the saved preference */
    var toggle = $("#sound-toggle");
    var pressed = !!(window.SoundFX && SoundFX.enabled);
    toggle.setAttribute("aria-pressed", String(pressed));
    toggle.addEventListener("click", function () {
      if (!window.SoundFX) return;
      var on = SoundFX.toggle();
      toggle.setAttribute("aria-pressed", String(on));
      if (on) SoundFX.click();
    });

    $("#btn-download").addEventListener("click", function () {
      downloadText("the-midnight-library-journal.txt", journalText(null));
    });

    $("#btn-again").addEventListener("click", function () {
      show("screen-landing");
    });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawConstellation, 120);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(drawConstellation);
    }
  }

  /* -------------------------- boot --------------------------- */

  restore();
  initWindow();
  initForm();
  initReader();
  initActions();
})();
