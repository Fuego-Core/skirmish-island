import { useMemo, useState } from "react";
import { C, DEV } from "../game/constants.js";
import { FACTIONS } from "../game/factions.js";
import { knownBots, playerScore } from "../game/bots.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, Btn } from "../ui/kit.jsx";
import { notificationsSupported, notificationsEnabled, enableNotifications, disableNotifications } from "../ui/notifications.js";

export function EmpireTab({ game, nowTick, renameIsland, exportSave, importSave, resetGame }) {
  const [editingIsland, setEditingIsland] = useState(null); // { id, name }
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

  // Classement — recalculé au plus une fois par minute, la puissance des
  // rivaux ne bougeant que très lentement.
  const minuteTick = Math.floor(nowTick / 60000);
  const ranking = useMemo(() => {
    const me = { key: "__me", name: "Toi", power: playerScore(game), isMe: true };
    return [...knownBots(game, nowTick), me].sort((a, b) => b.power - a.power).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteTick, game.islands, game.troops, game.explored, game.conquered]);

  const handleExport = () => setExportCode(exportSave());
  const handleImport = () => {
    const res = importSave(importCode);
    setImportMsg(res.message);
    if (res.ok) setImportCode("");
  };

  return (
    <>
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

      <SectionTitle>Classement de l'Égée</SectionTitle>
      <Card>
        <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 10, fontStyle: "italic" }}>
          Les cités rivales gagnent en puissance au fil de la partie. Explore pour en découvrir d'autres.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {ranking.map((b, i) => (
            <div key={b.key} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8,
              background: b.isMe ? "rgba(184,132,31,0.10)" : C.inset,
              border: `1px solid ${b.isMe ? C.gold : "transparent"}`,
            }}>
              <span style={{ width: 18, fontSize: 11, fontFamily: "monospace", color: i === 0 ? C.goldHi : C.textFaint, fontWeight: 700 }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: b.isMe ? C.goldHi : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {b.name}
                {b.pillee && <span style={{ fontSize: 9, color: C.textFaint, fontStyle: "italic" }}> · pillée</span>}
              </span>
              <span style={{ fontSize: 11.5, fontFamily: "monospace", fontWeight: 700, color: b.isMe ? C.goldHi : C.textDim }}>
                {b.power}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Tes îles ({game.islands.length})</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {game.islands.map((i) => (
          <Card key={i.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              {editingIsland && editingIsland.id === i.id ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center", flex: 1 }}>
                  <input
                    value={editingIsland.name}
                    onChange={(e) => setEditingIsland({ id: i.id, name: e.target.value })}
                    maxLength={22}
                    style={{ flex: 1, background: C.bgDeep, border: `1px solid ${C.gold}`, borderRadius: 6, color: C.text, padding: "5px 9px", fontSize: 12, fontFamily: "inherit", outline: "none" }}
                  />
                  <Btn small primary label="OK" onClick={() => { renameIsland(i.id, editingIsland.name); setEditingIsland(null); }} />
                </div>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <I name="ile" size={16} color={C.goldHi} />
                  {i.name}
                  <button onClick={() => setEditingIsland({ id: i.id, name: i.name })}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, lineHeight: 0 }}>
                    <I name="plume" size={13} color={C.textFaint} />
                  </button>
                </span>
              )}
              <span style={{ fontSize: 9, fontFamily: "monospace", color: C.textFaint }}>
                région {i.region.gx}:{i.region.gy}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 10, fontFamily: "monospace", color: C.textDim }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><I name="senat" size={11} color={C.textDim} />niv. {i.buildings.senat}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><I name="port" size={11} color={C.textDim} />{i.buildings.port || "—"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><I name="caserne" size={11} color={C.textDim} />{i.buildings.caserne || "—"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><I name="muraille" size={11} color={C.textDim} />{i.buildings.muraille || "—"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}><I name="esclaves" size={11} color={C.textDim} />{i.esclaves || 0}</span>
              {(i.buildings.colosse || 0) > 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, color: C.goldHi }}><I name="colosse" size={11} color={C.goldHi} />{i.buildings.colosse}/5</span>
              )}
            </div>
          </Card>
        ))}
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
