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
export const C = {
  bg: "#0d1720", bgDeep: "#091019", panel: "#14222e", panelUp: "#1a2c3a",
  border: "#2b4050", borderSoft: "#1d3140",
  text: "#e8e2d4", textDim: "#93a0a3", textFaint: "#5f7076",
  gold: "#c9a13b", goldHi: "#e8c96a", goldDim: "#7d6524", bronze: "#8a6d1f",
  ink: "#1a1408",
  ok: "#6ba579", okBg: "rgba(107,165,121,0.10)",
  bad: "#c05555",
  water: "#2f7fa6", empty: "#4f9160", inactive: "#b0722f", enemy: "#b04343", fog: "#2e3d47",
};

export const RES = ["bois", "pierre", "fer", "or", "ble"];

export const RES_LABEL = { bois: "Bois", pierre: "Pierre", fer: "Fer", or: "Or", ble: "Blé" };

export const RES_ICONN = { bois: "bois", pierre: "pierre", fer: "fer", or: "or", ble: "ble" };
export const RES_COLOR = { bois: "#7dab6a", pierre: "#9aa7b8", fer: "#8fb3c9", or: "#e8c96a", ble: "#e0b860" };
export const GROUP_COLOR = { prod: "#6ba579", infra: "#5b8fc9", mil: "#c06555", merveille: "#e8c96a" };

// ---- Intervalles temporels (dev : accélérés) ----
export const RAID_INTERVAL_MS = DEV ? 240000 : 6 * 3600000;   // pirates : toutes les ~4 min en dev
export const REGEN_MS = DEV ? 180000 : 8 * 3600000;           // îles pillées : repeuplées après ce délai
export const EVENT_INTERVAL_MS = DEV ? 150000 : 3 * 3600000;  // événements aléatoires
export const MARCHAND_DUREE_MS = DEV ? 90000 : 45 * 60000;    // durée de l'offre du marchand
