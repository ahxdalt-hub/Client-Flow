"use client";

/**
 * Tiny Web Audio sound engine — no audio files, everything synthesised.
 *
 * Design goals: hover ticks that feel like soft UI feedback rather than
 * beeps, a click with real "thock" weight, and a success chime worth
 * reaching. Automatically muted when the user turns sound off (persisted in
 * localStorage). Browsers block audio until a real gesture, so `unlockAudio`
 * is wired to the first pointer/key event.
 */

export type SoundName =
  | "hover"
  | "click"
  | "press"
  | "pop"
  | "open"
  | "success"
  | "error";

const STORAGE_KEY = "cf_sound";
/** Hover ticks are throttled so sweeping the mouse never machine-guns. */
const HOVER_THROTTLE_MS = 60;

let ctx: AudioContext | null = null;
let enabled: boolean | null = null;
let noiseBuffer: AudioBuffer | null = null;
let lastHoverAt = 0;

function shouldEnable(): boolean {
  if (enabled !== null) return enabled;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Default: OFF. A storefront should be silent until the visitor asks for
    // sound — unsolicited UI noise is the fastest way to make a premium page
    // feel cheap, and it surprises people on phones and in shared rooms.
    enabled = stored === "on";
  } catch {
    enabled = false;
  }
  return enabled;
}

export function isSoundOn(): boolean {
  return shouldEnable();
}

export function setSoundOn(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
    window.dispatchEvent(new Event("cf-sound-change"));
  } catch {
    /* private mode */
  }
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call from a real user gesture so hover sounds work before the first click. */
export function unlockAudio() {
  ensureCtx();
}

function getNoise(audio: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = Math.max(1, Math.floor(audio.sampleRate * 0.6));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

type ToneOptions = {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  glideTo?: number;
};

/** A single shaped oscillator note with a fast, click-free envelope. */
function tone({
  freq,
  dur,
  type = "sine",
  gain = 0.05,
  delay = 0,
  glideTo,
}: ToneOptions) {
  const audio = ensureCtx();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

type NoiseOptions = {
  dur: number;
  gain?: number;
  delay?: number;
  type?: BiquadFilterType;
  frequency?: number;
  q?: number;
};

/** A short filtered noise burst — used for transients and texture. */
function noise({
  dur,
  gain = 0.015,
  delay = 0,
  type = "highpass",
  frequency = 2200,
  q = 1,
}: NoiseOptions) {
  const audio = ensureCtx();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const src = audio.createBufferSource();
  src.buffer = getNoise(audio);
  const filter = audio.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const amp = audio.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(amp).connect(audio.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.04);
}

/** Noise through a sweeping filter — a soft whoosh for reveals. */
function sweep({
  dur,
  gain = 0.02,
  delay = 0,
  from = 340,
  to = 2400,
  q = 0.8,
}: {
  dur: number;
  gain?: number;
  delay?: number;
  from?: number;
  to?: number;
  q?: number;
}) {
  const audio = ensureCtx();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const src = audio.createBufferSource();
  src.buffer = getNoise(audio);
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const amp = audio.createGain();
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.3);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(amp).connect(audio.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.04);
}

export function play(name: SoundName) {
  if (!shouldEnable()) return;
  const audio = ensureCtx();
  if (!audio) return;

  switch (name) {
    case "hover": {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastHoverAt < HOVER_THROTTLE_MS) return;
      lastHoverAt = now;
      // Slight pitch variation keeps repetition from feeling mechanical.
      const base = 1500 + Math.random() * 520;
      tone({ freq: base, dur: 0.035, type: "sine", gain: 0.011, glideTo: base * 0.8 });
      break;
    }
    case "click": {
      // A satisfying "thock": low body → bright transient → air.
      tone({ freq: 215, dur: 0.12, type: "sine", gain: 0.055, glideTo: 96 });
      tone({ freq: 1180, dur: 0.028, type: "triangle", gain: 0.019 });
      noise({ dur: 0.05, gain: 0.014, frequency: 2400 });
      break;
    }
    case "press": {
      tone({ freq: 165, dur: 0.09, type: "sine", gain: 0.04, glideTo: 82 });
      noise({ dur: 0.035, gain: 0.011, frequency: 2000 });
      break;
    }
    case "pop": {
      tone({ freq: 320, dur: 0.1, type: "sine", gain: 0.048, glideTo: 640 });
      noise({ dur: 0.028, gain: 0.012, frequency: 2600 });
      break;
    }
    case "open": {
      sweep({ dur: 0.32, gain: 0.018, from: 320, to: 2200 });
      tone({ freq: 520, dur: 0.18, type: "sine", gain: 0.018, glideTo: 740 });
      break;
    }
    case "success": {
      noise({ dur: 0.16, gain: 0.011, frequency: 3000 });
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
        tone({ freq, dur: i === 3 ? 0.5 : 0.2, gain: 0.048, delay: i * 0.1 }),
      );
      tone({ freq: 261.63, dur: 0.6, type: "triangle", gain: 0.018, delay: 0.3 });
      break;
    }
    case "error": {
      tone({ freq: 220, dur: 0.16, type: "sawtooth", gain: 0.026 });
      tone({ freq: 176, dur: 0.24, type: "sawtooth", gain: 0.026, delay: 0.12 });
      break;
    }
  }
}
