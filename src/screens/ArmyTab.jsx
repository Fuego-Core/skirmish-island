import { C, RES } from "../game/constants.js";
import { TROOPS } from "../game/troops.js";
import { SPEED } from "../game/constants.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, QueueCard, Btn, CostRow, fmtTime } from "../ui/kit.jsx";
import troopHoplite from "../assets/images/troops/troop-hoplite.webp";
import troopArcher from "../assets/images/troops/troop-archer.webp";
import troopCavalier from "../assets/images/troops/troop-cavalier.webp";
import troopBelier from "../assets/images/troops/troop-belier.webp";
import troopCatapulte from "../assets/images/troops/troop-catapulte.webp";

const TROOP_PORTRAITS = { hoplite: troopHoplite, archer: troopArcher, cavalier: troopCavalier, belier: troopBelier, catapulte: troopCatapulte };

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
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {Object.keys(TROOPS).map((type) => {
          const t = TROOPS[type];
          const caserneOk = bestCaserne >= t.requiresCaserne;
          const busy = !!game.troopQueue;
          return (
            <Card key={type}>
              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <TroopPortrait type={type} dim={!caserneOk} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {t.label} <span style={{ fontFamily: "monospace", fontSize: 11, color: C.gold }}>×{game.troops[type]}</span>
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
