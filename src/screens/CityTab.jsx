import { C, RES, RES_ICONN, GROUP_COLOR } from "../game/constants.js";
import { BUILDINGS, GROUPS, B_ICON } from "../game/buildings.js";
import { upgradeCost } from "../game/buildings.js";
import { I } from "../ui/Icon.jsx";
import { CityScene } from "../ui/CityScene.jsx";
import { Card, QueueCard, Btn, fmtTime, fmtNum } from "../ui/kit.jsx";
import { haptic } from "../ui/haptics.js";
import { BUILDING_PORTRAITS } from "../ui/buildingPortraits.js";

function BuildingIcon({ bKey, col, active }) {
  if (BUILDING_PORTRAITS[bKey]) {
    return (
      <div style={{
        width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
        border: `1.5px solid ${active ? col + "aa" : C.borderSoft}`, boxShadow: "0 2px 6px rgba(0,0,0,0.45)",
        opacity: active ? 1 : 0.55,
      }}>
        <img src={BUILDING_PORTRAITS[bKey]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return <I name={B_ICON[bKey]} size={25} color={active ? col : C.textFaint} sw={1.6} />;
}

export function CityTab({
  game, nowTick, isl, openBuilding, setOpenBuilding, onSelectIsland,
  tradeEvent, visibleMissions, onOpenMissions, assignEsclave, freeEsclaves,
}) {
  return (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>
        {game.islands.map((i, idx) => (
          <button key={i.id} onClick={() => onSelectIsland(idx)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 13px", borderRadius: 18, fontSize: 11, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 0.5, cursor: "pointer",
              background: idx === game.activeIsland ? "rgba(201,161,59,0.13)" : C.panel,
              border: `1px solid ${idx === game.activeIsland ? C.gold : C.borderSoft}`,
              color: idx === game.activeIsland ? C.goldHi : C.textDim,
            }}>
            <I name="ile" size={13} color={idx === game.activeIsland ? C.goldHi : C.textDim} />
            {i.name}
          </button>
        ))}
      </div>

      {game.activeEvent && game.activeEvent.type === "marchand" && (
        <Card style={{ borderColor: C.gold, marginBottom: 10, padding: "11px 15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.goldHi }}>
              <I name="marche" size={15} color={C.goldHi} />
              Marchand ambulant — échange 1 pour 1 !
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: C.gold }}>{fmtTime(game.activeEvent.endsAt - nowTick)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: C.textDim }}>
              <I name={RES_ICONN[game.activeEvent.from]} size={13} color={C.textDim} /> →
              <I name={RES_ICONN[game.activeEvent.to]} size={13} color={C.goldHi} />
            </span>
            {[500, 2000, 8000].map((amt) => (
              <Btn key={amt} small label={fmtNum(amt)}
                disabled={game.resources[game.activeEvent.from] < amt}
                onClick={() => tradeEvent(amt)} />
            ))}
          </div>
        </Card>
      )}
      {visibleMissions.length > 0 && (() => {
        const next = visibleMissions.find((m) => m.done) || visibleMissions[0];
        return (
          <button onClick={onOpenMissions}
            style={{
              width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: next.done ? "rgba(201,161,59,0.12)" : `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`,
              border: `1px solid ${next.done ? C.gold : C.borderSoft}`, borderRadius: 10,
              padding: "10px 14px", marginBottom: 10, cursor: "pointer", color: C.text, textAlign: "left",
            }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, minWidth: 0 }}>
              <I name="laurier" size={16} color={C.goldHi} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {next.done ? "Mission accomplie : " : "Mission : "}<span style={{ color: next.done ? C.goldHi : C.textDim }}>{next.label}</span>
              </span>
            </span>
            <span style={{ fontSize: 10, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1, color: next.done ? C.goldHi : C.textFaint, flexShrink: 0 }}>
              {next.done ? "RÉCLAMER ›" : "VOIR ›"}
            </span>
          </button>
        );
      })()}

      <div style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 12, overflow: "hidden", marginBottom: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.35)" }}>
        <CityScene isl={isl} openKey={openBuilding} goldHi={C.goldHi}
          onTap={(key) => { haptic(9); setOpenBuilding(key); }} />
      </div>

      {isl.queue && (
        <QueueCard icon={B_ICON[isl.queue.key]} label={`${BUILDINGS[isl.queue.key].label} → niv. ${isl.queue.targetLevel}`} remaining={fmtTime(isl.queue.endsAt - nowTick)} />
      )}

      <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <I name="esclaves" size={15} color={C.gold} />
          Esclaves ici : <span style={{ fontFamily: "monospace", color: C.gold }}>{isl.esclaves || 0}</span>
          <span style={{ fontSize: 10, color: C.textDim }}>(+{Math.min((isl.esclaves || 0) * 3, 60)}% · {freeEsclaves} libres)</span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => assignEsclave(-1)} style={{ width: 26, height: 26, borderRadius: 6, background: C.panelUp, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer" }}>−</button>
          <button onClick={() => assignEsclave(1)} style={{ width: 26, height: 26, borderRadius: 6, background: C.panelUp, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer" }}>+</button>
        </div>
      </Card>

      {GROUPS.map(([gKey, gLabel]) => {
        const col = GROUP_COLOR[gKey];
        return (
          <div key={gKey}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "22px 2px 12px" }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: col, boxShadow: `0 0 7px ${col}` }} />
              <span style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: col }}>{gLabel}</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${col}55, transparent)` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
              {Object.keys(BUILDINGS).filter((k) => BUILDINGS[k].group === gKey).map((key) => {
                const b = BUILDINGS[key];
                const level = isl.buildings[key];
                const cost = upgradeCost(key, level);
                const req = b.requires;
                const reqOk = !req || Object.keys(req).every((rq) => isl.buildings[rq] >= req[rq]);
                const canAfford = RES.every((r) => game.resources[r] >= cost[r]);
                const maxed = b.maxLevel && level >= b.maxLevel;
                const ready = reqOk && canAfford && !isl.queue && !maxed;
                const inProgress = isl.queue && isl.queue.key === key;
                return (
                  <button key={key} onClick={() => { haptic(9); setOpenBuilding(key); }}
                    style={{
                      position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "13px 5px 11px", borderRadius: 11, cursor: "pointer", color: C.text,
                      background: level > 0 ? `linear-gradient(180deg, ${col}22, ${C.panel})` : C.ghost,
                      border: `1px solid ${inProgress ? C.goldHi : level > 0 ? col + "66" : C.borderSoft}`,
                      opacity: reqOk ? 1 : 0.45,
                    }}>
                    <BuildingIcon bKey={key} col={col} active={level > 0} />
                    <span style={{ fontSize: 10, textAlign: "center", lineHeight: 1.2, color: level > 0 ? C.text : C.textFaint }}>{b.label}</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: level > 0 ? col : C.textFaint }}>
                      {maxed ? "MAX" : level > 0 ? `niv. ${level}` : "à bâtir"}
                    </span>
                    {ready && (
                      <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, background: C.goldHi, boxShadow: `0 0 6px ${C.goldHi}` }} />
                    )}
                    {inProgress && (
                      <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, background: C.goldHi }}>
                        <span style={{ display: "block", width: "100%", height: "100%", borderRadius: 4, background: C.goldHi, animation: "pulse 1.1s infinite" }} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
