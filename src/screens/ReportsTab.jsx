import { C, RES, RES_ICONN } from "../game/constants.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, fmtNum } from "../ui/kit.jsx";

export function ReportsTab({ game }) {
  return (
    <>
      <SectionTitle>Rapports de bataille</SectionTitle>
      {game.reports.length === 0 && (
        <Card style={{ textAlign: "center" }}>
          <span style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>Aucune bataille livrée pour l'instant.</span>
        </Card>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {game.reports.map((rep, i) => (
          <Card key={i} style={{ borderColor: rep.win ? C.ok : C.bad }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: rep.kind === "evenement" ? C.goldHi : rep.win ? C.ok : C.bad, marginBottom: 5, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1 }}>
              <I name={rep.kind === "evenement" ? rep.icone : rep.kind === "defense" ? "muraille" : rep.win ? "epees" : "drapeau"} size={14} color={rep.kind === "evenement" ? C.goldHi : rep.win ? C.ok : C.bad} />
              {rep.kind === "evenement" ? rep.titre : rep.kind === "defense" ? (rep.win ? "RAID REPOUSSÉ" : "RAID PIRATE SUBI") : rep.win ? "VICTOIRE" : "DÉFAITE"}
              {rep.kind !== "evenement" && (
                <span style={{ color: C.textFaint, fontSize: 9, fontFamily: "monospace", letterSpacing: 0 }}>
                  · {rep.kind === "defense" ? "pirates égéens" : rep.targetType === "ile_joueur" ? "île joueur" : "île inactive"}
                </span>
              )}
            </div>
            {rep.kind === "evenement" && (
              <div style={{ fontSize: 11, color: C.textDim, fontStyle: "italic" }}>{rep.texte}</div>
            )}
            {rep.kind === "evenement" && rep.gains && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontFamily: "monospace", color: C.ok, marginTop: 4, flexWrap: "wrap" }}>
                Cargaison :
                {RES.map((r) => (
                  <span key={r} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <I name={RES_ICONN[r]} size={11} color={C.ok} />+{fmtNum(rep.gains[r])}
                  </span>
                ))}
              </div>
            )}
            {rep.kind !== "evenement" && (<>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: C.textDim }}>
                {rep.kind === "defense" ? `Garnison ${rep.atkPower}` : `Toi ${rep.atkPower}`} contre {rep.defPower}
                {rep.kind === "defense" && rep.wall > 0 ? ` (muraille niv. ${rep.wall})` : ""}
                {" "}· pertes : hop.{rep.losses.hoplite || 0} arc.{rep.losses.archer || 0} cav.{rep.losses.cavalier || 0} cat.{rep.losses.catapulte || 0} bél.{rep.losses.belier || 0}
              </div>
              {rep.vol && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontFamily: "monospace", color: C.bad, marginTop: 4, flexWrap: "wrap" }}>
                  Pillé par les pirates :
                  {RES.map((r) => (
                    <span key={r} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <I name={RES_ICONN[r]} size={11} color={C.bad} />−{fmtNum(rep.vol[r])}
                    </span>
                  ))}
                </div>
              )}
              {rep.butin && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontFamily: "monospace", color: C.ok, marginTop: 4, flexWrap: "wrap" }}>
                  Butin :
                  {RES.map((r) => (
                    <span key={r} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <I name={RES_ICONN[r]} size={11} color={C.ok} />{fmtNum(rep.butin[r])}
                    </span>
                  ))}
                  {rep.esclavesGagnes > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <I name="esclaves" size={11} color={C.ok} />+{rep.esclavesGagnes}
                    </span>
                  )}
                </div>
              )}
            </>)}
          </Card>
        ))}
      </div>
    </>
  );
}
