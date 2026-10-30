/*
 * Audio original para Valesca: efectos cartoon + un loop musical misterioso.
 * Todo se sintetiza con Web Audio; no utiliza samples ni melodías de franquicias.
 */
(() => {
  let context = null;
  let master = null;
  let enabled = true;
  let musicBuffer = null;
  let musicSource = null;
  let musicBus = null;

  function getContext() {
    if (!context) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
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
      try {
        await ctx.resume();
      } catch (_) {
        /* El navegador puede bloquear el audio. */
      }
    }
    return !!ctx;
  }

  function setEnabled(value) {
    enabled = !!value;
    const ctx = getContext();
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(enabled ? 0.58 : 0, now, 0.04);
    }
    return enabled;
  }

  function noiseBurst(
    duration,
    volume,
    filterType = "bandpass",
    frequency = 1400,
    q = 0.8,
    delay = 0,
  ) {
    const ctx = getContext();
    if (!ctx || !enabled) return;
    const start = ctx.currentTime + delay;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1)
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 0.45;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, volume),
      start + 0.008,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  function tone({
    frequency = 440,
    endFrequency = null,
    duration = 0.15,
    type = "sine",
    volume = 0.15,
    delay = 0,
    attack = 0.008,
    q = 1,
  }) {
    const ctx = getContext();
    if (!ctx || !enabled) return;
    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(25, frequency), start);
    if (endFrequency !== null)
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(25, endFrequency),
        start + duration,
      );
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(5200, start);
    filter.Q.value = q;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, volume),
      start + attack,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.025);
  }

  function midiFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function buildMysteryLoop(ctx) {
    // 4 compases en re menor: juguetón, misterioso y con sabor a cartoon de sábado por la mañana.
    const bpm = 108;
    const beat = 60 / bpm;
    const duration = beat * 16;
    const sampleRate = ctx.sampleRate;
    const length = Math.ceil(duration * sampleRate);
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    let noiseSeed = 0x4a31;
    const random = () => {
      noiseSeed = (noiseSeed * 1664525 + 1013904223) >>> 0;
      return (noiseSeed / 4294967296) * 2 - 1;
    };

    function addVoice({
      frequency,
      start,
      lengthSeconds,
      volume,
      kind = "pluck",
      pan = 0,
    }) {
      const startSample = Math.max(0, Math.floor(start * sampleRate));
      const sampleCount = Math.min(
        Math.floor(lengthSeconds * sampleRate),
        length - startSample,
      );
      if (sampleCount <= 0) return;
      const lGain = Math.sqrt((1 - pan) * 0.5);
      const rGain = Math.sqrt((1 + pan) * 0.5);
      const safeFrequency = Math.max(24, frequency || 220);
      for (let i = 0; i < sampleCount; i += 1) {
        const t = i / sampleRate;
        const progress = i / sampleCount;
        let envelope = 1;
        let wave = 0;
        if (kind === "pad") {
          envelope =
            Math.min(1, t / 0.22) * Math.min(1, (1 - progress) / 0.22) * 0.72;
          const phase = 2 * Math.PI * safeFrequency * t;
          wave =
            Math.sin(phase) * 0.72 +
            Math.sin(phase * 1.502) * 0.18 +
            Math.sin(phase * 2) * 0.1;
        } else if (kind === "bass") {
          envelope = (1 - Math.exp(-t * 42)) * Math.exp(-t * 3.4);
          const phase = 2 * Math.PI * safeFrequency * t;
          wave =
            Math.sin(phase) * 0.83 +
            Math.sin(phase * 2) * 0.12 +
            Math.sin(phase * 3) * 0.05;
        } else if (kind === "kick") {
          envelope = Math.exp(-t * 17);
          const phase = 2 * Math.PI * (92 * t - 37 * t * t);
          wave = Math.sin(phase);
        } else if (kind === "snare" || kind === "hat") {
          const decay = kind === "snare" ? 23 : 82;
          envelope = Math.exp(-t * decay) * Math.min(1, t * 220);
          wave = random() * (kind === "snare" ? 0.82 : 0.5);
          if (kind === "snare") wave += Math.sin(2 * Math.PI * 185 * t) * 0.18;
        } else {
          envelope = (1 - Math.exp(-t * 70)) * Math.exp(-t * 5.4);
          const phase = 2 * Math.PI * safeFrequency * t;
          wave =
            Math.sin(phase) * 0.74 +
            Math.sin(phase * 2.01) * 0.2 +
            Math.sin(phase * 3.97) * 0.06;
        }
        const sample = wave * envelope * volume;
        const index = startSample + i;
        left[index] += sample * lGain;
        right[index] += sample * rGain;
      }
    }

    const chords = [
      { pad: [50, 53, 57], bass: 38 }, // Dm
      { pad: [46, 50, 53], bass: 34 }, // Bb
      { pad: [43, 46, 50], bass: 31 }, // Gm
      { pad: [45, 49, 52, 55], bass: 33 }, // A7
    ];
    chords.forEach((chord, bar) => {
      const barStart = bar * 4 * beat;
      chord.pad.forEach((note, index) => {
        addVoice({
          frequency: midiFrequency(note),
          start: barStart,
          lengthSeconds: beat * 3.8,
          volume: 0.035,
          kind: "pad",
          pan: (index - 1) * 0.22,
        });
      });
      const bassPattern = [0, 7, 12, 7];
      bassPattern.forEach((interval, step) => {
        addVoice({
          frequency: midiFrequency(chord.bass + interval),
          start: barStart + step * beat,
          lengthSeconds: beat * 0.43,
          volume: 0.2,
          kind: "bass",
          pan: -0.08,
        });
      });
      [0, 2].forEach((step) =>
        addVoice({
          start: barStart + step * beat,
          lengthSeconds: 0.22,
          volume: 0.1,
          kind: "kick",
          pan: 0,
        }),
      );
      [1, 3].forEach((step) =>
        addVoice({
          start: barStart + step * beat,
          lengthSeconds: 0.16,
          volume: 0.052,
          kind: "snare",
          pan: 0.12,
        }),
      );
      for (let eighth = 0; eighth < 8; eighth += 1) {
        addVoice({
          start: barStart + eighth * beat * 0.5,
          lengthSeconds: 0.055,
          volume: eighth % 2 ? 0.018 : 0.012,
          kind: "hat",
          pan: eighth % 2 ? 0.3 : -0.3,
        });
      }
    });

    const melody = [
      [0, 74],
      [3, 69],
      [4, 72],
      [7, 77],
      [8, 76],
      [11, 72],
      [12, 69],
      [14, 67],
      [16, 70],
      [19, 74],
      [20, 77],
      [23, 74],
      [24, 76],
      [27, 73],
      [28, 69],
      [30, 67],
    ];
    melody.forEach(([eighth, note], index) => {
      addVoice({
        frequency: midiFrequency(note),
        start: eighth * beat * 0.5,
        lengthSeconds: beat * 0.34,
        volume: 0.115,
        kind: "pluck",
        pan: index % 2 ? 0.23 : -0.23,
      });
    });

    // Un poco de campanita alta al cierre del cuarto compás para que el loop vuelva con gracia.
    addVoice({
      frequency: midiFrequency(81),
      start: beat * 14.7,
      lengthSeconds: beat * 0.7,
      volume: 0.06,
      kind: "pluck",
      pan: 0.08,
    });

    // Evita picos excesivos al mezclar las capas polifónicas.
    for (let i = 0; i < length; i += 1) {
      left[i] = Math.tanh(left[i] * 1.45) * 0.82;
      right[i] = Math.tanh(right[i] * 1.45) * 0.82;
    }
    return buffer;
  }

  function startMusic() {
    const ctx = getContext();
    if (!ctx || !enabled || musicSource) return;
    if (!musicBuffer) musicBuffer = buildMysteryLoop(ctx);
    musicBus = ctx.createGain();
    musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicBus.gain.setTargetAtTime(0.72, ctx.currentTime + 0.03, 0.35);
    musicBus.connect(master);
    musicSource = ctx.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;
    musicSource.connect(musicBus);
    musicSource.start();
  }

  function stopMusic() {
    if (!context || !musicSource) return;
    const source = musicSource;
    const bus = musicBus;
    const now = context.currentTime;
    if (bus) {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setTargetAtTime(0.0001, now, 0.12);
    }
    window.setTimeout(() => {
      try {
        source.stop();
      } catch (_) {
        /* Ya estaba detenido. */
      }
      source.disconnect();
      bus?.disconnect();
      if (musicSource === source) musicSource = null;
      if (musicBus === bus) musicBus = null;
    }, 650);
  }

  function powerOn() {
    if (!enabled) return;
    noiseBurst(0.42, 0.22, "lowpass", 2200, 0.5);
    tone({
      frequency: 62,
      endFrequency: 185,
      duration: 0.6,
      type: "sawtooth",
      volume: 0.18,
    });
    tone({
      frequency: 920,
      endFrequency: 480,
      duration: 0.28,
      type: "sine",
      volume: 0.075,
      delay: 0.22,
    });
    tone({
      frequency: 120,
      endFrequency: 38,
      duration: 0.35,
      type: "triangle",
      volume: 0.14,
      delay: 0.42,
    });
  }

  function staticPop() {
    if (!enabled) return;
    noiseBurst(0.16, 0.15, "highpass", 2300, 0.5);
    tone({
      frequency: 1600,
      endFrequency: 360,
      duration: 0.09,
      type: "square",
      volume: 0.035,
    });
  }

  function cartoonHit(intensity = 1) {
    if (!enabled) return;
    noiseBurst(0.105, 0.33 * intensity, "lowpass", 900, 0.7);
    tone({
      frequency: 125,
      endFrequency: 43,
      duration: 0.2,
      type: "sine",
      volume: 0.34 * intensity,
    });
    tone({
      frequency: 510,
      endFrequency: 155,
      duration: 0.12,
      type: "square",
      volume: 0.075 * intensity,
      delay: 0.012,
    });
    tone({
      frequency: 82,
      endFrequency: 125,
      duration: 0.1,
      type: "triangle",
      volume: 0.12 * intensity,
      delay: 0.06,
    });
  }

  function glassCrack(intensity = 1) {
    if (!enabled) return;
    noiseBurst(0.26, 0.3 * intensity, "highpass", 2800, 1.8);
    [2200, 3100, 1450, 3900].forEach((frequency, index) => {
      tone({
        frequency,
        endFrequency: frequency * (0.55 + Math.random() * 0.15),
        duration: 0.14 + Math.random() * 0.1,
        type: "triangle",
        volume: 0.055 * intensity,
        delay: index * 0.018,
      });
    });
    tone({
      frequency: 700,
      endFrequency: 210,
      duration: 0.19,
      type: "sawtooth",
      volume: 0.07 * intensity,
      delay: 0.035,
    });
  }

  function cartoonYelp() {
    // Chillido caricaturesco sintetizado; no es una grabación real de gato.
    if (!enabled) return;
    tone({
      frequency: 620,
      endFrequency: 1480,
      duration: 0.13,
      type: "sawtooth",
      volume: 0.085,
      delay: 0.02,
      q: 2.5,
    });
    tone({
      frequency: 1480,
      endFrequency: 430,
      duration: 0.27,
      type: "sawtooth",
      volume: 0.075,
      delay: 0.14,
      q: 3,
    });
    tone({
      frequency: 980,
      endFrequency: 2100,
      duration: 0.095,
      type: "triangle",
      volume: 0.06,
      delay: 0.32,
    });
  }

  function shatter() {
    if (!enabled) return;
    noiseBurst(0.72, 0.43, "highpass", 1600, 0.65);
    noiseBurst(0.5, 0.24, "bandpass", 3600, 1.4, 0.04);
    [2700, 1900, 3400, 1250, 4100, 2300, 1700].forEach((frequency, index) => {
      tone({
        frequency,
        endFrequency: 90 + Math.random() * 140,
        duration: 0.3 + Math.random() * 0.2,
        type: index % 2 ? "triangle" : "sine",
        volume: 0.065,
        delay: index * 0.028,
      });
    });
    tone({
      frequency: 94,
      endFrequency: 34,
      duration: 0.45,
      type: "sine",
      volume: 0.28,
      delay: 0.03,
    });
    cartoonYelp();
  }

  function levelUp() {
    if (!enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      tone({
        frequency,
        endFrequency: frequency * 1.012,
        duration: 0.16,
        type: index < 2 ? "square" : "triangle",
        volume: index < 2 ? 0.045 : 0.065,
        delay: index * 0.085,
        attack: 0.012,
      });
    });
    tone({
      frequency: 1318.5,
      endFrequency: 1046.5,
      duration: 0.36,
      type: "sine",
      volume: 0.09,
      delay: 0.36,
      attack: 0.02,
    });
    tone({
      frequency: 1568,
      endFrequency: 1318.5,
      duration: 0.25,
      type: "triangle",
      volume: 0.045,
      delay: 0.42,
    });
  }

  window.InviteAudio = {
    unlock,
    setEnabled,
    startMusic,
    stopMusic,
    powerOn,
    staticPop,
    cartoonHit,
    glassCrack,
    shatter,
    levelUp,
  };
})();
