// ---- Mode DEV : rythme accéléré en développement, rythme réel en production ----
// Peut être surchargé via VITE_FORCE_DEV=true / VITE_FORCE_DEV=false dans l'environnement.
function resolveDev() {
  const override = import.meta.env.VITE_FORCE_DEV;
  if (override === "true") return true;
  if (override === "false") return false;
  return import.meta.env.DEV;
}
export const DEV = resolveDev();
export const SPEED = DEV ? 0.15 : 1;
export const DEV_CAP_MULT = DEV ? 300 : 1;

// ---- Design tokens ----
// Palette "marbre et bronze au crépuscule" — plus profonde et moins saturée que
// l'original, pensée pour une lecture premium sur écran OLED mobile.
export const C = {
  bg: "#0a1119", bgDeep: "#05090e", panel: "#141f29", panelUp: "#1b2b38",
  border: "#33495a", borderSoft: "#213542",
  text: "#ece5d6", textDim: "#9aa7ac", textFaint: "#67797f",
  gold: "#c39a3d", goldHi: "#e6c469", goldDim: "#7a6226", bronze: "#96622f",
  copper: "#b06a3f", ink: "#170f06",
  ok: "#5fa06d", okBg: "rgba(95,160,109,0.12)",
  bad: "#bd4d43", badBg: "rgba(189,77,67,0.12)",
  water: "#215e7c", empty: "#48815a", inactive: "#a8702f", enemy: "#a53f3f", fog: "#293a44",
  // Surfaces "verre" (glassmorphism) et ombrage — utilisées par le kit UI et les scènes.
  glass: "rgba(20,31,41,0.62)", glassHi: "rgba(33,49,63,0.55)", glassBorder: "rgba(230,210,160,0.10)",
  shadowSoft: "0 10px 28px rgba(2,5,9,0.42)", shadowLift: "0 3px 10px rgba(2,5,9,0.35)",
  glow: "0 0 22px rgba(230,196,105,0.30)",
};

export const RES = ["bois", "pierre", "fer", "or", "ble"];

export const RES_LABEL = { bois: "Bois", pierre: "Pierre", fer: "Fer", or: "Or", ble: "Blé" };

export const RES_ICONN = { bois: "bois", pierre: "pierre", fer: "fer", or: "or", ble: "ble" };
export const RES_COLOR = { bois: "#74a166", pierre: "#96a3ac", fer: "#7fa5bc", or: "#e6c469", ble: "#d1a856" };
export const GROUP_COLOR = { prod: "#5fa06d", infra: "#4f7fb0", mil: "#b5624a", merveille: "#e6c469" };

// ---- Intervalles temporels (dev : accélérés) ----
export const RAID_INTERVAL_MS = DEV ? 240000 : 6 * 3600000;   // pirates : toutes les ~4 min en dev
export const REGEN_MS = DEV ? 180000 : 8 * 3600000;           // îles pillées : repeuplées après ce délai
export const EVENT_INTERVAL_MS = DEV ? 150000 : 3 * 3600000;  // événements aléatoires
export const MARCHAND_DUREE_MS = DEV ? 90000 : 45 * 60000;    // durée de l'offre du marchand
