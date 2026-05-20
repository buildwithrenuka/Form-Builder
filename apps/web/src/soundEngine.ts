// ── Web Audio synthesis engine ─────────────────────────────────────────────
// All sounds are synthesised at runtime — no external files needed.

let _ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!_ctx) {
      _ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
    return _ctx;
  } catch {
    return null;
  }
}

function osc(
  a: AudioContext,
  dest: AudioNode,
  freq: number,
  type: OscillatorType = 'sine',
  vol = 0.08,
): OscillatorNode {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(dest);
  o.start();
  return o;
}

function noiseSource(a: AudioContext, dur = 4): AudioBufferSourceNode {
  const sr = a.sampleRate;
  const buf = a.createBuffer(1, sr * dur, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

// ── UI sound effects ───────────────────────────────────────────────────────

export function playClick(pitch = 1) {
  const a = ac();
  if (!a) return;
  const g = a.createGain();
  g.connect(a.destination);
  const o = a.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(520 * pitch, a.currentTime);
  o.frequency.exponentialRampToValueAtTime(280 * pitch, a.currentTime + 0.055);
  g.gain.setValueAtTime(0.12, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.06);
  o.connect(g);
  o.start(a.currentTime);
  o.stop(a.currentTime + 0.07);
}

export function playHover() {
  const a = ac();
  if (!a) return;
  const g = a.createGain();
  g.connect(a.destination);
  const o = a.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(340, a.currentTime);
  o.frequency.linearRampToValueAtTime(420, a.currentTime + 0.04);
  g.gain.setValueAtTime(0.035, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.05);
  o.connect(g);
  o.start(a.currentTime);
  o.stop(a.currentTime + 0.06);
}

export function playCoin() {
  const a = ac();
  if (!a) return;
  [880, 1100, 1320].forEach((freq, i) => {
    const g = a.createGain();
    g.connect(a.destination);
    const o = a.createOscillator();
    o.type = 'sine';
    const t = a.currentTime + i * 0.065;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.25);
  });
}

export function playSuccess() {
  const a = ac();
  if (!a) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const g = a.createGain();
    g.connect(a.destination);
    const o = a.createOscillator();
    o.type = 'triangle';
    const t = a.currentTime + i * 0.11;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.3);
  });
}

export function playWhoosh() {
  const a = ac();
  if (!a) return;
  const dur = 0.38;
  const sr = a.sampleRate;
  const buf = a.createBuffer(1, sr * dur, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, a.currentTime);
  filter.frequency.exponentialRampToValueAtTime(320, a.currentTime + dur);
  filter.Q.value = 1.4;
  const g = a.createGain();
  g.gain.setValueAtTime(0.26, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(a.destination);
  src.start(a.currentTime);
}

export function playDrumHit() {
  const a = ac();
  if (!a) return;
  const g = a.createGain();
  g.connect(a.destination);
  const o = a.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(180, a.currentTime);
  o.frequency.exponentialRampToValueAtTime(40, a.currentTime + 0.14);
  g.gain.setValueAtTime(0.5, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.16);
  o.connect(g);
  o.start(a.currentTime);
  o.stop(a.currentTime + 0.18);
}

// ── World ambient soundscapes ──────────────────────────────────────────────

export type AmbientHandle = { stop: () => void };

export function startWorldAmbient(worldId: string): AmbientHandle {
  const maybeCtx = ac();
  if (!maybeCtx) return { stop: () => {} };
  const a: AudioContext = maybeCtx;

  const master = a.createGain();
  master.gain.setValueAtTime(0, a.currentTime);
  master.gain.linearRampToValueAtTime(0.85, a.currentTime + 2.5);
  master.connect(a.destination);

  const oscillators: OscillatorNode[] = [];
  const sources: AudioBufferSourceNode[] = [];

  function addOsc(freq: number, type: OscillatorType = 'sine', vol = 0.06): OscillatorNode {
    const o = osc(a, master, freq, type, vol);
    oscillators.push(o);
    return o;
  }

  function addNoise(lpFreq: number, vol = 0.06): AudioBufferSourceNode {
    const src = noiseSource(a);
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lpFreq;
    const g = a.createGain();
    g.gain.value = vol;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start();
    sources.push(src);
    return src;
  }

  function addLFO(target: AudioParam, rate: number, depth: number): OscillatorNode {
    const lfo = a.createOscillator();
    const lfoG = a.createGain();
    lfo.frequency.value = rate;
    lfoG.gain.value = depth;
    lfo.connect(lfoG);
    lfoG.connect(target);
    lfo.start();
    oscillators.push(lfo);
    return lfo;
  }

  switch (worldId) {
    case 'jungle': {
      // Deep grove drone
      addOsc(58, 'sawtooth', 0.025);
      // Bird chirp: LFO-modulated high oscillator
      const chirp = addOsc(1400, 'sine', 0.018);
      addLFO(chirp.frequency, 7, 700);
      // Rustling leaves
      addNoise(900, 0.035);
      break;
    }
    case 'snow': {
      // Howling wind
      addNoise(450, 0.055);
      // High whistle with slow LFO
      const whistle = addOsc(1900, 'sine', 0.014);
      addLFO(whistle.frequency, 0.18, 220);
      // Low ice creak
      addOsc(75, 'triangle', 0.02);
      break;
    }
    case 'desert': {
      // Sandy wind
      addNoise(320, 0.048);
      // Ominous drone with slow drift
      const dr = addOsc(52, 'sawtooth', 0.022);
      addLFO(dr.frequency, 0.07, 9);
      // Heat shimmer high tone
      addOsc(2400, 'sine', 0.006);
      break;
    }
    case 'space': {
      // Two detuned oscillators for cosmic drone
      const d1 = addOsc(38, 'sawtooth', 0.03);
      const d2 = addOsc(39.4, 'sawtooth', 0.03);
      addLFO(d1.frequency, 0.04, 14);
      addLFO(d2.frequency, 0.06, 10);
      // Space static
      addNoise(180, 0.032);
      break;
    }
    case 'underwater': {
      // Deep pressure
      addNoise(220, 0.05);
      // Bubbling oscillator
      const bubble = addOsc(210, 'sine', 0.028);
      addLFO(bubble.frequency, 5, 90);
      // Sub bass
      addOsc(32, 'sine', 0.04);
      break;
    }
    case 'volcano': {
      // Ground rumble
      addNoise(90, 0.07);
      // Lava crackle (mid)
      addNoise(900, 0.025);
      // Pulsing sub bass
      const pulse = addOsc(28, 'sawtooth', 0.045);
      addLFO(pulse.frequency, 0.6, 12);
      break;
    }
    case 'heaven': {
      // Angelic choir shimmer — two detuned high sines
      const h1 = addOsc(880, 'sine', 0.018);
      const h2 = addOsc(882.5, 'sine', 0.016);
      addLFO(h1.frequency, 0.09, 18);
      addLFO(h2.frequency, 0.13, 12);
      // Soft celestial wind
      addNoise(3200, 0.022);
      // Warm low pad
      addOsc(110, 'triangle', 0.02);
      break;
    }
    case 'hell': {
      // Infernal low rumble
      addNoise(70, 0.08);
      // Screaming high distortion
      const hd1 = addOsc(220, 'sawtooth', 0.03);
      const hd2 = addOsc(223, 'sawtooth', 0.03);
      addLFO(hd1.frequency, 1.4, 28);
      addLFO(hd2.frequency, 1.1, 22);
      // Sub brimstone
      const brim = addOsc(35, 'sawtooth', 0.05);
      addLFO(brim.frequency, 0.5, 8);
      break;
    }
    case 'flower': {
      // Soft flute tones — triangle waves in C5/E5
      const fl1 = addOsc(523, 'triangle', 0.020);
      const fl2 = addOsc(659, 'triangle', 0.014);
      addLFO(fl1.frequency, 0.12, 14);
      addLFO(fl2.frequency, 0.09, 10);
      // Bird trill — fast LFO on high sine
      const bird = addOsc(1760, 'sine', 0.012);
      addLFO(bird.frequency, 9, 480);
      // Gentle meadow breeze
      addNoise(700, 0.028);
      break;
    }
    default: {
      addOsc(60, 'sine', 0.03);
      break;
    }
  }

  return {
    stop: () => {
      try {
        master.gain.setValueAtTime(master.gain.value, a.currentTime);
        master.gain.linearRampToValueAtTime(0, a.currentTime + 1.2);
        setTimeout(() => {
          oscillators.forEach(o => { try { o.stop(); } catch {} });
          sources.forEach(s => { try { s.stop(); } catch {} });
          master.disconnect();
        }, 1400);
      } catch {}
    },
  };
}
