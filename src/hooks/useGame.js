import { useCallback, useEffect, useRef, useState } from "react";
import { RES, SPEED, MARKET_PLAYER_FILL_MS, MARKET_OFFERS_MAX } from "../game/constants.js";
import { BUILDINGS, upgradeCost, buildDuration, buildSlots } from "../game/buildings.js";
import { SHIPS, shipSlots } from "../game/ships.js";
import { TROOPS, troopSlots } from "../game/troops.js";
import { FACTIONS } from "../game/factions.js";
import { MISSIONS } from "../game/missions.js";
import { rk, tileState, absDist } from "../game/world.js";
import { newGameState } from "../game/state.js";
import { applyElapsed } from "../game/engine.js";
import { creditOffer, debitOffer, ownedAmt, ownsWantBasket, creditBasket, debitBasket } from "../game/market.js";
import { notify } from "../ui/notifications.js";
import { sfx } from "../ui/sound.js";

const SAVE_KEY = "skirmish-save";

// Titre lisible pour un rapport fraîchement ajouté (même logique que ReportsTab).
function reportTitle(rep) {
  if (rep.kind === "evenement") return rep.titre;
  if (rep.kind === "defense") return rep.win ? "Raid repoussé" : "Raid pirate subi";
  return rep.win ? "Victoire" : "Défaite";
}

// Compare l'état avant/après un tick et notifie les chantiers/flottes qui
// viennent de se terminer, ainsi que tout nouveau rapport (combat ou événement).
// Une entrée de file est terminée quand la file raccourcit : les entrées ne
// sont retirées que par le moteur, à l'achèvement. Après une longue absence
// plusieurs peuvent tomber d'un coup — on ne prévient qu'une fois, pour ne pas
// noyer le joueur sous les notifications au retour.
function headCompleted(beforeQueue, afterQueue) {
  const before = beforeQueue || [], after = afterQueue || [];
  return after.length < before.length ? before[0] : null;
}

function notifyCompletions(before, after) {
  before.islands.forEach((isl, i) => {
    const nextIsl = after.islands[i];
    if (!nextIsl) return;
    const done = headCompleted(isl.queue, nextIsl.queue);
    if (done) { notify("Chantier terminé", `${BUILDINGS[done.key].label} — niveau ${done.targetLevel} atteint sur ${isl.name}.`); sfx("coin"); }
  });
  const ship = headCompleted(before.shipQueue, after.shipQueue);
  if (ship) { notify("Navire prêt", `${SHIPS[ship.type].label} a rejoint ta flotte.`); sfx("coin"); }

  const troop = headCompleted(before.troopQueue, after.troopQueue);
  if (troop) { notify("Troupes recrutées", `${TROOPS[troop.type].label} — recrutement terminé.`); sfx("coin"); }
  if (after.reports.length > 0 && JSON.stringify(after.reports[0]) !== JSON.stringify(before.reports[0])) {
    const rep = after.reports[0];
    notify(reportTitle(rep), "Nouveau rapport disponible dans l'onglet Rapports.");
    if (rep.kind === "evenement") sfx("notify");
    else sfx(rep.win ? "win" : "lose");
  }
}

export function useGame() {
  const [game, setGame] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const saveTimer = useRef(null);
  const gameRef = useRef(null);
  gameRef.current = game;

  // ---- Chargement initial ----
  useEffect(() => {
    let loaded = null;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch (e) {}
    setGame(applyElapsed(loaded || newGameState(), Date.now()));
  }, []);

  // ---- Tick 1s : simulation temporelle ----
  useEffect(() => {
    const id = setInterval(() => {
      setNowTick(Date.now());
      setGame((g) => {
        if (!g) return g;
        const next = applyElapsed(g, Date.now());
        notifyCompletions(g, next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ---- Sauvegarde débounced (2s) ----
  // Le tick 1s change `game` en continu : un debounce classique (clearTimeout à
  // chaque changement) ne se déclencherait donc jamais. On programme au plus une
  // sauvegarde par fenêtre de 2s et on écrit toujours l'état le plus frais (gameRef).
  useEffect(() => {
    if (!game) return;
    if (saveTimer.current) return;
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(gameRef.current)); } catch (e) {}
      saveTimer.current = null;
    }, 2000);
  }, [game]);

  // ---- Sauvegarde immédiate à la fermeture / mise en arrière-plan ----
  useEffect(() => {
    const flush = () => {
      if (!gameRef.current) return;
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(gameRef.current)); } catch (e) {}
    };
    const onVisibility = () => { if (document.hidden) flush(); };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const startUpgrade = useCallback((key) => {
    setGame((g) => {
      if (!g) return g;
      const isl = g.islands[g.activeIsland];
      const queue = isl.queue || [];
      if (queue.length >= buildSlots(isl.buildings.senat)) return g;
      // Niveau visé en tenant compte des améliorations déjà en file sur ce
      // même bâtiment (le coût suit donc la progression, pas le niveau actuel).
      const pending = queue.filter((q) => q.key === key).length;
      const level = isl.buildings[key] + pending;
      if (BUILDINGS[key].maxLevel && level >= BUILDINGS[key].maxLevel) return g;
      const req = BUILDINGS[key].requires;
      if (req && Object.keys(req).some((rq) => isl.buildings[rq] < req[rq])) return g;
      const cost = upgradeCost(key, level);
      if (!RES.every((r) => g.resources[r] >= cost[r])) return g;
      const s = JSON.parse(JSON.stringify(g));
      RES.forEach((r) => (s.resources[r] -= cost[r]));
      const q = s.islands[s.activeIsland].queue;
      const entry = { key, targetLevel: level + 1, endsAt: null };
      // Le premier de la file démarre tout de suite ; les suivants attendent
      // leur tour (le moteur leur donnera un endsAt à ce moment-là).
      if (q.length === 0) {
        entry.endsAt = Date.now() + buildDuration(key, level, isl.buildings.senat) * 1000;
      }
      q.push(entry);
      return s;
    });
  }, []);

  const buildShip = useCallback((type) => {
    setGame((g) => {
      if (!g) return g;
      const bestPort = Math.max(...g.islands.map((i) => i.buildings.port));
      if ((g.shipQueue || []).length >= shipSlots(bestPort)) return g;
      const ship = SHIPS[type];
      if (bestPort < ship.requiresPort) return g;
      if (!RES.every((r) => g.resources[r] >= ship.cost[r])) return g;
      const s = JSON.parse(JSON.stringify(g));
      RES.forEach((r) => (s.resources[r] -= ship.cost[r]));
      const fShip = (g.faction && FACTIONS[g.faction].shipSpeed) || 1;
      const entry = { type, endsAt: null };
      if (s.shipQueue.length === 0) {
        entry.endsAt = Date.now() + ship.duration * 1000 * SPEED * fShip;
      }
      s.shipQueue.push(entry);
      return s;
    });
  }, []);

  const recruitTroop = useCallback((type, count) => {
    setGame((g) => {
      if (!g) return g;
      const bestCaserne = Math.max(...g.islands.map((i) => i.buildings.caserne));
      if ((g.troopQueue || []).length >= troopSlots(bestCaserne)) return g;
      const t = TROOPS[type];
      if (bestCaserne < t.requiresCaserne) return g;
      const totalCost = {};
      RES.forEach((r) => (totalCost[r] = t.cost[r] * count));
      if (!RES.every((r) => g.resources[r] >= totalCost[r])) return g;
      const s = JSON.parse(JSON.stringify(g));
      RES.forEach((r) => (s.resources[r] -= totalCost[r]));
      const fTroop = (g.faction && FACTIONS[g.faction].troopSpeed) || 1;
      const entry = { type, remaining: count, nextAt: null };
      if (s.troopQueue.length === 0) {
        entry.nextAt = Date.now() + t.duration * 1000 * SPEED * fTroop;
      }
      s.troopQueue.push(entry);
      return s;
    });
  }, []);

  const startExplore = useCallback((px, py) => {
    setGame((g) => {
      if (!g || g.ships.explorateur < 1) return g;
      const key = rk(g.region, px, py);
      if (g.explored[key] || g.exploringTiles.some((e) => e.key === key)) return g;
      const dist = absDist(g.islands[0].region, g.islands[0].pos, g.region, px, py);
      const fTravel = (g.faction && FACTIONS[g.faction].travelSpeed) || 1;
      const oneWayMs = (5 + dist * 6) * 1000 * SPEED * fTravel;
      const s = JSON.parse(JSON.stringify(g));
      s.ships.explorateur -= 1;
      s.exploringTiles.push({ key, arriveAt: Date.now() + oneWayMs, endsAt: Date.now() + oneWayMs * 2 });
      return s;
    });
  }, []);

  const startColonize = useCallback((px, py) => {
    setGame((g) => {
      if (!g || g.colonizingTile || g.ships.colonisation < 1) return g;
      const key = rk(g.region, px, py);
      if (!g.explored[key] || g.colonized[key]) return g;
      const st = tileState(g.region.gx, g.region.gy, px, py);
      const colonisable = st === "ile_vide" || (st === "ile_inactive" && g.conquered[key]);
      if (!colonisable) return g;
      const dist = absDist(g.islands[0].region, g.islands[0].pos, g.region, px, py);
      const s = JSON.parse(JSON.stringify(g));
      s.ships.colonisation -= 1;
      const fTravelC = (g.faction && FACTIONS[g.faction].travelSpeed) || 1;
      s.colonizingTile = { key, region: { ...g.region }, endsAt: Date.now() + (15 + dist * 10) * 1000 * SPEED * fTravelC };
      return s;
    });
  }, []);

  const startAttack = useCallback((px, py, sending) => {
    setGame((g) => {
      if (!g || g.attack || g.ships.transport < 1) return g;
      const hasSiege = Object.keys(sending).some((t) => TROOPS[t].siege && sending[t] > 0);
      if (hasSiege && g.ships.siege < 1) return g;
      const key = rk(g.region, px, py);
      if (!g.explored[key] || g.colonized[key] || g.conquered[key]) return g;
      const st = tileState(g.region.gx, g.region.gy, px, py);
      if (st !== "ile_inactive" && st !== "ile_joueur") return g;
      const total = Object.values(sending).reduce((a, n) => a + n, 0);
      if (total < 1 || !Object.keys(sending).every((t) => g.troops[t] >= sending[t])) return g;
      const dist = absDist(g.islands[0].region, g.islands[0].pos, g.region, px, py);
      const fTravelA = (g.faction && FACTIONS[g.faction].travelSpeed) || 1;
      const oneWayMs = (8 + dist * 8) * 1000 * SPEED * fTravelA;
      const s = JSON.parse(JSON.stringify(g));
      Object.keys(sending).forEach((t) => (s.troops[t] -= sending[t]));
      s.ships.transport -= 1;
      if (hasSiege) s.ships.siege -= 1;
      s.attack = { key, troops: sending, withSiege: hasSiege, resolved: false, report: null, arriveAt: Date.now() + oneWayMs, endsAt: Date.now() + oneWayMs * 2 };
      return s;
    });
  }, []);

  const acceptMarketOffer = useCallback((offerId) => {
    setGame((g) => {
      if (!g) return g;
      const offer = (g.marketOffers || []).find((o) => o.id === offerId);
      if (!offer || offer.author !== "bot" || !ownsWantBasket(g, offer.want)) return g;
      const s = JSON.parse(JSON.stringify(g));
      debitBasket(s, offer.want);
      creditOffer(s, offer.give.kind, offer.give.key, offer.give.amt);
      s.marketOffers = s.marketOffers.filter((o) => o.id !== offerId);
      s.stats.tradesDone = (s.stats.tradesDone || 0) + 1;
      // Rapport immédiat : sans ça, accepter une offre est silencieux (l'offre
      // disparaît juste de la liste) et donne l'impression que rien ne s'est
      // passé, surtout si le gain se noie dans un gros stock déjà affiché arrondi.
      s.reports.unshift({ kind: "marche_achat", paid: offer.want, received: offer.give, at: Date.now() });
      s.reports = s.reports.slice(0, 8);
      return s;
    });
  }, []);

  // give = { kind, key, amt } ; want = [{ kind, key, amt }, ...] (1 ou 2
  // entrées, un panier de plusieurs ressources n'étant permis que si want ne
  // contient que des ressources — jamais troupe/navire des deux côtés, ni
  // plusieurs troupes/navires dans le panier).
  const postMarketOffer = useCallback((give, want) => {
    setGame((g) => {
      if (!g) return g;
      if (give.amt <= 0 || want.length < 1 || want.length > 2) return g;
      if (want.some((w) => w.amt <= 0)) return g;
      const hasNonRes = want.some((w) => w.kind !== "res");
      if (hasNonRes && (want.length > 1 || give.kind !== "res")) return g;
      if (want.some((w) => w.kind === give.kind && w.key === give.key)) return g;
      const keys = want.map((w) => w.kind + ":" + w.key);
      if (new Set(keys).size !== keys.length) return g;
      const bestMarche = Math.max(...g.islands.map((i) => i.buildings.marche));
      if (bestMarche < 1 || ownedAmt(g, give.kind, give.key) < give.amt) return g;
      if ((g.marketOffers || []).length >= MARKET_OFFERS_MAX) return g;
      const s = JSON.parse(JSON.stringify(g));
      debitOffer(s, give.kind, give.key, give.amt);
      const now = Date.now();
      s.marketOffers.push({
        id: `player-${now}-${Math.floor(Math.random() * 1e6)}`,
        author: "player", botName: null,
        give, want,
        postedAt: now, expiresAt: null,
        fillAt: now + Math.round(MARKET_PLAYER_FILL_MS * (0.7 + Math.random() * 0.6)),
      });
      return s;
    });
  }, []);

  const cancelMarketOffer = useCallback((offerId) => {
    setGame((g) => {
      if (!g) return g;
      const offer = (g.marketOffers || []).find((o) => o.id === offerId);
      if (!offer || offer.author !== "player") return g;
      const s = JSON.parse(JSON.stringify(g));
      creditOffer(s, offer.give.kind, offer.give.key, offer.give.amt);
      s.marketOffers = s.marketOffers.filter((o) => o.id !== offerId);
      return s;
    });
  }, []);

  const assignEsclave = useCallback((delta) => {
    setGame((g) => {
      if (!g) return g;
      const s = JSON.parse(JSON.stringify(g));
      const isl = s.islands[s.activeIsland];
      const assigned = s.islands.reduce((a, i) => a + (i.esclaves || 0), 0);
      const free = s.esclaves - assigned;
      if (delta > 0 && free < 1) return g;
      if (delta < 0 && (isl.esclaves || 0) < 1) return g;
      isl.esclaves = (isl.esclaves || 0) + delta;
      return s;
    });
  }, []);

  const startSpy = useCallback((px, py) => {
    setGame((g) => {
      if (!g || g.ships.eclaireur < 1) return g;
      const key = rk(g.region, px, py);
      if (!g.explored[key] || g.colonized[key] || g.spied[key]) return g;
      if (g.spyMissions.some((m) => m.key === key)) return g;
      const st = tileState(g.region.gx, g.region.gy, px, py);
      if (st !== "ile_inactive" && st !== "ile_joueur") return g;
      const dist = absDist(g.islands[0].region, g.islands[0].pos, g.region, px, py);
      const fT = (g.faction && FACTIONS[g.faction].travelSpeed) || 1;
      const oneWayMs = (4 + dist * 5) * 1000 * SPEED * fT;
      const s = JSON.parse(JSON.stringify(g));
      s.ships.eclaireur -= 1;
      s.spyMissions.push({ key, arriveAt: Date.now() + oneWayMs, endsAt: Date.now() + oneWayMs * 2 });
      return s;
    });
  }, []);

  const tradeEvent = useCallback((amount) => {
    setGame((g) => {
      if (!g || !g.activeEvent || g.activeEvent.type !== "marchand") return g;
      if (g.resources[g.activeEvent.from] < amount) return g;
      const s = JSON.parse(JSON.stringify(g));
      s.resources[s.activeEvent.from] -= amount;
      s.resources[s.activeEvent.to] += amount; // échange 1:1, l'aubaine
      return s;
    });
  }, []);

  const claimMission = useCallback((id) => {
    setGame((g) => {
      if (!g || g.claimedMissions[id]) return g;
      const m = MISSIONS.find((x) => x.id === id);
      if (!m || !m.check(g)) return g;
      const s = JSON.parse(JSON.stringify(g));
      RES.forEach((r) => (s.resources[r] += m.reward[r] || 0));
      s.claimedMissions[id] = true;
      return s;
    });
  }, []);

  const renameIsland = useCallback((id, name) => {
    setGame((g) => {
      if (!g) return g;
      const clean = (name || "").trim().slice(0, 22);
      if (!clean) return g;
      const s = JSON.parse(JSON.stringify(g));
      const isl2 = s.islands.find((i) => i.id === id);
      if (isl2) isl2.name = clean;
      return s;
    });
  }, []);

  const exportSave = useCallback(() => {
    const g = gameRef.current;
    if (!g) return "";
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(g))));
    } catch (e) {
      return "erreur d'export";
    }
  }, []);

  const importSave = useCallback((importCode) => {
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(importCode.trim()))));
      if (!parsed || !parsed.islands || !parsed.resources) throw new Error("format");
      const restored = applyElapsed(parsed, Date.now());
      setGame(restored);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(restored)); } catch (e) {}
      return { ok: true, message: "Sauvegarde restaurée." };
    } catch (e) {
      return { ok: false, message: "Code invalide — vérifie le copier-coller." };
    }
  }, []);

  const resetGame = useCallback(() => {
    const fresh = newGameState();
    setGame(fresh);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(fresh)); } catch (e) {}
  }, []);

  const chooseFaction = useCallback((fk) => {
    setGame((g) => ({ ...g, faction: fk }));
  }, []);

  return {
    game, setGame, nowTick,
    startUpgrade, buildShip, recruitTroop, startExplore, startColonize, startAttack,
    acceptMarketOffer, postMarketOffer, cancelMarketOffer, assignEsclave, startSpy, tradeEvent, claimMission, renameIsland,
    exportSave, importSave, resetGame, chooseFaction,
  };
}
