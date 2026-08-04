import { useState } from "react";
import { C, RES, RES_LABEL } from "../game/constants.js";
import { TROOPS } from "../game/troops.js";
import { SHIPS } from "../game/ships.js";
import { unitValue, ownedAmt } from "../game/market.js";
import { I } from "../ui/Icon.jsx";
import { Card, SectionTitle, Btn, ResIcon, fmtNum, fmtTime } from "../ui/kit.jsx";
import { TROOP_PORTRAITS } from "../ui/troopPortraits.js";
import { SHIP_PORTRAITS } from "../ui/shipPortraits.js";

const KIND_LABEL = { res: "Ressource", troop: "Troupe", ship: "Navire" };
const KIND_KEYS = { res: RES, troop: Object.keys(TROOPS), ship: Object.keys(SHIPS) };
const RATE = 1.5; // même ancre que l'ancien échange fixe 3 pour 2

function keyLabel(kind, key) {
  if (kind === "res") return RES_LABEL[key];
  if (kind === "troop") return TROOPS[key].label;
  return SHIPS[key].label;
}

function SideIcon({ kind, keyName, size = 18, dim }) {
  if (kind === "res") return <ResIcon r={keyName} size={size} dim={dim} />;
  const src = kind === "troop" ? TROOP_PORTRAITS[keyName] : SHIP_PORTRAITS[keyName];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, opacity: dim ? 0.5 : 1, border: `1px solid ${C.borderSoft}` }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

function OfferRow({ offer, nowTick, game, onAccept, onCancel }) {
  const isPlayer = offer.author === "player";
  const countdown = isPlayer ? offer.fillAt - nowTick : offer.expiresAt - nowTick;
  const canAccept = !isPlayer && ownedAmt(game, offer.wantKind, offer.wantKey) >= offer.wantAmt;
  return (
    <div style={{ background: C.inset, borderRadius: 10, padding: "11px 12px", border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: C.textFaint, marginBottom: 4 }}>{isPlayer ? "Ton offre" : offer.botName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontFamily: "monospace", color: C.text }}>
          <SideIcon kind={offer.giveKind} keyName={offer.giveKey} size={17} /> {fmtNum(offer.giveAmt)}
          <span style={{ color: C.gold }}>→</span>
          <SideIcon kind={offer.wantKind} keyName={offer.wantKey} size={17} /> {fmtNum(offer.wantAmt)}
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

function SidePicker({ side, kind, setKind, keyName, setKeyName, lockedToRes }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: C.textFaint, marginBottom: 5 }}>{side}</div>
      <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
        {Object.keys(KIND_LABEL).map((k) => (
          <button key={k} disabled={lockedToRes && k !== "res"}
            onClick={() => { setKind(k); setKeyName(KIND_KEYS[k][0]); }}
            style={{
              padding: "4px 9px", borderRadius: 6, fontSize: 10, cursor: lockedToRes && k !== "res" ? "not-allowed" : "pointer",
              background: kind === k ? `${C.gold}25` : "transparent",
              border: `1px solid ${kind === k ? C.gold : C.border}`,
              color: kind === k ? C.goldHi : lockedToRes && k !== "res" ? C.textFaint : C.textDim,
              opacity: lockedToRes && k !== "res" ? 0.4 : 1,
            }}>{KIND_LABEL[k]}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {KIND_KEYS[kind].map((k) => (
          <button key={k} onClick={() => setKeyName(k)}
            style={{ padding: 5, borderRadius: 7, background: keyName === k ? `${C.gold}25` : "transparent", border: `1px solid ${keyName === k ? C.gold : C.border}`, cursor: "pointer", lineHeight: 0 }}>
            <SideIcon kind={kind} keyName={k} size={kind === "res" ? 19 : 26} dim={keyName !== k} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function MarketTab({ game, nowTick, onAccept, onPost, onCancel }) {
  const [giveKind, setGiveKind] = useState("res");
  const [giveKey, setGiveKey] = useState("bois");
  const [wantKind, setWantKind] = useState("res");
  const [wantKey, setWantKey] = useState("fer");
  const [amt, setAmt] = useState(100);

  const offers = game.marketOffers || [];
  const botOffers = offers.filter((o) => o.author === "bot");
  const playerOffers = offers.filter((o) => o.author === "player");

  // Valeur d'échange suggérée, ancrée sur le coût de production quand une
  // unité (troupe/navire) est en jeu d'un côté ou de l'autre.
  let wantAmt;
  if (giveKind !== "res") wantAmt = Math.max(1, Math.round((amt * unitValue(giveKind, giveKey)) / RATE));
  else if (wantKind !== "res") wantAmt = Math.max(1, Math.round(amt / (unitValue(wantKind, wantKey) * RATE)));
  else wantAmt = Math.max(1, Math.floor(amt / RATE));

  const owned = ownedAmt(game, giveKind, giveKey);
  const canPost = !(giveKind === wantKind && giveKey === wantKey) && amt > 0 && owned >= amt;

  const handleGiveKind = (k) => { setGiveKind(k); setGiveKey(KIND_KEYS[k][0]); if (k !== "res") { setWantKind("res"); setWantKey(RES[0]); } };
  const handleWantKind = (k) => { setWantKind(k); setWantKey(KIND_KEYS[k][0]); if (k !== "res") { setGiveKind("res"); setGiveKey(RES[0]); } };

  return (
    <>
      <Card style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <I name="marche" size={17} color={C.gold} />
        <span style={{ fontSize: 12, color: C.textDim, lineHeight: 1.4 }}>
          Offres réelles des cités rivales et des joueurs — ressources, troupes ou navires, taux variables.
        </span>
      </Card>

      <SectionTitle>Poster une offre</SectionTitle>
      <Card>
        <SidePicker side="Tu donnes" kind={giveKind} setKind={handleGiveKind} keyName={giveKey} setKeyName={setGiveKey} lockedToRes={wantKind !== "res"} />
        <SidePicker side="Tu demandes" kind={wantKind} setKind={handleWantKind} keyName={wantKey} setKeyName={setWantKey} lockedToRes={giveKind !== "res"} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <input type="number" min={1} max={owned} value={amt} onChange={(e) => setAmt(Math.max(1, Math.floor(+e.target.value || 0)))}
            style={{ width: 90, padding: "6px 8px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontFamily: "monospace", fontSize: 13 }} />
          <span style={{ fontSize: 11, color: owned < amt ? C.bad : C.textFaint }}>
            {keyLabel(giveKind, giveKey)} (possédé : {fmtNum(owned)}) → ~{fmtNum(wantAmt)} {keyLabel(wantKind, wantKey)} demandé
          </span>
        </div>
        <Btn primary label="Publier l'offre" disabled={!canPost} onClick={() => onPost(giveKind, giveKey, amt, wantKind, wantKey, wantAmt)} />
      </Card>

      <SectionTitle>Offres des cités rivales</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {botOffers.length === 0 && <div style={{ fontSize: 12, color: C.textFaint, fontStyle: "italic" }}>Aucune offre pour l'instant.</div>}
        {botOffers.map((o) => (
          <OfferRow key={o.id} offer={o} nowTick={nowTick} game={game} onAccept={onAccept} onCancel={onCancel} />
        ))}
      </div>

      {playerOffers.length > 0 && (
        <>
          <SectionTitle>Tes offres en cours</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {playerOffers.map((o) => (
              <OfferRow key={o.id} offer={o} nowTick={nowTick} game={game} onAccept={onAccept} onCancel={onCancel} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
