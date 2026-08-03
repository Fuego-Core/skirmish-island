import { useState } from "react";
import { C, RES, RES_LABEL } from "../game/constants.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, Btn, ResIcon, fmtNum, fmtTime } from "../ui/kit.jsx";

function OfferRow({ offer, nowTick, resources, onAccept, onCancel }) {
  const isPlayer = offer.author === "player";
  const countdown = isPlayer ? offer.fillAt - nowTick : offer.expiresAt - nowTick;
  const canAccept = !isPlayer && resources[offer.wantRes] >= offer.wantAmt;
  return (
    <div style={{ background: C.inset, borderRadius: 10, padding: "11px 12px", border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 4 }}>{isPlayer ? "Ton offre" : offer.botName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: "monospace", color: C.text }}>
          <ResIcon r={offer.giveRes} size={17} /> {fmtNum(offer.giveAmt)}
          <span style={{ color: C.gold }}>→</span>
          <ResIcon r={offer.wantRes} size={17} /> {fmtNum(offer.wantAmt)}
        </div>
        <div style={{ fontSize: 10, color: C.textFaint, marginTop: 3, fontFamily: "monospace" }}>
          {isPlayer ? "reprise dans " : "expire dans "}{fmtTime(Math.max(0, countdown))}
        </div>
      </div>
      {isPlayer ? (
        <Btn small label="Annuler" onClick={() => onCancel(offer.id)} />
      ) : (
        <Btn small primary label="Accepter" disabled={!canAccept} onClick={() => onAccept(offer.id)} />
      )}
    </div>
  );
}

export function MarketTab({ game, nowTick, onAccept, onPost, onCancel }) {
  const [giveRes, setGiveRes] = useState("bois");
  const [wantRes, setWantRes] = useState("fer");
  const [amt, setAmt] = useState(100);

  const resources = game.resources;
  const offers = game.marketOffers || [];
  const botOffers = offers.filter((o) => o.author === "bot");
  const playerOffers = offers.filter((o) => o.author === "player");
  const rate = 1.5;
  const wantAmt = Math.max(1, Math.floor(amt / rate));
  const canPost = giveRes !== wantRes && amt > 0 && resources[giveRes] >= amt;

  return (
    <>
      <Card style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <I name="marche" size={17} color={C.gold} />
        <span style={{ fontSize: 12, color: C.textDim, lineHeight: 1.4 }}>
          Offres réelles des cités rivales et des joueurs — taux variables, à repérer.
        </span>
      </Card>

      <SectionTitle>Poster une offre</SectionTitle>
      <Card>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 9 }}>
          {RES.map((r) => (
            <button key={"g" + r} onClick={() => setGiveRes(r)}
              style={{ padding: 5, borderRadius: 7, background: giveRes === r ? `${C.gold}25` : "transparent", border: `1px solid ${giveRes === r ? C.gold : C.border}`, cursor: "pointer", lineHeight: 0 }}>
              <ResIcon r={r} size={19} dim={giveRes !== r} />
            </button>
          ))}
          <span style={{ fontSize: 13, color: C.gold, padding: "0 3px" }}>→</span>
          {RES.map((r) => (
            <button key={"w" + r} onClick={() => setWantRes(r)}
              style={{ padding: 5, borderRadius: 7, background: wantRes === r ? `${C.gold}25` : "transparent", border: `1px solid ${wantRes === r ? C.gold : C.border}`, cursor: "pointer", lineHeight: 0 }}>
              <ResIcon r={r} size={19} dim={wantRes !== r} />
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <input type="number" min={1} value={amt} onChange={(e) => setAmt(Math.max(1, Math.floor(+e.target.value || 0)))}
            style={{ width: 90, padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontFamily: "monospace", fontSize: 13 }} />
          <span style={{ fontSize: 11, color: C.textFaint }}>{RES_LABEL[giveRes]} → ~{fmtNum(wantAmt)} {RES_LABEL[wantRes]} demandé</span>
        </div>
        <Btn primary label="Publier l'offre" disabled={!canPost} onClick={() => onPost(giveRes, amt, wantRes, wantAmt)} />
      </Card>

      <SectionTitle>Offres des cités rivales</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {botOffers.length === 0 && <div style={{ fontSize: 12, color: C.textFaint, fontStyle: "italic" }}>Aucune offre pour l'instant.</div>}
        {botOffers.map((o) => (
          <OfferRow key={o.id} offer={o} nowTick={nowTick} resources={resources} onAccept={onAccept} onCancel={onCancel} />
        ))}
      </div>

      {playerOffers.length > 0 && (
        <>
          <SectionTitle>Tes offres en cours</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {playerOffers.map((o) => (
              <OfferRow key={o.id} offer={o} nowTick={nowTick} resources={resources} onAccept={onAccept} onCancel={onCancel} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
