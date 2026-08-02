import { BOT_GROWTH_PER_H, BOT_GROWTH_MAX } from "./constants.js";
import { TROOPS } from "./troops.js";
import { ISLAND_GRID, REGION_LIMIT, rk, tileState, enemyDefense } from "./world.js";

// ════════════════════════════════════════════════════════════
// CITÉS RIVALES ("bots")
//
// Les îles de type "ile_joueur" sont des cités tenues par des rivaux : elles
// portent un nom, montent en puissance au fil de la partie et peuvent lancer
// des raids sur le joueur. Tout est dérivé des coordonnées et du temps écoulé
// — rien n'est stocké dans la sauvegarde, donc une partie reprise plus tard
// retrouve exactement les mêmes rivaux.
//
// Les îles "ile_inactive" restent des ruines abandonnées : elles ne grandissent
// pas et n'attaquent jamais.
// ════════════════════════════════════════════════════════════

const BOT_NAMES = [
  "Corinthe", "Mégare", "Thèbes", "Argos", "Milet", "Éphèse", "Samos", "Rhodes",
  "Délos", "Naxos", "Paros", "Égine", "Chalcis", "Érétrie", "Théra", "Cnossos",
  "Mycènes", "Olympie", "Delphes", "Sicyone", "Élis", "Pylos", "Ténos", "Andros",
  "Ithaque", "Céphalonie", "Leucade", "Zante", "Cythère", "Ios", "Amorgos", "Kéos",
];
const ROMAN = ["", " II", " III", " IV", " V", " VI"];

function hash(gx, gy, px, py, a, b) {
  return ((((gx + 50) * a + (gy + 50) * b + px * 1373 + py * 2477) % 1000) + 1000) % 1000;
}

// Nom stable d'une cité rivale, déduit de ses coordonnées.
export function botName(gx, gy, px, py) {
  const h = hash(gx, gy, px, py, 8677, 3391);
  return BOT_NAMES[h % BOT_NAMES.length] + ROMAN[Math.floor(h / 97) % ROMAN.length];
}

// Coefficient de montée en puissance depuis le début de la partie.
export function botGrowth(elapsedMs) {
  const hours = Math.max(0, elapsedMs) / 3600000;
  return 1 + Math.min(hours * BOT_GROWTH_PER_H, BOT_GROWTH_MAX);
}

// Défense actuelle d'une case ennemie. Les cités rivales grandissent avec le
// temps, les îles inactives gardent la valeur d'origine.
export function tilePower(gx, gy, px, py, type, elapsedMs) {
  const base = enemyDefense(gx, gy, px, py, type);
  if (type !== "ile_joueur") return base;
  return Math.round(base * botGrowth(elapsedMs));
}

// Puissance offensive d'une cité rivale quand elle lance un raid : plus basse
// que sa défense (elle ne dégarnit pas ses murs pour attaquer).
export function botRaidPower(gx, gy, px, py, elapsedMs) {
  return Math.round(tilePower(gx, gy, px, py, "ile_joueur", elapsedMs) * 0.55);
}

// Score du joueur, sur la même échelle que la puissance des rivaux.
export function playerScore(state) {
  const garrison = Object.keys(TROOPS).reduce((a, t) => a + (state.troops[t] || 0) * TROOPS[t].def, 0);
  const wall = Math.max(0, ...state.islands.map((i) => i.buildings.muraille || 0));
  const levels = state.islands.reduce(
    (a, i) => a + Object.keys(i.buildings).reduce((b, k) => b + i.buildings[k], 0), 0
  );
  return Math.round(garrison * (1 + wall * 0.06) + levels * 12 + state.islands.length * 40);
}

// Cités rivales connues du joueur : celles de sa région de départ (ses voisines
// directes, réputées connues) et toutes celles qu'il a explorées ailleurs.
export function knownBots(state, now) {
  const elapsed = now - (state.startedAt || now);
  const home = (state.islands[0] && state.islands[0].region) || { gx: 0, gy: 0 };
  const out = [];
  const seen = new Set();

  const push = (gx, gy, px, py) => {
    if (tileState(gx, gy, px, py) !== "ile_joueur") return;
    const key = rk({ gx, gy }, px, py);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      key, gx, gy, px, py,
      name: botName(gx, gy, px, py),
      power: tilePower(gx, gy, px, py, "ile_joueur", elapsed),
      pillee: !!state.conquered[key],
    });
  };

  for (let py = 0; py < ISLAND_GRID; py++) {
    for (let px = 0; px < ISLAND_GRID; px++) push(home.gx, home.gy, px, py);
  }
  Object.keys(state.explored).forEach((key) => {
    const [regPart, coordPart] = key.split("|");
    const [gx, gy] = regPart.split(":").map(Number);
    const [px, py] = coordPart.split(",").map(Number);
    if (Math.abs(gx) <= REGION_LIMIT && Math.abs(gy) <= REGION_LIMIT) push(gx, gy, px, py);
  });

  return out.sort((a, b) => b.power - a.power);
}
