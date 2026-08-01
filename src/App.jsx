import { useState } from "react";
import { C, RES, RES_ICONN, RES_COLOR } from "./game/constants.js";
import { BUILDINGS, prodPerHour, storageCap } from "./game/buildings.js";
import { TROOPS } from "./game/troops.js";
import { PECHE_BLE_H } from "./game/ships.js";
import { MISSIONS } from "./game/missions.js";
import { tileState } from "./game/world.js";
import { useGame } from "./hooks/useGame.js";
import { I, Meander } from "./ui/Icon.jsx";
import { fd, fb, Btn } from "./ui/kit.jsx";
import { BuildingSheet } from "./ui/sheets/BuildingSheet.jsx";
import { TileSheet } from "./ui/sheets/TileSheet.jsx";
import { MissionsSheet } from "./ui/sheets/MissionsSheet.jsx";
import { TitleScreen } from "./screens/TitleScreen.jsx";
import { CityTab } from "./screens/CityTab.jsx";
import { MapTab } from "./screens/MapTab.jsx";
import { ArmyTab } from "./screens/ArmyTab.jsx";
import { PortTab } from "./screens/PortTab.jsx";
import { ReportsTab } from "./screens/ReportsTab.jsx";
import { EmpireTab } from "./screens/EmpireTab.jsx";

const fmtNum = (n) => (n >= 10000 ? `${Math.floor(n / 1000)}k` : Math.floor(n));

export default function App() {
  const {
    game, setGame, nowTick,
    startUpgrade, buildShip, recruitTroop, startExplore, startColonize, startAttack,
    tradeMarket, assignEsclave, startSpy, tradeEvent, claimMission, renameIsland,
    exportSave, importSave, resetGame, chooseFaction,
  } = useGame();

  const [tab, setTab] = useState("cite");
  const [openBuilding, setOpenBuilding] = useState(null);
  const [selectedTileKey, setSelectedTileKey] = useState(null);
  const [attackForm, setAttackForm] = useState({ hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 });
  const [marketFrom, setMarketFrom] = useState("bois");
  const [marketTo, setMarketTo] = useState("fer");
  const [showMissions, setShowMissions] = useState(false);

  if (!game) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.textDim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        Chargement de l'archipel…
      </div>
    );
  }

  if (!game.faction) {
    return <TitleScreen onChooseFaction={chooseFaction} />;
  }

  const isl = game.islands[game.activeIsland] || game.islands[0];
  const capMain = game.islands.reduce((a, i) => a + storageCap(i.buildings.entrepot), 0);
  const capBle = game.islands.reduce((a, i) => a + storageCap(i.buildings.grenier), 0);
  const bestPort = Math.max(...game.islands.map((i) => i.buildings.port));
  const bestCaserne = Math.max(...game.islands.map((i) => i.buildings.caserne));
  const upkeep = Object.keys(TROOPS).reduce((a, t) => a + game.troops[t] * TROOPS[t].upkeep, 0);
  const assignedEsclaves = game.islands.reduce((a, i) => a + (i.esclaves || 0), 0);
  const freeEsclaves = game.esclaves - assignedEsclaves;
  const armyPower = Object.keys(TROOPS).reduce((a, t) => a + game.troops[t] * TROOPS[t].atk, 0);
  const unreadReports = game.reports.filter((r) => !r.read).length;
  const missionList = MISSIONS.map((m) => ({ ...m, done: m.check(game), claimed: !!game.claimedMissions[m.id] }));
  const visibleMissions = missionList.filter((m) => !m.claimed).slice(0, 3);
  const claimableCount = visibleMissions.filter((m) => m.done).length;
  const citeReady = game.islands.some((i) => i.queue && nowTick >= i.queue.endsAt - 500);
  const badges = {
    cite: claimableCount > 0 ? String(claimableCount) : citeReady ? "!" : null,
    carte: null,
    armee: game.troopQueue && nowTick >= game.troopQueue.nextAt - 500 ? "!" : null,
    port: game.shipQueue && nowTick >= game.shipQueue.endsAt - 500 ? "!" : null,
    rapports: unreadReports > 0 ? String(unreadReports) : null,
    empire: null,
  };

  const selectedTile = selectedTileKey ? (() => {
    const parts = selectedTileKey.split("|");
    const [sgx, sgy] = parts[0].split(":").map(Number);
    if (sgx !== game.region.gx || sgy !== game.region.gy) return null;
    const [px, py] = parts[1].split(",").map(Number);
    const st = game.colonized[selectedTileKey] ? "ma_ville" : game.explored[selectedTileKey] ? tileState(sgx, sgy, px, py) : "fog";
    return { px, py, st };
  })() : null;

  const colosseDone = Math.max(...game.islands.map((i) => i.buildings.colosse || 0)) >= 5;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse 120% 60% at 50% -5%, #14293a 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`, color: C.text, ...fb }}>
      {colosseDone && !game.victoryShown && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(6,10,16,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ maxWidth: 360, textAlign: "center", background: `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`, border: `1px solid ${C.gold}`, borderRadius: 14, padding: "28px 22px", boxShadow: `0 0 40px rgba(201,161,59,0.25)` }}>
            <I name="colosse" size={52} color={C.goldHi} sw={1.3} />
            <div style={{ ...fd, fontSize: 21, letterSpacing: 3, color: C.goldHi, margin: "14px 0 4px" }}>LE COLOSSE</div>
            <div style={{ ...fd, fontSize: 13, letterSpacing: 2, color: C.gold, marginBottom: 12 }}>EST ACHEVÉ</div>
            <div style={{ width: 150, margin: "0 auto 14px" }}><Meander color={C.goldDim} height={8} /></div>
            <p style={{ fontSize: 13, color: C.textDim, fontStyle: "italic", margin: "0 0 14px" }}>
              Ton nom est gravé dans le marbre de l'Égée. La partie est remportée — mais ton empire, lui, continue.
            </p>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: C.textDim, marginBottom: 18, lineHeight: 1.8 }}>
              {Math.max(1, Math.round((nowTick - (game.startedAt || nowTick)) / 60000))} min de règne · {game.stats.wins} victoires<br />
              {game.islands.length} île{game.islands.length > 1 ? "s" : ""} · {game.stats.raidsRepousses} raids repoussés
            </div>
            <Btn primary label="Continuer à régner" onClick={() => setGame((g) => ({ ...g, victoryShown: true }))} />
          </div>
        </div>
      )}

      {/* ═══ Bandeau ressources (sticky) ═══ */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: `linear-gradient(180deg, ${C.bgDeep} 80%, rgba(9,16,25,0.92))`, borderBottom: `1px solid ${C.borderSoft}` }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "8px 10px 5px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
            {RES.map((r) => {
              const cap = r === "ble" ? capBle : capMain;
              const val = game.resources[r];
              const bKey = Object.keys(BUILDINGS).find((k) => BUILDINGS[k].produces === r);
              let ph = game.islands.reduce((a, i) => a + prodPerHour(i.buildings[bKey]) * (1 + Math.min((i.esclaves || 0) * 0.03, 0.6)), 0);
              if (r === "ble") ph += (game.ships.peche || 0) * PECHE_BLE_H - upkeep;
              ph = Math.round(ph);
              const pct = Math.min(100, (val / cap) * 100);
              return (
                <div key={r} style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <I name={RES_ICONN[r]} size={13} color={RES_COLOR[r]} sw={1.9} />
                    <span style={{ fontFamily: "monospace", fontSize: 11 }}>{fmtNum(val)}</span>
                  </div>
                  <div style={{ height: 3, background: C.border, borderRadius: 2, margin: "3px 3px 2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 92 ? C.bad : RES_COLOR[r], transition: "width 0.5s", opacity: 0.85 }} />
                  </div>
                  <div style={{ fontSize: 8, fontFamily: "monospace", color: ph < 0 ? C.bad : C.ok }}>{ph >= 0 ? "+" : ""}{fmtNum(ph)}/h</div>
                </div>
              );
            })}
          </div>
        </div>
        <Meander color={C.goldDim} />
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 12px 92px", boxSizing: "border-box" }}>
        {tab === "cite" && (
          <CityTab
            game={game} nowTick={nowTick} isl={isl}
            openBuilding={openBuilding} setOpenBuilding={setOpenBuilding}
            onSelectIsland={(idx) => { setGame((g) => ({ ...g, activeIsland: idx })); setOpenBuilding(null); }}
            tradeEvent={tradeEvent}
            visibleMissions={visibleMissions} onOpenMissions={() => setShowMissions(true)}
            assignEsclave={assignEsclave} freeEsclaves={freeEsclaves}
          />
        )}
        {tab === "carte" && (
          <MapTab
            game={game} nowTick={nowTick}
            selectedTileKey={selectedTileKey} setSelectedTileKey={setSelectedTileKey}
            onChangeRegion={(region) => setGame((g) => ({ ...g, region }))}
          />
        )}
        {tab === "armee" && (
          <ArmyTab game={game} nowTick={nowTick} bestCaserne={bestCaserne} armyPower={armyPower} upkeep={upkeep} recruitTroop={recruitTroop} />
        )}
        {tab === "port" && (
          <PortTab game={game} nowTick={nowTick} bestPort={bestPort} buildShip={buildShip} />
        )}
        {tab === "empire" && (
          <EmpireTab game={game} nowTick={nowTick} renameIsland={renameIsland} exportSave={exportSave} importSave={importSave} resetGame={resetGame} />
        )}
        {tab === "rapports" && <ReportsTab game={game} />}
      </div>

      {/* ═══ Sheet Case de carte ═══ */}
      {selectedTile && (
        <TileSheet
          game={game} selectedTile={selectedTile} selectedTileKey={selectedTileKey} nowTick={nowTick}
          attackForm={attackForm} setAttackForm={setAttackForm}
          onClose={() => setSelectedTileKey(null)}
          startExplore={startExplore} startColonize={startColonize} startSpy={startSpy} startAttack={startAttack}
        />
      )}

      {/* ═══ Sheet Bâtiment ═══ */}
      {openBuilding && (
        <BuildingSheet
          buildingKey={openBuilding} isl={isl} resources={game.resources} nowTick={nowTick}
          marketFrom={marketFrom} setMarketFrom={setMarketFrom} marketTo={marketTo} setMarketTo={setMarketTo}
          onClose={() => setOpenBuilding(null)} onUpgrade={startUpgrade} onTradeMarket={tradeMarket}
        />
      )}

      {/* ═══ Sheet Missions ═══ */}
      <MissionsSheet open={showMissions} onClose={() => setShowMissions(false)} visibleMissions={visibleMissions} claimMission={claimMission} />

      {/* ═══ Navigation basse ═══ */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.bgDeep, borderTop: `1px solid ${C.borderSoft}`, zIndex: 30, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Meander color={C.goldDim} />
        <div style={{ maxWidth: 480, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6, 1fr)" }}>
          {[["cite", "senat", "Cité"], ["carte", "carte", "Carte"], ["armee", "epees", "Armée"], ["port", "port", "Port"], ["rapports", "rapports", "Rapports"], ["empire", "couronne", "Empire"]].map(([k, icon, label]) => (
            <button key={k}
              onClick={() => {
                setTab(k);
                if (k === "rapports") setGame((g) => ({ ...g, reports: g.reports.map((r) => ({ ...r, read: true })) }));
              }}
              style={{
                padding: "8px 0 10px", background: "transparent", border: "none", cursor: "pointer",
                color: tab === k ? C.goldHi : C.textFaint,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative",
              }}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <I name={icon} size={19} color={tab === k ? C.goldHi : C.textFaint} sw={1.6} />
                {badges[k] && (
                  <span style={{
                    position: "absolute", top: -5, right: -9, minWidth: 14, height: 14, padding: "0 3px",
                    borderRadius: 8, background: `linear-gradient(180deg, ${C.goldHi}, ${C.bronze})`,
                    color: C.ink, fontSize: 9, fontFamily: "monospace", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }}>{badges[k]}</span>
                )}
              </span>
              <span style={{ ...fd, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
