// ---- Troupes (upkeep = blé/h consommé par unité) ----
// `family` sert au bonus de composition (voir compositionBonus ci-dessous) :
// une armée qui mélange infanterie/tir/cavalerie touche mieux qu'un empilement
// mono-unité, sans avoir besoin de connaître la composition de l'adversaire
// (pirates/bots restent une puissance abstraite — utile aussi le jour où de
// vrais joueurs, avec de vraies compositions, remplaceront les bots).
export const TROOPS = {
  hoplite:  { label: "Hoplite", atk: 6, def: 8, upkeep: 2, requiresCaserne: 1, duration: 20, family: "infantry",
    cost: { bois: 25, pierre: 10, fer: 45, or: 8, ble: 30 }, desc: "Socle de toute armée. Solide en défense." },
  archer:   { label: "Archer", atk: 8, def: 4, upkeep: 1, requiresCaserne: 1, duration: 16, family: "ranged",
    cost: { bois: 45, pierre: 5, fer: 25, or: 6, ble: 25 }, desc: "Léger et offensif, fragile au corps-à-corps." },
  cavalier: { label: "Cavalier", atk: 14, def: 6, upkeep: 4, requiresCaserne: 3, duration: 35, family: "cavalry",
    cost: { bois: 40, pierre: 15, fer: 70, or: 25, ble: 60 }, desc: "Frappe fort, mange beaucoup." },
  belier:   { label: "Bélier", atk: 26, def: 6, upkeep: 3, siege: true, requiresCaserne: 4, duration: 65,
    cost: { bois: 380, pierre: 120, fer: 200, or: 60, ble: 80 }, desc: "Engin de siège — nécessite un bateau de siège." },
  catapulte:{ label: "Catapulte", atk: 40, def: 2, upkeep: 3, siege: true, requiresCaserne: 5, duration: 80,
    cost: { bois: 320, pierre: 180, fer: 260, or: 80, ble: 90 }, desc: "Dévastatrice — nécessite un bateau de siège." },
};

// Bonus/malus selon l'équilibre de l'armée (hors unités de siège, qui ont
// déjà leur propre bonus dédié) : de +12% (mix parfaitement équilibré entre
// les 3 familles) à −12% (empilement d'une seule famille). Calculé sur la
// puissance d'attaque pondérée, pas le nombre d'unités brut.
export function compositionBonus(troops) {
  const families = { infantry: 0, ranged: 0, cavalry: 0 };
  let total = 0;
  Object.keys(TROOPS).forEach((t) => {
    const def = TROOPS[t];
    if (def.siege) return;
    const power = (troops[t] || 0) * def.atk;
    families[def.family] += power;
    total += power;
  });
  if (total <= 0) return 1;
  const maxShare = Math.max(families.infantry, families.ranged, families.cavalry) / total;
  const t = Math.min(1, Math.max(0, (maxShare - 1 / 3) / (1 - 1 / 3)));
  return 1.12 - t * 0.24;
}

// Emplacements de file à la caserne : un de plus par niveau de Caserne,
// plafonné. Les lots sont levés l'un après l'autre.
export const TROOP_SLOTS_MAX = 10;
export function troopSlots(caserneLevel) {
  return Math.max(1, Math.min(TROOP_SLOTS_MAX, caserneLevel + 1));
}
