import { C, RES, RES_ICONN, RES_COLOR } from "../game/constants.js";
import { I } from "./Icon.jsx";

// ---- UI helpers ----
export const fd = { fontFamily: "'Cinzel', Georgia, serif" };
export const fb = { fontFamily: "'Crimson Pro', Georgia, serif" };

export const Card = ({ children, style }) => (
  <div style={{ background: `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`, border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: "12px 14px", ...style }}>{children}</div>
);

export const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 2px 9px" }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.goldDim})` }} />
    <span style={{ ...fd, fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.gold }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.goldDim}, transparent)` }} />
  </div>
);

export const CostRow = ({ cost, resources, mult = 1 }) => (
  <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
    {RES.map((r) => (
      <span key={r} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontFamily: "monospace", color: resources[r] >= cost[r] * mult ? C.textDim : C.bad }}>
        <I name={RES_ICONN[r]} size={12} color={resources[r] >= cost[r] * mult ? RES_COLOR[r] : C.bad} />
        {fmtNum(cost[r] * mult)}
      </span>
    ))}
  </div>
);

export const Btn = ({ label, disabled, onClick, small, primary }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: small ? "6px 11px" : "9px 18px", borderRadius: 7,
      fontSize: small ? 10 : 12, ...fd, letterSpacing: 0.8,
      background: disabled ? "transparent" : primary ? `linear-gradient(180deg, ${C.goldHi}, ${C.gold} 45%, ${C.bronze})` : "rgba(201,161,59,0.10)",
      border: `1px solid ${disabled ? C.border : C.gold}`,
      color: disabled ? C.textFaint : primary ? C.ink : C.gold,
      cursor: disabled ? "not-allowed" : "pointer",
      textShadow: primary && !disabled ? "0 1px 0 rgba(255,255,255,0.25)" : "none",
      boxShadow: primary && !disabled ? "0 2px 6px rgba(0,0,0,0.35)" : "none",
    }}>{label}</button>
);

export const Stepper = ({ value, max, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
    <button onClick={() => onChange(Math.max(0, value - 1))}
      style={{ width: 26, height: 26, borderRadius: 6, background: C.panelUp, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>−</button>
    <span style={{ fontFamily: "monospace", fontSize: 12, width: 54, textAlign: "center", color: C.text }}>{value}/{max}</span>
    <button onClick={() => onChange(Math.min(max, value + 1))}
      style={{ width: 26, height: 26, borderRadius: 6, background: C.panelUp, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>+</button>
  </div>
);

export const Sheet = ({ open, onClose, title, icon, accent, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(5,9,14,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "78vh", overflowY: "auto", boxSizing: "border-box",
          background: `linear-gradient(180deg, ${C.panelUp}, ${C.panel})`,
          borderTop: `2px solid ${accent || C.gold}`, borderRadius: "16px 16px 0 0",
          padding: "10px 16px 24px", boxShadow: "0 -8px 30px rgba(0,0,0,0.5)",
          animation: "sheetUp 0.22s ease-out",
        }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 9, ...fd, fontSize: 14, letterSpacing: 1.5, color: accent || C.goldHi }}>
            {icon && <I name={icon} size={19} color={accent || C.goldHi} />}
            {title}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textDim, fontSize: 18, cursor: "pointer", padding: 4, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const QueueCard = ({ icon, label, remaining }) => (
  <Card style={{ borderColor: C.goldDim, marginBottom: 8, padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, ...fb }}>
      <I name={icon} size={15} color={C.gold} />{label}
    </span>
    <span style={{ fontFamily: "monospace", fontSize: 12, color: C.gold }}>{remaining}</span>
  </Card>
);

export const fmtTime = (ms) => {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}m ${sec % 60}s` : `${sec}s`;
};
export const fmtNum = (n) => (n >= 10000 ? `${Math.floor(n / 1000)}k` : Math.floor(n));
