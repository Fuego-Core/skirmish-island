import { C } from "../../game/constants.js";
import { TROOPS, compositionBonus, matchupBonus } from "../../game/troops.js";
import { ISLAND_GRID, TILE_LABELS, tileColor } from "../../game/world.js";
import { botName, tilePower } from "../../game/bots.js";
import { REGEN_MS } from "../../game/constants.js";
import { I } from "../Icon.jsx";
import { Sheet, Btn, Stepper, fmtTime, fmtNum, fmtAgo } from "../kit.jsx";
import tileIslandImg from "../../assets/images/tile-island.webp";
import { TROOP_PORTRAITS } from "../troopPortraits.js";

const FAMILY_LABEL = { infantry: "Infanterie", ranged: "Tir", cavalry: "Cavalerie" };
const FAMILY_COLOR = { infantry: C.water, ranged: C.gold, cavalry: C.copper };

// Répartition adverse révélée par l'espionnage — donne un vrai repère
// tactique (contre d'unités) plutôt qu'un simple chiffre de défense.
function EnemyMixBar({ mix }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
        {["infantry", "ranged", "cavalry"].map((f) => (
          <div key={f} style={{ width: `${mix[f] * 100}%`, background: FAMILY_COLOR[f] }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        {["infantry", "ranged", "cavalry"].map((f) => (
          <span key={f} style={{ fontSize: 8.5, color: C.textFaint }}>{FAMILY_LABEL[f]} {Math.round(mix[f] * 100)}%</span>
        ))}
      </div>
    </div>
  );
}

export function TileSheet({
  game, selectedTile, selectedTileKey, nowTick, attackForm, setAttackForm,
  onClose, startExplore, startColonize, startSpy, startAttack,
}) {
  if (!selectedTile) return null;
  const conquered = game.conquered[selectedTileKey];
  const alreadyColonized = !!game.colonized[selectedTileKey];

  return (
    <Sheet open onClose={onClose}
      title={conquered && selectedTile.st !== "ma_ville"
        ? "ÎLE PILLÉE"
        : selectedTile.st === "ile_joueur"
          ? botName(game.region.gx, game.region.gy, selectedTile.px, selectedTile.py).toUpperCase()
          : TILE_LABELS[selectedTile.st].toUpperCase()}
      icon={selectedTile.st === "ma_ville" ? "senat" : selectedTile.st === "fog" ? "explorateur" : selectedTile.st === "eau" ? "peche" : "ile"}
      accent={selectedTile.st === "fog" || selectedTile.st === "eau" ? C.gold : tileColor(selectedTile.st)}>
      <div style={{ textAlign: "center" }}>
        {(selectedTile.st === "ma_ville" || selectedTile.st === "ile_joueur" || selectedTile.st === "ile_inactive" || selectedTile.st === "ile_vide") && (
          <div style={{
            borderRadius: 12, overflow: "hidden", marginBottom: 12, height: 110,
            background: `linear-gradient(160deg, ${tileColor(selectedTile.st)}, ${tileColor(selectedTile.st)}88)`,
            border: `1px solid ${tileColor(selectedTile.st)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={tileIslandImg} alt="" style={{ width: "78%", height: "78%", objectFit: "contain", display: "block" }} />
          </div>
        )}
        <div style={{ fontSize: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "monospace", color: C.goldHi }}>
            {game.region.gx * ISLAND_GRID + selectedTile.px - (game.islands[0].region.gx * ISLAND_GRID + game.islands[0].pos.px)}:
            {game.region.gy * ISLAND_GRID + selectedTile.py - (game.islands[0].region.gy * ISLAND_GRID + game.islands[0].pos.py)}
          </span>{" "}— {conquered && selectedTile.st !== "ma_ville"
            ? `Île pillée — repeuplée dans ${fmtTime(REGEN_MS - (nowTick - (conquered === true ? nowTick : conquered)))}`
            : TILE_LABELS[selectedTile.st]}
        </div>
        {selectedTile.st === "fog" && (
          <Btn primary label={`Explorer (${game.ships.explorateur} nef)`}
            disabled={game.ships.explorateur < 1}
            onClick={() => startExplore(selectedTile.px, selectedTile.py)} />
        )}
        {(selectedTile.st === "ile_vide" || (selectedTile.st === "ile_inactive" && conquered)) && !alreadyColonized && (
          <Btn primary label={`Coloniser (${game.ships.colonisation} nef)`}
            disabled={game.ships.colonisation < 1 || !!game.colonizingTile}
            onClick={() => startColonize(selectedTile.px, selectedTile.py)} />
        )}
        {(selectedTile.st === "ile_joueur" || selectedTile.st === "ile_inactive") && !conquered && !alreadyColonized && (
          <div>
            {game.spied[selectedTileKey] ? (
              <div style={{ borderRadius: 10, marginBottom: 10, border: `1px solid ${C.borderSoft}`, overflow: "hidden", textAlign: "left" }}>
                <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `${C.gold}0f` }}>
                  <span style={{ fontSize: 9.5, fontFamily: "'Cinzel', Georgia, serif", letterSpacing: 1, color: C.goldHi, textTransform: "uppercase" }}>
                    Renseignement d'éclaireur
                  </span>
                  <span style={{ fontSize: 9, color: C.textFaint, fontFamily: "monospace" }}>{fmtAgo(nowTick - game.spied[selectedTileKey].at)}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div style={{ padding: "10px 12px", borderRight: `1px solid ${C.borderSoft}` }}>
                    <div style={{ fontSize: 8.5, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Défense exacte</div>
                    <div style={{ fontSize: 15, fontFamily: "monospace", fontWeight: 700, color: C.bad }}>{fmtNum(game.spied[selectedTileKey].def)}</div>
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 8.5, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Butin est. / ressource</div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: C.ok }}>{fmtNum(game.spied[selectedTileKey].butinMin)}–{fmtNum(game.spied[selectedTileKey].butinMax)}</div>
                  </div>
                </div>
                {game.spied[selectedTileKey].familyMix && (
                  <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.borderSoft}` }}>
                    <div style={{ fontSize: 8.5, color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Composition adverse</div>
                    <EnemyMixBar mix={game.spied[selectedTileKey].familyMix} />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                <span>Défense inconnue (~{Math.round(tilePower(game.region.gx, game.region.gy, selectedTile.px, selectedTile.py, selectedTile.st, nowTick - (game.startedAt || nowTick)) * (0.7 + ((selectedTile.px * 7 + selectedTile.py * 13) % 7) * 0.1))} ?)</span>
                <Btn small label={`Espionner (${game.ships.eclaireur} nef)`}
                  disabled={game.ships.eclaireur < 1 || game.spyMissions.some((m) => m.key === selectedTileKey)}
                  onClick={() => startSpy(selectedTile.px, selectedTile.py)} />
              </div>
            )}
            {Object.keys(TROOPS).map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 5 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1px solid ${C.borderSoft}` }}>
                  <img src={TROOP_PORTRAITS[t]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <span style={{ fontSize: 10, color: C.textDim, width: 60, textAlign: "left" }}>{TROOPS[t].label}</span>
                <Stepper value={attackForm[t]} max={game.troops[t]} onChange={(v) => setAttackForm((f) => ({ ...f, [t]: v }))} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 9, flexWrap: "wrap" }}>
              <Btn small label="Tout envoyer"
                onClick={() => setAttackForm({ hoplite: game.troops.hoplite, archer: game.troops.archer, cavalier: game.troops.cavalier, catapulte: game.troops.catapulte, belier: game.troops.belier })} />
              <Btn primary label="Lancer l'assaut"
                disabled={game.ships.transport < 1 || !!game.attack || Object.values(attackForm).reduce((a, n) => a + n, 0) < 1 || ((attackForm.catapulte > 0 || attackForm.belier > 0) && game.ships.siege < 1)}
                onClick={() => { startAttack(selectedTile.px, selectedTile.py, { ...attackForm }); setAttackForm({ hoplite: 0, archer: 0, cavalier: 0, catapulte: 0, belier: 0 }); }} />
            </div>
            <div style={{ fontSize: 9, color: C.textDim, marginTop: 6, fontStyle: "italic" }}>
              {(() => {
                const enemyMix = game.spied[selectedTileKey] && game.spied[selectedTileKey].familyMix;
                const bonus = enemyMix ? matchupBonus(attackForm, enemyMix) : compositionBonus(attackForm);
                const power = Math.round(Object.keys(attackForm).reduce((a, t) => a + attackForm[t] * TROOPS[t].atk * (TROOPS[t].siege ? 1.5 : 1), 0) * bonus);
                const pct = Math.round((bonus - 1) * 100);
                const hasTroops = Object.values(attackForm).reduce((a, n) => a + n, 0) > 0;
                return (
                  <>
                    Puissance : {power}
                    {hasTroops && ` (${enemyMix ? "contre" : "mix"} ${pct >= 0 ? "+" : ""}${pct}%)`}
                  </>
                );
              })()}
              {(attackForm.catapulte > 0 || attackForm.belier > 0) && (game.ships.siege >= 1 ? " · nef de siège mobilisée" : " · nef de siège requise !")}
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
