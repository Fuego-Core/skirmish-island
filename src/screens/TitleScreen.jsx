import { C } from "../game/constants.js";
import { FACTIONS } from "../game/factions.js";
import { Meander } from "../ui/Icon.jsx";
import { fd, fb } from "../ui/kit.jsx";
import titleBackdrop from "../assets/images/title-backdrop.webp";
import crestAthenes from "../assets/images/crest-athenes.webp";
import crestSparte from "../assets/images/crest-sparte.webp";
import crestLogo from "../assets/images/crest-logo.webp";

const CREST_IMAGES = { athenes: crestAthenes, sparte: crestSparte, senat: crestLogo };

// L'écran-titre garde une ambiance crépusculaire fixe, indépendante du thème
// clair de la coquille du jeu (photo de fond sombre + texte clair dessus).
const T = {
  bgDeep: "#05090e",
  text: "#f0e8d8", textDim: "#c9bfa8", textFaint: "#a89878",
  gold: "#e6c469", goldDim: "#7a6226",
  shadowSoft: "0 10px 28px rgba(2,5,9,0.42)",
};

// Médaillon héraldique (bas-relief bronze généré) — un seul motif de "blason"
// réutilisé pour le logo du jeu et pour chaque faction, découpé en cercle.
function Crest({ icon, size = 60 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
      border: `1.5px solid ${T.gold}88`, boxShadow: "0 3px 10px rgba(0,0,0,0.55), inset 0 0 12px rgba(0,0,0,0.45)",
    }}>
      <img src={CREST_IMAGES[icon]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

export function TitleScreen({ onChooseFaction }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", color: T.text, ...fb, display: "flex", flexDirection: "column" }}>
      {/* Fond : crépuscule sur l'Égée, en mouvement lent (Ken Burns) */}
      <div style={{ position: "absolute", inset: "-6%", zIndex: 0, animation: "kenBurns 32s ease-in-out infinite" }}>
        <img src={titleBackdrop} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "58% 28%", display: "block" }} />
      </div>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: `linear-gradient(180deg, ${T.bgDeep}d1 0%, ${T.bgDeep}70 14%, ${T.bgDeep}40 28%, ${T.bgDeep}4a 42%, #2a1a1acc 58%, #1c1018ea 78%, ${T.bgDeep} 100%)`,
      }} />
      {/* halo chaud qui prolonge le crépuscule sous les cartes, pour éviter la coupure nette image/panneau */}
      <div style={{ position: "absolute", left: "50%", top: "54%", width: 460, height: 460, marginLeft: -230, marginTop: -230, zIndex: 1, background: "radial-gradient(circle, rgba(216,120,70,0.22), transparent 68%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "30px 18px calc(30px + env(safe-area-inset-bottom))", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, animation: "riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div style={{ animation: "floatY 4.5s ease-in-out infinite" }}>
            <Crest icon="senat" size={76} />
          </div>
          <h1 style={{ ...fd, fontSize: 32, fontWeight: 700, letterSpacing: 7, color: T.gold, margin: "10px 0 0", textAlign: "center", textShadow: `0 4px 26px rgba(230,196,105,0.4), 0 2px 6px rgba(0,0,0,0.7)` }}>
            SKIRMISH
          </h1>
          <h1 style={{ ...fd, fontSize: 32, fontWeight: 700, letterSpacing: 7, color: T.gold, margin: "0 0 10px", textAlign: "center", textShadow: `0 4px 26px rgba(230,196,105,0.4), 0 2px 6px rgba(0,0,0,0.7)` }}>
            ISLAND
          </h1>
          <div style={{ width: 170, marginBottom: 10 }}><Meander color={T.goldDim} height={7} /></div>
          <p style={{ fontSize: 13.5, color: T.text, margin: 0, textAlign: "center", letterSpacing: 0.3, textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
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
                  textAlign: "left", cursor: "pointer", borderRadius: 16, padding: "14px 16px",
                  background: `linear-gradient(160deg, rgba(58,38,42,0.6), rgba(24,16,22,0.68))`,
                  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                  border: `1px solid rgba(233,196,140,0.14)`, color: T.text, boxShadow: T.shadowSoft,
                  animation: `riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${0.1 + i * 0.09}s`,
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Crest icon={fk} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...fd, fontSize: 16, fontWeight: 600, letterSpacing: 2, color: T.gold }}>{f.label.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: T.textFaint, marginTop: 1 }}>{f.motto}</div>
                  </div>
                  <span style={{ fontSize: 18, color: T.textFaint, opacity: 0.6, lineHeight: 1 }}>›</span>
                </div>
                <div style={{ fontSize: 12.5, color: T.textDim, margin: "10px 0 8px", lineHeight: 1.4 }}>{f.desc}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 600, color: C.ok, background: C.okBg, padding: "4px 9px", borderRadius: 999 }}>
                  {f.bonus}
                </div>
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 9.5, color: T.textFaint, marginTop: 20, letterSpacing: 0.6 }}>Choix définitif pour cette partie.</p>
      </div>
    </div>
  );
}
