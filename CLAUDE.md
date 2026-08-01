# Skirmish Island — notes pour Claude Code

## Règle d'or

**`src/game/` est la source de vérité de l'équilibrage.** C'est du JavaScript pur,
sans aucun import React — testable directement (`npm test`). Aucune formule,
aucune constante numérique (coûts, production, durées, dégâts, probabilités…)
ne s'y modifie sans demande explicite. Le jeu a été porté depuis
`skirmish-island-v14.jsx` (composant React monolithique d'origine) par un
copier-coller fidèle : mêmes noms de fonctions, mêmes constantes, mêmes
valeurs. Toute "amélioration" spontanée des mécaniques est à proscrire.

## Architecture

```
src/
├── game/            Moteur pur (aucun import React) — logique + données + formules
│   ├── constants.js   Palette C, RES, RES_COLOR, GROUP_COLOR, SPEED, DEV, intervalles
│   ├── buildings.js   BUILDINGS, GROUPS, upgradeCost, buildDuration, prodPerHour, storageCap
│   ├── ships.js        SHIPS, PECHE_BLE_H
│   ├── troops.js       TROOPS
│   ├── factions.js     FACTIONS
│   ├── world.js        tileState, enemyDefense, absDist, rk, regionDist, TILE_LABELS, tileColor
│   ├── missions.js     MISSIONS
│   ├── state.js        newGameState, freshBuildings
│   ├── engine.js       applyElapsed — toute la simulation temporelle (chantiers, flottes,
│   │                   combats, raids pirates, événements, économie hors-ligne incluse)
│   └── __tests__/      Tests vitest sur le moteur pur
├── hooks/
│   └── useGame.js     Chargement/sauvegarde (localStorage), tick 1s, tous les callbacks d'action
├── ui/
│   ├── Icon.jsx        ICON_PATHS + composant I + Meander (frise grecque)
│   ├── CityScene.jsx   BSprite, BUILDING_SPOTS, PAL, CityScene (scène d'île SVG tapable)
│   ├── kit.jsx          Card, SectionTitle, Btn, Stepper, CostRow, QueueCard, Sheet, fmtTime, fmtNum
│   └── sheets/          BuildingSheet, TileSheet, MissionsSheet (panneaux glissants)
└── screens/
    ├── TitleScreen.jsx  Choix de faction (Athènes / Sparte)
    ├── CityTab.jsx, MapTab.jsx, ArmyTab.jsx, PortTab.jsx, ReportsTab.jsx, EmpireTab.jsx
```

`App.jsx` orchestre : bandeau ressources, onglets, sheets globales, navigation basse.

## Mode DEV / production

`src/game/constants.js` calcule `DEV` via `import.meta.env.DEV` (Vite bascule
automatiquement production=false hors dev), avec surcharge possible par
`VITE_FORCE_DEV=true|false`. `DEV` pilote `SPEED` (rythme de jeu accéléré en
dev, x1 en prod) et les stocks de départ. Ne jamais figer `DEV` en dur.

## Sauvegarde

`useGame.js` sauvegarde dans `localStorage` (clé `skirmish-save`), au plus
une fois toutes les 2s (le tick de simulation tourne toutes les secondes, donc
un debounce classique ne se déclencherait jamais — voir le commentaire dans
le hook). Une sauvegarde de secours est aussi déclenchée sur `pagehide` /
mise en arrière-plan.

## Avant de toucher au moteur

Si une tâche demande de changer une formule (production, coûts, combat,
raids…), c'est un changement d'équilibrage — à confirmer explicitement avec
l'utilisateur avant de l'appliquer, même si la demande semble anodine.
