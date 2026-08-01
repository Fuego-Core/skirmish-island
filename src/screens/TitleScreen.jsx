import { C } from "../game/constants.js";
import { FACTIONS } from "../game/factions.js";
import { freshBuildings } from "../game/state.js";
import { I, Meander } from "../ui/Icon.jsx";
import { CityScene } from "../ui/CityScene.jsx";
import { fd, fb } from "../ui/kit.jsx";

const BACKDROP_ISLAND = {
  buildings: { ...freshBuildings(true), muraille: 1, port: 1, caserne: 1, mine_or: 1 },
  queue: null,
};

export function TitleScreen({ onChooseFaction }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", color: C.text, ...fb, display: "flex", flexDirection: "column" }}>
      {/* Fond animé : la cité, en mouvement lent (Ken Burns) */}
      <div style={{ position: "absolute", inset: "-6%", zIndex: 0, animation: "kenBurns 28s ease-in-out infinite" }}>
        <CityScene isl={BACKDROP_ISLAND} onTap={() => {}} openKey={null} gold={C.gold} goldHi={C.goldHi} ink={C.ink} />
      </div>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: `linear-gradient(180deg, ${C.bgDeep}cc 0%, ${C.bgDeep}55 28%, ${C.bgDeep}55 52%, ${C.bg}ee 78%, ${C.bgDeep} 100%)`,
      }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `radial-gradient(ellipse 120% 60% at 50% 8%, transparent 40%, ${C.bgDeep}dd 100%)` }} />

      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "30px 18px calc(30px + env(safe-area-inset-bottom))", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30, animation: "riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(circle, ${C.goldDim}33, transparent 70%)`, marginBottom: 6, animation: "floatY 4.5s ease-in-out infinite" }}>
            <I name="senat" size={46} color={C.goldHi} sw={1.25} />
          </div>
          <h1 style={{ ...fd, fontSize: 32, fontWeight: 700, letterSpacing: 7, color: C.goldHi, margin: "10px 0 0", textAlign: "center", textShadow: `0 4px 24px rgba(230,196,105,0.35), 0 2px 4px rgba(0,0,0,0.6)` }}>
            SKIRMISH
          </h1>
          <h1 style={{ ...fd, fontSize: 32, fontWeight: 700, letterSpacing: 7, color: C.goldHi, margin: "0 0 10px", textAlign: "center", textShadow: `0 4px 24px rgba(230,196,105,0.35), 0 2px 4px rgba(0,0,0,0.6)` }}>
            ISLAND
          </h1>
          <div style={{ width: 170, marginBottom: 10 }}><Meander color={C.goldDim} height={7} /></div>
          <p style={{ fontSize: 13.5, color: C.textDim, margin: 0, textAlign: "center", letterSpacing: 0.3 }}>
            L'Égée t'attend. Choisis ta cité.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 400 }}>
          {Object.keys(FACTIONS).map((fk, i) => {
            const f = FACTIONS[fk];
            return (
              <button key={fk}
                onClick={() => onChooseFaction(fk)}
                style={{
                  textAlign: "left", cursor: "pointer", borderRadius: 16, padding: "16px 18px",
                  background: `linear-gradient(160deg, ${C.glassHi}, ${C.glass})`,
                  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                  border: `1px solid ${C.glassBorder}`, color: C.text, boxShadow: C.shadowSoft,
                  animation: `riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${0.1 + i * 0.09}s`,
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(160deg, ${C.goldDim}44, transparent)`, border: `1px solid ${C.goldDim}55` }}>
                    <I name={fk} size={26} color={C.goldHi} sw={1.4} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...fd, fontSize: 16, fontWeight: 600, letterSpacing: 2, color: C.goldHi }}>{f.label.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: C.textFaint, marginTop: 1 }}>{f.motto}</div>
                  </div>
                  <span style={{ fontSize: 18, color: C.textFaint, opacity: 0.6, lineHeight: 1 }}>›</span>
                </div>
                <div style={{ fontSize: 12.5, color: C.textDim, margin: "10px 0 8px", lineHeight: 1.4 }}>{f.desc}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 600, color: C.ok, background: C.okBg, padding: "4px 9px", borderRadius: 999 }}>
                  {f.bonus}
                </div>
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 9.5, color: C.textFaint, marginTop: 20, letterSpacing: 0.6 }}>Choix définitif pour cette partie.</p>
      </div>
    </div>
  );
}
