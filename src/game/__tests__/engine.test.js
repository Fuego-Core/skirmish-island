import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { applyElapsed } from "../engine.js";
import { newGameState, freshBuildings } from "../state.js";
import { prodPerHour, storageCap, upgradeCost, buildDuration, BUILDINGS, buildSlots } from "../buildings.js";
import { TROOPS, troopSlots, compositionBonus, matchupBonus } from "../troops.js";
import { SHIPS, shipSlots } from "../ships.js";
import { rk, tileState, enemyDefense, regionDist } from "../world.js";
import { SPEED, REGEN_MS, BOT_GROWTH_MAX } from "../constants.js";
import { botName, botGrowth, tilePower, knownBots, playerScore, tileFamilyMix } from "../bots.js";
import { MARKET_OFFERS_MAX, MARKET_OFFER_LIFETIME_MS } from "../constants.js";
import { generateBotOffer } from "../market.js";

// Construit un état de base isolé (raids/événements désactivés par défaut,
// pour ne pas interférer avec les assertions du test en cours).
function baseState(now) {
  const s = newGameState();
  s.nextRaidAt = now + 1e9;
  s.nextBotRaidAt = now + 1e9;
  s.nextEventAt = now + 1e9;
  s.nextMarketOfferAt = now + 1e9;
  s.lastSeen = now;
  return s;
}

describe("prodPerHour / storageCap / coûts croissants", () => {
  it("les coûts d'amélioration augmentent avec le niveau", () => {
    const cost0 = upgradeCost("senat", 0);
    const cost1 = upgradeCost("senat", 3);
    const cost2 = upgradeCost("senat", 6);
    expect(cost1.bois).toBeGreaterThan(cost0.bois);
    expect(cost2.bois).toBeGreaterThan(cost1.bois);
    expect(cost2.or).toBeGreaterThan(cost1.or);
  });

  it("la capacité de stockage croît avec le niveau", () => {
    expect(storageCap(3)).toBeGreaterThan(storageCap(1));
  });
});

describe("production sur 1 heure", () => {
  it("crédite la production horaire des bâtiments", () => {
    const now = Date.now();
    const s = baseState(now);
    s.islands = [{
      id: 1, name: "Cité mère", region: { gx: 0, gy: 0 }, pos: { px: 4, py: 4 },
      buildings: { ...freshBuildings(true), scierie: 4, entrepot: 20, grenier: 20 },
      queue: null, esclaves: 0,
    }];
    s.activeIsland = 0;
    s.resources = { bois: 0, pierre: 0, fer: 0, or: 0, ble: 0 };
    s.ships = { explorateur: 0, colonisation: 0, transport: 0, peche: 0, siege: 0 };
    s.troops = { hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 };

    const after = applyElapsed(s, now + 3600000);
    expect(after.resources.bois).toBe(prodPerHour(4));
  });
});

describe("chantiers", () => {
  it("un chantier terminé applique le niveau cible et vide la file", () => {
    const now = Date.now();
    const s = baseState(now);
    s.islands[0].queue = [{ key: "senat", targetLevel: 2, endsAt: now - 1 }];
    const after = applyElapsed(s, now);
    expect(after.islands[0].buildings.senat).toBe(2);
    expect(after.islands[0].queue.length).toBe(0);
  });

  it("un chantier non terminé reste en file", () => {
    const now = Date.now();
    const s = baseState(now);
    s.islands[0].queue = [{ key: "senat", targetLevel: 2, endsAt: now + 5000 }];
    const after = applyElapsed(s, now);
    expect(after.islands[0].buildings.senat).toBe(1);
    expect(after.islands[0].queue.length).toBe(1);
  });
});

describe("recrutement par lots", () => {
  it("recrute tous les lots dus et vide la file quand terminé", () => {
    const now = Date.now();
    const s = baseState(now);
    s.troops.hoplite = 0;
    const dur = TROOPS.hoplite.duration * 1000 * SPEED;
    s.troopQueue = [{ type: "hoplite", remaining: 3, nextAt: now + dur }];
    const after = applyElapsed(s, now + dur * 3 + 1);
    expect(after.troops.hoplite).toBe(3);
    expect(after.troopQueue.length).toBe(0);
  });

  it("ne recrute que les lots déjà dus", () => {
    const now = Date.now();
    const s = baseState(now);
    s.troops.hoplite = 0;
    const dur = TROOPS.hoplite.duration * 1000 * SPEED;
    s.troopQueue = [{ type: "hoplite", remaining: 3, nextAt: now + dur }];
    const after = applyElapsed(s, now + dur * 1.5);
    expect(after.troops.hoplite).toBe(1);
    expect(after.troopQueue.length).toBe(1);
    expect(after.troopQueue[0].remaining).toBe(2);
  });
});

describe("exploration : aller-retour", () => {
  it("révèle la case à l'arrivée puis rend le bateau au retour", () => {
    const now = Date.now();
    const s = baseState(now);
    const key = rk({ gx: 0, gy: 0 }, 2, 2);
    s.explored = {};
    s.ships.explorateur = 0;
    s.stats.explorations = 0;
    s.exploringTiles = [{ key, arriveAt: now - 500, endsAt: now + 5000 }];

    const midway = applyElapsed(s, now);
    expect(midway.explored[key]).toBe(true);
    expect(midway.stats.explorations).toBe(1);
    expect(midway.ships.explorateur).toBe(0); // pas encore rentré

    const after = applyElapsed(midway, now + 6000);
    expect(after.ships.explorateur).toBe(1);
    expect(after.exploringTiles.length).toBe(0);
  });
});

describe("colonisation", () => {
  it("fonde une nouvelle île à la fin du trajet", () => {
    const now = Date.now();
    const s = baseState(now);
    const key = rk({ gx: 0, gy: 0 }, 3, 3);
    s.colonizingTile = { key, region: { gx: 0, gy: 0 }, endsAt: now - 1 };
    const nbBefore = s.islands.length;
    const nextId = s.nextIslandId;

    const after = applyElapsed(s, now);
    expect(after.islands.length).toBe(nbBefore + 1);
    expect(after.colonized[key]).toBe(nextId);
    expect(after.colonizingTile).toBeNull();
    expect(after.nextIslandId).toBe(nextId + 1);
  });
});

describe("résolution d'attaque avec butin", () => {
  it("une attaque écrasante l'emporte, rapporte du butin et conquiert la case", () => {
    const now = Date.now();
    const s = baseState(now);
    // Cherche une case "ile_inactive" proche pour une défense connue et modeste
    let target = null;
    for (let px = 0; px < 9 && !target; px++) {
      for (let py = 0; py < 9 && !target; py++) {
        if (tileState(0, 0, px, py) === "ile_inactive") target = { px, py };
      }
    }
    expect(target).not.toBeNull();
    const key = rk({ gx: 0, gy: 0 }, target.px, target.py);

    s.troops = { hoplite: 100000, archer: 0, cavalier: 0, catapulte: 0, belier: 0 };
    s.attack = {
      key, troops: { hoplite: 100000 }, withSiege: false, resolved: false, report: null,
      arriveAt: now, endsAt: now,
    };
    s.ships.transport = 0;
    s.resources = { bois: 0, pierre: 0, fer: 0, or: 0, ble: 0 };

    const after = applyElapsed(s, now);
    expect(after.attack).toBeNull();
    expect(after.reports[0].kind).toBe("attaque");
    expect(after.reports[0].win).toBe(true);
    expect(after.conquered[key]).toBeTruthy();
    expect(after.resources.bois).toBeGreaterThan(0);
    expect(after.ships.transport).toBe(1); // le transport rentre au port
  });
});

describe("raid pirate : bonus de muraille", () => {
  const now = Date.now();
  let randomSpy;
  beforeEach(() => { randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5); });
  afterEach(() => { randomSpy.mockRestore(); });

  function raidState(wallLevel) {
    const s = baseState(now);
    s.islands[0].buildings.senat = 5;
    s.islands[0].buildings.muraille = wallLevel;
    s.troops = { hoplite: 10, archer: 0, cavalier: 0, catapulte: 0, belier: 0 };
    s.resources = { bois: 1000, pierre: 1000, fer: 1000, or: 1000, ble: 1000 };
    s.nextRaidAt = now - 1;
    return s;
  }

  it("sans muraille, la garnison cède face aux pirates", () => {
    const after = applyElapsed(raidState(0), now);
    expect(after.reports[0].kind).toBe("defense");
    expect(after.reports[0].win).toBe(false);
    expect(after.reports[0].vol).not.toBeNull();
  });

  it("une muraille haut niveau suffit à repousser le même raid", () => {
    const after = applyElapsed(raidState(15), now);
    expect(after.reports[0].kind).toBe("defense");
    expect(after.reports[0].win).toBe(true);
    expect(after.reports[0].vol).toBeNull();
    expect(after.stats.raidsRepousses).toBe(1);
  });
});

describe("régénération des îles pillées", () => {
  it("une île pillée redevient attaquable après le délai de régénération", () => {
    const now = Date.now();
    const s = baseState(now);
    const key = rk({ gx: 1, gy: 1 }, 4, 4);
    s.conquered = { [key]: now - REGEN_MS - 1 };

    const after = applyElapsed(s, now);
    expect(after.conquered[key]).toBeUndefined();
  });

  it("une île pillée reste marquée avant le délai", () => {
    const now = Date.now();
    const s = baseState(now);
    const key = rk({ gx: 1, gy: 1 }, 4, 4);
    s.conquered = { [key]: now - 10 };

    const after = applyElapsed(s, now);
    expect(after.conquered[key]).toBe(now - 10);
  });
});

describe("le blé ne passe jamais sous zéro", () => {
  it("un entretien largement supérieur à la production plafonne le blé à 0", () => {
    const now = Date.now();
    const s = baseState(now);
    s.islands[0].buildings.ferme = 0; // pas de production de blé
    s.ships.peche = 0;
    s.troops = { hoplite: 5000, archer: 0, cavalier: 0, catapulte: 0, belier: 0 }; // upkeep énorme
    s.resources.ble = 50;

    const after = applyElapsed(s, now + 3600000 * 5);
    expect(after.resources.ble).toBe(0);
  });
});

describe("défense plus forte en région lointaine", () => {
  it("en moyenne, la défense ennemie augmente avec la distance au centre", () => {
    const sampleAt = (gx, gy) => {
      let total = 0, n = 0;
      for (let px = 0; px < 9; px++) {
        for (let py = 0; py < 9; py++) {
          total += enemyDefense(gx, gy, px, py, "ile_joueur");
          n += 1;
        }
      }
      return total / n;
    };
    const avgNear = sampleAt(0, 0);
    const avgFar = sampleAt(6, 6);
    expect(regionDist({ gx: 6, gy: 6 })).toBeGreaterThan(regionDist({ gx: 0, gy: 0 }));
    expect(avgFar).toBeGreaterThan(avgNear * 1.5);
  });
});

describe("cités rivales (bots)", () => {
  it("le nom d'une cité rivale est stable pour des coordonnées données", () => {
    expect(botName(0, 0, 3, 4)).toBe(botName(0, 0, 3, 4));
    // deux cases différentes ne donnent pas systématiquement le même nom
    const names = new Set();
    for (let px = 0; px < 9; px++) for (let py = 0; py < 9; py++) names.add(botName(0, 0, px, py));
    expect(names.size).toBeGreaterThan(5);
  });

  it("les cités rivales montent en puissance avec le temps, les îles inactives non", () => {
    const jour = 3600000 * 24;
    const rival0 = tilePower(0, 0, 3, 4, "ile_joueur", 0);
    const rivalPlusTard = tilePower(0, 0, 3, 4, "ile_joueur", jour);
    expect(rivalPlusTard).toBeGreaterThan(rival0);

    const inactive0 = tilePower(0, 0, 3, 4, "ile_inactive", 0);
    const inactivePlusTard = tilePower(0, 0, 3, 4, "ile_inactive", jour);
    expect(inactivePlusTard).toBe(inactive0);
  });

  it("la montée en puissance est plafonnée", () => {
    expect(botGrowth(3600000 * 24 * 365)).toBeCloseTo(1 + BOT_GROWTH_MAX, 5);
  });

  it("une cité rivale finit par lancer un raid sur le joueur", () => {
    const now = Date.now();
    const s = baseState(now);
    s.troops = { hoplite: 2, archer: 0, cavalier: 0, catapulte: 0, belier: 0 };
    s.nextBotRaidAt = now + 1000;

    const after = applyElapsed(s, now + 2000);
    const raid = after.reports.find((r) => r.kind === "defense" && r.attaquant);
    expect(raid).toBeTruthy();
    expect(typeof raid.attaquant).toBe("string");
    expect(raid.defPower).toBeGreaterThan(0);
  });

  it("le classement contient le joueur et des rivaux, trié par puissance", () => {
    const now = Date.now();
    const s = baseState(now);
    const rivaux = knownBots(s, now);
    expect(rivaux.length).toBeGreaterThan(0);
    for (let i = 1; i < rivaux.length; i++) {
      expect(rivaux[i - 1].power).toBeGreaterThanOrEqual(rivaux[i].power);
    }
    expect(playerScore(s)).toBeGreaterThan(0);
  });
});

describe("files d'attente séquentielles", () => {
  it("les emplacements s'ouvrent avec le niveau de Sénat / Port / Caserne", () => {
    expect(buildSlots(1)).toBe(1);
    expect(buildSlots(5)).toBe(2);
    expect(buildSlots(10)).toBe(3);
    expect(buildSlots(20)).toBe(3); // plafonné

    expect(shipSlots(0)).toBe(1);
    expect(shipSlots(3)).toBe(4);
    expect(shipSlots(50)).toBe(10); // plafonné

    expect(troopSlots(0)).toBe(1);
    expect(troopSlots(4)).toBe(5);
    expect(troopSlots(50)).toBe(10); // plafonné
  });

  it("un chantier en file démarre à la fin du précédent, pas en parallèle", () => {
    const now = Date.now();
    const s = baseState(now);
    s.islands[0].buildings.scierie = 1;
    s.islands[0].queue = [
      { key: "senat", targetLevel: 2, endsAt: now + 1000 },
      { key: "scierie", targetLevel: 2, endsAt: null },
    ];

    // Juste après la fin du premier : le second démarre seulement maintenant
    const after = applyElapsed(s, now + 1000);
    expect(after.islands[0].buildings.senat).toBe(2);
    expect(after.islands[0].buildings.scierie).toBe(1); // pas encore construit
    expect(after.islands[0].queue.length).toBe(1);
    expect(after.islands[0].queue[0].endsAt).toBeGreaterThan(now + 1000);
  });

  it("rattrape plusieurs achèvements d'un coup après une absence", () => {
    const now = Date.now();
    const s = baseState(now);
    s.ships.peche = 0;
    s.ships.explorateur = 0;
    const d = (t) => SHIPS[t].duration * 1000 * SPEED;
    s.shipQueue = [
      { type: "peche", endsAt: now + d("peche") },
      { type: "explorateur", endsAt: null },
    ];

    const after = applyElapsed(s, now + d("peche") + d("explorateur") + 1);
    expect(after.ships.peche).toBe(1);
    expect(after.ships.explorateur).toBe(1);
    expect(after.shipQueue.length).toBe(0);
  });

  it("migre une sauvegarde de l'ancien format sans perdre le chantier en cours", () => {
    const now = Date.now();
    const legacy = baseState(now);
    legacy.islands[0].queue = { key: "senat", targetLevel: 2, endsAt: now + 5000 };
    legacy.shipQueue = { type: "peche", endsAt: now + 5000 };
    legacy.troopQueue = { type: "hoplite", remaining: 2, nextAt: now + 5000 };

    const after = applyElapsed(legacy, now);
    expect(Array.isArray(after.islands[0].queue)).toBe(true);
    expect(after.islands[0].queue[0].key).toBe("senat");
    expect(Array.isArray(after.shipQueue)).toBe(true);
    expect(after.shipQueue[0].type).toBe("peche");
    expect(Array.isArray(after.troopQueue)).toBe(true);
    expect(after.troopQueue[0].remaining).toBe(2);
  });

  it("migre une sauvegarde sans chantier en cours vers des files vides", () => {
    const now = Date.now();
    const legacy = baseState(now);
    legacy.islands[0].queue = null;
    legacy.shipQueue = null;
    legacy.troopQueue = null;

    const after = applyElapsed(legacy, now);
    expect(after.islands[0].queue).toEqual([]);
    expect(after.shipQueue).toEqual([]);
    expect(after.troopQueue).toEqual([]);
  });
});

describe("marché de l'Égée", () => {
  it("génère une offre rivale une fois des cités rivales connues", () => {
    const now = Date.now();
    const s = baseState(now);
    const offer = generateBotOffer(s, now);
    expect(offer).toBeTruthy();
    expect(offer.author).toBe("bot");
    expect(offer.give.key).not.toBe(offer.want[0].key);
    expect(offer.give.amt).toBeGreaterThan(0);
    expect(offer.want[0].amt).toBeGreaterThan(0);
  });

  it("respecte le plafond d'offres actives simultanées", () => {
    const now = Date.now();
    const s = baseState(now);
    s.nextMarketOfferAt = now + 1000;
    const after = applyElapsed(s, now + 1000 + MARKET_OFFERS_MAX * 200000);
    expect(after.marketOffers.length).toBeLessThanOrEqual(MARKET_OFFERS_MAX);
  });

  it("une offre rivale expirée disparaît", () => {
    const now = Date.now();
    const s = baseState(now);
    s.marketOffers = [{
      id: "bot-x", author: "bot", botName: "Test",
      give: { kind: "res", key: "bois", amt: 100 }, want: [{ kind: "res", key: "fer", amt: 150 }],
      postedAt: now, expiresAt: now + 1000, fillAt: null,
    }];
    const after = applyElapsed(s, now + MARKET_OFFER_LIFETIME_MS + 2000);
    expect(after.marketOffers.find((o) => o.id === "bot-x")).toBeUndefined();
  });

  it("une offre du joueur se remplit et crédite les ressources demandées", () => {
    const now = Date.now();
    const s = baseState(now);
    const bleAvant = s.resources.ble;
    s.marketOffers = [{
      id: "player-x", author: "player", botName: null,
      give: { kind: "res", key: "bois", amt: 100 }, want: [{ kind: "res", key: "ble", amt: 150 }],
      postedAt: now, expiresAt: null, fillAt: now + 1000,
    }];
    const after = applyElapsed(s, now + 2000);
    expect(after.marketOffers.find((o) => o.id === "player-x")).toBeUndefined();
    expect(after.resources.ble).toBeCloseTo(bleAvant + 150, 0);
  });

  it("une offre remplie incrémente stats.tradesDone (mission marché)", () => {
    const now = Date.now();
    const s = baseState(now);
    s.marketOffers = [{
      id: "player-y", author: "player", botName: null,
      give: { kind: "res", key: "bois", amt: 50 }, want: [{ kind: "res", key: "or", amt: 40 }],
      postedAt: now, expiresAt: null, fillAt: now + 1000,
    }];
    const after = applyElapsed(s, now + 2000);
    expect(after.stats.tradesDone).toBe(1);
  });

  it("une offre du joueur peut échanger des troupes contre des ressources", () => {
    const now = Date.now();
    const s = baseState(now);
    const orAvant = s.resources.or;
    s.marketOffers = [{
      id: "player-troop", author: "player", botName: null,
      give: { kind: "troop", key: "hoplite", amt: 2 }, want: [{ kind: "res", key: "or", amt: 30 }],
      postedAt: now, expiresAt: null, fillAt: now + 1000,
    }];
    const after = applyElapsed(s, now + 2000);
    expect(after.marketOffers.find((o) => o.id === "player-troop")).toBeUndefined();
    expect(after.resources.or).toBeCloseTo(orAvant + 30, 0);
  });

  it("une offre du joueur peut demander un panier de 2 ressources", () => {
    const now = Date.now();
    const s = baseState(now);
    const boisAvant = s.resources.bois;
    const pierreAvant = s.resources.pierre;
    s.marketOffers = [{
      id: "player-basket", author: "player", botName: null,
      give: { kind: "res", key: "ble", amt: 200 }, want: [{ kind: "res", key: "bois", amt: 80 }, { kind: "res", key: "pierre", amt: 60 }],
      postedAt: now, expiresAt: null, fillAt: now + 1000,
    }];
    const after = applyElapsed(s, now + 2000);
    expect(after.marketOffers.find((o) => o.id === "player-basket")).toBeUndefined();
    expect(after.resources.bois).toBeCloseTo(boisAvant + 80, 0);
    expect(after.resources.pierre).toBeCloseTo(pierreAvant + 60, 0);
  });

  it("filtre les offres de l'ancien format (sans give/want)", () => {
    const now = Date.now();
    const s = baseState(now);
    s.marketOffers = [{ id: "legacy", author: "bot", botName: "Test", giveRes: "bois", giveAmt: 10, wantRes: "fer", wantAmt: 10, postedAt: now, expiresAt: now + 1e9, fillAt: null }];
    const after = applyElapsed(s, now + 10);
    expect(after.marketOffers.find((o) => o.id === "legacy")).toBeUndefined();
  });
});

describe("équilibre de composition d'armée", () => {
  it("une armée parfaitement équilibrée obtient le bonus maximal", () => {
    // atk hoplite=6, archer=8, cavalier=14 — équilibrer les parts de puissance,
    // pas les effectifs bruts.
    const troops = { hoplite: 100, archer: 75, cavalier: 300 / 7 };
    const bonus = compositionBonus(troops);
    expect(bonus).toBeCloseTo(1.12, 1);
  });

  it("une armée mono-unité subit le malus maximal", () => {
    const bonus = compositionBonus({ hoplite: 100, archer: 0, cavalier: 0, belier: 0, catapulte: 0 });
    expect(bonus).toBeCloseTo(0.88, 5);
  });

  it("une armée uniquement de siège (sans troupe de mêlée) reste neutre", () => {
    const bonus = compositionBonus({ hoplite: 0, archer: 0, cavalier: 0, belier: 5, catapulte: 5 });
    expect(bonus).toBe(1);
  });

  it("le bonus de composition influence la résolution d'une attaque", () => {
    const now = Date.now();
    const s = baseState(now);
    s.troops = { hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 };
    s.ships.transport = 1;
    const region = { gx: 5, gy: 5 };
    const px = 4, py = 4;
    const key = rk(region, px, py);
    const oneWay = 5000;
    s.region = region;
    s.attack = {
      key, troops: { hoplite: 50, archer: 0, cavalier: 0, catapulte: 0, belier: 0 },
      withSiege: false, resolved: false, report: null, arriveAt: now + oneWay, endsAt: now + oneWay * 2,
    };
    const afterMono = applyElapsed(s, now + oneWay * 2 + 10);
    const monoAtk = afterMono.reports[0].atkPower;

    const s2 = baseState(now);
    s2.troops = { hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 };
    s2.ships.transport = 1;
    s2.region = region;
    s2.attack = {
      key, troops: { hoplite: 17, archer: 13, cavalier: 7, catapulte: 0, belier: 0 },
      withSiege: false, resolved: false, report: null, arriveAt: now + oneWay, endsAt: now + oneWay * 2,
    };
    const afterMix = applyElapsed(s2, now + oneWay * 2 + 10);
    const mixAtk = afterMix.reports[0].atkPower;

    // Puissance brute similaire (mono ~300, mix ~(17*6+13*8+7*14)=304) mais le
    // mix équilibré doit ressortir avec un atkPower relatif plus élevé grâce
    // au bonus de composition.
    expect(mixAtk / 304).toBeGreaterThan(monoAtk / 300);
  });
});

describe("contre d'unités contre une cité rivale connue", () => {
  it("tileFamilyMix est stable pour des coordonnées données et somme à 1", () => {
    const mix = tileFamilyMix(2, -1, 5, 6);
    expect(mix).toEqual(tileFamilyMix(2, -1, 5, 6));
    expect(mix.infantry + mix.ranged + mix.cavalry).toBeCloseTo(1, 5);
  });

  it("une armée qui contre directement la composition adverse obtient le bonus maximal", () => {
    const bonus = matchupBonus({ hoplite: 100 }, { infantry: 0, ranged: 0, cavalry: 1 });
    expect(bonus).toBeCloseTo(1.3, 5);
  });

  it("une armée contrée par l'adversaire obtient le malus maximal", () => {
    const bonus = matchupBonus({ hoplite: 100 }, { infantry: 0, ranged: 1, cavalry: 0 });
    expect(bonus).toBeCloseTo(0.7, 5);
  });

  it("l'espionnage d'une cité rivale révèle sa composition", () => {
    const now = Date.now();
    const s = baseState(now);
    const region = { gx: 3, gy: -2 };
    const px = 2, py = 3;
    const key = rk(region, px, py);
    s.region = region;
    s.ships.eclaireur = 1;
    s.spyMissions = [{ key, arriveAt: now + 500, endsAt: now + 1000 }];
    const after = applyElapsed(s, now + 600);
    expect(after.spied[key]).toBeTruthy();
    if (tileState(region.gx, region.gy, px, py) === "ile_joueur") {
      expect(after.spied[key].familyMix).toBeTruthy();
      expect(after.spied[key].familyMix.infantry + after.spied[key].familyMix.ranged + after.spied[key].familyMix.cavalry).toBeCloseTo(1, 5);
    } else {
      expect(after.spied[key].familyMix).toBeNull();
    }
  });

  it("l'espionnage abouti pousse aussi un rapport consultable", () => {
    const now = Date.now();
    const s = baseState(now);
    const region = { gx: 3, gy: -2 };
    const px = 2, py = 3;
    const key = rk(region, px, py);
    s.region = region;
    s.ships.eclaireur = 1;
    s.spyMissions = [{ key, arriveAt: now + 500, endsAt: now + 1000 }];
    const after = applyElapsed(s, now + 600);
    const rep = after.reports.find((r) => r.kind === "espionnage");
    expect(rep).toBeTruthy();
    expect(rep.def).toBe(after.spied[key].def);
    expect(rep.butinMin).toBe(after.spied[key].butinMin);
    expect(rep.butinMax).toBe(after.spied[key].butinMax);
    expect(rep.cible).toBeTruthy();
  });
});
