// ---- Troupes (upkeep = blé/h consommé par unité) ----
export const TROOPS = {
  hoplite:  { label: "Hoplite", atk: 6, def: 8, upkeep: 2, requiresCaserne: 1, duration: 20,
    cost: { bois: 25, pierre: 10, fer: 45, or: 8, ble: 30 }, desc: "Socle de toute armée. Solide en défense." },
  archer:   { label: "Archer", atk: 8, def: 4, upkeep: 1, requiresCaserne: 1, duration: 16,
    cost: { bois: 45, pierre: 5, fer: 25, or: 6, ble: 25 }, desc: "Léger et offensif, fragile au corps-à-corps." },
  cavalier: { label: "Cavalier", atk: 14, def: 6, upkeep: 4, requiresCaserne: 3, duration: 35,
    cost: { bois: 40, pierre: 15, fer: 70, or: 25, ble: 60 }, desc: "Frappe fort, mange beaucoup." },
  belier:   { label: "Bélier", atk: 26, def: 6, upkeep: 3, siege: true, requiresCaserne: 4, duration: 65,
    cost: { bois: 380, pierre: 120, fer: 200, or: 60, ble: 80 }, desc: "Engin de siège — nécessite un bateau de siège." },
  catapulte:{ label: "Catapulte", atk: 40, def: 2, upkeep: 3, siege: true, requiresCaserne: 5, duration: 80,
    cost: { bois: 320, pierre: 180, fer: 260, or: 80, ble: 90 }, desc: "Dévastatrice — nécessite un bateau de siège." },
};
