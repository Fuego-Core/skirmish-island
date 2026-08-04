import { RES, SPEED, REGEN_MS, RAID_INTERVAL_MS, BOT_RAID_INTERVAL_MS, EVENT_INTERVAL_MS, MARCHAND_DUREE_MS, MARKET_OFFER_INTERVAL_MS, MARKET_OFFERS_MAX } from "./constants.js";
import { BUILDINGS, prodPerHour, storageCap, buildDuration } from "./buildings.js";
import { TROOPS } from "./troops.js";
import { SHIPS, PECHE_BLE_H } from "./ships.js";
import { FACTIONS } from "./factions.js";
import { tileState, regionDist } from "./world.js";
import { tilePower, botRaidPower, botName, knownBots } from "./bots.js";
import { generateBotOffer } from "./market.js";
import { freshBuildings } from "./state.js";

// ---- Migration des sauvegardes ----
// Les files étaient auparavant un seul chantier/commande à la fois (objet ou
// null) ; elles sont désormais des tableaux. On convertit à la volée pour ne
// pas perdre une partie en cours.
export function migrateQueues(s) {
  s.islands.forEach((isl) => {
    if (!Array.isArray(isl.queue)) isl.queue = isl.queue ? [isl.queue] : [];
  });
  if (!Array.isArray(s.shipQueue)) s.shipQueue = s.shipQueue ? [s.shipQueue] : [];
  if (!Array.isArray(s.troopQueue)) s.troopQueue = s.troopQueue ? [s.troopQueue] : [];
  return s;
}

// ---- Simulation du temps écoulé ----
export function applyElapsed(state, now) {
  const s = migrateQueues(JSON.parse(JSON.stringify(state)));
  const fShip = (s.faction && FACTIONS[s.faction] && FACTIONS[s.faction].shipSpeed) || 1;
  const fTroop = (s.faction && FACTIONS[s.faction] && FACTIONS[s.faction].troopSpeed) || 1;

  // Régénération : les îles pillées se repeuplent après un délai
  Object.keys(s.conquered).forEach((k) => {
    const ts = s.conquered[k] === true ? now : s.conquered[k];
    if (!s.colonized[k] && now - ts > REGEN_MS) delete s.conquered[k];
  });

  // Chantiers par île — file séquentielle : le suivant démarre à la fin du
  // précédent, y compris pour rattraper une longue absence hors ligne.
  s.islands.forEach((isl) => {
    let guard = 0;
    while (isl.queue.length > 0 && isl.queue[0].endsAt && now >= isl.queue[0].endsAt && guard < 50) {
      guard += 1;
      const done = isl.queue.shift();
      isl.buildings[done.key] = done.targetLevel;
      const next = isl.queue[0];
      if (next) {
        const dur = buildDuration(next.key, next.targetLevel - 1, isl.buildings.senat);
        next.endsAt = done.endsAt + dur * 1000;
      }
    }
  });
  // Chantier naval — même principe
  {
    let guard = 0;
    while (s.shipQueue.length > 0 && s.shipQueue[0].endsAt && now >= s.shipQueue[0].endsAt && guard < 60) {
      guard += 1;
      const done = s.shipQueue.shift();
      s.ships[done.type] += 1;
      const next = s.shipQueue[0];
      if (next) next.endsAt = done.endsAt + SHIPS[next.type].duration * 1000 * SPEED * fShip;
    }
  }
  // Recrutement — chaque entrée est un lot, les unités sortent une par une
  {
    let guard = 0;
    while (s.troopQueue.length > 0 && guard < 600) {
      const head = s.troopQueue[0];
      if (!head.nextAt || now < head.nextAt) break;
      guard += 1;
      s.troops[head.type] += 1;
      head.remaining -= 1;
      if (head.remaining <= 0) {
        const finishedAt = head.nextAt;
        s.troopQueue.shift();
        const next = s.troopQueue[0];
        if (next) next.nextAt = finishedAt + TROOPS[next.type].duration * 1000 * SPEED * fTroop;
      } else {
        head.nextAt += TROOPS[head.type].duration * 1000 * SPEED * fTroop;
      }
    }
  }
  // Explorations
  if (s.exploringTiles.length > 0) {
    s.exploringTiles.forEach((e) => {
      if (now >= e.arriveAt && !s.explored[e.key]) { s.explored[e.key] = true; s.stats.explorations += 1; }
    });
    const done = s.exploringTiles.filter((e) => now >= e.endsAt).length;
    if (done > 0) s.ships.explorateur += done;
    s.exploringTiles = s.exploringTiles.filter((e) => now < e.endsAt);
  }
  // Colonisation
  if (s.colonizingTile && now >= s.colonizingTile.endsAt) {
    const key = s.colonizingTile.key;
    const [pxs, pys] = key.split("|")[1].split(",").map(Number);
    const region = s.colonizingTile.region || { gx: 0, gy: 0 };
    s.islands.push({ id: s.nextIslandId, name: `Colonie ${s.islands.length}`, region, pos: { px: pxs, py: pys }, buildings: freshBuildings(false), queue: [], esclaves: 0 });
    s.colonized[key] = s.nextIslandId;
    s.nextIslandId += 1;
    s.colonizingTile = null;
  }
  // Attaque
  if (s.attack) {
    if (!s.attack.resolved && now >= s.attack.arriveAt) {
      const [regPart, coordPart] = s.attack.key.split("|");
      const [agx, agy] = regPart.split(":").map(Number);
      const [px, py] = coordPart.split(",").map(Number);
      const type = tileState(agx, agy, px, py);
      const defPower = s.conquered[s.attack.key] ? 0 : tilePower(agx, agy, px, py, type, now - (s.startedAt || now));
      const factionAtk = (s.faction && FACTIONS[s.faction] && FACTIONS[s.faction].atkBonus) || 1;
      const atkPower = Math.round(Object.keys(s.attack.troops).reduce((a, t) => a + s.attack.troops[t] * TROOPS[t].atk, 0) * factionAtk);
      const siegeBonus = Object.keys(s.attack.troops).reduce((a, t) => a + (TROOPS[t].siege ? s.attack.troops[t] * TROOPS[t].atk * 0.5 : 0), 0);
      const win = atkPower + siegeBonus > defPower;
      const losses = {}, survivors = {};
      Object.keys(s.attack.troops).forEach((t) => {
        const sent = s.attack.troops[t];
        const lossRate = win ? Math.min(0.9, defPower / ((atkPower + siegeBonus) * 2 || 1)) : 0.75;
        losses[t] = Math.min(sent, Math.round(sent * lossRate));
        survivors[t] = sent - losses[t];
      });
      let butin = null, esclavesGagnes = 0;
      if (win) {
        const mult = (type === "ile_joueur" ? 8 : 4) * (1 + regionDist({ gx: agx, gy: agy }) * 0.5);
        butin = {};
        RES.forEach((r) => (butin[r] = Math.round(defPower * mult * (0.7 + Math.random() * 0.6))));
        if (Math.random() < 0.45) esclavesGagnes = 1 + Math.floor(Math.random() * 3);
        s.conquered[s.attack.key] = now;
      }
      if (win) s.stats.wins += 1;
      s.attack.resolved = true;
      s.attack.report = {
        kind: "attaque", win, atkPower: atkPower + siegeBonus, defPower, losses, survivors, butin, esclavesGagnes,
        targetType: type, cible: type === "ile_joueur" ? botName(agx, agy, px, py) : null,
        key: s.attack.key, at: now,
      };
    }
    if (now >= s.attack.endsAt) {
      const rep = s.attack.report;
      if (rep) {
        Object.keys(rep.survivors).forEach((t) => (s.troops[t] += rep.survivors[t]));
        if (rep.butin) RES.forEach((r) => (s.resources[r] += rep.butin[r]));
        s.esclaves += rep.esclavesGagnes || 0;
        s.reports.unshift(rep);
        s.reports = s.reports.slice(0, 8);
      }
      s.ships.transport += 1;
      if (s.attack.withSiege) s.ships.siege += 1;
      s.attack = null;
    }
  }

  // ---- Espionnage ----
  if (s.spyMissions.length > 0) {
    s.spyMissions.forEach((m) => {
      if (now >= m.arriveAt && !s.spied[m.key]) {
        const [regPart, coordPart] = m.key.split("|");
        const [agx, agy] = regPart.split(":").map(Number);
        const [px, py] = coordPart.split(",").map(Number);
        const type = tileState(agx, agy, px, py);
        const def = tilePower(agx, agy, px, py, type, now - (s.startedAt || now));
        const mult = (type === "ile_joueur" ? 8 : 4) * (1 + regionDist({ gx: agx, gy: agy }) * 0.5);
        s.spied[m.key] = { def, butinMin: Math.round(def * mult * 0.7), butinMax: Math.round(def * mult * 1.3), at: now };
      }
    });
    const doneSpy = s.spyMissions.filter((m) => now >= m.endsAt).length;
    if (doneSpy > 0) s.ships.eclaireur += doneSpy;
    s.spyMissions = s.spyMissions.filter((m) => now < m.endsAt);
  }

  // ---- Événements aléatoires ----
  let evGuard = 0;
  while (s.nextEventAt && now >= s.nextEventAt && evGuard < 3) {
    evGuard += 1;
    const roll = Math.random();
    if (roll < 0.36) {
      // Marchand ambulant : échange 1:1 limité dans le temps
      const pool = [...RES];
      const from = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      const to = pool[Math.floor(Math.random() * pool.length)];
      s.activeEvent = { type: "marchand", from, to, endsAt: s.nextEventAt + MARCHAND_DUREE_MS };
      s.reports.unshift({ kind: "evenement", titre: "MARCHAND AMBULANT", icone: "marche", win: true, texte: `Un marchand propose un échange sans perte pendant un temps limité.`, at: s.nextEventAt });
    } else if (roll < 0.68) {
      // Tempête : toutes les flottes en mer sont retardées de 30%
      s.exploringTiles.forEach((e) => { const d = Math.round((e.endsAt - now) * 0.3); e.arriveAt += d; e.endsAt += d; });
      if (s.attack) { const d = Math.round((s.attack.endsAt - now) * 0.3); s.attack.arriveAt += d; s.attack.endsAt += d; }
      if (s.colonizingTile) { const d = Math.round((s.colonizingTile.endsAt - now) * 0.3); s.colonizingTile.endsAt += d; }
      s.spyMissions.forEach((m) => { const d = Math.round((m.endsAt - now) * 0.3); m.arriveAt += d; m.endsAt += d; });
      s.reports.unshift({ kind: "evenement", titre: "TEMPÊTE SUR L'ÉGÉE", icone: "explorateur", win: false, texte: "Poséidon gronde : toutes tes flottes en mer sont retardées.", at: s.nextEventAt });
    } else {
      // Naufrage : épave à récupérer — gain immédiat
      const gains = {};
      RES.forEach((r) => (gains[r] = Math.round(200 + Math.random() * 600)));
      RES.forEach((r) => (s.resources[r] += gains[r]));
      s.reports.unshift({ kind: "evenement", titre: "ÉPAVE ÉCHOUÉE", icone: "peche", win: true, texte: "Une épave s'est échouée sur tes côtes — sa cargaison est à toi.", gains, at: s.nextEventAt });
    }
    s.reports = s.reports.slice(0, 8);
    s.nextEventAt += Math.round(EVENT_INTERVAL_MS * (0.7 + Math.random() * 0.6));
  }
  if (s.activeEvent && now >= s.activeEvent.endsAt) s.activeEvent = null;

  // ---- Raids pirates ----
  let raidGuard = 0;
  while (s.nextRaidAt && now >= s.nextRaidAt && raidGuard < 4) {
    raidGuard += 1;
    const totalSenat = s.islands.reduce((a, i) => a + i.buildings.senat, 0);
    const troopAtk = Object.keys(TROOPS).reduce((a, t) => a + s.troops[t] * TROOPS[t].atk, 0);
    const pirate = Math.round((40 + totalSenat * 15 + troopAtk * 0.25) * (0.8 + Math.random() * 0.4));
    const wall = Math.max(...s.islands.map((i) => i.buildings.muraille || 0));
    const garrison = Math.round(
      Object.keys(TROOPS).reduce((a, t) => a + s.troops[t] * TROOPS[t].def, 0) * (1 + wall * 0.06)
    );
    const held = garrison >= pirate;
    const losses = {};
    Object.keys(TROOPS).forEach((t) => {
      const rate = held ? Math.min(0.2, pirate / ((garrison || 1) * 3)) : 0.3;
      losses[t] = Math.round(s.troops[t] * rate);
      s.troops[t] -= losses[t];
    });
    let vol = null;
    if (!held) {
      vol = {};
      RES.forEach((r) => {
        vol[r] = Math.round(s.resources[r] * 0.15);
        s.resources[r] -= vol[r];
      });
    } else {
      s.stats.raidsRepousses += 1;
    }
    s.reports.unshift({ kind: "defense", win: held, atkPower: garrison, defPower: pirate, losses, vol, wall, at: s.nextRaidAt });
    s.reports = s.reports.slice(0, 8);
    s.nextRaidAt += Math.round(RAID_INTERVAL_MS * (0.75 + Math.random() * 0.5));
  }

  // ---- Raids des cités rivales ----
  // Une cité rivale connue vient piller le joueur : même résolution que les
  // pirates, mais l'assaillant est nommé et sa force dépend de sa propre
  // montée en puissance (pas seulement de celle du joueur).
  if (!s.nextBotRaidAt) s.nextBotRaidAt = now + BOT_RAID_INTERVAL_MS;
  let botGuard = 0;
  while (now >= s.nextBotRaidAt && botGuard < 3) {
    botGuard += 1;
    const rivals = knownBots(s, s.nextBotRaidAt).filter((b) => !b.pillee);
    if (rivals.length === 0) {
      s.nextBotRaidAt += BOT_RAID_INTERVAL_MS;
      continue;
    }
    // Un des trois plus puissants rivaux connus mène l'assaut.
    const pick = rivals[Math.floor(Math.random() * Math.min(3, rivals.length))];
    const elapsed = s.nextBotRaidAt - (s.startedAt || s.nextBotRaidAt);
    const assault = Math.round(botRaidPower(pick.gx, pick.gy, pick.px, pick.py, elapsed) * (0.85 + Math.random() * 0.3));
    const wall = Math.max(...s.islands.map((i) => i.buildings.muraille || 0));
    const garrison = Math.round(
      Object.keys(TROOPS).reduce((a, t) => a + s.troops[t] * TROOPS[t].def, 0) * (1 + wall * 0.06)
    );
    const held = garrison >= assault;
    const losses = {};
    Object.keys(TROOPS).forEach((t) => {
      const rate = held ? Math.min(0.2, assault / ((garrison || 1) * 3)) : 0.3;
      losses[t] = Math.round(s.troops[t] * rate);
      s.troops[t] -= losses[t];
    });
    let vol = null;
    if (!held) {
      vol = {};
      RES.forEach((r) => {
        vol[r] = Math.round(s.resources[r] * 0.12);
        s.resources[r] -= vol[r];
      });
    } else {
      s.stats.raidsRepousses += 1;
    }
    s.reports.unshift({
      kind: "defense", win: held, atkPower: garrison, defPower: assault,
      losses, vol, wall, attaquant: pick.name, at: s.nextBotRaidAt,
    });
    s.reports = s.reports.slice(0, 8);
    s.nextBotRaidAt += Math.round(BOT_RAID_INTERVAL_MS * (0.75 + Math.random() * 0.5));
  }

  // ---- Marché de l'Égée ----
  // Offres postées par les cités rivales connues et par le joueur — plus
  // d'échange automatique : chaque offre a un taux propre, se remplit après
  // un délai (côté joueur) ou expire (côté rival) si personne ne l'accepte.
  if (!s.marketOffers) s.marketOffers = [];
  if (!s.nextMarketOfferAt) s.nextMarketOfferAt = now + MARKET_OFFER_INTERVAL_MS;
  if (s.stats.tradesDone === undefined) s.stats.tradesDone = 0;
  s.marketOffers = s.marketOffers.filter((o) => !(o.author === "bot" && o.expiresAt && now >= o.expiresAt));
  s.marketOffers = s.marketOffers.filter((o) => {
    if (o.author === "player" && o.fillAt && now >= o.fillAt) {
      s.resources[o.wantRes] += o.wantAmt;
      s.stats.tradesDone += 1;
      s.reports.unshift({ kind: "marche", giveRes: o.giveRes, giveAmt: o.giveAmt, wantRes: o.wantRes, wantAmt: o.wantAmt, at: o.fillAt });
      s.reports = s.reports.slice(0, 8);
      return false;
    }
    return true;
  });
  let marketGuard = 0;
  while (now >= s.nextMarketOfferAt && marketGuard < 3) {
    marketGuard += 1;
    const offer = generateBotOffer(s, s.nextMarketOfferAt);
    if (offer && s.marketOffers.length < MARKET_OFFERS_MAX) s.marketOffers.push(offer);
    s.nextMarketOfferAt += Math.round(MARKET_OFFER_INTERVAL_MS * (0.7 + Math.random() * 0.6));
  }

  // ---- Économie ----
  const elapsedH = Math.max(0, (now - s.lastSeen) / 3600000);
  const capMain = s.islands.reduce((a, i) => a + storageCap(i.buildings.entrepot), 0);
  const capBle = s.islands.reduce((a, i) => a + storageCap(i.buildings.grenier), 0);
  const upkeep = Object.keys(TROOPS).reduce((a, t) => a + s.troops[t] * TROOPS[t].upkeep, 0);

  RES.forEach((r) => {
    const bKey = Object.keys(BUILDINGS).find((k) => BUILDINGS[k].produces === r);
    if (!bKey) return;
    let total = s.islands.reduce((a, i) => {
      const islMult = 1 + Math.min((i.esclaves || 0) * 0.03, 0.6);
      return a + prodPerHour(i.buildings[bKey]) * islMult;
    }, 0);
    if (r === "ble") total += (s.ships.peche || 0) * PECHE_BLE_H - upkeep;
    const cap = r === "ble" ? capBle : capMain;
    s.resources[r] = Math.max(0, Math.min(cap, s.resources[r] + total * elapsedH));
  });

  s.lastSeen = now;
  return s;
}
