import { useEffect, useRef, useState } from "react";
import { C, RES, RES_ICONN, RES_COLOR } from "./game/constants.js";
import { BUILDINGS, prodPerHour, storageCap } from "./game/buildings.js";
import { TROOPS } from "./game/troops.js";
import { PECHE_BLE_H } from "./game/ships.js";
import { MISSIONS } from "./game/missions.js";
import { tileState } from "./game/world.js";
import { useGame } from "./hooks/useGame.js";
import { I, Meander } from "./ui/Icon.jsx";
import { fd, fb, Btn, ResIcon } from "./ui/kit.jsx";
import { haptic } from "./ui/haptics.js";
import { isMuted, setMuted, startMusic, stopMusic } from "./ui/sound.js";
import { BuildingSheet } from "./ui/sheets/BuildingSheet.jsx";
import { TileSheet } from "./ui/sheets/TileSheet.jsx";
import { MissionsSheet } from "./ui/sheets/MissionsSheet.jsx";
import { MarketTab } from "./screens/MarketTab.jsx";
import { TitleScreen } from "./screens/TitleScreen.jsx";
import { CityTab } from "./screens/CityTab.jsx";
import { ConstructionTab } from "./screens/ConstructionTab.jsx";
import { ClassementTab } from "./screens/ClassementTab.jsx";
import { MapTab } from "./screens/MapTab.jsx";
import { ArmyTab } from "./screens/ArmyTab.jsx";
import { PortTab } from "./screens/PortTab.jsx";
import { ReportsTab } from "./screens/ReportsTab.jsx";
import victoryColossus from "./assets/images/victory-colossus.webp";
import crestLogo from "./assets/images/crest-logo.webp";

const fmtNum = (n) => (n >= 10000 ? `${Math.floor(n / 1000)}k` : Math.floor(n));

export default function App() {
  const {
    game, setGame, nowTick,
    startUpgrade, buildShip, recruitTroop, startExplore, startColonize, startAttack,
    acceptMarketOffer, postMarketOffer, cancelMarketOffer, assignEsclave, startSpy, tradeEvent, claimMission, renameIsland,
    exportSave, importSave, resetGame, chooseFaction,
  } = useGame();

  const [tab, setTab] = useState("cite");
  const [openBuilding, setOpenBuilding] = useState(null);
  const [selectedTileKey, setSelectedTileKey] = useState(null);
  const [attackForm, setAttackForm] = useState({ hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 });
  const [showMissions, setShowMissions] = useState(false);
  const [muted, setMutedState] = useState(isMuted());

  const colosseDoneNow = game && game.faction
    ? Math.max(...game.islands.map((i) => i.buildings.colosse || 0)) >= 5
    : false;
  useEffect(() => {
    if (colosseDoneNow && game && !game.victoryShown) haptic([15, 60, 15, 60, 40]);
  }, [colosseDoneNow]);

  // Musique d'ambiance : ne peut démarrer qu'après un geste utilisateur
  // (politique autoplay des navigateurs) — on l'amorce sur le premier tap/clic,
  // et on la coupe quand l'onglet/app passe en arrière-plan (sinon elle continue
  // à jouer alors que le joueur est sur une autre appli).
  const musicStartedRef = useRef(false);
  useEffect(() => {
    if (!game || !game.faction || muted) return;
    const kick = () => { startMusic(); musicStartedRef.current = true; window.removeEventListener("pointerdown", kick); };
    window.addEventListener("pointerdown", kick);
    const onVisibility = () => {
      if (document.hidden) stopMusic();
      else if (musicStartedRef.current) startMusic();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerdown", kick);
      document.removeEventListener("visibilitychange", onVisibility);
      stopMusic();
    };
  }, [game && game.faction, muted]);

  if (!game) {
    return (
      <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", ...fb }}>
        <div style={{
          position: "fixed", inset: 0, zIndex: -1,
          background: `radial-gradient(ellipse 60% 40% at 15% 8%, rgba(224,176,74,0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 88% 14%, rgba(169,123,58,0.14) 0%, transparent 65%),
            linear-gradient(165deg, ${C.panel} 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`,
        }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
            border: `1.5px solid ${C.goldHi}88`, boxShadow: `0 4px 14px rgba(80,60,20,0.25), ${C.glow}`,
            animation: "floatY 2.6s ease-in-out infinite",
          }}>
            <img src={crestLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ ...fd, fontSize: 12.5, fontWeight: 600, letterSpacing: 3.5, color: C.goldHi, textTransform: "uppercase" }}>
            Skirmish Island
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: C.gold, animation: `pulse 1.1s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
        </div>
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
  const citeReady = game.islands.some((i) => (i.queue || []).some((q) => q.endsAt && nowTick >= q.endsAt - 500));
  const badges = {
    cite: claimableCount > 0 ? String(claimableCount) : null,
    construction: citeReady ? "!" : null,
    carte: null,
    armee: (game.troopQueue || []).some((q) => q.nextAt && nowTick >= q.nextAt - 500) ? "!" : null,
    port: (game.shipQueue || []).some((q) => q.endsAt && nowTick >= q.endsAt - 500) ? "!" : null,
    rapports: unreadReports > 0 ? String(unreadReports) : null,
  };

  const selectedTile = selectedTileKey ? (() => {
    const parts = selectedTileKey.split("|");
    const [sgx, sgy] = parts[0].split(":").map(Number);
    if (sgx !== game.region.gx || sgy !== game.region.gy) return null;
    const [px, py] = parts[1].split(",").map(Number);
    const st = game.colonized[selectedTileKey] ? "ma_ville" : game.explored[selectedTileKey] ? tileState(sgx, sgy, px, py) : "fog";
    return { px, py, st };
  })() : null;

  const colosseDone = colosseDoneNow;

  return (
    <div style={{ minHeight: "100vh", position: "relative", color: C.text, ...fb }}>
      {/* Fond "bronze au crépuscule" — dégradés superposés, aucune photo nécessaire */}
      <div style={{
        position: "fixed", inset: 0, zIndex: -2,
        background: `radial-gradient(ellipse 60% 40% at 15% 8%, rgba(224,176,74,0.14) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 88% 14%, rgba(169,123,58,0.12) 0%, transparent 65%),
          radial-gradient(ellipse 70% 50% at 28% 92%, rgba(120,85,40,0.16) 0%, transparent 60%),
          radial-gradient(ellipse 55% 42% at 92% 88%, rgba(224,176,74,0.10) 0%, transparent 55%),
          linear-gradient(165deg, ${C.panel} 0%, ${C.bg} 55%, ${C.bgDeep} 100%)`,
      }} />
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: `radial-gradient(ellipse 130% 55% at 50% -10%, rgba(224,176,74,0.10) 0%, transparent 42%), radial-gradient(ellipse 140% 65% at 50% 112%, rgba(0,0,0,0.25) 0%, transparent 55%)` }} />
      {colosseDone && !game.victoryShown && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(3,5,8,0.78)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.25s ease-out" }}>
          <div style={{
            width: "100%", maxWidth: 380, textAlign: "center", position: "relative", overflow: "hidden",
            background: `linear-gradient(175deg, ${C.panelUp}, ${C.panel})`, border: `1px solid ${C.gold}55`,
            borderRadius: 22, boxShadow: `0 20px 60px rgba(0,0,0,0.55), ${C.glow}`,
            animation: "scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both", maxHeight: "88vh", display: "flex", flexDirection: "column",
          }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={victoryColossus} alt="" style={{ width: "100%", height: 250, objectFit: "cover", objectPosition: "50% 3%", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 45%, ${C.panel} 96%)` }} />
            </div>
            <div style={{ padding: "0 24px 28px", overflowY: "auto" }}>
              <div style={{ ...fd, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: C.goldHi, margin: "0 0 4px" }}>LE COLOSSE</div>
              <div style={{ ...fd, fontSize: 13, fontWeight: 600, letterSpacing: 2, color: C.gold, marginBottom: 14 }}>EST ACHEVÉ</div>
              <div style={{ width: 150, margin: "0 auto 16px" }}><Meander color={C.goldDim} height={8} /></div>
              <p style={{ fontSize: 13.5, color: C.textDim, margin: "0 0 16px", lineHeight: 1.5 }}>
                Ton nom est gravé dans le marbre de l'Égée. La partie est remportée — mais ton empire, lui, continue.
              </p>
              <div style={{ fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: C.textDim, marginBottom: 20, lineHeight: 1.9 }}>
                {Math.max(1, Math.round((nowTick - (game.startedAt || nowTick)) / 60000))} min de règne · {game.stats.wins} victoires<br />
                {game.islands.length} île{game.islands.length > 1 ? "s" : ""} · {game.stats.raidsRepousses} raids repoussés
              </div>
              <Btn primary label="Continuer à régner" onClick={() => setGame((g) => ({ ...g, victoryShown: true }))} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ Bandeau ressources (sticky) ═══ */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: `linear-gradient(180deg, ${C.bgDeep}f0 82%, ${C.bgDeep}00)`, backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "10px 10px 7px", position: "relative" }}>
          <button onClick={() => { const next = !muted; setMuted(next); setMutedState(next); if (next) stopMusic(); else startMusic(); }} aria-label={muted ? "Activer le son" : "Couper le son"}
            style={{ position: "absolute", right: 10, top: -3, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", opacity: 0.55, zIndex: 1 }}>
            <I name={muted ? "sonCoupe" : "son"} size={13} color={C.textFaint} sw={1.6} />
          </button>
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
                    <ResIcon r={r} size={15} />
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

      <div key={tab} style={{ maxWidth: 480, margin: "0 auto", padding: "12px 12px 92px", boxSizing: "border-box", animation: "tabIn 0.22s ease-out both" }}>
        {tab === "cite" && (
          <CityTab
            game={game} nowTick={nowTick} isl={isl} setTab={setTab}
            onSelectIsland={(idx) => { setGame((g) => ({ ...g, activeIsland: idx })); setOpenBuilding(null); }}
            tradeEvent={tradeEvent}
            visibleMissions={visibleMissions} onOpenMissions={() => setShowMissions(true)}
            renameIsland={renameIsland} exportSave={exportSave} importSave={importSave} resetGame={resetGame}
          />
        )}
        {tab === "construction" && (
          <ConstructionTab
            game={game} nowTick={nowTick} isl={isl}
            openBuilding={openBuilding} setOpenBuilding={setOpenBuilding}
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
        {tab === "rapports" && <ReportsTab game={game} nowTick={nowTick} />}
        {tab === "marche" && (
          <MarketTab game={game} nowTick={nowTick} onAccept={acceptMarketOffer} onPost={postMarketOffer} onCancel={cancelMarketOffer} />
        )}
        {tab === "classement" && <ClassementTab game={game} nowTick={nowTick} />}
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
          onClose={() => setOpenBuilding(null)} onUpgrade={startUpgrade}
          onOpenMarket={() => { setOpenBuilding(null); setTab("marche"); }}
        />
      )}

      {/* ═══ Sheet Missions ═══ */}
      <MissionsSheet open={showMissions} onClose={() => setShowMissions(false)} visibleMissions={visibleMissions} claimMission={claimMission} />


      {/* ═══ Navigation basse ═══ */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.bgDeep}f2`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderTop: `1px solid ${C.borderSoft}`, zIndex: 30, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Meander color={C.goldDim} />
        <div style={{ maxWidth: 480, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(8, 1fr)", padding: "4px 4px 0" }}>
          {[["cite", "couronne", "Cité"], ["construction", "senat", "Bâtir"], ["carte", "carte", "Carte"], ["armee", "epees", "Armée"], ["port", "port", "Port"], ["marche", "marche", "Marché"], ["classement", "laurier", "Rang"], ["rapports", "rapports", "Rapports"]].map(([k, icon, label]) => {
            const activeTab = tab === k;
            return (
              <button key={k}
                onClick={() => {
                  if (k !== tab) haptic(6);
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
