import { C, RES, GROUP_COLOR } from "../../game/constants.js";
import { BUILDINGS, B_ICON, upgradeCost, buildDuration, prodPerHour, storageCap, buildSlots } from "../../game/buildings.js";
import { I } from "../Icon.jsx";
import { Sheet, Btn, ResIcon, fmtNum, fmtTime } from "../kit.jsx";
import { BUILDING_PORTRAITS } from "../buildingPortraits.js";

export function BuildingSheet({
  buildingKey, isl, resources, nowTick,
  onClose, onUpgrade, onOpenMarket,
}) {
  const key = buildingKey;
  const b = BUILDINGS[key];
  const col = GROUP_COLOR[b.group];
  const queue = isl.queue || [];
  const slots = buildSlots(isl.buildings.senat);
  // Niveau atteint une fois la file écoulée : coût et durée affichés suivent
  // les améliorations déjà en attente sur ce bâtiment.
  const pending = queue.filter((q) => q.key === key).length;
  const level = isl.buildings[key] + pending;
  const cost = upgradeCost(key, level);
  const req = b.requires;
  const reqOk = !req || Object.keys(req).every((rq) => isl.buildings[rq] >= req[rq]);
  const canAfford = RES.every((r) => resources[r] >= cost[r]);
  const maxed = b.maxLevel && level >= b.maxLevel;
  const busy = queue.length >= slots;
  const dur = buildDuration(key, level, isl.buildings.senat);
  const active = queue[0] && queue[0].key === key ? queue[0] : null;
  const inProgress = pending > 0;

  return (
    <Sheet open onClose={onClose} title={b.label.toUpperCase()} icon={B_ICON[key]} accent={col}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
        <div style={{ width: 58, height: 58, borderRadius: 12, background: `linear-gradient(180deg, ${col}28, ${C.panel})`, border: `1px solid ${col}66`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          {BUILDING_PORTRAITS[key] ? (
            <img src={BUILDING_PORTRAITS[key]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <I name={B_ICON[key]} size={32} color={col} sw={1.5} />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontFamily: "monospace", color: col }}>
            {maxed ? "NIVEAU MAX" : level > 0 ? `Niveau ${level}` : "Non construit"}
            {!maxed && <span style={{ color: C.textFaint }}> → {level + 1}</span>}
          </div>
          <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", marginTop: 3 }}>{b.desc}</div>
        </div>
      </div>

      {(() => {
        const statLabel = b.produces ? "Production/h" : (key === "entrepot" || key === "grenier") ? "Capacité" : key === "muraille" ? "Bonus garnison" : null;
        if (!statLabel) return null;
        const fmt = (lvl) => b.produces ? `+${fmtNum(prodPerHour(lvl))}` : key === "muraille" ? `+${lvl * 6}%` : fmtNum(storageCap(lvl));
        return (
          <div style={{ borderRadius: 10, marginBottom: 12, border: `1px solid ${C.borderSoft}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: maxed ? "1fr" : "1fr 1fr" }}>
              <div style={{ padding: "10px 13px", borderRight: maxed ? "none" : `1px solid ${C.borderSoft}` }}>
                <div style={{ fontSize: 8.5, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1.2, color: C.textFaint, textTransform: "uppercase", marginBottom: 4 }}>
                  {statLabel} · niv. {level}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "monospace", color: C.text }}>
                  {b.produces && <ResIcon r={b.produces} size={16} />}
                  {fmt(level)}
                </div>
              </div>
              {!maxed && (
                <div style={{ padding: "10px 13px", background: `${C.ok}14` }}>
                  <div style={{ fontSize: 8.5, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1.2, color: C.ok, textTransform: "uppercase", marginBottom: 4 }}>
                    {statLabel} · niv. {level + 1}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "monospace", color: C.ok, fontWeight: 700 }}>
                    {b.produces && <ResIcon r={b.produces} size={16} />}
                    {fmt(level + 1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {key === "colosse" && (
        <div style={{ background: C.inset, borderRadius: 9, padding: "12px 13px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>Étapes de construction</div>
          <div style={{ display: "flex", gap: 5 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} style={{ flex: 1, height: 7, borderRadius: 4, background: n <= level ? C.goldHi : C.border }} />
            ))}
          </div>
        </div>
      )}
      {!reqOk && (
        <div style={{ background: "rgba(192,85,85,0.10)", border: `1px solid ${C.bad}44`, borderRadius: 9, padding: "11px 13px", marginBottom: 12, fontSize: 11, color: C.bad }}>
          Requiert : {Object.keys(req).map((rq) => `${BUILDINGS[rq].label} niv. ${req[rq]}`).join(", ")}
        </div>
      )}
      {inProgress && (
        <div style={{ background: "rgba(201,161,59,0.10)", border: `1px solid ${C.gold}`, borderRadius: 9, padding: "11px 13px", marginBottom: 12, fontSize: 12, color: C.goldHi, display: "flex", justifyContent: "space-between" }}>
          <span>{active ? "Chantier en cours" : `En file (${pending})`}</span>
          <span style={{ fontFamily: "monospace" }}>{active ? fmtTime(active.endsAt - nowTick) : "en attente"}</span>
        </div>
      )}

      {key === "marche" && level > 0 && (
        <div style={{ background: C.inset, borderRadius: 10, padding: "13px 14px", marginBottom: 13, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.4 }}>
            Offres réelles des cités rivales et des joueurs — taux variables, à repérer.
          </div>
          <Btn primary small label="Ouvrir le marché" onClick={onOpenMarket} />
        </div>
      )}

      {!maxed && (
        <>
          <div style={{ fontSize: 10, color: C.textFaint, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1.5, marginBottom: 9 }}>COÛT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7, marginBottom: 15 }}>
            {RES.map((r) => {
              const enough = resources[r] >= cost[r];
              return (
                <div key={r} style={{ textAlign: "center", background: C.inset, borderRadius: 8, padding: "7px 2px", border: `1px solid ${enough ? "transparent" : C.bad + "55"}` }}>
                  <ResIcon r={r} size={18} dim={!enough} />
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: enough ? C.textDim : C.bad, marginTop: 2 }}>{fmtNum(cost[r])}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Btn primary label={`${busy ? "File pleine" : level > 0 ? "Améliorer" : "Construire"} · ${fmtTime(dur * 1000)}`}
              disabled={busy || !canAfford || !reqOk}
              onClick={() => { onUpgrade(key); onClose(); }} />
          </div>
        </>
      )}
    </Sheet>
  );
}
