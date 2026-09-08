// Renders 6 ambient background tracks as seamless WAV loops.
// Pure-JS synthesis engine: pads (detuned saws + lowpass), bass, melody
// (scale-based random walk with vibrato), soft drums, and a 2-comb reverb.
// Run: node scripts/render-music.mjs  ->  public/music/trackN.wav

import { writeFileSync, mkdirSync } from "node:fs";

const SR = 22050;

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// ---------- small DSP helpers ----------
function onePoleLP(x, a, state) {
  const y = state[0] + a * (x - state[0]);
  state[0] = y;
  return y;
}

function comb(x, d, fb, lp, delay, state) {
  const idx = (state.pos - d + d) % d;
  const out = delay[idx] + fb * x;
  // lowpass inside the loop for a darker tail
  const filtered = state.lp + lp * (out - state.lp);
  state.lp = filtered;
  delay[idx] = filtered;
  state.pos++;
  return filtered;
}

// ---------- render one track ----------
function renderTrack(cfg) {
  const spb = 60 / cfg.bpm;
  const beats = cfg.bars * 4;
  const N = Math.round(beats * spb * SR);
  const XF = Math.round(0.35 * SR);
  const total = N + XF;
  const dry = new Float32Array(total);
  const rng = mulberry32(cfg.seed);

  const add = (start, len, fn) => {
    const s0 = Math.round(start * SR);
    const e0 = Math.min(total, s0 + Math.round(len * SR));
    for (let i = s0; i < e0; i++) {
      const t = (i - s0) / SR;
      dry[i] += fn(t, (i - s0) % SR);
    }
  };

  // ----- chord per bar (triad from scale degree) -----
  const chords = [];
  for (let bar = 0; bar < cfg.bars; bar++) {
    const deg = cfg.prog[bar % cfg.prog.length];
    const tones = [0, 2, 4].map((k) => {
      const d = (deg + k) % cfg.scale.length;
      const oct = Math.floor((deg + k) / cfg.scale.length);
      return cfg.root + cfg.scale[d] + 12 * oct;
    });
    chords.push(tones);
  }

  // ----- pads: detuned saws through lowpass, slow attack/release -----
  for (let bar = 0; bar < cfg.bars; bar++) {
    const t0 = bar * 4 * spb;
    const dur = 4 * spb;
    for (const midi of chords[bar]) {
      const f = mtof(midi - 12);
      for (const det of [0.994, 1.006]) {
        let phase = 0;
        const lf = [0];
        add(t0, dur + 1.4, (t) => {
          // envelope: 1.2s attack, hold, 1.4s release
          const env =
            t < 1.2 ? t / 1.2 : t > dur ? Math.max(0, 1 - (t - dur) / 1.4) : 1;
          const dt = 1 / SR;
          phase = (phase + (f * det * dt)) % 1;
          const saw = 2 * phase - 1;
          return onePoleLP(saw, 0.12, lf) * env * 0.055;
        });
      }
    }
  }

  // ----- bass: triangle on the groove -----
  const bassPattern =
    cfg.bass === "full" ? [0, 2, 3.5] : cfg.bass === "half" ? [0, 2] : [0];
  for (let bar = 0; bar < cfg.bars; bar++) {
    const deg = cfg.prog[bar % cfg.prog.length];
    const midi = cfg.root - 12 + cfg.scale[deg % cfg.scale.length];
    const f = mtof(midi);
    for (const beat of bassPattern) {
      const t0 = (bar * 4 + beat) * spb;
      const dur = (cfg.bass === "full" && beat === 3.5 ? 0.4 : 1.6) * spb;
      let phase = 0;
      const lf = [0];
      add(t0, dur, (t) => {
        const env = Math.min(1, t / 0.02) * Math.max(0, 1 - t / dur);
        phase = (phase + f / SR) % 1;
        const tri = 4 * Math.abs(phase - 0.5) - 1;
        return onePoleLP(tri, 0.3, lf) * env * (cfg.bassLvl ?? 0.4);
      });
    }
  }

  // ----- melody: random walk over the scale, sine + vibrato -----
  const steps = beats * 2; // 8th notes
  let degIdx = Math.floor(cfg.scale.length / 2);
  let prevNote = -1;
  for (let s = 0; s < steps; s++) {
    const t0 = s * (spb / 2);
    // small rest at the start of every bar for breathing room
    const restBias = s % 8 === 0 ? 0.5 : 0;
    if (rng() > cfg.density + restBias) continue;
    const move = Math.floor(rng() * 3) - 1; // -1..1
    degIdx = Math.min(cfg.scale.length - 1, Math.max(0, degIdx + move));
    let midi = cfg.root + 12 + cfg.scale[degIdx];
    if (degIdx < prevNote && midi <= prevNote) midi += 12;
    const f = mtof(midi);
    prevNote = midi;
    const dur = spb * (rng() < 0.3 ? 1.9 : 0.9);
    add(t0, dur, (t) => {
      const env = Math.min(1, t / 0.015) * Math.exp(-t / cfg.noteTau);
      const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t - Math.PI / 2);
      return (Math.sin(2 * Math.PI * f * vib * t) * 0.7 + Math.sin(4 * Math.PI * f * vib * t) * 0.18) * env * (cfg.melodyLvl ?? 0.42);
    });
  }

  // ----- drums -----
  const drum8 = (pos, fn) => {
    for (let bar = 0; bar < cfg.bars; bar++) {
      add((bar * 8 + pos) * (spb / 2), fn);
    }
  };
  const noise = (() => {
    const n = 4096;
    const b = new Float32Array(n);
    const rn = mulberry32(cfg.seed + 7);
    for (let i = 0; i < n; i++) b[i] = rn() * 2 - 1;
    let k = 0;
    return () => b[k++ % n];
  })();

  const kick = (pos, lvl) => {
    if (lvl <= 0) return;
    drum8(pos, (t) => {
      const f = 150 * Math.pow(48 / 150, t / 0.12);
      return Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.055) * lvl;
    });
  };
  const hat = (pos, lvl) => {
    if (lvl <= 0) return;
    let prev = 0;
    drum8(pos, (t) => {
      const x = noise();
      const hp = x - prev;
      prev = x;
      return hp * Math.exp(-t / 0.014) * lvl;
    });
  };
  const clap = (pos, lvl) => {
    if (lvl <= 0) return;
    let prev = 0;
    drum8(pos, (t) => {
      const x = noise();
      const hp = x - prev;
      prev = x;
      return (hp * 0.7 + Math.sin(2 * Math.PI * 190 * t) * 0.5) * Math.exp(-t / 0.07) * lvl;
    });
  };

  for (const p of cfg.kick ?? []) kick(p, cfg.kickLvl ?? 0);
  for (const p of cfg.hat ?? []) hat(p, cfg.hatLvl ?? 0);
  for (const p of cfg.clap ?? []) clap(p, cfg.clapLvl ?? 0);

  // ----- reverb: two feedback combs -----
  const d1 = Math.round(0.211 * SR);
  const d2 = Math.round(0.277 * SR);
  const buf1 = new Float32Array(d1);
  const buf2 = new Float32Array(d2);
  const st1 = { pos: 0, lp: 0 };
  const st2 = { pos: 0, lp: 0 };
  const wet = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const x = dry[i];
    const r1 = comb(x, d1, 0.48, 0.35, buf1, st1);
    const r2 = comb(x, d2, 0.42, 0.3, buf2, st2);
    wet[i] = (r1 + r2) * 0.5 * (cfg.rev ?? 0.35);
  }

  // ----- master: soft clip + normalize -----
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let v = (dry[i] * 0.9 + wet[i]) * 1.5;
    v = Math.tanh(v) / Math.tanh(1.5);
    out[i] = v;
  }
  // normalize
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
  const g = peak > 0 ? 0.85 / peak : 1;
  for (let i = 0; i < N; i++) out[i] *= g;

  // ----- seamless loop crossfade (fold the tail into the head) -----
  for (let i = 0; i < XF; i++) {
    const w = i / XF;
    out[i] = out[i] * w + dry[N + i] * (1 - w);
  }

  return out;
}

function writeWav(file, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(file, buf);
  console.log(`  ${file}  ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
}

// ---------- track definitions ----------
const tracks = [
  {
    file: "track0.wav",
    bpm: 66, bars: 8, root: 48,
    scale: [0, 2, 4, 7, 9],
    prog: [0, 3, 4, 3, 0, 3, 4, 3],
    density: 0.3, noteTau: 0.5, melodyLvl: 0.42, bass: "half", bassLvl: 0.34,
    rev: 0.42, seed: 11,
  },
  {
    file: "track1.wav",
    bpm: 58, bars: 8, root: 45,
    scale: [0, 3, 5, 7, 10],
    prog: [0, 2, 3, 2, 0, 3, 4, 2],
    density: 0.26, noteTau: 0.6, melodyLvl: 0.38, bass: "half", bassLvl: 0.32,
    rev: 0.48, seed: 22,
  },
  {
    file: "track2.wav",
    bpm: 96, bars: 12, root: 48,
    scale: [0, 2, 4, 5, 7, 9, 11],
    prog: [0, 4, 5, 3, 0, 4, 5, 3, 0, 5, 4, 3],
    density: 0.45, noteTau: 0.3, melodyLvl: 0.42, bass: "full", bassLvl: 0.4,
    rev: 0.28, seed: 33,
    kick: [0, 4], hat: [0, 2, 4, 6], clap: [2, 6],
    kickLvl: 0.4, hatLvl: 0.08, clapLvl: 0.14,
  },
  {
    file: "track3.wav",
    bpm: 124, bars: 12, root: 45,
    scale: [0, 2, 4, 5, 7, 9, 10],
    prog: [0, 4, 0, 3, 0, 4, 5, 4, 0, 4, 0, 5],
    density: 0.5, noteTau: 0.22, melodyLvl: 0.4, bass: "full", bassLvl: 0.42,
    rev: 0.22, seed: 44,
    kick: [0, 2, 4, 6, 7], hat: [1, 3, 5, 7], clap: [2, 6],
    kickLvl: 0.42, hatLvl: 0.09, clapLvl: 0.13,
  },
  {
    file: "track4.wav",
    bpm: 72, bars: 8, root: 41,
    scale: [0, 2, 3, 5, 7, 8, 11],
    prog: [0, 5, 6, 4, 0, 5, 6, 3],
    density: 0.24, noteTau: 0.42, melodyLvl: 0.36, bass: "half", bassLvl: 0.36,
    rev: 0.5, seed: 55,
    kick: [0], hat: [4],
    kickLvl: 0.28, hatLvl: 0.04,
  },
  {
    file: "track5.wav",
    bpm: 112, bars: 12, root: 48,
    scale: [0, 2, 4, 7, 9],
    prog: [0, 4, 3, 0, 0, 4, 3, 4, 0, 4, 3, 0],
    density: 0.5, noteTau: 0.26, melodyLvl: 0.44, bass: "full", bassLvl: 0.42,
    rev: 0.24, seed: 66,
    kick: [0, 3, 4, 7], hat: [0, 2, 4, 6], clap: [2, 6],
    kickLvl: 0.4, hatLvl: 0.1, clapLvl: 0.15,
  },
];

mkdirSync(new URL("../public/music/", import.meta.url), { recursive: true });
console.log("Rendering music tracks…");
for (const cfg of tracks) {
  const samples = renderTrack(cfg);
  writeWav(new URL(`../public/music/${cfg.file}`, import.meta.url), samples);
}
console.log("Done.");
