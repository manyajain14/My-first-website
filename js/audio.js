/* ============================================================
   The Midnight Library — sound
   Every effect is synthesized live with the Web Audio API,
   so no audio files are needed and it works offline.
   ============================================================ */
var SoundFX = (function () {
  "use strict";

  var ctx = null;
  var master = null;
  var pad = null;
  var enabled = true;

  try {
    enabled = localStorage.getItem("ml-sound") !== "off";
  } catch (e) { /* private mode */ }

  function ac() {
    if (!enabled) return null;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function envelope(g, t0, peak, attack, decay) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  }

  /* a soft bell note with a long tail */
  function tone(c, freq, t0, dur, peak, type) {
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    envelope(g, t0, peak, 0.015, dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.1);
  }

  /* filtered noise — wind, paper, air */
  function noise(c, t0, dur, f0, f1, peak, type) {
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource();
    src.buffer = buf;
    var flt = c.createBiquadFilter();
    flt.type = type || "lowpass";
    flt.frequency.setValueAtTime(f0, t0);
    flt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    flt.Q.value = 0.8;
    var g = c.createGain();
    envelope(g, t0, peak, 0.03, dur);
    src.connect(flt); flt.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  /* low ambient pad that sits underneath everything */
  function startPad() {
    var c = ac(); if (!c || pad) return;
    var g = c.createGain();
    g.gain.value = 0.014;
    var lfo = c.createOscillator();
    lfo.frequency.value = 0.09;
    var lfoGain = c.createGain();
    lfoGain.gain.value = 0.006;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    var o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = 110;      // A2
    var o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = 164.81;  // E3
    var o3 = c.createOscillator(); o3.type = "triangle"; o3.frequency.value = 220;  // A3
    var g3 = c.createGain(); g3.gain.value = 0.25;
    o1.connect(g); o2.connect(g); o3.connect(g3); g3.connect(g);
    g.connect(master);
    o1.start(); o2.start(); o3.start(); lfo.start();
    pad = { gain: g, oscs: [o1, o2, o3, lfo] };
  }

  function stopPad() {
    if (!pad) return;
    var p = pad; pad = null;
    try {
      p.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      setTimeout(function () { p.oscs.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 900);
    } catch (e) {}
  }

  return {
    get enabled() { return enabled; },

    /* the window swings open: breath of wind + distant bells */
    open: function () {
      var c = ac(); if (!c) return;
      var t = c.currentTime;
      noise(c, t, 1.1, 3200, 380, 0.22);
      noise(c, t + 0.08, 0.9, 900, 2400, 0.06, "bandpass");
      var notes = [440, 523.25, 659.25, 880];
      for (var i = 0; i < notes.length; i++) {
        tone(c, notes[i], t + 0.22 + i * 0.14, 1.4, 0.075);
      }
      startPad();
    },

    /* turning a page: soft paper whisper + faint tap */
    page: function () {
      var c = ac(); if (!c) return;
      var t = c.currentTime;
      noise(c, t, 0.22, 1400, 2600, 0.14, "bandpass");
      tone(c, 196, t, 0.18, 0.05, "triangle");
    },

    /* a volume lifted from the shelf */
    book: function () {
      var c = ac(); if (!c) return;
      var t = c.currentTime;
      tone(c, 96, t, 0.4, 0.16, "sine");
      tone(c, 144, t + 0.02, 0.28, 0.06, "triangle");
      noise(c, t, 0.16, 700, 1600, 0.08, "bandpass");
    },

    /* closing something gently */
    close: function () {
      var c = ac(); if (!c) return;
      var t = c.currentTime;
      noise(c, t, 0.3, 2200, 500, 0.1);
      tone(c, 160, t, 0.22, 0.05, "triangle");
    },

    /* the epilogue: a small constellation of ascending bells */
    shimmer: function () {
      var c = ac(); if (!c) return;
      var t = c.currentTime;
      var notes = [523.25, 587.33, 783.99, 1046.5, 1318.5];
      for (var i = 0; i < notes.length; i++) {
        tone(c, notes[i], t + i * 0.16, 1.8, 0.06);
        tone(c, notes[i] / 2, t + i * 0.16, 2.0, 0.03);
      }
      noise(c, t, 1.6, 5000, 8000, 0.02, "highpass");
    },

    /* tiny UI tick */
    click: function () {
      var c = ac(); if (!c) return;
      tone(c, 660, c.currentTime, 0.08, 0.04, "triangle");
    },

    toggle: function () {
      enabled = !enabled;
      try { localStorage.setItem("ml-sound", enabled ? "on" : "off"); } catch (e) {}
      if (enabled) { if (ctx && ctx.state === "suspended") ctx.resume(); startPad(); }
      else stopPad();
      return enabled;
    }
  };
})();
