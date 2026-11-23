/* The Midnight Library — night sky
   A field of slowly twinkling stars with the occasional shooting star. */
(function () {
  "use strict";

  var canvas = document.getElementById("starfield");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return; // canvas unsupported (e.g. very old browsers) — night sky stays plain navy
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var W = 0, H = 0;
  var stars = [];
  var meteors = [];
  var nextMeteor = 3500; // ms until first meteor
  var last = 0;

  var PALETTE = [
    [255, 255, 255],   // white
    [214, 228, 255],   // ice blue
    [255, 230, 168],   // warm gold
    [255, 214, 224]    // faint rose
  ];

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    var count = Math.max(90, Math.min(260, Math.round((W * H) / 8500)));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 1.35,
        base: 0.3 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        c: PALETTE[Math.floor(Math.random() * PALETTE.length)]
      });
    }
  }

  function drawSky(t) {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = s.base * (0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase));
      ctx.globalAlpha = tw;
      ctx.fillStyle = "rgb(" + s.c[0] + "," + s.c[1] + "," + s.c[2] + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function spawnMeteor(t) {
    var sx = W * (0.25 + Math.random() * 0.7);
    var sy = Math.random() * H * 0.35;
    var speed = 5 + Math.random() * 4;                 // px per ~16ms step
    var angle = Math.PI * (0.12 + Math.random() * 0.1); // shallow downward slope
    meteors.push({
      x: sx, y: sy,
      vx: -Math.cos(angle) * speed,                    // drift left…
      vy: Math.sin(angle) * speed,                     // …and gently down
      born: t,
      life: 900 + Math.random() * 500
    });
    nextMeteor = t + 5000 + Math.random() * 7000;
  }

  function drawMeteors(t, dt) {
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      var age = t - m.born;
      if (age > m.life || m.x < -80 || m.y > H + 80) {
        meteors.splice(i, 1);
        continue;
      }
      m.x += m.vx * dt * 0.06;
      m.y += m.vy * dt * 0.06;

      var fade = 1 - age / m.life;
      var tailX = m.x - m.vx * 26;
      var tailY = m.y - m.vy * 26;

      var grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, "rgba(255, 246, 220," + (0.9 * fade) + ")");
      grad.addColorStop(1, "rgba(255, 246, 220, 0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 252, 240," + fade + ")";
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(t) {
    if (!last) last = t;
    var dt = Math.min(50, t - last);
    last = t;

    drawSky(t);

    if (!reduced) {
      if (t > nextMeteor) spawnMeteor(t);
      drawMeteors(t, dt);
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("resize", resize);
  resize();

  if (reduced) {
    drawSky(0); // one static painting
  } else {
    requestAnimationFrame(frame);
  }
})();
