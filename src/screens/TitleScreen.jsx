import { C } from "../game/constants.js";
import { FACTIONS } from "../game/factions.js";
import { I, Meander } from "../ui/Icon.jsx";
import { fd, fb } from "../ui/kit.jsx";
import titleBackdrop from "../assets/images/title-backdrop.webp";

// Médaillon héraldique (couronne de laurier + icône) — un seul motif de
// "crest" réutilisé pour le blason du jeu et pour chaque faction.
function Crest({ icon, size = 60, iconSize = 22 }) {
  const leafAngles = [];
  for (let a = -164; a <= 164; a += 16) leafAngles.push(a);
  return (
    <svg width={size} height={size} viewBox="-32 -32 64 64" style={{ flexShrink: 0, filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.45))" }}>
      <defs>
        <radialGradient id={`crestFill-${icon}`} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#f3d99a" /><stop offset="55%" stopColor="#c39a3d" /><stop offset="100%" stopColor="#8a662b" />
        </radialGradient>
      </defs>
      <g fill="#6d8a56">
        {leafAngles.map((a, i) => (
          <g key={i} transform={`rotate(${a}) translate(0, -29)`}>
            <path d="M0,5.2 C-2.7,3 -3,-1 0,-5.2 C3,-1 2.7,3 0,5.2 Z" transform={a < 0 ? "scale(-1,1)" : undefined} opacity={0.92} />
          </g>
        ))}
      </g>
      <circle cx="0" cy="0" r="24" fill={`url(#crestFill-${icon})`} stroke="#3a2a12" strokeWidth="1.2" />
      <circle cx="0" cy="0" r="24" fill="none" stroke="#fff3d6" strokeWidth="0.7" opacity="0.4" />
      <g transform={`translate(${-iconSize / 2},${-iconSize / 2})`}>
        <I name={icon} size={iconSize} color="#1c1509" sw={1.6} />
      </g>
    </svg>
  );
}

export function TitleScreen({ onChooseFaction }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", color: C.text, ...fb, display: "flex", flexDirection: "column" }}>
      {/* Fond : crépuscule sur l'Égée, en mouvement lent (Ken Burns) */}
      <div style={{ position: "absolute", inset: "-6%", zIndex: 0, animation: "kenBurns 32s ease-in-out infinite" }}>
        <img src={titleBackdrop} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "58% 28%", display: "block" }} />
      </div>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: `linear-gradient(180deg, ${C.bgDeep}d1 0%, ${C.bgDeep}70 14%, ${C.bgDeep}40 28%, ${C.bgDeep}4a 42%, #2a1a1acc 58%, #1c1018ea 78%, ${C.bgDeep} 100%)`,
      }} />
      {/* halo chaud qui prolonge le crépuscule sous les cartes, pour éviter la coupure nette image/panneau */}
      <div style={{ position: "absolute", left: "50%", top: "54%", width: 460, height: 460, marginLeft: -230, marginTop: -230, zIndex: 1, background: "radial-gradient(circle, rgba(216,120,70,0.22), transparent 68%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "30px 18px calc(30px + env(safe-area-inset-bottom))", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, animation: "riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div style={{ animation: "floatY 4.5s ease-in-out infinite" }}>
            <Crest icon="senat" size={68} iconSize={26} />
          </div>
          <h1 style={{ ...fd, fontSize: 32, fontWeight: 700, letterSpacing: 7, color: C.goldHi, margin: "10px 0 0", textAlign: "center", textShadow: `0 4px 26px rgba(230,196,105,0.4), 0 2px 6px rgba(0,0,0,0.7)` }}>
            SKIRMISH
          </h1>
          <h1 style={{ ...fd, fontSize: 32, fontWeight: 700, letterSpacing: 7, color: C.goldHi, margin: "0 0 10px", textAlign: "center", textShadow: `0 4px 26px rgba(230,196,105,0.4), 0 2px 6px rgba(0,0,0,0.7)` }}>
            ISLAND
          </h1>
          <div style={{ width: 170, marginBottom: 10 }}><Meander color={C.goldDim} height={7} /></div>
          <p style={{ fontSize: 13.5, color: C.text, margin: 0, textAlign: "center", letterSpacing: 0.3, textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>
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
                  border: `1px solid rgba(233,196,140,0.14)`, color: C.text, boxShadow: C.shadowSoft,
                  animation: `riseIn 0.6s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${0.1 + i * 0.09}s`,
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Crest icon={fk} />
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
