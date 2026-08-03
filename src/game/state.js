import { DEV, RAID_INTERVAL_MS, BOT_RAID_INTERVAL_MS, EVENT_INTERVAL_MS, MARKET_OFFER_INTERVAL_MS } from "./constants.js";
import { BUILDINGS } from "./buildings.js";
import { ISLAND_GRID, rk } from "./world.js";

// ---- État ----
export function freshBuildings(main) {
  const b = {};
  Object.keys(BUILDINGS).forEach((k) => (b[k] = 0));
  if (main) { b.senat = 1; b.scierie = 1; b.carriere = 1; b.mine_fer = 1; b.ferme = 1; b.entrepot = 1; b.grenier = 1; }
  else { b.senat = 1; b.entrepot = 1; b.grenier = 1; }
  return b;
}
export function newGameState() {
  const center = Math.floor(ISLAND_GRID / 2);
  const r0 = { gx: 0, gy: 0 };
  const explored = { [rk(r0, center, center)]: true };
  if (DEV) for (let py = 0; py < ISLAND_GRID; py++) for (let px = 0; px < ISLAND_GRID; px++) explored[rk(r0, px, py)] = true;
  return {
    version: 12,
    faction: null,
    startedAt: Date.now(),
    nextRaidAt: Date.now() + RAID_INTERVAL_MS,
    nextBotRaidAt: Date.now() + BOT_RAID_INTERVAL_MS,
    nextMarketOfferAt: Date.now() + MARKET_OFFER_INTERVAL_MS,
    marketOffers: [],
    nextEventAt: Date.now() + EVENT_INTERVAL_MS,
    activeEvent: null,
    victoryShown: false,
    spied: {},
    spyMissions: [],
    claimedMissions: {},
    stats: { wins: 0, explorations: 0, raidsRepousses: 0 },
    lastSeen: Date.now(),
    resources: DEV
      ? { bois: 80000, pierre: 80000, fer: 80000, or: 50000, ble: 60000 }
      : { bois: 300, pierre: 300, fer: 220, or: 100, ble: 250 },
    islands: [{ id: 1, name: "Cité mère", region: r0, pos: { px: center, py: center }, buildings: freshBuildings(true), queue: [], esclaves: 0 }],
    activeIsland: 0,
    ships: DEV ? { explorateur: 5, colonisation: 3, transport: 5, peche: 2, siege: 2 }
               : { explorateur: 0, colonisation: 0, transport: 0, peche: 0, siege: 0 },
    troops: DEV ? { hoplite: 60, archer: 60, cavalier: 25, catapulte: 6, belier: 8 }
                : { hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 },
    esclaves: DEV ? 6 : 0,
    shipQueue: [],    // [{ type, endsAt }] — séquentiel, seul le premier a un endsAt
    troopQueue: [],   // [{ type, remaining, nextAt }] — un lot par entrée
    explored,
    colonized: { [rk(r0, center, center)]: 1 },
    conquered: {},
    region: r0,
    exploringTiles: [],
    colonizingTile: null,
    attack: null,
    reports: [],
    nextIslandId: 2,
  };
}
