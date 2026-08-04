import { useState } from "react";
import { C, RES, RES_LABEL } from "../game/constants.js";
import { TROOPS } from "../game/troops.js";
import { SHIPS } from "../game/ships.js";
import { unitValue, ownedAmt, ownsWantBasket } from "../game/market.js";
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

// Une ligne "3 Bois" ou "5 Hoplites" — icône + montant + libellé texte,
// pour rester lisible même sans reconnaître l'icône au premier coup d'œil.
function AmountTag({ kind, keyName, amt, size = 22, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <SideIcon kind={kind} keyName={keyName} size={size} />
      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: color || C.text }}>{fmtNum(amt)}</span>
      <span style={{ fontSize: 11, color: C.textFaint }}>{keyLabel(kind, keyName)}</span>
    </span>
  );
}

function OfferRow({ offer, nowTick, game, onAccept, onCancel }) {
  const isPlayer = offer.author === "player";
  const countdown = isPlayer ? offer.fillAt - nowTick : offer.expiresAt - nowTick;
  const canAccept = !isPlayer && ownsWantBasket(game, offer.want);
  return (
    <div style={{ background: C.inset, borderRadius: 10, padding: "13px 14px", border: `1px solid ${C.borderSoft}` }}>
      <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 8 }}>{isPlayer ? "Ton offre" : offer.botName}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 9 }}>
        <AmountTag kind={offer.give.kind} keyName={offer.give.key} amt={offer.give.amt} color={C.bad} />
        <I name="marche" size={14} color={C.gold} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {offer.want.map((w, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {i > 0 && <span style={{ color: C.textFaint, fontSize: 11 }}>+</span>}
              <AmountTag kind={w.kind} keyName={w.key} amt={w.amt} color={C.ok} />
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 10.5, color: C.textFaint, fontFamily: "monospace" }}>
          {isPlayer ? "reprise dans " : "expire dans "}{fmtTime(Math.max(0, countdown))}
        </span>
        {isPlayer ? (
          <Btn small label="Annuler" onClick={() => onCancel(offer.id)} />
        ) : (
          <Btn small primary label="Accepter" disabled={!canAccept} onClick={() => onAccept(offer.id)} />
        )}
      </div>
    </div>
  );
}

// Sélecteur "type + valeur" pour un côté de l'offre — icônes plus grandes et
// libellé texte à côté de chaque bouton pour rester lisible.
function KindPicker({ kind, setKind, lockedToRes }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
      {Object.keys(KIND_LABEL).map((k) => (
        <button key={k} disabled={lockedToRes && k !== "res"}
          onClick={() => setKind(k)}
          style={{
            flex: 1, padding: "7px 6px", borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: lockedToRes && k !== "res" ? "not-allowed" : "pointer",
            background: kind === k ? `${C.gold}25` : "transparent",
            border: `1px solid ${kind === k ? C.gold : C.border}`,
            color: kind === k ? C.goldHi : lockedToRes && k !== "res" ? C.textFaint : C.textDim,
            opacity: lockedToRes && k !== "res" ? 0.4 : 1,
          }}>{KIND_LABEL[k]}</button>
      ))}
    </div>
  );
}

function KeyPicker({ kind, keyName, setKeyName, exclude }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
      {KIND_KEYS[kind].filter((k) => k !== exclude).map((k) => (
        <button key={k} onClick={() => setKeyName(k)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8,
            background: keyName === k ? `${C.gold}25` : "transparent", border: `1px solid ${keyName === k ? C.gold : C.border}`, cursor: "pointer",
          }}>
          <SideIcon kind={kind} keyName={k} size={kind === "res" ? 20 : 28} dim={keyName !== k} />
          <span style={{ fontSize: 11, color: keyName === k ? C.goldHi : C.textDim }}>{keyLabel(kind, k)}</span>
        </button>
      ))}
    </div>
  );
}

function AmountInput({ value, onChange, owned }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="number" min={1} value={value} onChange={(e) => onChange(Math.max(1, Math.floor(+e.target.value || 0)))}
        style={{ width: 90, padding: "7px 9px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.panel, color: C.text, fontFamily: "monospace", fontSize: 14 }} />
      {owned !== undefined && <span style={{ fontSize: 10.5, color: value > owned ? C.bad : C.textFaint }}>possédé : {fmtNum(owned)}</span>}
    </div>
  );
}

export function MarketTab({ game, nowTick, onAccept, onPost, onCancel }) {
  const [giveKind, setGiveKind] = useState("res");
  const [giveKey, setGiveKey] = useState("bois");
  const [giveAmt, setGiveAmt] = useState(100);
  const [wantKind, setWantKind] = useState("res");
  const [wantKey, setWantKey] = useState("fer");
  const [wantAmt, setWantAmt] = useState(66);
  const [want2On, setWant2On] = useState(false);
  const [wantKey2, setWantKey2] = useState("pierre");
  const [wantAmt2, setWantAmt2] = useState(30);

  const offers = game.marketOffers || [];
  const botOffers = offers.filter((o) => o.author === "bot");
  const playerOffers = offers.filter((o) => o.author === "player");

  const canBasket = wantKind === "res"; // panier de 2e ressource : uniquement si "tu demandes" = ressource

  const handleGiveKind = (k) => {
    setGiveKind(k); setGiveKey(KIND_KEYS[k][0]);
    if (k !== "res") { setWantKind("res"); setWantKey(RES[0]); }
  };
  const handleWantKind = (k) => {
    setWantKind(k); setWantKey(KIND_KEYS[k][0]);
    if (k !== "res") { setGiveKind("res"); setGiveKey(RES[0]); setWant2On(false); }
  };

  const owned = ownedAmt(game, giveKind, giveKey);
  const want = [{ kind: wantKind, key: wantKey, amt: wantAmt }];
  if (canBasket && want2On) want.push({ kind: "res", key: wantKey2, amt: wantAmt2 });
  const dupWant = canBasket && want2On && wantKey2 === wantKey;
  const sameAsGive = want.some((w) => w.kind === giveKind && w.key === giveKey);
  const canPost = !sameAsGive && !dupWant && giveAmt > 0 && owned >= giveAmt && wantAmt > 0 && (!want2On || wantAmt2 > 0);

  const suggestedTotal = giveKind !== "res"
    ? Math.round((giveAmt * unitValue(giveKind, giveKey)) / RATE)
    : wantKind !== "res"
      ? null
      : Math.round(giveAmt / RATE);

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
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Tu donnes</div>
        <KindPicker kind={giveKind} setKind={handleGiveKind} lockedToRes={wantKind !== "res"} />
        <KeyPicker kind={giveKind} keyName={giveKey} setKeyName={setGiveKey} />
        <AmountInput value={giveAmt} onChange={setGiveAmt} owned={owned} />

        <div style={{ height: 1, background: C.borderSoft, margin: "14px 0" }} />

        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Tu demandes</div>
        <KindPicker kind={wantKind} setKind={handleWantKind} lockedToRes={giveKind !== "res"} />
        <KeyPicker kind={wantKind} keyName={wantKey} setKeyName={setWantKey} />
        <AmountInput value={wantAmt} onChange={setWantAmt} />

        {canBasket && (
          <div style={{ marginTop: 10 }}>
            {!want2On ? (
              <button onClick={() => setWant2On(true)}
                style={{ fontSize: 11, color: C.goldHi, background: "transparent", border: `1px dashed ${C.gold}`, borderRadius: 7, padding: "6px 10px", cursor: "pointer" }}>
                + Ajouter une 2ᵉ ressource demandée
              </button>
            ) : (
              <div style={{ background: C.ghost, borderRadius: 8, padding: "10px 10px 4px", marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.textDim }}>2ᵉ ressource demandée</span>
                  <button onClick={() => setWant2On(false)} style={{ background: "transparent", border: "none", color: C.textFaint, cursor: "pointer", fontSize: 11 }}>retirer</button>
                </div>
                <KeyPicker kind="res" keyName={wantKey2} setKeyName={setWantKey2} exclude={wantKey} />
                <AmountInput value={wantAmt2} onChange={setWantAmt2} />
                {dupWant && <div style={{ fontSize: 10, color: C.bad, marginTop: 4 }}>Choisis deux ressources différentes.</div>}
              </div>
            )}
          </div>
        )}

        {suggestedTotal !== null && (
          <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 10, fontStyle: "italic" }}>
            Valeur indicative de ce que tu donnes : ~{fmtNum(suggestedTotal)} {wantKind === "res" ? keyLabel("res", wantKey) : ""}
          </div>
        )}
        {sameAsGive && <div style={{ fontSize: 10.5, color: C.bad, marginTop: 8 }}>Tu ne peux pas demander ce que tu donnes déjà.</div>}

        <div style={{ marginTop: 12 }}>
          <Btn primary label="Publier l'offre" disabled={!canPost}
            onClick={() => { onPost({ kind: giveKind, key: giveKey, amt: giveAmt }, want); }} />
        </div>
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
