import { RES, MARKET_OFFER_LIFETIME_MS } from "./constants.js";
import { TROOPS } from "./troops.js";
import { SHIPS } from "./ships.js";
import { knownBots, botGrowth } from "./bots.js";

// ════════════════════════════════════════════════════════════
// MARCHÉ DE L'ÉGÉE — offres postées par les cités rivales connues (et par le
// joueur). Un taux variable autour de l'ancien échange fixe 3 pour 2 (facteur
// 1.5) : parfois meilleur marché, parfois moins bon — de vraies affaires à
// repérer plutôt qu'un échange automatique.
//
// Chaque offre a un côté "give" et un côté "want", chacun { kind, key, amt } :
// kind = "res" (RES), "troop" (TROOPS) ou "ship" (SHIPS). Les cités rivales ne
// proposent que des ressources ; le joueur peut aussi mettre en jeu des
// troupes ou des navires contre des ressources (jamais troupe/navire des deux
// côtés à la fois).
// ════════════════════════════════════════════════════════════

function pickTwoDistinctResources() {
  const giveRes = RES[Math.floor(Math.random() * RES.length)];
  let wantRes = RES[Math.floor(Math.random() * RES.length)];
  while (wantRes === giveRes) wantRes = RES[Math.floor(Math.random() * RES.length)];
  return [giveRes, wantRes];
}

// Valeur d'échange d'une unité (troupe/navire) = somme de son coût de
// production en ressources — ancre cohérente avec le reste de l'économie.
export function unitValue(kind, key) {
  const def = kind === "troop" ? TROOPS[key] : kind === "ship" ? SHIPS[key] : null;
  if (!def) return 1;
  return Object.values(def.cost).reduce((a, n) => a + n, 0);
}

export function creditOffer(s, kind, key, amt) {
  if (kind === "troop") s.troops[key] += amt;
  else if (kind === "ship") s.ships[key] += amt;
  else s.resources[key] += amt;
}

export function debitOffer(s, kind, key, amt) {
  if (kind === "troop") s.troops[key] -= amt;
  else if (kind === "ship") s.ships[key] -= amt;
  else s.resources[key] -= amt;
}

export function ownedAmt(g, kind, key) {
  if (kind === "troop") return g.troops[key] || 0;
  if (kind === "ship") return g.ships[key] || 0;
  return g.resources[key] || 0;
}

// Génère une offre rivale, ou null si aucune cité rivale n'est encore connue
// (avant toute exploration). Toujours ressource contre ressource.
export function generateBotOffer(state, now) {
  const rivals = knownBots(state, now).filter((b) => !b.pillee);
  if (rivals.length === 0) return null;
  const bot = rivals[Math.floor(Math.random() * Math.min(5, rivals.length))];
  const [giveRes, wantRes] = pickTwoDistinctResources();
  const growth = botGrowth(now - (state.startedAt || now));
  const giveAmt = Math.round((80 + Math.random() * 260) * growth);
  const rate = 1.1 + Math.random() * 1.1; // 1.1 (très avantageux) à 2.2 (mauvais taux)
  const wantAmt = Math.max(1, Math.round(giveAmt * rate));
  return {
    id: `bot-${now}-${Math.floor(Math.random() * 1e6)}`,
    author: "bot", botName: bot.name,
    giveKind: "res", giveKey: giveRes, giveAmt,
    wantKind: "res", wantKey: wantRes, wantAmt,
    postedAt: now, expiresAt: now + MARKET_OFFER_LIFETIME_MS, fillAt: null,
  };
}
