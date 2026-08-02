import { C, RES } from "../game/constants.js";
import { SHIPS, PECHE_BLE_H } from "../game/ships.js";
import { SPEED } from "../game/constants.js";
import { Card, SectionTitle, QueueCard, Btn, CostRow, fmtTime } from "../ui/kit.jsx";
import shipExplorateur from "../assets/images/ships/ship-explorateur.webp";
import shipPeche from "../assets/images/ships/ship-peche.webp";
import shipTransport from "../assets/images/ships/ship-transport.webp";
import shipColonisation from "../assets/images/ships/ship-colonisation.webp";
import shipSiege from "../assets/images/ships/ship-siege.webp";
import shipEclaireur from "../assets/images/ships/ship-eclaireur.webp";

const SHIP_PORTRAITS = {
  explorateur: shipExplorateur, peche: shipPeche, transport: shipTransport,
  colonisation: shipColonisation, siege: shipSiege, eclaireur: shipEclaireur,
};

function ShipPortrait({ type, dim }) {
  return (
    <div style={{
      width: 52, height: 52, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
      border: `1.5px solid ${C.goldHi}${dim ? "44" : "88"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
      opacity: dim ? 0.5 : 1,
    }}>
      <img src={SHIP_PORTRAITS[type]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

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
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {Object.keys(SHIPS).map((type) => {
          const ship = SHIPS[type];
          const portOk = bestPort >= ship.requiresPort;
          const busy = !!game.shipQueue;
          return (
            <Card key={type}>
              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <ShipPortrait type={type} dim={!portOk} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {ship.label} <span style={{ fontFamily: "monospace", fontSize: 11, color: C.gold }}>×{game.ships[type]}</span>
                    </span>
                    {type === "peche" && game.ships.peche > 0 && (
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: C.ok }}>+{game.ships.peche * PECHE_BLE_H} blé/h</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 3, lineHeight: 1.3 }}>
                    {ship.desc}{!portOk && <span style={{ color: C.bad }}> — Port niv. {ship.requiresPort} requis</span>}
                  </div>
                </div>
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
