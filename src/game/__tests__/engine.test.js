import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { applyElapsed } from "../engine.js";
import { newGameState, freshBuildings } from "../state.js";
import { prodPerHour, storageCap, upgradeCost, buildDuration, BUILDINGS } from "../buildings.js";
import { TROOPS } from "../troops.js";
import { rk, tileState, enemyDefense, regionDist } from "../world.js";
import { SPEED, REGEN_MS } from "../constants.js";

// Construit un état de base isolé (raids/événements désactivés par défaut,
// pour ne pas interférer avec les assertions du test en cours).
function baseState(now) {
  const s = newGameState();
  s.nextRaidAt = now + 1e9;
  s.nextEventAt = now + 1e9;
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
    s.islands[0].queue = { key: "senat", targetLevel: 2, endsAt: now - 1 };
    const after = applyElapsed(s, now);
    expect(after.islands[0].buildings.senat).toBe(2);
    expect(after.islands[0].queue).toBeNull();
  });

  it("un chantier non terminé reste en file", () => {
    const now = Date.now();
    const s = baseState(now);
    s.islands[0].queue = { key: "senat", targetLevel: 2, endsAt: now + 5000 };
    const after = applyElapsed(s, now);
    expect(after.islands[0].buildings.senat).toBe(1);
    expect(after.islands[0].queue).not.toBeNull();
  });
});

describe("recrutement par lots", () => {
  it("recrute tous les lots dus et vide la file quand terminé", () => {
    const now = Date.now();
    const s = baseState(now);
    s.troops.hoplite = 0;
    const dur = TROOPS.hoplite.duration * 1000 * SPEED;
    s.troopQueue = { type: "hoplite", remaining: 3, nextAt: now + dur };
    const after = applyElapsed(s, now + dur * 3 + 1);
    expect(after.troops.hoplite).toBe(3);
    expect(after.troopQueue).toBeNull();
  });

  it("ne recrute que les lots déjà dus", () => {
    const now = Date.now();
    const s = baseState(now);
    s.troops.hoplite = 0;
    const dur = TROOPS.hoplite.duration * 1000 * SPEED;
    s.troopQueue = { type: "hoplite", remaining: 3, nextAt: now + dur };
    const after = applyElapsed(s, now + dur * 1.5);
    expect(after.troops.hoplite).toBe(1);
    expect(after.troopQueue).not.toBeNull();
    expect(after.troopQueue.remaining).toBe(2);
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
