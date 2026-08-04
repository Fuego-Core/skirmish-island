import { useState } from "react";
import { C, RES } from "../game/constants.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, Sheet, ResIcon, fmtNum, fmtAgo } from "../ui/kit.jsx";
import { TROOP_PORTRAITS } from "../ui/troopPortraits.js";
import { SHIP_PORTRAITS } from "../ui/shipPortraits.js";
import eventMarchand from "../assets/images/event-marchand.webp";
import eventTempete from "../assets/images/event-tempete.webp";
import eventEpave from "../assets/images/event-epave.webp";
import reportVictoire from "../assets/images/reports/report-victoire.webp";
import reportDefaite from "../assets/images/reports/report-defaite.webp";
import reportRaidRepousse from "../assets/images/reports/report-raid-repousse.webp";
import reportRaidSubi from "../assets/images/reports/report-raid-subi.webp";

// Vignettes en médaillon (bas-relief bronze généré) pour les 3 événements
// aléatoires — mêmes clés "icone" que le moteur (marche/explorateur/peche).
const EVENT_CRESTS = { marche: eventMarchand, explorateur: eventTempete, peche: eventEpave };

// Vignettes en médaillon pour les 4 issues possibles d'un rapport de combat.
const BATTLE_CRESTS = {
  victoire: reportVictoire, defaite: reportDefaite,
  "raid-repousse": reportRaidRepousse, "raid-subi": reportRaidSubi,
};
function battleCrestKey(rep) {
  if (rep.kind === "defense") return rep.win ? "raid-repousse" : "raid-subi";
  return rep.win ? "victoire" : "defaite";
}

function crestFor(rep) {
  if (rep.kind === "evenement") return EVENT_CRESTS[rep.icone];
  if (rep.kind === "marche") return eventMarchand;
  return BATTLE_CRESTS[battleCrestKey(rep)];
}

function titleFor(rep) {
  if (rep.kind === "evenement") return rep.titre;
  if (rep.kind === "marche") return "OFFRE DU MARCHÉ REMPLIE";
  if (rep.kind === "defense") return rep.win ? "RAID REPOUSSÉ" : "RAID PIRATE SUBI";
  return rep.win ? "VICTOIRE" : "DÉFAITE";
}

function subtitleFor(rep) {
  if (rep.kind === "evenement") return rep.texte;
  if (rep.kind === "marche") return `${fmtNum(rep.give.amt)} donné contre ${rep.want.map((w) => fmtNum(w.amt)).join(" + ")} reçu`;
  if (rep.kind === "defense") return rep.attaquant || "pirates égéens";
  return rep.cible || (rep.targetType === "ile_joueur" ? "cité rivale" : "île inactive");
}

function outcomeColor(rep) {
  if (rep.kind === "evenement" || rep.kind === "marche") return C.goldHi;
  return rep.win ? C.ok : C.bad;
}

function TradeIcon({ kind, keyName, size = 18 }) {
  if (kind === "res") return <ResIcon r={keyName} size={size} />;
  const src = kind === "troop" ? TROOP_PORTRAITS[keyName] : SHIP_PORTRAITS[keyName];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1px solid ${C.borderSoft}` }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function Crest({ src, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
      border: `1px solid ${C.goldHi}77`, boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
    }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function ReportDetail({ rep }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
        <Crest src={crestFor(rep)} size={52} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1, color: outcomeColor(rep) }}>{titleFor(rep)}</div>
          <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 3 }}>{subtitleFor(rep)}</div>
        </div>
      </div>

      {rep.kind === "evenement" && rep.gains && (
        <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 8 }}>
          <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 7 }}>Cargaison récupérée</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {RES.map((r) => (
              <span key={r} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontFamily: "monospace", color: C.ok }}>
                <ResIcon r={r} size={16} />+{fmtNum(rep.gains[r])}
              </span>
            ))}
          </div>
        </div>
      )}

      {rep.kind === "marche" && (
        <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13, fontFamily: "monospace" }}>
          <TradeIcon kind={rep.give.kind} keyName={rep.give.key} size={18} /> −{fmtNum(rep.give.amt)}
          <span style={{ color: C.gold }}>→</span>
          {rep.want.map((w, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {i > 0 && <span style={{ color: C.textFaint }}>+</span>}
              <TradeIcon kind={w.kind} keyName={w.key} size={18} /> +{fmtNum(w.amt)}
            </span>
          ))}
        </div>
      )}

      {rep.kind !== "evenement" && rep.kind !== "marche" && (<>
        <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 8 }}>
          <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 7 }}>Forces en présence</div>
          <div style={{ fontSize: 12, fontFamily: "monospace", color: C.text }}>
            {rep.kind === "defense" ? `Garnison ${rep.atkPower}` : `Ton armée ${rep.atkPower}`} contre {rep.defPower}
            {rep.kind === "defense" && rep.wall > 0 ? ` (muraille niv. ${rep.wall})` : ""}
            {rep.combatBonus !== undefined && (
              <span style={{ color: rep.combatBonus >= 1 ? C.ok : C.bad }}>
                {" "}({rep.targetType === "ile_joueur" ? "contre" : "mix"} {rep.combatBonus >= 1 ? "+" : ""}{Math.round((rep.combatBonus - 1) * 100)}%)
              </span>
            )}
          </div>
        </div>

        <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 8 }}>
          <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 7 }}>Pertes</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5, fontFamily: "monospace", color: C.bad }}>
            <span>Hoplites {rep.losses.hoplite || 0}</span>
            <span>Archers {rep.losses.archer || 0}</span>
            <span>Cavaliers {rep.losses.cavalier || 0}</span>
            <span>Catapultes {rep.losses.catapulte || 0}</span>
            <span>Béliers {rep.losses.belier || 0}</span>
          </div>
        </div>

        {rep.vol && (
          <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 7 }}>Pillé par les pirates</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {RES.map((r) => (
                <span key={r} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontFamily: "monospace", color: C.bad }}>
                  <ResIcon r={r} size={16} />−{fmtNum(rep.vol[r])}
                </span>
              ))}
            </div>
          </div>
        )}

        {rep.butin && (
          <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 7 }}>Butin ramené</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {RES.map((r) => (
                <span key={r} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontFamily: "monospace", color: C.ok }}>
                  <ResIcon r={r} size={16} />+{fmtNum(rep.butin[r])}
                </span>
              ))}
              {rep.esclavesGagnes > 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontFamily: "monospace", color: C.ok }}>
                  <I name="esclaves" size={14} color={C.ok} />+{rep.esclavesGagnes}
                </span>
              )}
            </div>
          </div>
        )}
      </>)}

      <div style={{ fontSize: 10, color: C.textFaint, fontFamily: "monospace", marginTop: 4 }}>
        {new Date(rep.at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
      </div>
    </>
  );
}

export function ReportsTab({ game, nowTick }) {
  const [openReport, setOpenReport] = useState(null);

  return (
    <>
      <SectionTitle>Rapports de bataille</SectionTitle>
      {game.reports.length === 0 && (
        <Card style={{ textAlign: "center" }}>
          <span style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>Aucune bataille livrée pour l'instant.</span>
        </Card>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {game.reports.map((rep, i) => (
          <button key={i} onClick={() => setOpenReport(rep)}
            style={{
              display: "flex", alignItems: "center", gap: 11, textAlign: "left", cursor: "pointer",
              background: `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`, border: `1px solid ${C.borderSoft}`, borderLeft: `3px solid ${outcomeColor(rep)}`,
              borderRadius: 11, padding: "10px 12px", color: C.text,
              animation: "riseIn 0.32s ease-out both", animationDelay: `${Math.min(i, 8) * 0.04}s`,
            }}>
            <Crest src={crestFor(rep)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 0.6, color: outcomeColor(rep), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {titleFor(rep)}
              </div>
              <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {subtitleFor(rep)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 9.5, fontFamily: "monospace", color: C.textFaint }}>{fmtAgo(nowTick - rep.at)}</span>
              <I name="drapeau" size={11} color={C.textFaint} sw={1.4} />
            </div>
          </button>
        ))}
      </div>

      <Sheet open={!!openReport} onClose={() => setOpenReport(null)} title="RAPPORT" icon="rapports">
        {openReport && <ReportDetail rep={openReport} />}
      </Sheet>
    </>
  );
}
