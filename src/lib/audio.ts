let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playNightTransition() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 2);
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.5);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 3);
}

export function playDayTransition() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
  osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.2); 
  osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.4); 
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 1.5);
}

export function playTick() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
  
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

export function playVictory() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [440, 554, 659, 880];
  
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + i * 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + 1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 1);
  });
}

export function playDefeat() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 1.5);

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.5);
}

// --- Ambience -----------------------------------------------------------------
// A soft looping drone that sets the mood. `night` is a low, tense pad; `day`
// is a brighter, calmer one. Only one ambience plays at a time.
type Ambience = 'night' | 'day';
let ambienceNodes: { osc: OscillatorNode; osc2: OscillatorNode; gain: GainNode; lfo: OscillatorNode } | null = null;
let currentAmbience: Ambience | null = null;

export function startAmbience(kind: Ambience) {
  if (!audioCtx) return;
  if (currentAmbience === kind && ambienceNodes) return; // already playing
  stopAmbience();

  const base = kind === 'night' ? 55 : 130;   // A1 vs C3-ish
  const detune = kind === 'night' ? 1.5 : 2.0;
  const peak = kind === 'night' ? 0.06 : 0.04; // keep it subtle

  const osc = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();

  osc.type = 'sine';
  osc2.type = kind === 'night' ? 'triangle' : 'sine';
  osc.frequency.value = base;
  osc2.frequency.value = base + detune;

  filter.type = 'lowpass';
  filter.frequency.value = kind === 'night' ? 400 : 900;

  // Slow tremolo so the pad breathes.
  lfo.frequency.value = 0.15;
  lfoGain.gain.value = peak * 0.4;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(peak, audioCtx.currentTime + 2);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc2.start();
  lfo.start();

  ambienceNodes = { osc, osc2, gain, lfo };
  currentAmbience = kind;
}

export function stopAmbience() {
  if (!audioCtx || !ambienceNodes) {
    currentAmbience = null;
    return;
  }
  const { osc, osc2, gain, lfo } = ambienceNodes;
  const t = audioCtx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.6);
  [osc, osc2, lfo].forEach(n => { try { n.stop(t + 0.7); } catch {} });
  ambienceNodes = null;
  currentAmbience = null;
}

// Witch potion: a quick magical shimmer.
export function playPotion() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [880, 1320, 1760].forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = now + i * 0.06;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx!.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

// A death sting for the sunrise announcement when someone died.
export function playDeath() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.8);
  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.9);
}
