import { useState } from "react";
import { C } from "../game/constants.js";
import { ISLAND_GRID, REGION_LIMIT, rk, tileState, tileColor } from "../game/world.js";
import { I } from "../ui/Icon.jsx";
import { QueueCard, fmtTime } from "../ui/kit.jsx";
import { haptic } from "../ui/haptics.js";

export function MapTab({ game, nowTick, selectedTileKey, setSelectedTileKey, onChangeRegion }) {
  const [showRegionMap, setShowRegionMap] = useState(false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <button onClick={() => setShowRegionMap((v) => !v)}
          style={{ padding: "5px 13px", borderRadius: 8, fontSize: 10, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1, background: showRegionMap ? "rgba(201,161,59,0.12)" : "transparent", border: `1px solid ${showRegionMap ? C.gold : C.border}`, color: showRegionMap ? C.goldHi : C.textDim, cursor: "pointer" }}>
          {showRegionMap ? "Fermer l'archipel" : "Voir l'archipel"}
        </button>
      </div>
      {showRegionMap && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ background: `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`, border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${REGION_LIMIT * 2 + 1}, 22px)`, gap: 2 }}>
              {Array.from({ length: REGION_LIMIT * 2 + 1 }).map((_, ry) =>
                Array.from({ length: REGION_LIMIT * 2 + 1 }).map((_, rx) => {
                  const rgx = rx - REGION_LIMIT, rgy = ry - REGION_LIMIT;
                  const isCurrent = rgx === game.region.gx && rgy === game.region.gy;
                  const hasIsland = game.islands.some((i) => i.region.gx === rgx && i.region.gy === rgy);
                  const distC = Math.max(Math.abs(rgx), Math.abs(rgy));
                  return (
                    <button key={`${rgx}:${rgy}`}
                      onClick={() => { onChangeRegion({ gx: rgx, gy: rgy }); setSelectedTileKey(null); setShowRegionMap(false); }}
                      title={`${rgx}:${rgy}`}
                      style={{
                        width: 22, height: 22, borderRadius: 4, padding: 0, cursor: "pointer",
                        background: isCurrent ? `linear-gradient(160deg, ${C.goldHi}, ${C.bronze})` : `rgba(42,101,132,${0.85 - distC * 0.12})`,
                        border: `1px solid ${isCurrent ? C.goldHi : C.bgDeep}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      {hasIsland && !isCurrent && <span style={{ width: 6, height: 6, borderRadius: 3, background: C.goldHi, display: "inline-block" }} />}
                      {isCurrent && <I name="ile" size={12} color={C.ink} sw={2.2} />}
                    </button>
                  );
                })
              )}
            </div>
            <div style={{ fontSize: 8, color: C.textFaint, fontFamily: "monospace", textAlign: "center", marginTop: 5 }}>
              Plus loin du centre = ennemis plus forts, butin plus riche
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
        {[["O", -1, 0], ["N", 0, -1], null, ["S", 0, 1], ["E", 1, 0]].map((d) =>
          d === null ? (
            <span key="pos" style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: 13, color: C.goldHi, padding: "0 10px", letterSpacing: 1 }}>
              {game.region.gx}:{game.region.gy}
            </span>
          ) : (() => {
            const [lbl, dx, dy] = d;
            const ngx = game.region.gx + dx, ngy = game.region.gy + dy;
            const ok2 = Math.abs(ngx) <= REGION_LIMIT && Math.abs(ngy) <= REGION_LIMIT;
            return (
              <button key={lbl} disabled={!ok2}
                onClick={() => { onChangeRegion({ gx: ngx, gy: ngy }); setSelectedTileKey(null); }}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 11, fontFamily: "'Cinzel', Georgia, serif",
                  background: ok2 ? "rgba(201,161,59,0.10)" : "transparent",
                  border: `1px solid ${ok2 ? C.gold : C.border}`,
                  color: ok2 ? C.gold : C.textFaint,
                  cursor: ok2 ? "pointer" : "not-allowed",
                }}>{lbl}</button>
            );
          })()
        )}
      </div>

      {game.exploringTiles.length > 0 && (
        <QueueCard icon="explorateur" label={`${game.exploringTiles.length} exploration${game.exploringTiles.length > 1 ? "s" : ""} en mer`} remaining={fmtTime(Math.min(...game.exploringTiles.map((e) => e.endsAt)) - nowTick)} />
      )}
      {game.colonizingTile && (
        <QueueCard icon="colonisation" label="Colons en route" remaining={fmtTime(game.colonizingTile.endsAt - nowTick)} />
      )}
      {game.spyMissions.length > 0 && (
        <QueueCard icon="eclaireur" label={`${game.spyMissions.length} nef${game.spyMissions.length > 1 ? "s" : ""} éclaireuse${game.spyMissions.length > 1 ? "s" : ""} en mission`} remaining={fmtTime(Math.min(...game.spyMissions.map((m) => m.endsAt)) - nowTick)} />
      )}
      {game.attack && (
        <QueueCard icon="transport" label={nowTick < game.attack.arriveAt ? "Flotte de guerre — aller" : "Flotte de guerre — retour"} remaining={fmtTime((nowTick < game.attack.arriveAt ? game.attack.arriveAt : game.attack.endsAt) - nowTick)} />
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ background: `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`, border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${ISLAND_GRID}, 36px)`, gap: 2 }}>
            {Array.from({ length: ISLAND_GRID }).map((_, py) =>
              Array.from({ length: ISLAND_GRID }).map((_, px) => {
                const key = rk(game.region, px, py);
                const isMine = !!game.colonized[key];
                const isExplored = !!game.explored[key];
                const exp = game.exploringTiles.find((e) => e.key === key);
                const isExploring = !!exp && nowTick < exp.arriveAt;
                const isColonizing = game.colonizingTile && game.colonizingTile.key === key;
                const isAttacking = game.attack && game.attack.key === key && nowTick < game.attack.arriveAt;
                const isConquered = !!game.conquered[key];
                const st = isMine ? "ma_ville" : isExplored ? tileState(game.region.gx, game.region.gy, px, py) : "fog";
                const isSelected = selectedTileKey === key;
                const tileIcon = isMine ? "senat" : isExploring ? "explorateur" : isColonizing ? "colonisation" : isAttacking ? "transport" : isConquered ? "drapeau" : null;
                return (
                  <button key={key} onClick={() => { haptic(6); setSelectedTileKey(key); }}
                    style={{
                      width: 36, height: 36, borderRadius: 5, padding: 0,
                      background: st === "ma_ville"
                        ? `linear-gradient(160deg, ${C.goldHi}, ${C.bronze})`
                        : `linear-gradient(160deg, ${tileColor(st)}, ${tileColor(st)}cc)`,
                      border: `1px solid ${isSelected ? C.goldHi : C.bgDeep}`,
                      boxShadow: isSelected ? `0 0 7px ${C.gold}` : "inset 0 1px 0 rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      opacity: isExploring || isColonizing ? 0.5 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {tileIcon && <I name={tileIcon} size={17} color={st === "ma_ville" ? C.ink : "#f0ead6"} sw={2} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 11, justifyContent: "center", marginTop: 10 }}>
        {[["fog", "Non exploré"], ["eau", "Mer"], ["ile_vide", "Vide"], ["ile_inactive", "Inactive"], ["ile_joueur", "Joueur"], ["ma_ville", "Tes cités"]].map(([k, label]) => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: C.textDim }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: k === "ma_ville" ? C.gold : tileColor(k), display: "inline-block" }} />{label}
          </span>
        ))}
      </div>
    </>
  );
}
