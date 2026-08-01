import { C, RES } from "../game/constants.js";
import { SHIPS, PECHE_BLE_H } from "../game/ships.js";
import { SPEED } from "../game/constants.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, QueueCard, Btn, CostRow, fmtTime } from "../ui/kit.jsx";

export function PortTab({ game, nowTick, bestPort, buildShip }) {
  return (
    <>
      {game.shipQueue && (
        <QueueCard icon={game.shipQueue.type} label={`${SHIPS[game.shipQueue.type].label} en chantier`} remaining={fmtTime(game.shipQueue.endsAt - nowTick)} />
      )}
      {bestPort === 0 && (
        <Card style={{ borderColor: C.bad, textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>Érige un Port (Sénat niv. 2 requis) pour armer des nefs.</span>
        </Card>
      )}
      <SectionTitle>Flotte</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.keys(SHIPS).map((type) => {
          const ship = SHIPS[type];
          const portOk = bestPort >= ship.requiresPort;
          const busy = !!game.shipQueue;
          return (
            <Card key={type}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                  <I name={type} size={19} color={C.goldHi} />
                  {ship.label} <span style={{ fontFamily: "monospace", fontSize: 11, color: C.gold }}>×{game.ships[type]}</span>
                </span>
                {type === "peche" && game.ships.peche > 0 && (
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: C.ok }}>+{game.ships.peche * PECHE_BLE_H} blé/h</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 7, fontStyle: "italic" }}>
                {ship.desc}{!portOk && <span style={{ color: C.bad, fontStyle: "normal" }}> — Port niv. {ship.requiresPort} requis</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <CostRow cost={ship.cost} resources={game.resources} />
                <Btn small primary label={`Armer · ${fmtTime(ship.duration * 1000 * SPEED)}`}
                  disabled={busy || !portOk || !RES.every((r) => game.resources[r] >= ship.cost[r])}
                  onClick={() => buildShip(type)} />
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
