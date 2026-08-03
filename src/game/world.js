import { C } from "./constants.js";

// ---- Monde ----
export const ISLAND_GRID = 9;
export const REGION_LIMIT = 4;
export function rk(region, px, py) { return `${region.gx}:${region.gy}|${px},${py}`; }
export function tileState(gx, gy, px, py) {
  const seed = (((gx + 50) * 9973 + (gy + 50) * 6151 + px * 131 + py * 967) % 100 + 100) % 100;
  if (seed < 8) return "ile_joueur";
  if (seed < 20) return "ile_inactive";
  if (seed < 45) return "ile_vide";
  return "eau";
}
export function regionDist(region) { return Math.max(Math.abs(region.gx), Math.abs(region.gy)); }
export function enemyDefense(gx, gy, px, py, type) {
  const seed = (((gx + 50) * 7919 + (gy + 50) * 4271 + px * 271 + py * 613) % 100 + 100) % 100;
  const base = type === "ile_inactive" ? 15 + Math.round(seed * 0.5) : 70 + seed * 2;
  const distMult = 1 + regionDist({ gx, gy }) * 0.6; // plus loin = plus fort
  return Math.round(base * distMult);
}
export function absDist(mainRegion, mainPos, targetRegion, px, py) {
  const ax = mainRegion.gx * ISLAND_GRID + mainPos.px, ay = mainRegion.gy * ISLAND_GRID + mainPos.py;
  const bx = targetRegion.gx * ISLAND_GRID + px, by = targetRegion.gy * ISLAND_GRID + py;
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}
export const TILE_LABELS = {
  eau: "Mer", ile_joueur: "Île joueur", ile_vide: "Île vide — colonisable",
  ile_inactive: "Île inactive", ma_ville: "Une de tes cités", fog: "Non explorée",
};
export function tileColor(s) {
  return { eau: C.water, ile_vide: C.empty, ile_inactive: C.inactive, ile_joueur: C.enemy, ma_ville: C.playerBlue, fog: C.fog }[s] || C.fog;
}
