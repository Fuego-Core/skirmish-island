import { useCallback, useEffect, useRef, useState } from "react";
import { RES, SPEED } from "../game/constants.js";
import { BUILDINGS, upgradeCost, buildDuration } from "../game/buildings.js";
import { SHIPS } from "../game/ships.js";
import { TROOPS } from "../game/troops.js";
import { FACTIONS } from "../game/factions.js";
import { MISSIONS } from "../game/missions.js";
import { rk, tileState, absDist } from "../game/world.js";
import { newGameState } from "../game/state.js";
import { applyElapsed } from "../game/engine.js";
import { notify } from "../ui/notifications.js";

const SAVE_KEY = "skirmish-save";

// Titre lisible pour un rapport fraîchement ajouté (même logique que ReportsTab).
function reportTitle(rep) {
  if (rep.kind === "evenement") return rep.titre;
  if (rep.kind === "defense") return rep.win ? "Raid repoussé" : "Raid pirate subi";
  return rep.win ? "Victoire" : "Défaite";
}

// Compare l'état avant/après un tick et notifie les chantiers/flottes qui
// viennent de se terminer, ainsi que tout nouveau rapport (combat ou événement).
function notifyCompletions(before, after) {
  before.islands.forEach((isl, i) => {
    const nextIsl = after.islands[i];
    if (isl.queue && nextIsl && !nextIsl.queue) {
      notify("Chantier terminé", `${BUILDINGS[isl.queue.key].label} — niveau ${isl.queue.targetLevel} atteint sur ${isl.name}.`);
    }
  });
  if (before.shipQueue && !after.shipQueue) {
    notify("Navire prêt", `${SHIPS[before.shipQueue.type].label} a rejoint ta flotte.`);
  }
  if (before.troopQueue && !after.troopQueue) {
    notify("Troupes recrutées", `${TROOPS[before.troopQueue.type].label} — recrutement terminé.`);
  }
  if (after.reports.length > 0 && JSON.stringify(after.reports[0]) !== JSON.stringify(before.reports[0])) {
    notify(reportTitle(after.reports[0]), "Nouveau rapport disponible dans l'onglet Rapports.");
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
      if (isl.queue) return g;
      const level = isl.buildings[key];
      if (BUILDINGS[key].maxLevel && level >= BUILDINGS[key].maxLevel) return g;
      const req = BUILDINGS[key].requires;
      if (req && Object.keys(req).some((rq) => isl.buildings[rq] < req[rq])) return g;
      const cost = upgradeCost(key, level);
      if (!RES.every((r) => g.resources[r] >= cost[r])) return g;
      const s = JSON.parse(JSON.stringify(g));
      RES.forEach((r) => (s.resources[r] -= cost[r]));
      const dur = buildDuration(key, level, isl.buildings.senat);
      s.islands[s.activeIsland].queue = { key, targetLevel: level + 1, endsAt: Date.now() + dur * 1000 };
      return s;
    });
  }, []);

  const buildShip = useCallback((type) => {
    setGame((g) => {
      if (!g || g.shipQueue) return g;
      const ship = SHIPS[type];
      const bestPort = Math.max(...g.islands.map((i) => i.buildings.port));
      if (bestPort < ship.requiresPort) return g;
      if (!RES.every((r) => g.resources[r] >= ship.cost[r])) return g;
      const s = JSON.parse(JSON.stringify(g));
      RES.forEach((r) => (s.resources[r] -= ship.cost[r]));
      const fShip = (g.faction && FACTIONS[g.faction].shipSpeed) || 1;
      s.shipQueue = { type, endsAt: Date.now() + ship.duration * 1000 * SPEED * fShip };
      return s;
    });
  }, []);

  const recruitTroop = useCallback((type, count) => {
    setGame((g) => {
      if (!g || g.troopQueue) return g;
      const t = TROOPS[type];
      const bestCaserne = Math.max(...g.islands.map((i) => i.buildings.caserne));
      if (bestCaserne < t.requiresCaserne) return g;
      const totalCost = {};
      RES.forEach((r) => (totalCost[r] = t.cost[r] * count));
      if (!RES.every((r) => g.resources[r] >= totalCost[r])) return g;
      const s = JSON.parse(JSON.stringify(g));
      RES.forEach((r) => (s.resources[r] -= totalCost[r]));
      const fTroop = (g.faction && FACTIONS[g.faction].troopSpeed) || 1;
      s.troopQueue = { type, remaining: count, nextAt: Date.now() + t.duration * 1000 * SPEED * fTroop };
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

  const tradeMarket = useCallback((from, to, amount) => {
    setGame((g) => {
      if (!g || from === to) return g;
      const bestMarche = Math.max(...g.islands.map((i) => i.buildings.marche));
      if (bestMarche < 1 || g.resources[from] < amount) return g;
      const s = JSON.parse(JSON.stringify(g));
      s.resources[from] -= amount;
      s.resources[to] += Math.floor(amount / 1.5);
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
    tradeMarket, assignEsclave, startSpy, tradeEvent, claimMission, renameIsland,
    exportSave, importSave, resetGame, chooseFaction,
  };
}
