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
      <div style={{ minHeight: "100vh", background: C.bg, color: C.textDim, display: "flex", alignItems: "center", justifyContent: "center", ...fb, fontSize: 13.5 }}>
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
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse 120% 60% at 50% -5%, #16293a 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`, color: C.text, ...fb }}>
      {colosseDone && !game.victoryShown && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(3,5,8,0.78)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.25s ease-out" }}>
          <div style={{
            maxWidth: 360, textAlign: "center", position: "relative", overflow: "hidden",
            background: `linear-gradient(175deg, ${C.panelUp}, ${C.panel})`, border: `1px solid ${C.gold}55`,
            borderRadius: 22, padding: "32px 24px", boxShadow: `0 20px 60px rgba(0,0,0,0.55), ${C.glow}`,
            animation: "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div aria-hidden style={{ position: "absolute", top: 62, left: "50%", width: 90, height: 90, marginLeft: -45, borderRadius: "50%", border: `1.5px solid ${C.goldHi}`, animation: "burstRing 1.8s ease-out infinite" }} />
            <I name="colosse" size={54} color={C.goldHi} sw={1.25} style={{ position: "relative" }} />
            <div style={{ ...fd, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.goldHi, margin: "16px 0 4px", position: "relative" }}>LE COLOSSE</div>
            <div style={{ ...fd, fontSize: 13, fontWeight: 600, letterSpacing: 2, color: C.gold, marginBottom: 14, position: "relative" }}>EST ACHEVÉ</div>
            <div style={{ width: 150, margin: "0 auto 16px", position: "relative" }}><Meander color={C.goldDim} height={8} /></div>
            <p style={{ fontSize: 13.5, color: C.textDim, margin: "0 0 16px", lineHeight: 1.5, position: "relative" }}>
              Ton nom est gravé dans le marbre de l'Égée. La partie est remportée — mais ton empire, lui, continue.
            </p>
            <div style={{ fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: C.textDim, marginBottom: 20, lineHeight: 1.9, position: "relative" }}>
              {Math.max(1, Math.round((nowTick - (game.startedAt || nowTick)) / 60000))} min de règne · {game.stats.wins} victoires<br />
              {game.islands.length} île{game.islands.length > 1 ? "s" : ""} · {game.stats.raidsRepousses} raids repoussés
            </div>
            <div style={{ position: "relative" }}><Btn primary label="Continuer à régner" onClick={() => setGame((g) => ({ ...g, victoryShown: true }))} /></div>
          </div>
        </div>
      )}

      {/* ═══ Bandeau ressources (sticky) ═══ */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: `linear-gradient(180deg, ${C.bgDeep}f0 82%, ${C.bgDeep}00)`, backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "10px 10px 7px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {RES.map((r) => {
              const cap = r === "ble" ? capBle : capMain;
              const val = game.resources[r];
              const bKey = Object.keys(BUILDINGS).find((k) => BUILDINGS[k].produces === r);
              let ph = game.islands.reduce((a, i) => a + prodPerHour(i.buildings[bKey]) * (1 + Math.min((i.esclaves || 0) * 0.03, 0.6)), 0);
              if (r === "ble") ph += (game.ships.peche || 0) * PECHE_BLE_H - upkeep;
              ph = Math.round(ph);
              const pct = Math.min(100, (val / cap) * 100);
              return (
                <div key={r} style={{ textAlign: "center", background: C.glass, border: `1px solid ${C.glassBorder}`, borderRadius: 10, padding: "6px 2px 5px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <I name={RES_ICONN[r]} size={13} color={RES_COLOR[r]} sw={1.9} />
                    <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 11.5, fontWeight: 700 }}>{fmtNum(val)}</span>
                  </div>
                  <div style={{ height: 3, background: C.border, borderRadius: 2, margin: "4px 3px 3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 92 ? C.bad : RES_COLOR[r], transition: "width 0.5s", opacity: 0.9, boxShadow: pct > 92 ? `0 0 6px ${C.bad}` : "none" }} />
                  </div>
                  <div style={{ fontSize: 8.5, fontVariantNumeric: "tabular-nums", fontWeight: 600, color: ph < 0 ? C.bad : C.ok }}>{ph >= 0 ? "+" : ""}{fmtNum(ph)}/h</div>
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
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.bgDeep}f2`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderTop: `1px solid ${C.borderSoft}`, zIndex: 30, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Meander color={C.goldDim} />
        <div style={{ maxWidth: 480, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(6, 1fr)", padding: "4px 4px 0" }}>
          {[["cite", "senat", "Cité"], ["carte", "carte", "Carte"], ["armee", "epees", "Armée"], ["port", "port", "Port"], ["rapports", "rapports", "Rapports"], ["empire", "couronne", "Empire"]].map(([k, icon, label]) => {
            const activeTab = tab === k;
            return (
              <button key={k}
                onClick={() => {
                  setTab(k);
                  if (k === "rapports") setGame((g) => ({ ...g, reports: g.reports.map((r) => ({ ...r, read: true })) }));
                }}
                style={{
                  padding: "9px 2px 8px", margin: "0 2px", borderRadius: 12, background: activeTab ? C.glassHi : "transparent", border: "none", cursor: "pointer",
                  color: activeTab ? C.goldHi : C.textFaint,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", minHeight: 48,
                }}>
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <I name={icon} size={19} color={activeTab ? C.goldHi : C.textFaint} sw={activeTab ? 1.9 : 1.6} />
                  {badges[k] && (
                    <span style={{
                      position: "absolute", top: -6, right: -10, minWidth: 15, height: 15, padding: "0 3px",
                      borderRadius: 8, background: `linear-gradient(180deg, ${C.goldHi}, ${C.bronze})`,
                      color: C.ink, fontSize: 9, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    }}>{badges[k]}</span>
                  )}
                </span>
                <span style={{ ...fd, fontSize: 8.5, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
