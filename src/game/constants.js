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
// Palette "marbre et bronze en plein jour" — ivoire chaud et bronze profond,
// pensée pour une lecture premium et lumineuse sur mobile.
export const C = {
  bg: "#f4ecd9", bgDeep: "#e7d9b8", panel: "#fffdf7", panelUp: "#ffffff",
  border: "#d8c69c", borderSoft: "#e8dcb9",
  text: "#2b2013", textDim: "#6d5c42", textFaint: "#998a6c",
  gold: "#9c6f1f", goldHi: "#b8841f", goldDim: "#cfae76", bronze: "#7a5220",
  copper: "#9c5f2e", ink: "#20160a",
  ok: "#3f7a4c", okBg: "rgba(63,122,76,0.10)",
  bad: "#b23b30", badBg: "rgba(178,59,48,0.10)",
  water: "#2f6b8a", empty: "#4d8a5f", inactive: "#b17a34", enemy: "#a94237", fog: "#a49879",
  // Surfaces "verre" (glassmorphism) et ombrage — utilisées par le kit UI et les scènes.
  glass: "rgba(255,253,246,0.68)", glassHi: "rgba(255,255,255,0.82)", glassBorder: "rgba(120,90,40,0.14)",
  shadowSoft: "0 10px 26px rgba(120,90,45,0.16)", shadowLift: "0 3px 10px rgba(120,90,45,0.13)",
  glow: "0 0 20px rgba(160,120,30,0.22)",
  // Surfaces "en creux" (encarts stats/coûts) et états inactifs — remplacent les
  // noirs semi-transparents qui supposaient un fond sombre.
  inset: "rgba(120,90,40,0.06)", ghost: "rgba(90,65,30,0.045)",
};

export const RES = ["bois", "pierre", "fer", "or", "ble"];

export const RES_LABEL = { bois: "Bois", pierre: "Pierre", fer: "Fer", or: "Or", ble: "Blé" };

export const RES_ICONN = { bois: "bois", pierre: "pierre", fer: "fer", or: "or", ble: "ble" };
export const RES_COLOR = { bois: "#4f7a3f", pierre: "#6b7680", fer: "#3d6f8f", or: C.goldHi, ble: "#a9762c" };
export const GROUP_COLOR = { prod: "#3f7a4c", infra: "#3d6f8f", mil: "#a04a35", merveille: C.goldHi };

// ---- Intervalles temporels (dev : accélérés) ----
export const RAID_INTERVAL_MS = DEV ? 240000 : 6 * 3600000;   // pirates : toutes les ~4 min en dev
export const BOT_RAID_INTERVAL_MS = DEV ? 300000 : 9 * 3600000; // raids des cités rivales
// Montée en puissance des cités rivales, par heure de partie (plafonnée).
// Divisée par SPEED pour que le rythme dev accéléré fasse aussi grandir les bots plus vite.
export const BOT_GROWTH_PER_H = 0.06 / SPEED;
export const BOT_GROWTH_MAX = 1.5;                            // au plus × 2,5 à terme
export const REGEN_MS = DEV ? 180000 : 8 * 3600000;           // îles pillées : repeuplées après ce délai
export const EVENT_INTERVAL_MS = DEV ? 150000 : 3 * 3600000;  // événements aléatoires
export const MARCHAND_DUREE_MS = DEV ? 90000 : 45 * 60000;    // durée de l'offre du marchand
