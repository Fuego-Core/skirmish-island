// ---- Bateaux ----
export const SHIPS = {
  explorateur: { label: "Bateau explorateur", requiresPort: 1, duration: 30,
    cost: { bois: 120, pierre: 30, fer: 40, or: 15, ble: 30 },
    desc: "Révèle une case à l'arrivée puis revient au port. Réutilisable." },
  peche: { label: "Bateau de pêche", requiresPort: 1, duration: 40,
    cost: { bois: 180, pierre: 40, fer: 60, or: 20, ble: 40 },
    desc: "Pêche en continu : +180 blé/h par bateau." },
  transport: { label: "Bateau de transport", requiresPort: 2, duration: 60,
    cost: { bois: 260, pierre: 120, fer: 140, or: 60, ble: 120 },
    desc: "Transporte tes troupes à l'attaque, puis revient." },
  colonisation: { label: "Bateau de colonisation", requiresPort: 2, duration: 90,
    cost: { bois: 350, pierre: 220, fer: 180, or: 120, ble: 250 },
    desc: "Fonde une nouvelle cité sur une île vide (consommé)." },
  siege: { label: "Bateau de siège", requiresPort: 3, duration: 110,
    cost: { bois: 420, pierre: 260, fer: 260, or: 140, ble: 160 },
    desc: "Escorte les engins de siège lors des attaques." },
  eclaireur: { label: "Nef éclaireuse", requiresPort: 1, duration: 25,
    cost: { bois: 100, pierre: 20, fer: 30, or: 25, ble: 25 },
    desc: "Espionne une île : révèle sa défense exacte et son butin. Revient au port." },
};
export const PECHE_BLE_H = 180;

// Emplacements de file au chantier naval : un de plus par niveau de Port,
// plafonné. Les nefs sortent l'une après l'autre.
export const SHIP_SLOTS_MAX = 10;
export function shipSlots(portLevel) {
  return Math.max(1, Math.min(SHIP_SLOTS_MAX, portLevel + 1));
}
