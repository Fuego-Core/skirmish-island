import { C } from "../game/constants.js";
import { FACTIONS } from "../game/factions.js";
import { I, Meander } from "../ui/Icon.jsx";

export function TitleScreen({ onChooseFaction }) {
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse 130% 70% at 50% -10%, #1a3547 0%, #0d1720 55%, #091019 100%)`, color: C.text, fontFamily: "'Crimson Pro', Georgia, serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 18px", boxSizing: "border-box" }}>
      <I name="senat" size={54} color={C.goldHi} sw={1.3} />
      <h1 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: 30, letterSpacing: 6, color: C.goldHi, margin: "16px 0 2px", textAlign: "center", textShadow: "0 2px 12px rgba(201,161,59,0.35)" }}>
        SKIRMISH
      </h1>
      <h1 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: 30, letterSpacing: 6, color: C.goldHi, margin: "0 0 6px", textAlign: "center", textShadow: "0 2px 12px rgba(201,161,59,0.35)" }}>
        ISLAND
      </h1>
      <div style={{ width: 190, marginBottom: 8 }}><Meander color={C.goldDim} height={8} /></div>
      <p style={{ fontSize: 14, color: C.textDim, fontStyle: "italic", margin: "0 0 26px", textAlign: "center" }}>
        L'Égée t'attend. Choisis ta cité.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 380 }}>
        {Object.keys(FACTIONS).map((fk) => {
          const f = FACTIONS[fk];
          return (
            <button key={fk}
              onClick={() => onChooseFaction(fk)}
              style={{
                textAlign: "left", cursor: "pointer", borderRadius: 12, padding: "16px 18px",
                background: `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`,
                border: `1px solid ${C.borderSoft}`, color: C.text,
                transition: "border-color 0.2s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <I name={fk} size={34} color={C.goldHi} sw={1.4} />
                <div>
                  <div style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: 17, letterSpacing: 2.5, color: C.goldHi }}>{f.label.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: C.textFaint, fontStyle: "italic" }}>{f.motto}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", marginBottom: 7 }}>{f.desc}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: C.ok }}>{f.bonus}</div>
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 9, color: C.textFaint, marginTop: 22, fontFamily: "monospace" }}>Choix définitif pour cette partie.</p>
    </div>
  );
}
