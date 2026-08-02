import { C, RES, RES_ICONN, RES_COLOR } from "../../game/constants.js";
import { I } from "../Icon.jsx";
import { Sheet, Btn, fmtNum } from "../kit.jsx";

export function MissionsSheet({ open, onClose, visibleMissions, claimMission }) {
  return (
    <Sheet open={open} onClose={onClose} title="MISSIONS" icon="laurier">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleMissions.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 11px", background: C.inset, borderRadius: 9, border: `1px solid ${m.done ? C.gold : C.borderSoft}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: m.done ? C.goldHi : C.text }}>{m.label}</div>
              <div style={{ fontSize: 10, color: C.textDim, fontStyle: "italic" }}>{m.desc}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                {RES.filter((r) => m.reward[r]).map((r) => (
                  <span key={r} style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 9, fontFamily: "monospace", color: C.ok }}>
                    <I name={RES_ICONN[r]} size={10} color={RES_COLOR[r]} />{fmtNum(m.reward[r])}
                  </span>
                ))}
              </div>
            </div>
            {m.done ? (
              <Btn small primary label="Réclamer" onClick={() => claimMission(m.id)} />
            ) : (
              <span style={{ fontSize: 9, color: C.textFaint, fontFamily: "monospace", flexShrink: 0 }}>en cours</span>
            )}
          </div>
        ))}
        {visibleMissions.length === 0 && (
          <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", textAlign: "center", padding: 10 }}>
            Toutes les missions sont accomplies. L'Égée s'incline.
          </div>
        )}
      </div>
    </Sheet>
  );
}
