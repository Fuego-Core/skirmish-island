import { C, RES } from "../game/constants.js";
import { TROOPS } from "../game/troops.js";
import { SPEED } from "../game/constants.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, QueueCard, Btn, CostRow, fmtTime } from "../ui/kit.jsx";

export function ArmyTab({ game, nowTick, bestCaserne, armyPower, upkeep, recruitTroop }) {
  return (
    <>
      <Card style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
          <I name="epees" size={15} color={C.gold} />
          Puissance : <span style={{ fontFamily: "monospace", color: C.goldHi }}>{armyPower}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
          <I name="ble" size={15} color={upkeep > 0 ? C.bad : C.textDim} />
          <span style={{ fontFamily: "monospace", color: upkeep > 0 ? C.bad : C.textDim }}>−{upkeep}/h</span>
        </span>
      </Card>
      {game.troopQueue && (
        <div style={{ marginTop: 8 }}>
          <QueueCard icon={game.troopQueue.type} label={`${TROOPS[game.troopQueue.type].label} — reste ×${game.troopQueue.remaining}`} remaining={fmtTime(game.troopQueue.nextAt - nowTick)} />
        </div>
      )}
      {bestCaserne === 0 && (
        <Card style={{ borderColor: C.bad, marginTop: 8, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>Érige une Caserne (Sénat niv. 2 requis) pour lever des troupes.</span>
        </Card>
      )}
      <SectionTitle>Unités</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.keys(TROOPS).map((type) => {
          const t = TROOPS[type];
          const caserneOk = bestCaserne >= t.requiresCaserne;
          const busy = !!game.troopQueue;
          return (
            <Card key={type}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                  <I name={type} size={19} color={C.goldHi} />
                  {t.label} <span style={{ fontFamily: "monospace", fontSize: 11, color: C.gold }}>×{game.troops[type]}</span>
                </span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: C.textDim }}>atq {t.atk} · déf {t.def} · −{t.upkeep} blé/h</span>
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 7, fontStyle: "italic" }}>
                {t.desc}{!caserneOk && <span style={{ color: C.bad, fontStyle: "normal" }}> — Caserne niv. {t.requiresCaserne} requise</span>}
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
