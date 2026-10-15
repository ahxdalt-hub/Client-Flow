"use client";

const STORAGE_KEY = "marketloom.sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let initialized = false;
const listeners = new Set<(value: boolean) => void>();

function emit(): void {
  for (const listener of listeners) listener(enabled);
}

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function playTone(options: {
  freq: number;
  to?: number;
  duration: number;
  delay?: number;
  peak: number;
  type?: OscillatorType;
}): void {
  if (!enabled) return;
  const audio = ensureContext();
  if (!audio || !master) return;

  const t0 = audio.currentTime + (options.delay ?? 0);
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4200, t0);
  filter.Q.value = 0.6;

  osc.type = options.type ?? "sine";
  osc.frequency.setValueAtTime(options.freq, t0);
  if (options.to) {
    osc.frequency.exponentialRampToValueAtTime(options.to, t0 + options.duration);
  }

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(options.peak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + options.duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  osc.start(t0);
  osc.stop(t0 + options.duration + 0.02);
}

export function initSoundPreference(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    enabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } else {
    enabled = stored === "1";
  }
  emit();
}

export function subscribeSound(listener: (value: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }
  if (value) ensureContext();
  emit();
}

export const sound = {
  tick(): void {
    playTone({ freq: 1500, to: 1100, duration: 0.045, peak: 0.018 });
  },
  click(): void {
    playTone({ freq: 520, to: 380, duration: 0.09, peak: 0.05 });
    playTone({ freq: 1180, duration: 0.05, delay: 0.01, peak: 0.02 });
  },
  open(): void {
    playTone({ freq: 320, to: 520, duration: 0.14, peak: 0.04, type: "triangle" });
  },
  close(): void {
    playTone({ freq: 480, to: 300, duration: 0.13, peak: 0.035, type: "triangle" });
  },
  confirm(): void {
    playTone({ freq: 587.33, duration: 0.16, peak: 0.05, type: "triangle" });
    playTone({ freq: 783.99, duration: 0.18, delay: 0.09, peak: 0.05, type: "triangle" });
    playTone({ freq: 1046.5, duration: 0.3, delay: 0.18, peak: 0.045 });
  },
  success(): void {
    playTone({ freq: 523.25, duration: 0.18, peak: 0.05, type: "triangle" });
    playTone({ freq: 659.25, duration: 0.2, delay: 0.1, peak: 0.05, type: "triangle" });
    playTone({ freq: 987.77, duration: 0.4, delay: 0.2, peak: 0.045 });
  },
};
