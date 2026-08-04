// Retour sonore léger — sons synthétisés via Web Audio (aucun fichier à charger),
// silencieux par défaut sur premier chargement tant qu'aucun geste utilisateur
// n'a eu lieu (politique autoplay des navigateurs), puis actif jusqu'à mute manuel.
let ctx = null;
const MUTE_KEY = "skirmish-sound-muted";

export function isMuted() {
  return typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
}

export function setMuted(v) {
  if (typeof localStorage !== "undefined") localStorage.setItem(MUTE_KEY, v ? "1" : "0");
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, dur, { type = "sine", gain = 0.09, delay = 0, slideTo } = {}) {
  const c = getCtx();
  if (!c || isMuted()) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// ---- Musique d'ambiance ----
// Nappe procédurale façon lyre antique : accords tenus en aeolien (mode
// mineur naturel) qui s'enchaînent lentement, filtre passe-bas doux pour
// rester en fond, aucune boucle audio à charger.
const PROGRESSION = [
  [220.0, 261.63, 329.63],   // Am
  [174.61, 220.0, 261.63],   // F
  [196.0, 246.94, 293.66],   // G(add9-ish)
  [220.0, 277.18, 329.63],   // Am(maj-ish drone)
];
let musicGain = null;
let musicTimer = null;
let musicStep = 0;
let musicRunning = false;

function playPadChord(freqs, dur) {
  const c = getCtx();
  if (!c || !musicGain) return;
  const t0 = c.currentTime;
  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    const filt = c.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 900;
    osc.type = i === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.05, t0 + dur * 0.3);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(filt);
    filt.connect(g);
    g.connect(musicGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  });
  // Note pincée occasionnelle, façon corde de lyre, par-dessus l'accord.
  if (musicStep % 2 === 1) {
    const pluck = freqs[Math.floor(Math.random() * freqs.length)] * 2;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pluck, t0 + dur * 0.5);
    g.gain.setValueAtTime(0, t0 + dur * 0.5);
    g.gain.linearRampToValueAtTime(0.035, t0 + dur * 0.5 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.5 + 1.4);
    osc.connect(g);
    g.connect(musicGain);
    osc.start(t0 + dur * 0.5);
    osc.stop(t0 + dur * 0.5 + 1.5);
  }
}

function musicLoop() {
  if (!musicRunning) return;
  const dur = 9;
  playPadChord(PROGRESSION[musicStep % PROGRESSION.length], dur);
  musicStep++;
  musicTimer = setTimeout(musicLoop, dur * 1000 * 0.92);
}

export function startMusic() {
  const c = getCtx();
  if (!c || isMuted() || musicRunning) return;
  musicRunning = true;
  musicGain = c.createGain();
  musicGain.gain.setValueAtTime(0, c.currentTime);
  musicGain.gain.linearRampToValueAtTime(1, c.currentTime + 2);
  musicGain.connect(c.destination);
  musicLoop();
}

export function stopMusic() {
  musicRunning = false;
  if (musicTimer) clearTimeout(musicTimer);
  musicTimer = null;
  if (musicGain) {
    const c = getCtx();
    if (c) {
      musicGain.gain.linearRampToValueAtTime(0, c.currentTime + 0.6);
      const g = musicGain;
      setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 700);
    }
    musicGain = null;
  }
}

const SFX = {
  tap: () => tone(720, 0.05, { type: "sine", gain: 0.05 }),
  confirm: () => { tone(520, 0.08, { gain: 0.08 }); tone(780, 0.1, { delay: 0.05, gain: 0.07 }); },
  coin: () => { tone(880, 0.07, { type: "triangle", gain: 0.07 }); tone(1320, 0.09, { delay: 0.04, type: "triangle", gain: 0.06 }); },
  win: () => { tone(523, 0.11, { gain: 0.09 }); tone(659, 0.11, { delay: 0.09, gain: 0.09 }); tone(784, 0.18, { delay: 0.18, gain: 0.09 }); },
  lose: () => { tone(300, 0.22, { type: "sawtooth", gain: 0.07, slideTo: 160 }); },
  notify: () => { tone(660, 0.06, { gain: 0.06 }); tone(990, 0.08, { delay: 0.07, gain: 0.06 }); },
};

export function sfx(name) {
  try { SFX[name]?.(); } catch (e) {}
}
