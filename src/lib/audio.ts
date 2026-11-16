/** Every sound is synthesized with the Web Audio API, so there are no copyrighted assets. */

let ctx: AudioContext | null = null;
let ambient: { stop: () => void } | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, endFreq?: number) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

export function playBanish() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.7, "sine", 0.12));
  tone(300, 0, 0.9, "triangle", 0.05, 1200);
}

export function playSummon() {
  tone(220, 0, 0.5, "sawtooth", 0.04, 110);
  tone(330, 0.05, 0.6, "sine", 0.05, 165);
}

export function playClick() {
  tone(660, 0, 0.08, "square", 0.02);
}

export function playWarning() {
  tone(110, 0, 0.6, "sawtooth", 0.06, 80);
  tone(116, 0, 0.6, "sawtooth", 0.06, 84);
}

export function startAmbient() {
  if (ambient) return;
  const c = getCtx();
  if (!c) return;
  const master = c.createGain();
  master.gain.value = 0.0001;
  master.gain.exponentialRampToValueAtTime(0.08, c.currentTime + 2);
  master.connect(c.destination);

  const drone = c.createOscillator();
  drone.type = "sawtooth";
  drone.frequency.value = 55;
  const droneFilter = c.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 160;
  drone.connect(droneFilter).connect(master);

  const lfo = c.createOscillator();
  lfo.frequency.value = 0.12;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 60;
  lfo.connect(lfoGain).connect(droneFilter.frequency);

  const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const wind = c.createBufferSource();
  wind.buffer = buffer;
  wind.loop = true;
  const windFilter = c.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 400;
  windFilter.Q.value = 0.6;
  const windGain = c.createGain();
  windGain.gain.value = 0.25;
  wind.connect(windFilter).connect(windGain).connect(master);

  const sweep = c.createOscillator();
  sweep.frequency.value = 0.07;
  const sweepGain = c.createGain();
  sweepGain.gain.value = 250;
  sweep.connect(sweepGain).connect(windFilter.frequency);

  drone.start();
  lfo.start();
  wind.start();
  sweep.start();

  ambient = {
    stop: () => {
      master.gain.cancelScheduledValues(c.currentTime);
      master.gain.setValueAtTime(master.gain.value, c.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8);
      window.setTimeout(() => {
        drone.stop();
        lfo.stop();
        wind.stop();
        sweep.stop();
        master.disconnect();
      }, 900);
    },
  };
}

export function stopAmbient() {
  ambient?.stop();
  ambient = null;
}
