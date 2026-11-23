/* ============================================================
   The Midnight Library — night sky
   Layered starfield: faint far stars, glowing near stars,
   slow parallax drift, a soft nebula wash, shooting stars.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("starfield");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return; // canvas unsupported — night sky stays plain navy

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var W = 0, H = 0, DPR = 1;
  var far = [], near = [];
  var meteors = [];
  var nextMeteor = 4000;
  var last = 0;

  var PALETTE = [
    [255, 255, 255],
    [214, 228, 255],
    [255, 230, 168],
    [255, 214, 224]
  ];

  /* pre-rendered soft-glow sprite for the brighter stars */
  function makeGlowSprite(rgb) {
    var s = document.createElement("canvas");
    s.width = s.height = 64;
    var c = s.getContext("2d");
    if (!c) return null;
    var g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(" + rgb + ",0.9)");
    g.addColorStop(0.45, "rgba(" + rgb + ",0.25)");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    return s;
  }

  var SPRITES = {};
  PALETTE.forEach(function (p) { SPRITES[p.join(",")] = makeGlowSprite(p.join(",")); });

  /* one static wash of deep-space colour, drawn scaled each frame */
  var nebula = null;
  function buildNebula() {
    nebula = document.createElement("canvas");
    nebula.width = Math.max(2, Math.floor(W / 3));
    nebula.height = Math.max(2, Math.floor(H / 3));
    var c = nebula.getContext("2d");
    if (!c) return;
    var blobs = [
      [0.22, 0.25, 0.55, "79, 70, 229", 0.16],   // indigo
      [0.8, 0.2, 0.45, "13, 148, 136", 0.10],   // teal
      [0.7, 0.85, 0.5, "192, 38, 107", 0.08],   // magenta
      [0.3, 0.9, 0.4, "30, 64, 175", 0.12]      // blue
    ];
    blobs.forEach(function (b) {
      var x = b[0] * nebula.width, y = b[1] * nebula.height, r = b[2] * Math.max(nebula.width, nebula.height);
      var g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(" + b[3] + "," + b[4] + ")");
      g.addColorStop(1, "rgba(" + b[3] + ",0)");
      c.fillStyle = g;
      c.fillRect(0, 0, nebula.width, nebula.height);
    });
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
    buildNebula();
  }

  function seed() {
    var area = W * H;
    var nFar = Math.max(120, Math.min(420, Math.round(area / 5200)));
    var nNear = Math.max(24, Math.min(90, Math.round(area / 22000)));
    far = []; near = [];
    var i;
    for (i = 0; i < nFar; i++) {
      far.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.3 + Math.random() * 0.7,
        base: 0.25 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.9,
        vx: -(0.3 + Math.random() * 0.7),
        vy: 0.15 + Math.random() * 0.4,
        c: PALETTE[(Math.random() * PALETTE.length) | 0]
      });
    }
    for (i = 0; i < nNear; i++) {
      near.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.9 + Math.random() * 1.4,
        base: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.2,
        vx: -(0.15 + Math.random() * 0.35),
        vy: 0.08 + Math.random() * 0.2,
        c: PALETTE[(Math.random() * PALETTE.length) | 0]
      });
    }
  }

  function drawSky(t, dt) {
    ctx.clearRect(0, 0, W, H);

    if (nebula) {
      ctx.globalAlpha = 0.9;
      ctx.drawImage(nebula, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    var i, s, tw;
    for (i = 0; i < far.length; i++) {
      s = far[i];
      s.x += s.vx * dt * 0.004;
      s.y += s.vy * dt * 0.004;
      if (s.x < -2) s.x = W + 2;
      if (s.y > H + 2) s.y = -2;
      tw = s.base * (0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase));
      ctx.globalAlpha = tw;
      ctx.fillStyle = "rgb(" + s.c[0] + "," + s.c[1] + "," + s.c[2] + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (i = 0; i < near.length; i++) {
      s = near[i];
      s.x += s.vx * dt * 0.004;
      s.y += s.vy * dt * 0.004;
      if (s.x < -20) s.x = W + 20;
      if (s.y > H + 20) s.y = -20;
      tw = s.base * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase));
      var spr = SPRITES[s.c.join(",")];
      var size = s.r * 9;
      if (spr) {
        ctx.globalAlpha = tw;
        ctx.drawImage(spr, s.x - size / 2, s.y - size / 2, size, size);
      } else {
        ctx.globalAlpha = tw;
        ctx.fillStyle = "rgb(" + s.c[0] + "," + s.c[1] + "," + s.c[2] + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function spawnMeteor(t) {
    var sx = W * (0.3 + Math.random() * 0.65);
    var sy = Math.random() * H * 0.32;
    var speed = 5 + Math.random() * 4;
    var angle = Math.PI * (0.12 + Math.random() * 0.1);
    meteors.push({
      x: sx, y: sy,
      vx: -Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      born: t,
      life: 900 + Math.random() * 500
    });
    nextMeteor = t + 5000 + Math.random() * 7000;
  }

  function drawMeteors(t, dt) {
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      var age = t - m.born;
      if (age > m.life || m.x < -80 || m.y > H + 80) { meteors.splice(i, 1); continue; }
      m.x += m.vx * dt * 0.06;
      m.y += m.vy * dt * 0.06;
      var fade = 1 - age / m.life;
      var grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 26, m.y - m.vy * 26);
      grad.addColorStop(0, "rgba(255,246,220," + (0.9 * fade) + ")");
      grad.addColorStop(1, "rgba(255,246,220,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 26, m.y - m.vy * 26);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,252,240," + fade + ")";
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(t) {
    if (!last) last = t;
    var dt = Math.min(50, t - last);
    last = t;
    drawSky(t, dt);
    if (t > nextMeteor) spawnMeteor(t);
    drawMeteors(t, dt);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();

  if (reduced) {
    drawSky(0, 0); // one static painting
  } else {
    requestAnimationFrame(frame);
  }
})();
