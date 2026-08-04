import { useState } from "react";
import { C, DEV, SPEED, RES } from "../game/constants.js";
import { FACTIONS } from "../game/factions.js";
import { B_ICON, buildSlots, buildDuration, prodPerHour } from "../game/buildings.js";
import { TROOPS, troopSlots } from "../game/troops.js";
import { SHIPS, shipSlots } from "../game/ships.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, QueueCard, SlotQueue, Btn, ResIcon, fmtTime, fmtNum } from "../ui/kit.jsx";
import { BUILDING_PORTRAITS } from "../ui/buildingPortraits.js";
import { TROOP_PORTRAITS } from "../ui/troopPortraits.js";
import tileIslandImg from "../assets/images/tile-island.webp";

const PROD_BUILDING = { bois: "scierie", pierre: "carriere", fer: "mine_fer", or: "mine_or", ble: "ferme" };
import { SHIP_PORTRAITS } from "../ui/shipPortraits.js";
import { notificationsSupported, notificationsEnabled, enableNotifications, disableNotifications } from "../ui/notifications.js";

function ClickableQueue({ onClick, ...props }) {
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <QueueCard {...props} />
    </div>
  );
}

export function CityTab({
  game, nowTick, isl, onSelectIsland, setTab,
  tradeEvent, visibleMissions, onOpenMissions,
  renameIsland, exportSave, importSave, resetGame,
}) {
  const [editingIsland, setEditingIsland] = useState(null);
  const [importCode, setImportCode] = useState("");
  const [exportCode, setExportCode] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [notifOn, setNotifOn] = useState(notificationsEnabled());
  const [notifMsg, setNotifMsg] = useState("");

  const handleToggleNotif = async () => {
    if (notifOn) {
      disableNotifications();
      setNotifOn(false);
      setNotifMsg("");
    } else {
      const ok = await enableNotifications();
      setNotifOn(ok);
      setNotifMsg(ok ? "" : "Autorisation refusée par le navigateur.");
    }
  };

  const handleExport = () => setExportCode(exportSave());
  const handleImport = () => {
    const res = importSave(importCode);
    setImportMsg(res.message);
    if (res.ok) setImportCode("");
  };

  const fShip = (game.faction && FACTIONS[game.faction].shipSpeed) || 1;
  const fTroop = (game.faction && FACTIONS[game.faction].troopSpeed) || 1;
  const bestPort = Math.max(...game.islands.map((i) => i.buildings.port));
  const bestCaserne = Math.max(...game.islands.map((i) => i.buildings.caserne));

  // Détail case par case (portrait + décompte) des trois files de
  // production — vue d'ensemble directe, sans avoir à changer d'onglet.
  let cumulBuild = nowTick;
  const buildItems = (isl.queue || []).map((q, i) => {
    cumulBuild = i === 0 ? q.endsAt : cumulBuild + buildDuration(q.key, q.targetLevel - 1, isl.buildings.senat) * 1000;
    return { portrait: BUILDING_PORTRAITS[q.key], icon: B_ICON[q.key], remaining: fmtTime(cumulBuild - nowTick) };
  });
  let cumulShip = nowTick;
  const shipItems = (game.shipQueue || []).map((q, i) => {
    cumulShip = i === 0 ? q.endsAt : cumulShip + SHIPS[q.type].duration * 1000 * SPEED * fShip;
    return { portrait: SHIP_PORTRAITS[q.type], icon: q.type, remaining: fmtTime(cumulShip - nowTick) };
  });
  let cumulTroop = nowTick;
  const troopItems = (game.troopQueue || []).map((q, i) => {
    const unitDur = TROOPS[q.type].duration * 1000 * SPEED * fTroop;
    cumulTroop = i === 0 ? q.nextAt + (q.remaining - 1) * unitDur : cumulTroop + q.remaining * unitDur;
    return { portrait: TROOP_PORTRAITS[q.type], icon: q.type, remaining: fmtTime(cumulTroop - nowTick) };
  });

  const enCours = [];
  if (game.exploringTiles.length > 0) {
    enCours.push({ key: "explos", icon: "explorateur", label: `${game.exploringTiles.length} exploration${game.exploringTiles.length > 1 ? "s" : ""} en mer`, remaining: fmtTime(Math.min(...game.exploringTiles.map((e) => e.endsAt)) - nowTick), tab: "carte" });
  }
  if (game.colonizingTile) {
    enCours.push({ key: "coloni", icon: "colonisation", label: "Colons en route", remaining: fmtTime(game.colonizingTile.endsAt - nowTick), tab: "carte" });
  }
  if (game.attack) {
    const going = nowTick < game.attack.arriveAt;
    enCours.push({ key: "attaque", icon: "transport", label: going ? "Flotte de guerre — aller" : "Flotte de guerre — retour", remaining: fmtTime((going ? game.attack.arriveAt : game.attack.endsAt) - nowTick), tab: "carte" });
  }

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
              <ResIcon r={game.activeEvent.from} size={15} /> →
              <ResIcon r={game.activeEvent.to} size={15} />
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

      {(buildItems.length > 0 || shipItems.length > 0 || troopItems.length > 0 || enCours.length > 0) ? (
        <>
          <SectionTitle>En cours</SectionTitle>
          {buildItems.length > 0 && (
            <div onClick={() => setTab("construction")} style={{ cursor: "pointer" }}>
              <SlotQueue title="Chantiers" slots={buildSlots(isl.buildings.senat)} items={buildItems} />
            </div>
          )}
          {shipItems.length > 0 && (
            <div onClick={() => setTab("port")} style={{ cursor: "pointer" }}>
              <SlotQueue title="Chantier naval" slots={shipSlots(bestPort)} items={shipItems} />
            </div>
          )}
          {troopItems.length > 0 && (
            <div onClick={() => setTab("armee")} style={{ cursor: "pointer" }}>
              <SlotQueue title="Caserne" slots={troopSlots(bestCaserne)} items={troopItems} />
            </div>
          )}
          {enCours.map((e) => (
            <ClickableQueue key={e.key} icon={e.icon} label={e.label} remaining={e.remaining} onClick={() => setTab(e.tab)} />
          ))}
        </>
      ) : (
        <Card style={{ marginBottom: 10, textAlign: "center", fontSize: 12, color: C.textFaint, fontStyle: "italic" }}>
          Rien en cours — lance un chantier, une flotte ou une exploration.
        </Card>
      )}

      <SectionTitle>Ton règne</SectionTitle>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, fontFamily: "monospace", color: C.textDim }}>
          <span>Faction : <span style={{ color: C.goldHi }}>{game.faction ? FACTIONS[game.faction].label : "—"}</span></span>
          <span>Règne : <span style={{ color: C.goldHi }}>{Math.max(1, Math.round((nowTick - (game.startedAt || nowTick)) / 60000))} min</span></span>
          <span>Victoires : <span style={{ color: C.ok }}>{game.stats.wins}</span></span>
          <span>Raids repoussés : <span style={{ color: C.ok }}>{game.stats.raidsRepousses}</span></span>
          <span>Explorations : <span style={{ color: C.goldHi }}>{game.stats.explorations}</span></span>
          <span>Esclaves : <span style={{ color: C.goldHi }}>{game.esclaves}</span></span>
        </div>
      </Card>

      <SectionTitle>Tes îles ({game.islands.length})</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {game.islands.map((i) => {
          const esclavesBonus = Math.min((i.esclaves || 0) * 3, 60);
          return (
            <Card key={i.id} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 10, overflow: "hidden", flexShrink: 0,
                  background: `linear-gradient(160deg, ${C.playerBlue}, ${C.playerBlue}88)`, border: `1px solid ${C.playerBlue}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src={tileIslandImg} alt="" style={{ width: "82%", height: "82%", objectFit: "contain", display: "block" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingIsland && editingIsland.id === i.id ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        value={editingIsland.name}
                        onChange={(e) => setEditingIsland({ id: i.id, name: e.target.value })}
                        maxLength={22}
                        style={{ flex: 1, background: C.bgDeep, border: `1px solid ${C.gold}`, borderRadius: 6, color: C.text, padding: "5px 9px", fontSize: 12, fontFamily: "inherit", outline: "none" }}
                      />
                      <Btn small primary label="OK" onClick={() => { renameIsland(i.id, editingIsland.name); setEditingIsland(null); }} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600 }}>
                      {i.name}
                      <button onClick={() => setEditingIsland({ id: i.id, name: i.name })}
                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, lineHeight: 0 }}>
                        <I name="plume" size={12} color={C.textFaint} />
                      </button>
                    </div>
                  )}
                  <div style={{ fontSize: 9.5, fontFamily: "monospace", color: C.textFaint, marginTop: 2 }}>
                    région {i.region.gx}:{i.region.gy}{(i.buildings.colosse || 0) > 0 && (
                      <span style={{ color: C.goldHi }}> · Colosse {i.buildings.colosse}/5</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "10px 12px", borderRight: `1px solid ${C.borderSoft}` }}>
                  <div style={{ fontSize: 8.5, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1.4, color: C.textFaint, marginBottom: 7, textTransform: "uppercase" }}>Bâtiments</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontFamily: "monospace", color: C.textDim }}><I name="senat" size={11} color={C.textDim} />Sénat {i.buildings.senat}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontFamily: "monospace", color: C.textDim }}><I name="port" size={11} color={C.textDim} />Port {i.buildings.port || "—"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontFamily: "monospace", color: C.textDim }}><I name="caserne" size={11} color={C.textDim} />Caserne {i.buildings.caserne || "—"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontFamily: "monospace", color: C.textDim }}><I name="muraille" size={11} color={C.textDim} />Muraille {i.buildings.muraille || "—"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontFamily: "monospace", color: C.textDim }}><I name="esclaves" size={11} color={C.textDim} />Esclaves {i.esclaves || 0} {esclavesBonus > 0 && <span style={{ color: C.ok }}>(+{esclavesBonus}%)</span>}</span>
                  </div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 8.5, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1.4, color: C.textFaint, marginBottom: 7, textTransform: "uppercase" }}>Production/h</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {RES.map((r) => {
                      const ph = Math.round(prodPerHour(i.buildings[PROD_BUILDING[r]]) * (1 + esclavesBonus / 100));
                      return (
                        <span key={r} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontFamily: "monospace", color: ph > 0 ? C.ok : C.textFaint }}>
                          <ResIcon r={r} size={12} dim={ph <= 0} />+{fmtNum(ph)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {notificationsSupported() && (
        <>
          <SectionTitle>Notifications</SectionTitle>
          <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11.5, color: C.textDim, lineHeight: 1.4, paddingRight: 10 }}>
              Prévient quand un chantier finit, une flotte revient ou un raid a lieu — tant que le jeu reste ouvert (pas de vrai push, l'app n'a pas de serveur).
              {notifMsg && <div style={{ color: C.bad, marginTop: 4 }}>{notifMsg}</div>}
            </div>
            <Btn small primary={!notifOn} label={notifOn ? "Activées" : "Activer"} onClick={handleToggleNotif} />
          </Card>
        </>
      )}

      <SectionTitle>Sauvegarde</SectionTitle>
      <Card>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <Btn small label="Générer le code de sauvegarde" onClick={handleExport} />
        </div>
        {exportCode && (
          <textarea readOnly value={exportCode} rows={3}
            onFocus={(e) => e.target.select()}
            style={{ width: "100%", boxSizing: "border-box", background: C.bgDeep, border: `1px solid ${C.borderSoft}`, borderRadius: 6, color: C.textDim, fontSize: 9, fontFamily: "monospace", padding: 8, marginBottom: 10, resize: "vertical" }} />
        )}
        <div style={{ fontSize: 10, color: C.textDim, marginBottom: 6, fontStyle: "italic" }}>Restaurer une partie :</div>
        <textarea value={importCode} onChange={(e) => setImportCode(e.target.value)} rows={2}
          placeholder="Colle un code de sauvegarde ici…"
          style={{ width: "100%", boxSizing: "border-box", background: C.bgDeep, border: `1px solid ${C.borderSoft}`, borderRadius: 6, color: C.text, fontSize: 9, fontFamily: "monospace", padding: 8, marginBottom: 6, resize: "vertical" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Btn small primary label="Restaurer" disabled={!importCode.trim()} onClick={handleImport} />
          {importMsg && <span style={{ fontSize: 10, color: importMsg.includes("invalide") ? C.bad : C.ok }}>{importMsg}</span>}
        </div>
      </Card>

      <div style={{ marginTop: 22, textAlign: "center" }}>
        <button onClick={resetGame}
          style={{ padding: "6px 15px", borderRadius: 8, fontSize: 10, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1, background: "transparent", border: `1px solid ${C.bad}`, color: C.bad, cursor: "pointer", opacity: 0.8 }}>
          Recommencer la partie
        </button>
        {DEV && <div style={{ fontSize: 9, color: C.goldDim, marginTop: 7, fontFamily: "monospace" }}>MODE DEV · sauvegarde auto · production hors ligne</div>}
      </div>
    </>
  );
}
