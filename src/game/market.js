import { RES, MARKET_OFFER_LIFETIME_MS } from "./constants.js";
import { knownBots, botGrowth } from "./bots.js";

// ════════════════════════════════════════════════════════════
// MARCHÉ DE L'ÉGÉE — offres postées par les cités rivales connues (et par le
// joueur). Un taux variable autour de l'ancien échange fixe 3 pour 2 (facteur
// 1.5) : parfois meilleur marché, parfois moins bon — de vraies affaires à
// repérer plutôt qu'un échange automatique.
// ════════════════════════════════════════════════════════════

function pickTwoDistinctResources() {
  const giveRes = RES[Math.floor(Math.random() * RES.length)];
  let wantRes = RES[Math.floor(Math.random() * RES.length)];
  while (wantRes === giveRes) wantRes = RES[Math.floor(Math.random() * RES.length)];
  return [giveRes, wantRes];
}

// Génère une offre rivale, ou null si aucune cité rivale n'est encore connue
// (avant toute exploration).
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
    giveRes, giveAmt, wantRes, wantAmt,
    postedAt: now, expiresAt: now + MARKET_OFFER_LIFETIME_MS, fillAt: null,
  };
}
