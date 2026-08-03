import { RES, DEV_CAP_MULT, SPEED } from "./constants.js";

// ---- Bâtiments ----
export const BUILDINGS = {
  senat:    { label: "Sénat", group: "infra", desc: "Cœur de la cité — débloque les autres bâtiments et accélère les chantiers." },
  scierie:  { label: "Scierie", group: "prod", produces: "bois", desc: "Produit du bois." },
  carriere: { label: "Carrière", group: "prod", produces: "pierre", desc: "Produit de la pierre." },
  mine_fer: { label: "Mine de fer", group: "prod", produces: "fer", desc: "Produit du fer." },
  mine_or:  { label: "Mine d'or", group: "prod", produces: "or", requires: { senat: 3 }, desc: "Produit de l'or." },
  ferme:    { label: "Ferme", group: "prod", produces: "ble", desc: "Produit du blé — nourrit ton armée." },
  entrepot: { label: "Entrepôt", group: "infra", desc: "Stocke bois, pierre, fer et or." },
  grenier:  { label: "Grenier", group: "infra", desc: "Stocke le blé." },
  marche:   { label: "Marché", group: "infra", requires: { senat: 3 }, desc: "Échange tes ressources excédentaires (3 contre 2)." },
  port:     { label: "Port", group: "mil", requires: { senat: 2 }, desc: "Chantier naval — permet de construire des bateaux." },
  muraille: { label: "Muraille", group: "mil", requires: { senat: 2 }, desc: "Protège la cité — chaque niveau renforce ta garnison de 6% contre les raids." },
  colosse:  { label: "Le Colosse", group: "merveille", requires: { senat: 5 }, maxLevel: 5, desc: "Merveille de l'Égée. Achève ses 5 étapes pour graver ton nom dans l'histoire — et remporter la partie." },
  caserne:  { label: "Caserne", group: "mil", requires: { senat: 2 }, desc: "Permet de recruter troupes et engins de siège." },
};
export const GROUPS = [["prod", "Production"], ["infra", "Infrastructure"], ["mil", "Militaire & naval"], ["merveille", "Merveille"]];

export const B_ICON = { senat: "senat", scierie: "scierie", carriere: "carriere", mine_fer: "mine_fer", mine_or: "mine_or", ferme: "ferme", entrepot: "entrepot", grenier: "grenier", marche: "marche", port: "port", caserne: "caserne", muraille: "muraille", colosse: "colosse" };

// ---- Files d'attente ----
// Nombre de chantiers qu'on peut mettre en file sur une île. Ils se
// construisent l'un après l'autre : plus d'emplacements ne fait pas construire
// plus vite, ça évite juste d'avoir à relancer à chaque fin de chantier.
export const BUILD_SLOTS_MAX = 3;
export function buildSlots(senatLevel) {
  if (senatLevel >= 10) return 3;
  if (senatLevel >= 5) return 2;
  return 1;
}

// ---- Formules ----
export function prodPerHour(level) { return level <= 0 ? 0 : Math.round(30 * level * Math.pow(1.16, level - 1)); }
export function storageCap(level) { return Math.round(600 * Math.pow(1.35, level)) * DEV_CAP_MULT; }
export function upgradeCost(key, level) {
  const base = {
    senat: { bois: 120, pierre: 130, fer: 90, or: 50, ble: 60 },
    scierie: { bois: 40, pierre: 60, fer: 30, or: 10, ble: 20 },
    carriere: { bois: 65, pierre: 40, fer: 30, or: 10, ble: 20 },
    mine_fer: { bois: 55, pierre: 55, fer: 25, or: 15, ble: 25 },
    mine_or: { bois: 60, pierre: 60, fer: 40, or: 10, ble: 30 },
    ferme: { bois: 45, pierre: 40, fer: 25, or: 10, ble: 15 },
    entrepot: { bois: 90, pierre: 80, fer: 50, or: 20, ble: 10 },
    grenier: { bois: 80, pierre: 70, fer: 45, or: 20, ble: 10 },
    marche: { bois: 100, pierre: 90, fer: 60, or: 60, ble: 40 },
    port: { bois: 140, pierre: 100, fer: 80, or: 40, ble: 50 },
    caserne: { bois: 110, pierre: 120, fer: 100, or: 30, ble: 70 },
    muraille: { bois: 90, pierre: 160, fer: 70, or: 25, ble: 40 },
    colosse: { bois: 5000, pierre: 6500, fer: 4500, or: 3500, ble: 2500 },
  }[key];
  const mult = Math.pow(1.28, level);
  const cost = {};
  RES.forEach((r) => (cost[r] = Math.round(base[r] * mult)));
  return cost;
}
export function buildDuration(key, level, senatLevel) {
  const base = key === "colosse" ? 150 + level * 110 : 25 + level * 22;
  const senatBonus = 1 - Math.min(senatLevel * 0.04, 0.5);
  return Math.max(2, Math.round(base * senatBonus * SPEED));
}
