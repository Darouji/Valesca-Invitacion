/* Efectos de audio creados por síntesis Web Audio. No requiere archivos externos. */
(() => {
  let context = null;
  let master = null;
  let enabled = true;

  function getContext() {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = enabled ? 0.58 : 0;
      master.connect(context.destination);
    }
    return context;
  }

  async function unlock() {
    const ctx = getContext();
    if (ctx && ctx.state === "suspended") {
      try { await ctx.resume(); } catch (_) { /* El navegador puede bloquear el audio. */ }
    }
    return !!ctx;
  }

  function setEnabled(value) {
    enabled = !!value;
    const ctx = getContext();
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(enabled ? 0.58 : 0, now, 0.025);
    }
    return enabled;
  }

  function noiseBurst(duration, volume, filterType = "bandpass", frequency = 1400, q = 0.8, delay = 0) {
    const ctx = getContext();
    if (!ctx || !enabled) return;
    const start = ctx.currentTime + delay;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 0.45;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter); filter.connect(gain); gain.connect(master);
    source.start(start); source.stop(start + duration + 0.02);
  }

  function tone({ frequency = 440, endFrequency = null, duration = 0.15, type = "sine", volume = 0.15, delay = 0, attack = 0.008, q = 1 }) {
    const ctx = getContext();
    if (!ctx || !enabled) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(25, frequency), start);
    if (endFrequency !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFrequency), start + duration);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(5200, start);
    filter.Q.value = q;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter); filter.connect(gain); gain.connect(master);
    osc.start(start); osc.stop(start + duration + 0.025);
  }

  function powerOn() {
    if (!enabled) return;
    noiseBurst(0.42, 0.22, "lowpass", 2200, 0.5);
    tone({ frequency: 62, endFrequency: 185, duration: 0.6, type: "sawtooth", volume: 0.18 });
    tone({ frequency: 920, endFrequency: 480, duration: 0.28, type: "sine", volume: 0.075, delay: 0.22 });
    tone({ frequency: 120, endFrequency: 38, duration: 0.35, type: "triangle", volume: 0.14, delay: 0.42 });
  }

  function staticPop() {
    if (!enabled) return;
    noiseBurst(0.16, 0.15, "highpass", 2300, 0.5);
    tone({ frequency: 1600, endFrequency: 360, duration: 0.09, type: "square", volume: 0.035 });
  }

  function cartoonHit(intensity = 1) {
    if (!enabled) return;
    noiseBurst(0.105, 0.33 * intensity, "lowpass", 900, 0.7);
    tone({ frequency: 125, endFrequency: 43, duration: 0.2, type: "sine", volume: 0.34 * intensity });
    tone({ frequency: 510, endFrequency: 155, duration: 0.12, type: "square", volume: 0.075 * intensity, delay: 0.012 });
    tone({ frequency: 82, endFrequency: 125, duration: 0.1, type: "triangle", volume: 0.12, delay: 0.06 });
  }

  function glassCrack(intensity = 1) {
    if (!enabled) return;
    noiseBurst(0.26, 0.3 * intensity, "highpass", 2800, 1.8);
    [2200, 3100, 1450, 3900].forEach((f, i) => tone({ frequency: f, endFrequency: f * (0.55 + Math.random() * 0.15), duration: 0.14 + Math.random() * 0.1, type: "triangle", volume: 0.055 * intensity, delay: i * 0.018 }));
    tone({ frequency: 700, endFrequency: 210, duration: 0.19, type: "sawtooth", volume: 0.07 * intensity, delay: 0.035 });
  }

  function cartoonYelp() {
    /* Chillido caricaturesco sintetizado; no es una grabación real de gato. */
    if (!enabled) return;
    tone({ frequency: 620, endFrequency: 1480, duration: 0.13, type: "sawtooth", volume: 0.085, delay: 0.02, q: 2.5 });
    tone({ frequency: 1480, endFrequency: 430, duration: 0.27, type: "sawtooth", volume: 0.075, delay: 0.14, q: 3 });
    tone({ frequency: 980, endFrequency: 2100, duration: 0.095, type: "triangle", volume: 0.06, delay: 0.32 });
  }

  function shatter() {
    if (!enabled) return;
    noiseBurst(0.72, 0.43, "highpass", 1600, 0.65);
    noiseBurst(0.5, 0.24, "bandpass", 3600, 1.4, 0.04);
    [2700, 1900, 3400, 1250, 4100, 2300, 1700].forEach((f, i) => tone({ frequency: f, endFrequency: 90 + Math.random() * 140, duration: 0.3 + Math.random() * 0.2, type: i % 2 ? "triangle" : "sine", volume: 0.065, delay: i * 0.028 }));
    tone({ frequency: 94, endFrequency: 34, duration: 0.45, type: "sine", volume: 0.28, delay: 0.03 });
    cartoonYelp();
  }

  window.InviteAudio = { unlock, setEnabled, powerOn, staticPop, cartoonHit, glassCrack, shatter };
})();
