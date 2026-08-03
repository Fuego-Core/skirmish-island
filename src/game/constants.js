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
// Palette "marbre et bronze en plein jour" — parchemin dense et bronze
// profond. Voulue moins blanche/éblouissante que la première version claire :
// fonds plus riches, cartes en parchemin plutôt que blanc pur, contraste
// renforcé — un entre-deux entre le clair et le sombre.
export const C = {
  bg: "#e8d9b7", bgDeep: "#d3bd8b", panel: "#f5ecd8", panelUp: "#faf2df",
  border: "#c2a565", borderSoft: "#d9c493",
  text: "#241a0d", textDim: "#5c4a2e", textFaint: "#8a7550",
  gold: "#9c6f1f", goldHi: "#b8841f", goldDim: "#cfae76", bronze: "#6e4a1c",
  copper: "#8f562a", ink: "#20160a",
  ok: "#3f7a4c", okBg: "rgba(63,122,76,0.12)",
  bad: "#b23b30", badBg: "rgba(178,59,48,0.12)",
  water: "#2f6b8a", empty: "#4d8a5f", inactive: "#b17a34", enemy: "#a94237", fog: "#a49879",
  // Surfaces "verre" (glassmorphism) et ombrage — utilisées par le kit UI et les scènes.
  glass: "rgba(245,236,216,0.72)", glassHi: "rgba(250,242,223,0.88)", glassBorder: "rgba(100,72,30,0.20)",
  shadowSoft: "0 10px 26px rgba(90,65,30,0.22)", shadowLift: "0 3px 10px rgba(90,65,30,0.18)",
  glow: "0 0 20px rgba(160,120,30,0.26)",
  // Surfaces "en creux" (encarts stats/coûts) et états inactifs — remplacent les
  // noirs semi-transparents qui supposaient un fond sombre.
  inset: "rgba(100,72,30,0.09)", ghost: "rgba(80,58,25,0.07)",
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

// ---- Marché de l'Égée (offres postées par les cités rivales et le joueur) ----
export const MARKET_OFFER_INTERVAL_MS = DEV ? 60000 : 45 * 60000;   // nouvelle offre rivale
export const MARKET_OFFER_LIFETIME_MS = DEV ? 200000 : 6 * 3600000; // une offre rivale expire si pas acceptée
export const MARKET_PLAYER_FILL_MS = DEV ? 100000 : 2 * 3600000;    // délai moyen avant qu'une offre postée soit remplie
export const MARKET_OFFERS_MAX = 8;                                 // offres actives simultanées, tous auteurs confondus
