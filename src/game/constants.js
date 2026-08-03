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
// Palette "marbre et bronze au crépuscule" — mix sombre/clair, à dominante
// sombre : fonds bruns profonds façon cuir/bois patiné, rehaussés d'or et de
// bronze lumineux pour garder la chaleur du thème d'origine.
export const C = {
  bg: "#241a10", bgDeep: "#160f09", panel: "#2f2314", panelUp: "#3a2c19",
  border: "#5c4527", borderSoft: "#453620",
  text: "#f1e4c8", textDim: "#c7b48c", textFaint: "#8f7c58",
  gold: "#c99a3a", goldHi: "#e0b04a", goldDim: "#9c7d43", bronze: "#a97b3a",
  copper: "#b97a42", ink: "#1a1006",
  ok: "#5fae70", okBg: "rgba(95,174,112,0.14)",
  bad: "#d3564a", badBg: "rgba(211,86,74,0.16)",
  water: "#3a7fa0", empty: "#5a9c6c", inactive: "#c68d3f", enemy: "#c1584a", fog: "#6b5d43",
  // Surfaces "verre" (glassmorphism) et ombrage — utilisées par le kit UI et les scènes.
  glass: "rgba(47,35,20,0.72)", glassHi: "rgba(58,44,25,0.88)", glassBorder: "rgba(230,190,120,0.16)",
  shadowSoft: "0 10px 26px rgba(0,0,0,0.45)", shadowLift: "0 3px 10px rgba(0,0,0,0.35)",
  glow: "0 0 20px rgba(224,176,74,0.28)",
  // Surfaces "en creux" (encarts stats/coûts) et états inactifs.
  inset: "rgba(0,0,0,0.22)", ghost: "rgba(0,0,0,0.16)",
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
