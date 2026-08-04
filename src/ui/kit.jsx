import { C, RES, RES_ICONN, RES_COLOR } from "../game/constants.js";
import { I } from "./Icon.jsx";
import { haptic } from "./haptics.js";
import { sfx } from "./sound.js";
import { RES_PORTRAITS } from "./resourcePortraits.js";

// Icône de ressource — image générée (bois/pierre/fer/or/blé), remplace la
// petite icône trait partout où une ressource est affichée.
export const ResIcon = ({ r, size = 13, dim }) => (
  RES_PORTRAITS[r]
    ? <img src={RES_PORTRAITS[r]} alt="" style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, display: "inline-block", opacity: dim ? 0.55 : 1, filter: dim ? "grayscale(0.4)" : "none" }} />
    : <I name={RES_ICONN[r]} size={size} color={dim ? C.bad : RES_COLOR[r]} />
);

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
  <div style={{ ...glassSurface, borderRadius: 14, padding: "15px 17px", ...style }}>{children}</div>
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
    {RES.map((r) => {
      const enough = resources[r] >= cost[r] * mult;
      return (
        <span key={r} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, ...fmono, fontWeight: 600, color: enough ? C.textDim : C.bad }}>
          <ResIcon r={r} size={15} dim={!enough} />
          {fmtNum(cost[r] * mult)}
        </span>
      );
    })}
  </div>
);

export const Btn = ({ label, disabled, onClick, small, primary }) => (
  <button onClick={(e) => { haptic(primary ? 12 : 7); sfx(primary ? "confirm" : "tap"); onClick?.(e); }} disabled={disabled}
    style={{
      padding: small ? "8px 14px" : "11px 20px", minHeight: small ? 32 : 44, borderRadius: 10,
      fontSize: small ? 11 : 13, ...fd, fontWeight: 600, letterSpacing: 0.6,
      background: disabled ? C.ghost : primary ? `linear-gradient(180deg, ${C.goldHi}, ${C.gold} 55%, ${C.bronze})` : C.glassHi,
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
    <button onClick={() => { haptic(5); onChange(Math.max(0, value - 1)); }}
      style={{ width: 34, height: 34, borderRadius: 9, background: C.glassHi, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>−</button>
    <span style={{ ...fmono, fontSize: 13, fontWeight: 600, width: 58, textAlign: "center", color: C.text }}>{value}/{max}</span>
    <button onClick={() => { haptic(5); onChange(Math.min(max, value + 1)); }}
      style={{ width: 34, height: 34, borderRadius: 9, background: C.glassHi, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>+</button>
  </div>
);

export const Sheet = ({ open, onClose, title, icon, accent, children }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(30,22,10,0.42)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.18s ease-out" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, maxHeight: "82vh", overflowY: "auto", boxSizing: "border-box",
          background: `linear-gradient(175deg, ${C.panelUp}, ${C.panel})`,
          borderTop: `1px solid ${accent || C.gold}66`, borderLeft: `1px solid ${C.glassBorder}`, borderRight: `1px solid ${C.glassBorder}`,
          borderRadius: "20px 20px 0 0",
          padding: "12px 20px calc(28px + env(safe-area-inset-bottom))", boxShadow: "0 -16px 40px rgba(2,4,7,0.55)",
          animation: "sheetUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
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

// File d'attente en cases prédéfinies — tous les emplacements sont visibles
// dès le départ (vides, pointillés) ; chaque commande occupe une case avec
// son portrait et un décompte, la première en cours mise en avant.
// `items` = [{ portrait, icon, remaining }], remaining = temps estimé avant
// que CETTE case soit terminée (cumul des files en attente devant elle).
export const SlotQueue = ({ title, slots, items }) => (
  <Card style={{ borderColor: `${C.goldDim}88`, marginBottom: 8, padding: "12px 14px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <span style={{ ...fd, fontSize: 10, fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: C.gold }}>{title}</span>
      <span style={{ ...fmono, fontSize: 10.5, fontWeight: 700, color: items.length >= slots ? C.bad : C.textFaint }}>{items.length}/{slots}</span>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      {Array.from({ length: slots }).map((_, i) => {
        const it = items[i];
        if (!it) {
          return <div key={i} style={{ width: 50, height: 50, borderRadius: 10, flexShrink: 0, background: C.ghost, border: `1px dashed ${C.borderSoft}` }} />;
        }
        const active = i === 0;
        return (
          <div key={i} style={{ width: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 10, overflow: "hidden", position: "relative",
              border: `1.5px solid ${active ? C.gold : C.borderSoft}`,
              boxShadow: active ? `0 0 0 1px ${C.goldHi}55, 0 2px 6px rgba(0,0,0,0.35)` : "0 2px 5px rgba(0,0,0,0.22)",
              opacity: active ? 1 : 0.8,
            }}>
              {it.portrait
                ? <img src={it.portrait} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.inset }}>
                    <I name={it.icon} size={20} color={active ? C.gold : C.textFaint} />
                  </div>}
            </div>
            <span style={{ ...fmono, fontSize: 9, fontWeight: 700, color: active ? C.gold : C.textFaint }}>{it.remaining}</span>
          </div>
        );
      })}
    </div>
  </Card>
);

export const fmtTime = (ms) => {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}m ${sec % 60}s` : `${sec}s`;
};
export const fmtNum = (n) => (n >= 10000 ? `${Math.floor(n / 1000)}k` : Math.floor(n));

// Horodatage relatif ("il y a 5 min") pour le journal des rapports.
export const fmtAgo = (deltaMs) => {
  const s = Math.max(0, Math.floor(deltaMs / 1000));
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
};
