import { C } from "../../game/constants.js";
import { TROOPS } from "../../game/troops.js";
import { ISLAND_GRID, TILE_LABELS } from "../../game/world.js";
import { botName, tilePower } from "../../game/bots.js";
import { REGEN_MS } from "../../game/constants.js";
import { I } from "../Icon.jsx";
import { Sheet, Btn, Stepper, fmtTime, fmtNum } from "../kit.jsx";

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
      accent={selectedTile.st === "ma_ville" ? C.goldHi : selectedTile.st === "ile_vide" ? "#4f9160" : selectedTile.st === "ile_joueur" ? "#b04343" : selectedTile.st === "ile_inactive" ? "#b0722f" : C.gold}>
      <div style={{ textAlign: "center" }}>
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
              <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8 }}>
                <span style={{ color: C.goldHi }}>Renseignement d'éclaireur</span> — défense exacte :{" "}
                <span style={{ color: C.bad, fontFamily: "monospace" }}>{game.spied[selectedTileKey].def}</span>
                {" "}· butin : <span style={{ color: C.ok, fontFamily: "monospace" }}>{fmtNum(game.spied[selectedTileKey].butinMin)}–{fmtNum(game.spied[selectedTileKey].butinMax)}</span>/ressource
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
                <I name={t} size={16} color={C.textDim} />
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
              Puissance : {Object.keys(attackForm).reduce((a, t) => a + attackForm[t] * TROOPS[t].atk * (TROOPS[t].siege ? 1.5 : 1), 0)}
              {(attackForm.catapulte > 0 || attackForm.belier > 0) && (game.ships.siege >= 1 ? " · nef de siège mobilisée" : " · nef de siège requise !")}
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
