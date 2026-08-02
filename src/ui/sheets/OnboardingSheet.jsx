import { C, RES, RES_ICONN } from "../../game/constants.js";
import { I } from "../Icon.jsx";
import { Sheet, Btn } from "../kit.jsx";

const STEPS = [
  { icon: null, text: "Bois, pierre, fer, or et blé s'accumulent seuls avec le temps — surveille tes réserves dans le bandeau du haut." },
  { icon: "senat", text: "Onglet Cité : construis et améliore tes bâtiments. Le Sénat niveau 2 débloque Port et Caserne." },
  { icon: "carte", text: "Onglet Carte : explore les îles voisines pour les coloniser ou les piller." },
  { icon: "colosse", text: "Objectif : achève Le Colosse (5 étapes) pour remporter la partie." },
];

export function OnboardingSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="COMMENT JOUER" icon="laurier">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 30, height: 30, flexShrink: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: C.inset, border: `1px solid ${C.borderSoft}`,
            }}>
              {s.icon ? <I name={s.icon} size={15} color={C.gold} /> : (
                <div style={{ display: "flex", gap: 1 }}>
                  {RES.map((r) => <I key={r} name={RES_ICONN[r]} size={7} color={C.gold} />)}
                </div>
              )}
            </div>
            <span style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.4, flex: 1 }}>{s.text}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Btn primary label="Commencer l'aventure" onClick={onClose} />
      </div>
    </Sheet>
  );
}
