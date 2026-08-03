import { C, RES, RES_ICONN, RES_COLOR, GROUP_COLOR } from "../../game/constants.js";
import { BUILDINGS, B_ICON, upgradeCost, buildDuration, prodPerHour, storageCap, buildSlots } from "../../game/buildings.js";
import { I } from "../Icon.jsx";
import { Sheet, Btn, fmtNum, fmtTime } from "../kit.jsx";
import { BUILDING_PORTRAITS } from "../buildingPortraits.js";

export function BuildingSheet({
  buildingKey, isl, resources, nowTick,
  marketFrom, setMarketFrom, marketTo, setMarketTo,
  onClose, onUpgrade, onTradeMarket,
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

      {b.produces && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 12 }}>
          <I name={RES_ICONN[b.produces]} size={16} color={RES_COLOR[b.produces]} />
          <span style={{ fontSize: 12, fontFamily: "monospace", color: C.textDim }}>
            +{prodPerHour(level)}/h <span style={{ color: C.ok }}>→ +{prodPerHour(level + 1)}/h</span>
          </span>
        </div>
      )}
      {(key === "entrepot" || key === "grenier") && (
        <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 12, fontSize: 12, fontFamily: "monospace", color: C.textDim }}>
          Capacité {fmtNum(storageCap(level))} <span style={{ color: C.ok }}>→ {fmtNum(storageCap(level + 1))}</span>
        </div>
      )}
      {key === "muraille" && (
        <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 12, fontSize: 12, fontFamily: "monospace", color: C.textDim }}>
          Garnison +{level * 6}% <span style={{ color: C.ok }}>→ +{(level + 1) * 6}%</span>
        </div>
      )}
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
        <div style={{ background: C.inset, borderRadius: 10, padding: "13px 14px", marginBottom: 13, border: `1px solid ${C.borderSoft}` }}>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 9 }}>Échange — 3 donnés contre 2 reçus</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 9 }}>
            {RES.map((r) => (
              <button key={"f" + r} onClick={() => setMarketFrom(r)}
                style={{ padding: 6, borderRadius: 7, background: marketFrom === r ? `${RES_COLOR[r]}25` : "transparent", border: `1px solid ${marketFrom === r ? RES_COLOR[r] : C.border}`, cursor: "pointer", lineHeight: 0 }}>
                <I name={RES_ICONN[r]} size={15} color={marketFrom === r ? RES_COLOR[r] : C.textFaint} />
              </button>
            ))}
            <span style={{ fontSize: 13, color: C.gold, padding: "0 3px" }}>→</span>
            {RES.map((r) => (
              <button key={"t" + r} onClick={() => setMarketTo(r)}
                style={{ padding: 6, borderRadius: 7, background: marketTo === r ? `${RES_COLOR[r]}25` : "transparent", border: `1px solid ${marketTo === r ? RES_COLOR[r] : C.border}`, cursor: "pointer", lineHeight: 0 }}>
                <I name={RES_ICONN[r]} size={15} color={marketTo === r ? RES_COLOR[r] : C.textFaint} />
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[300, 1500, 6000].map((amt) => (
              <Btn key={amt} small label={`${fmtNum(amt)} → ${fmtNum(Math.floor(amt / 1.5))}`}
                disabled={marketFrom === marketTo || resources[marketFrom] < amt}
                onClick={() => onTradeMarket(marketFrom, marketTo, amt)} />
            ))}
          </div>
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
                  <I name={RES_ICONN[r]} size={14} color={enough ? RES_COLOR[r] : C.bad} />
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
