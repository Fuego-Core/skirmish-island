# Skirmish Island

Jeu de gestion et de stratégie mobile en Grèce antique. Développe ta cité
insulaire, explore l'archipel, colonise, recrute une armée, pille les îles
voisines et défends-toi contre les raids pirates — jusqu'à achever **Le
Colosse**.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (`http://localhost:5173` par défaut). En dev, le jeu
tourne en **mode accéléré** (`DEV=true`) : ressources de départ généreuses,
constructions et trajets rapides — pratique pour tester.

## Basculer DEV / production

Le mode DEV est piloté par `import.meta.env.DEV` (Vite) dans
`src/game/constants.js` :

- `npm run dev` → toujours en mode DEV (rythme accéléré).
- `npm run build` + `npm run preview` → mode production (rythme réel, stocks
  de départ modestes).
- Pour forcer un mode sans changer de commande, définir la variable
  d'environnement `VITE_FORCE_DEV=true` ou `VITE_FORCE_DEV=false` (fichier
  `.env.local`, non versionné).

## Tests

```bash
npm test
```

Les tests (`vitest`) couvrent le moteur pur (`src/game/engine.js` et
alentours) : production horaire, fin de chantier, recrutement par lots,
aller-retour d'exploration, colonisation, résolution d'attaque avec butin,
raid pirate avec bonus de muraille, régénération d'île pillée, plancher à
zéro du blé, coûts croissants, défense croissante avec la distance.

## Build de production

```bash
npm run build   # génère dist/
npm run preview # sert dist/ localement pour vérifier
```

## Où se trouve chaque partie du jeu

| Dossier | Contenu |
|---|---|
| `src/game/` | Moteur pur (données, formules, simulation temporelle) — **source de vérité de l'équilibrage**, voir `CLAUDE.md` |
| `src/hooks/useGame.js` | Sauvegarde (`localStorage`), tick de jeu, callbacks d'action |
| `src/ui/` | Icônes SVG, scène de cité, kit de composants, panneaux glissants |
| `src/screens/` | Écran titre + 6 onglets (Cité, Carte, Armée, Port, Rapports, Empire) |
| `src/App.jsx` | Orchestration : bandeau ressources, navigation, sheets globales |

## PWA

Le jeu est installable (`manifest.webmanifest` + service worker minimal dans
`public/sw.js`) et s'ouvre hors ligne une fois visité une première fois.
Sur mobile : ouvrir le site déployé dans le navigateur puis "Ajouter à
l'écran d'accueil".

## Déploiement

### Vercel (recommandé)

Un `vercel.json` est déjà présent. Pour déployer :

1. Connecter le dépôt GitHub sur [vercel.com](https://vercel.com) (New
   Project → importer `skirmish-island`).
2. Vercel détecte Vite automatiquement (build `npm run build`, sortie
   `dist/`) — aucun réglage supplémentaire nécessaire.
3. Déployer. Chaque push sur la branche de production redéploie
   automatiquement.

### GitHub Pages (alternative)

Un workflow GitHub Actions (`.github/workflows/deploy-pages.yml`) est prêt :
il build, teste, puis déploie `dist/` sur Pages à chaque push sur `main`.

1. Dans les réglages du dépôt : **Settings → Pages → Source : GitHub
   Actions**.
2. Adapter si besoin la branche déclenchante du workflow à la branche par
   défaut réelle du dépôt.
3. Si le site est servi depuis un sous-chemin (`https://<user>.github.io/skirmish-island/`
   plutôt qu'un domaine personnalisé), ajouter `base: "/skirmish-island/"`
   dans `vite.config.js`.

Ces deux déploiements nécessitent une action côté compte (connecter le
dépôt à Vercel, ou activer Pages dans les réglages GitHub) — étape à faire
manuellement une fois, ensuite tout est automatique.
