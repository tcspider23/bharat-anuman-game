"use client";

// Background music: pre-rendered WAV loops (see scripts/render-music.mjs)
// played through HTMLAudioElement. Sound effects stay on a Web Audio SFX bus.
//
// Browsers block audio until a user gesture, so primeAudio() attaches
// one-time global listeners that (re)start everything on first interaction.

export type Mood = "relaxing" | "energetic" | "faster" | "mysterious" | "celebratory";

export type Track = {
  id: number;
  name: string;
  mood: Mood;
  file: string;
};

export const TRACKS: Track[] = [
  { id: 0, name: "Saffron Dreams", mood: "relaxing", file: "track0.wav" },
  { id: 1, name: "Jasmine Night", mood: "relaxing", file: "track1.wav" },
  { id: 2, name: "Victory March", mood: "energetic", file: "track2.wav" },
  { id: 3, name: "Rapid Pulse", mood: "faster", file: "track3.wav" },
  { id: 4, name: "Midnight Clue", mood: "mysterious", file: "track4.wav" },
  { id: 5, name: "Jashn", mood: "celebratory", file: "track5.wav" },
];

// ---------------- background music ----------------
let audio: HTMLAudioElement | null = null;
let currentTrackId = -1;
let wantPlaying = false;

function ensureAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
  }
  return audio;
}

export function startMusic(trackId: number, volume: number) {
  const a = ensureAudio();
  if (!a) return;
  primeAudio();
  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS[0];
  currentTrackId = track.id;
  if (!a.src.includes(track.file)) {
    a.src = `/music/${track.file}`;
  }
  a.loop = true;
  a.volume = Math.max(0, Math.min(1, volume));
  wantPlaying = true;
  a.play().catch(() => {
    /* will retry automatically on next user gesture via primeAudio */
  });
}

export function stopMusic() {
  wantPlaying = false;
  if (audio) audio.pause();
}

export function setVolume(v: number) {
  if (audio) audio.volume = Math.max(0, Math.min(1, v));
}

export function currentTrack() {
  return TRACKS.find((t) => t.id === currentTrackId) ?? null;
}

// ---------------- audio unlock (autoplay policy) ----------------
let primed = false;

export function primeAudio() {
  if (primed || typeof window === "undefined") return;
  primed = true;
  const unlock = () => {
    // resume the SFX AudioContext
    const r = getSfx();
    if (r && r.ctx.state === "suspended") {
      r.ctx.resume().catch(() => {});
    }
    // resume background music if it was wanted
    if (wantPlaying && audio && audio.paused && audio.src) {
      audio.play().catch(() => {});
    }
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

// ---------------- sound effects (Web Audio, independent of music) ----------------
let sfxCtx: AudioContext | null = null;
let sfxBus: GainNode | null = null;

function getSfx() {
  if (!sfxCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    sfxCtx = new Ctor();
    sfxBus = sfxCtx.createGain();
    sfxBus.gain.value = 0.35;
    sfxBus.connect(sfxCtx.destination);
  }
  return { ctx: sfxCtx!, sfx: sfxBus! };
}

export function playSoundEffect(type: "yes" | "no" | "click" | "win" | "lose") {
  primeAudio();
  const r = getSfx();
  if (!r) return;
  const { ctx, sfx } = r;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const now = ctx.currentTime;

  if (type === "win") {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "triangle";
      osc.frequency.value = freq;
      filter.type = "lowpass";
      filter.frequency.value = 3000;
      const t = now + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(filter).connect(gain).connect(sfx);
      osc.start(t);
      osc.stop(t + 0.5);
    });
    return;
  }

  if (type === "lose") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain).connect(sfx);
    osc.start(now);
    osc.stop(now + 0.7);
    return;
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 3000;

  if (type === "yes") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.15);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(filter).connect(gain).connect(sfx);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === "no") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.2);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(filter).connect(gain).connect(sfx);
    osc.start(now);
    osc.stop(now + 0.3);
  } else {
    osc.type = "triangle";
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(filter).connect(gain).connect(sfx);
    osc.start(now);
    osc.stop(now + 0.1);
  }
}
