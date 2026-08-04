// ════════════════════════════════════════════════════════════
// MISSIONS — chaîne d'objectifs guidés
// ════════════════════════════════════════════════════════════
const bmax = (g, k) => Math.max(...g.islands.map((i) => i.buildings[k] || 0));
export const MISSIONS = [
  { id: "senat2", label: "Consolide ton Sénat", desc: "Sénat au niveau 2", reward: { bois: 600, pierre: 600, fer: 300, or: 100, ble: 300 }, check: (g) => bmax(g, "senat") >= 2 },
  { id: "scierie3", label: "Le bois avant tout", desc: "Scierie au niveau 3", reward: { bois: 400, pierre: 700, fer: 350, or: 120, ble: 300 }, check: (g) => bmax(g, "scierie") >= 3 },
  { id: "prod2", label: "Économie de base", desc: "Scierie, carrière, mine de fer et ferme au niveau 2", reward: { bois: 800, pierre: 800, fer: 600, or: 200, ble: 500 }, check: (g) => ["scierie", "carriere", "mine_fer", "ferme"].every((k) => bmax(g, k) >= 2) },
  { id: "port1", label: "Ouvre-toi à la mer", desc: "Construis le Port", reward: { bois: 900, pierre: 500, fer: 400, or: 200, ble: 400 }, check: (g) => bmax(g, "port") >= 1 },
  { id: "nef1", label: "Première nef", desc: "Arme un bateau explorateur", reward: { bois: 500, pierre: 300, fer: 300, or: 150, ble: 300 }, check: (g) => g.ships.explorateur >= 1 || g.stats.explorations >= 1 },
  { id: "explo3", label: "Cartographe", desc: "Révèle 3 cases par exploration", reward: { bois: 700, pierre: 700, fer: 500, or: 250, ble: 500 }, check: (g) => g.stats.explorations >= 3 },
  { id: "caserne1", label: "Appel aux armes", desc: "Construis la Caserne", reward: { bois: 600, pierre: 600, fer: 800, or: 200, ble: 600 }, check: (g) => bmax(g, "caserne") >= 1 },
  { id: "muraille2", label: "Derrière les remparts", desc: "Muraille au niveau 2 (contre les pirates)", reward: { bois: 800, pierre: 1200, fer: 600, or: 300, ble: 500 }, check: (g) => bmax(g, "muraille") >= 2 },
  { id: "victoire1", label: "Premier sang", desc: "Remporte une bataille", reward: { bois: 1200, pierre: 1200, fer: 1000, or: 500, ble: 800 }, check: (g) => g.stats.wins >= 1 },
  { id: "colonie1", label: "L'empire s'étend", desc: "Fonde une colonie", reward: { bois: 2000, pierre: 2000, fer: 1500, or: 800, ble: 1500 }, check: (g) => g.islands.length >= 2 },
  { id: "marche1", label: "Négociant", desc: "Construis le Marché", reward: { bois: 1000, pierre: 1000, fer: 800, or: 600, ble: 700 }, check: (g) => bmax(g, "marche") >= 1 },
  { id: "raid1", label: "Les pirates mordent la poussière", desc: "Repousse un raid pirate", reward: { bois: 1500, pierre: 1500, fer: 1200, or: 700, ble: 1000 }, check: (g) => g.stats.raidsRepousses >= 1 },
  { id: "catapulte1", label: "Ingénieur de guerre", desc: "Construis une catapulte", reward: { bois: 2500, pierre: 2500, fer: 2000, or: 1000, ble: 1500 }, check: (g) => g.troops.catapulte >= 1 },
  { id: "espion1", label: "Œil sur l'ennemi", desc: "Espionne une île rivale", reward: { bois: 1800, pierre: 1800, fer: 1400, or: 800, ble: 1200 }, check: (g) => Object.keys(g.spied || {}).length >= 1 },
  { id: "marche_use1", label: "Premier échange", desc: "Conclus une offre au marché", reward: { bois: 1300, pierre: 1300, fer: 1000, or: 900, ble: 900 }, check: (g) => (g.stats.tradesDone || 0) >= 1 },
  { id: "victoire5", label: "Terreur de l'Égée", desc: "Remporte 5 batailles", reward: { bois: 4000, pierre: 4000, fer: 3000, or: 2000, ble: 3000 }, check: (g) => g.stats.wins >= 5 },
  { id: "colosse1", label: "Les fondations du Colosse", desc: "Colosse à l'étape 1/5", reward: { bois: 3000, pierre: 3000, fer: 2500, or: 1200, ble: 2000 }, check: (g) => bmax(g, "colosse") >= 1 },
  { id: "colosse3", label: "À mi-hauteur", desc: "Colosse à l'étape 3/5", reward: { bois: 6000, pierre: 6000, fer: 5000, or: 2500, ble: 4000 }, check: (g) => bmax(g, "colosse") >= 3 },
];
