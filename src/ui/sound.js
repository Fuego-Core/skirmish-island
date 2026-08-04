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
