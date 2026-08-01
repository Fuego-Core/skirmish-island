import { C, RES, RES_ICONN, RES_COLOR } from "../game/constants.js";
import { I } from "./Icon.jsx";

// ---- Polices ----
// Cinzel : titres, empreinte "gravé dans le marbre" — réservé aux headers/CTA.
// Manrope : interface, chiffres, corps de texte — lisible et net à petite taille.
export const fd = { fontFamily: "'Cinzel', Georgia, serif" };
export const fb = { fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const fmono = { fontFamily: "'Manrope', ui-monospace, monospace", fontVariantNumeric: "tabular-nums" };

// Surface "verre" commune aux panneaux — légère transparence + flou + liseré chaud.
const glassSurface = {
  background: `linear-gradient(165deg, ${C.glassHi}, ${C.glass})`,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: `1px solid ${C.glassBorder}`,
  boxShadow: C.shadowSoft,
};

export const Card = ({ children, style }) => (
  <div style={{ ...glassSurface, borderRadius: 14, padding: "13px 15px", ...style }}>{children}</div>
);

export const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 2px 10px" }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.goldDim})` }} />
    <span style={{ ...fd, fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: C.gold }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.goldDim}, transparent)` }} />
  </div>
);

export const CostRow = ({ cost, resources, mult = 1 }) => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
    {RES.map((r) => (
      <span key={r} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, ...fmono, fontWeight: 600, color: resources[r] >= cost[r] * mult ? C.textDim : C.bad }}>
        <I name={RES_ICONN[r]} size={13} color={resources[r] >= cost[r] * mult ? RES_COLOR[r] : C.bad} />
        {fmtNum(cost[r] * mult)}
      </span>
    ))}
  </div>
);

export const Btn = ({ label, disabled, onClick, small, primary }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: small ? "8px 14px" : "11px 20px", minHeight: small ? 32 : 44, borderRadius: 10,
      fontSize: small ? 11 : 13, ...fd, fontWeight: 600, letterSpacing: 0.6,
      background: disabled ? "rgba(255,255,255,0.03)" : primary ? `linear-gradient(180deg, ${C.goldHi}, ${C.gold} 55%, ${C.bronze})` : C.glassHi,
      backdropFilter: disabled || primary ? "none" : "blur(10px)",
      border: `1px solid ${disabled ? C.borderSoft : primary ? C.goldHi : C.border}`,
      color: disabled ? C.textFaint : primary ? C.ink : C.text,
      cursor: disabled ? "not-allowed" : "pointer",
      textShadow: primary && !disabled ? "0 1px 0 rgba(255,255,255,0.3)" : "none",
      boxShadow: primary && !disabled ? `${C.shadowLift}, ${C.glow}` : disabled ? "none" : C.shadowLift,
    }}>{label}</button>
);

export const Stepper = ({ value, max, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <button onClick={() => onChange(Math.max(0, value - 1))}
      style={{ width: 34, height: 34, borderRadius: 9, background: C.glassHi, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>−</button>
    <span style={{ ...fmono, fontSize: 13, fontWeight: 600, width: 58, textAlign: "center", color: C.text }}>{value}/{max}</span>
    <button onClick={() => onChange(Math.min(max, value + 1))}
      style={{ width: 34, height: 34, borderRadius: 9, background: C.glassHi, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>+</button>
  </div>
);

export const Sheet = ({ open, onClose, title, icon, accent, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(3,6,10,0.66)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.18s ease-out" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "82vh", overflowY: "auto", boxSizing: "border-box",
          background: `linear-gradient(175deg, ${C.panelUp}, ${C.panel})`,
          borderTop: `1px solid ${accent || C.gold}66`, borderLeft: `1px solid ${C.glassBorder}`, borderRight: `1px solid ${C.glassBorder}`,
          borderRadius: "20px 20px 0 0",
          padding: "10px 18px calc(26px + env(safe-area-inset-bottom))", boxShadow: "0 -16px 40px rgba(2,4,7,0.55)",
          animation: "sheetUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, ...fd, fontSize: 15, fontWeight: 600, letterSpacing: 1.2, color: accent || C.goldHi }}>
            {icon && <I name={icon} size={20} color={accent || C.goldHi} />}
            {title}
          </span>
          <button onClick={onClose} aria-label="Fermer"
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: C.glassHi, borderRadius: 9, border: `1px solid ${C.border}`, color: C.textDim, fontSize: 15, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const QueueCard = ({ icon, label, remaining }) => (
  <Card style={{ borderColor: `${C.goldDim}88`, marginBottom: 8, padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, ...fb, fontWeight: 500 }}>
      <I name={icon} size={16} color={C.gold} />{label}
    </span>
    <span style={{ ...fmono, fontSize: 13, fontWeight: 700, color: C.gold }}>{remaining}</span>
  </Card>
);

export const fmtTime = (ms) => {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}m ${sec % 60}s` : `${sec}s`;
};
export const fmtNum = (n) => (n >= 10000 ? `${Math.floor(n / 1000)}k` : Math.floor(n));
