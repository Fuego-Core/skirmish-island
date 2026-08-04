import { useState } from "react";
import { C } from "../../game/constants.js";
import { TROOPS, compositionBonus, matchupBonus } from "../../game/troops.js";
import { FACTIONS } from "../../game/factions.js";
import { Sheet, Btn, Stepper, fmtNum } from "../kit.jsx";
import { TROOP_PORTRAITS } from "../troopPortraits.js";

const FAMILY_LABEL = { infantry: "Infanterie", ranged: "Tir", cavalry: "Cavalerie" };
const FAMILY_COLOR = { infantry: C.water, ranged: C.gold, cavalry: C.copper };

function TroopPortrait({ type }) {
  return (
    <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", overflow: "hidden", border: `1.5px solid ${C.goldHi}88` }}>
      <img src={TROOP_PORTRAITS[type]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

// Simulateur autonome : ne consomme rien, n'envoie aucune flotte — juste un
// aperçu des mêmes formules que la vraie résolution d'attaque (engine.js),
// pour tester une composition avant de s'engager pour de vrai.
export function SimulatorSheet({ open, onClose, game }) {
  const [attackForm, setAttackForm] = useState({ hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 });
  const [defPower, setDefPower] = useState(200);
  const [knowMix, setKnowMix] = useState(false);
  const [mix, setMix] = useState({ infantry: 34, ranged: 33, cavalry: 33 });

  const setMixPart = (f, v) => setMix((m) => ({ ...m, [f]: Math.max(0, Math.min(100, v)) }));
  const mixTotal = mix.infantry + mix.ranged + mix.cavalry;
  const normMix = mixTotal > 0
    ? { infantry: mix.infantry / mixTotal, ranged: mix.ranged / mixTotal, cavalry: mix.cavalry / mixTotal }
    : { infantry: 1 / 3, ranged: 1 / 3, cavalry: 1 / 3 };

  const factionAtk = (game.faction && FACTIONS[game.faction].atkBonus) || 1;
  const bonus = knowMix ? matchupBonus(attackForm, normMix) : compositionBonus(attackForm);
  const rawAtk = Object.keys(attackForm).reduce((a, t) => a + attackForm[t] * TROOPS[t].atk, 0);
  const siegeBonus = Object.keys(attackForm).reduce((a, t) => a + (TROOPS[t].siege ? attackForm[t] * TROOPS[t].atk * 0.5 : 0), 0);
  const atkPower = Math.round(rawAtk * factionAtk * bonus);
  const totalAtk = atkPower + siegeBonus;
  const hasTroops = Object.values(attackForm).reduce((a, n) => a + n, 0) > 0;
  const win = hasTroops && totalAtk > defPower;
  const lossRate = !hasTroops ? 0 : win ? Math.min(0.9, defPower / ((totalAtk) * 2 || 1)) : 0.75;
  const pct = Math.round((bonus - 1) * 100);

  return (
    <Sheet open={open} onClose={onClose} title="SIMULATEUR DE COMBAT" icon="epees">
      <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 14, fontStyle: "italic" }}>
        Teste une composition avant de l'envoyer pour de vrai — n'engage aucune troupe, n'envoie aucune flotte.
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 8 }}>Tes troupes envoyées</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
        {Object.keys(TROOPS).map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TroopPortrait type={t} />
            <span style={{ fontSize: 11, color: C.textDim, flex: 1 }}>{TROOPS[t].label}</span>
            <Stepper value={attackForm[t]} max={game.troops[t] || 0} onChange={(v) => setAttackForm((f) => ({ ...f, [t]: v }))} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 8 }}>Défense adverse</div>
      <div style={{ background: C.inset, borderRadius: 9, padding: "11px 13px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: C.textDim }}>Puissance de défense</span>
          <input type="number" min={0} value={defPower} onChange={(e) => setDefPower(Math.max(0, Math.floor(+e.target.value || 0)))}
            style={{ width: 90, padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontFamily: "monospace", fontSize: 13 }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10.5, color: C.textDim, cursor: "pointer", marginBottom: knowMix ? 10 : 0 }}>
          <input type="checkbox" checked={knowMix} onChange={(e) => setKnowMix(e.target.checked)} />
          Composition connue (espionnage) — active le contre d'unités
        </label>
        {knowMix && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["infantry", "ranged", "cavalry"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: FAMILY_COLOR[f], flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, color: C.textDim, width: 66 }}>{FAMILY_LABEL[f]}</span>
                <input type="number" min={0} max={100} value={mix[f]} onChange={(e) => setMixPart(f, Math.floor(+e.target.value || 0))}
                  style={{ width: 60, padding: "4px 7px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontFamily: "monospace", fontSize: 11 }} />
                <span style={{ fontSize: 10, color: C.textFaint }}>% (soit {Math.round(normMix[f] * 100)}% normalisé)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        background: win ? "rgba(95,174,112,0.12)" : hasTroops ? "rgba(211,86,74,0.12)" : C.inset,
        border: `1px solid ${win ? C.ok : hasTroops ? C.bad : C.borderSoft}`, borderRadius: 10, padding: "13px 14px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: hasTroops ? (win ? C.ok : C.bad) : C.textFaint }}>
            {hasTroops ? (win ? "Victoire probable" : "Défaite probable") : "Aucune troupe engagée"}
          </span>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: C.text }}>{totalAtk} <span style={{ color: C.textFaint }}>vs</span> {defPower}</span>
        </div>
        {hasTroops && (
          <>
            <div style={{ fontSize: 10.5, color: C.textDim, marginBottom: 4 }}>
              Bonus de {knowMix ? "contre" : "mix"} : <span style={{ color: pct >= 0 ? C.ok : C.bad, fontFamily: "monospace" }}>{pct >= 0 ? "+" : ""}{pct}%</span>
              {siegeBonus > 0 && <> · bonus de siège : <span style={{ color: C.ok, fontFamily: "monospace" }}>+{Math.round(siegeBonus)}</span></>}
            </div>
            <div style={{ fontSize: 10.5, color: C.textDim }}>
              Pertes estimées : <span style={{ color: C.bad, fontFamily: "monospace" }}>~{Math.round(lossRate * 100)}%</span> de tes troupes envoyées
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <Btn small label="Réinitialiser" onClick={() => { setAttackForm({ hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 }); setDefPower(200); setKnowMix(false); }} />
      </div>
    </Sheet>
  );
}
