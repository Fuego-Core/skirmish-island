import { useMemo } from "react";
import { C } from "../game/constants.js";
import { knownBots, playerScore } from "../game/bots.js";
import { Card, SectionTitle } from "../ui/kit.jsx";

export function ClassementTab({ game, nowTick }) {
  const minuteTick = Math.floor(nowTick / 60000);
  const ranking = useMemo(() => {
    const me = { key: "__me", name: "Toi", power: playerScore(game), isMe: true };
    return [...knownBots(game, nowTick), me].sort((a, b) => b.power - a.power);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minuteTick, game.islands, game.troops, game.explored, game.conquered]);

  return (
    <>
      <SectionTitle>Classement de l'Égée</SectionTitle>
      <Card style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 10.5, color: C.textFaint, lineHeight: 1.4 }}>
          Les cités rivales sont générées et grandissent au fil de la partie — explore pour en découvrir
          d'autres. Ce classement n'inclut que ta partie : le jeu n'a pas encore de serveur pour comparer
          de vrais joueurs entre eux.
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {ranking.map((b, i) => (
            <div key={b.key} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8,
              background: b.isMe ? "rgba(184,132,31,0.10)" : C.inset,
              border: `1px solid ${b.isMe ? C.gold : "transparent"}`,
            }}>
              <span style={{ width: 22, fontSize: 11, fontFamily: "monospace", color: i === 0 ? C.goldHi : C.textFaint, fontWeight: 700 }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: b.isMe ? C.goldHi : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {b.name}
                {b.pillee && <span style={{ fontSize: 9, color: C.textFaint, fontStyle: "italic" }}> · pillée</span>}
              </span>
              <span style={{ fontSize: 11.5, fontFamily: "monospace", fontWeight: 700, color: b.isMe ? C.goldHi : C.textDim }}>
                {b.power}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
