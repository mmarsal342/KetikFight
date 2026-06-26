let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let enabled = true;

export function initAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function getCtx(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

export function isSoundEnabled() {
  return enabled;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.5,
  freqEnd?: number,
) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + duration);
  }
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + duration);
}

function noiseBurst(duration: number, filterFreq: number, volume: number = 0.3, sweepTo?: number) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterFreq, c.currentTime);
  if (sweepTo) {
    filter.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + duration);
  }
  filter.Q.value = 2;

  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start();
  source.stop(c.currentTime + duration);
}

export const sfx = {
  whoosh() {
    noiseBurst(0.3, 400, 0.15, 2000);
  },

  hit() {
    tone(120, 0.15, "square", 0.4, 50);
    noiseBurst(0.08, 2000, 0.1);
  },

  playerHit() {
    tone(80, 0.25, "sawtooth", 0.35, 40);
    noiseBurst(0.1, 500, 0.08);
  },

  clang() {
    tone(800, 0.12, "square", 0.2);
    tone(1200, 0.1, "square", 0.15);
    setTimeout(() => tone(600, 0.08, "square", 0.1), 30);
  },

  shield() {
    tone(400, 0.15, "sine", 0.2, 800);
    setTimeout(() => tone(600, 0.15, "sine", 0.2, 1000), 80);
    setTimeout(() => tone(800, 0.2, "sine", 0.15, 1200), 160);
  },

  lompat() {
    tone(300, 0.08, "sine", 0.25, 800);
    setTimeout(() => {
      tone(800, 0.1, "triangle", 0.2);
      noiseBurst(0.05, 3000, 0.08);
    }, 80);
  },

  cpuBlock() {
    tone(300, 0.1, "sawtooth", 0.2, 150);
    noiseBurst(0.06, 800, 0.06);
  },

  type() {
    tone(600 + Math.random() * 200, 0.02, "sine", 0.04);
  },

  win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      setTimeout(() => tone(f, 0.2, "triangle", 0.3), i * 120);
    });
    setTimeout(() => tone(1568, 0.4, "triangle", 0.25), 480);
  },

  lose() {
    const notes = [440, 370, 311, 220];
    notes.forEach((f, i) => {
      setTimeout(() => tone(f, 0.25, "sawtooth", 0.25), i * 150);
    });
    setTimeout(() => tone(110, 0.5, "sawtooth", 0.2), 600);
  },

  start() {
    tone(440, 0.1, "triangle", 0.2);
    setTimeout(() => tone(659, 0.15, "triangle", 0.25), 100);
  },

  slotRefill() {
    tone(500 + Math.random() * 300, 0.04, "sine", 0.06);
  },

  ultReady() {
    tone(200, 0.1, "sawtooth", 0.15);
    setTimeout(() => tone(400, 0.1, "sawtooth", 0.15), 80);
    setTimeout(() => tone(600, 0.1, "sawtooth", 0.15), 160);
    setTimeout(() => tone(800, 0.3, "triangle", 0.25), 240);
    setTimeout(() => noiseBurst(0.3, 200, 0.1, 2000), 240);
  },

  ultFire() {
    noiseBurst(0.5, 100, 0.3, 3000);
    tone(150, 0.4, "sawtooth", 0.4, 50);
    setTimeout(() => tone(80, 0.3, "square", 0.3, 40), 100);
    setTimeout(() => noiseBurst(0.2, 500, 0.15), 200);
  },

  select() {
    tone(800, 0.05, "sine", 0.1);
  },
};
