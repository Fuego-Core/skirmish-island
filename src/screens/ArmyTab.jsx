import { useState } from "react";
import { C, RES } from "../game/constants.js";
import { TROOPS, troopSlots, compositionBonus } from "../game/troops.js";
import { SPEED } from "../game/constants.js";
import { FACTIONS } from "../game/factions.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, SlotQueue, Btn, CostRow, fmtTime } from "../ui/kit.jsx";
import { TROOP_PORTRAITS } from "../ui/troopPortraits.js";
import { SimulatorSheet } from "../ui/sheets/SimulatorSheet.jsx";

const FAMILY_LABEL = { infantry: "Infanterie", ranged: "Tir", cavalry: "Cavalerie" };
const FAMILY_COLOR = { infantry: C.water, ranged: C.gold, cavalry: C.copper };

// Barre de composition + bonus/malus — rend visible la mécanique de mix
// d'armée (voir compositionBonus dans troops.js) plutôt que de la laisser
// invisible dans les formules de combat.
function CompositionBar({ troops }) {
  const shares = { infantry: 0, ranged: 0, cavalry: 0 };
  let total = 0;
  Object.keys(TROOPS).forEach((t) => {
    const def = TROOPS[t];
    if (def.siege) return;
    const power = (troops[t] || 0) * def.atk;
    shares[def.family] += power;
    total += power;
  });
  const bonus = compositionBonus(troops);
  const pct = Math.round((bonus - 1) * 100);
  if (total <= 0) {
    return (
      <Card style={{ marginBottom: 8, textAlign: "center" }}>
        <span style={{ fontSize: 11, color: C.textFaint, fontStyle: "italic" }}>Lève des troupes pour voir l'équilibre de ton armée.</span>
      </Card>
    );
  }
  return (
    <Card style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontSize: 11, color: C.textDim }}>Équilibre de l'armée</span>
        <span style={{ fontSize: 11.5, fontFamily: "monospace", fontWeight: 700, color: pct >= 0 ? C.ok : C.bad }}>
          {pct >= 0 ? "+" : ""}{pct}% au combat
        </span>
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
        {["infantry", "ranged", "cavalry"].map((f) => (
          <div key={f} style={{ width: `${(shares[f] / total) * 100}%`, background: FAMILY_COLOR[f] }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {["infantry", "ranged", "cavalry"].map((f) => (
          <span key={f} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9.5, color: C.textFaint }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: FAMILY_COLOR[f], display: "inline-block" }} />
            {FAMILY_LABEL[f]} {Math.round((shares[f] / total) * 100)}%
          </span>
        ))}
      </div>
      <div style={{ fontSize: 9.5, color: C.textFaint, marginTop: 7, fontStyle: "italic" }}>
        Un mix équilibré des 3 familles booste tes troupes au combat ; un empilement d'un seul type les pénalise.
      </div>
    </Card>
  );
}

function TroopPortrait({ type, dim }) {
  return (
    <div style={{
      width: 52, height: 52, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
      border: `1.5px solid ${C.goldHi}${dim ? "44" : "88"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
      opacity: dim ? 0.5 : 1,
    }}>
      <img src={TROOP_PORTRAITS[type]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

export function ArmyTab({ game, nowTick, bestCaserne, armyPower, upkeep, recruitTroop }) {
  const [showSimulator, setShowSimulator] = useState(false);
  const troopQueue = game.troopQueue || [];
  const fTroop = (game.faction && FACTIONS[game.faction].troopSpeed) || 1;
  // Décompte par case = temps avant que TOUT le lot de cette case soit levé
  // (cumul des lots devant elle + le reste du sien).
  let cumulEnds = nowTick;
  const troopQueueItems = troopQueue.map((q, i) => {
    const unitDur = TROOPS[q.type].duration * 1000 * SPEED * fTroop;
    cumulEnds = i === 0 ? q.nextAt + (q.remaining - 1) * unitDur : cumulEnds + q.remaining * unitDur;
    return { portrait: TROOP_PORTRAITS[q.type], icon: q.type, remaining: fmtTime(cumulEnds - nowTick) };
  });

  return (
    <>
      <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
          <I name="epees" size={15} color={C.gold} />
          Puissance : <span style={{ fontFamily: "monospace", color: C.goldHi }}>{armyPower}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
          <I name="ble" size={15} color={upkeep > 0 ? C.bad : C.textDim} />
          <span style={{ fontFamily: "monospace", color: upkeep > 0 ? C.bad : C.textDim }}>−{upkeep}/h</span>
        </span>
        <Btn small label="Simulateur" onClick={() => setShowSimulator(true)} />
      </Card>
      <SimulatorSheet open={showSimulator} onClose={() => setShowSimulator(false)} game={game} />
      <div style={{ marginTop: 8 }}>
        <CompositionBar troops={game.troops} />
      </div>
      {troopQueue.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <SlotQueue title="Caserne" slots={troopSlots(bestCaserne)} items={troopQueueItems} />
        </div>
      )}
      {bestCaserne === 0 && (
        <Card style={{ borderColor: C.bad, marginTop: 8, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>Érige une Caserne (Sénat niv. 2 requis) pour lever des troupes.</span>
        </Card>
      )}
      <SectionTitle>Unités</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {Object.keys(TROOPS).map((type) => {
          const t = TROOPS[type];
          const caserneOk = bestCaserne >= t.requiresCaserne;
          const busy = (game.troopQueue || []).length >= troopSlots(bestCaserne);
          return (
            <Card key={type}>
              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <TroopPortrait type={type} dim={!caserneOk} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                      {t.label} <span style={{ fontFamily: "monospace", fontSize: 11, color: C.gold }}>×{game.troops[type]}</span>
                      {t.family && (
                        <span style={{ fontSize: 8.5, padding: "1px 6px", borderRadius: 5, background: `${FAMILY_COLOR[t.family]}22`, color: FAMILY_COLOR[t.family], fontWeight: 700 }}>
                          {FAMILY_LABEL[t.family]}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 9.5, fontFamily: "monospace", color: C.textDim }}>atq {t.atk} · déf {t.def} · −{t.upkeep} blé/h</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 3, lineHeight: 1.3 }}>
                    {t.desc}{!caserneOk && <span style={{ color: C.bad }}> — Caserne niv. {t.requiresCaserne} requise</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <CostRow cost={t.cost} resources={game.resources} />
                <div style={{ display: "flex", gap: 5 }}>
                  <Btn small primary label={`Lever ×1 · ${fmtTime(t.duration * 1000 * SPEED)}`}
                    disabled={busy || !caserneOk || !RES.every((r) => game.resources[r] >= t.cost[r])}
                    onClick={() => recruitTroop(type, 1)} />
                  <Btn small label="×5"
                    disabled={busy || !caserneOk || !RES.every((r) => game.resources[r] >= t.cost[r] * 5)}
                    onClick={() => recruitTroop(type, 5)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
