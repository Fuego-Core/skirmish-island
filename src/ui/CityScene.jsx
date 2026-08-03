import cityIsland from "../assets/images/city-island.webp";
import { BUILDING_PORTRAITS } from "./buildingPortraits.js";

// ════════════════════════════════════════════════════════════
// SCÈNE DE CITÉ — photo générée (acropole en terrasses), avec des
// marqueurs tapables en médaillon (portraits de bâtiments déjà générés)
// posés dessus. Plus de dessin vectoriel : la scène est une image fixe,
// seuls les marqueurs sont interactifs.
// ════════════════════════════════════════════════════════════

export const BUILDING_SPOTS = {
  senat:    { x: 102, y: 46 },
  colosse:  { x: 204, y: 78 },
  marche:   { x: 174, y: 48 },
  port:     { x: 258, y: 60 },
  caserne:  { x: 60,  y: 66 },
  muraille: { x: 39,  y: 90 },
  entrepot: { x: 210, y: 106 },
  grenier:  { x: 120, y: 106 },
  ferme:    { x: 66,  y: 124 },
  scierie:  { x: 30,  y: 130 },
  carriere: { x: 258, y: 124 },
  mine_fer: { x: 219, y: 156 },
  mine_or:  { x: 180, y: 170 },
};

export function CityScene({ isl, onTap, openKey, goldHi }) {
  return (
    <svg viewBox="0 0 300 200" style={{ width: "100%", display: "block" }}>
      <defs>
        <clipPath id="markerClip"><circle r="16" /></clipPath>
        <radialGradient id="markerBadgeFill" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f0d078" /><stop offset="100%" stopColor="#c39a3d" />
        </radialGradient>
        <radialGradient id="sceneVignette" cx="50%" cy="42%" r="75%">
          <stop offset="62%" stopColor="#000000" stopOpacity="0" /><stop offset="100%" stopColor="#0a0602" stopOpacity="0.3" />
        </radialGradient>
      </defs>

      <image href={cityIsland} x="0" y="0" width="300" height="200" preserveAspectRatio="xMidYMid slice" />

      {/* goélands */}
      <g stroke="#fff6e0" strokeWidth="0.9" fill="none" opacity="0.5">
        <path d="M96 30 q3 -3 6 0 M102 30 q3 -3 6 0" />
        <path d="M224 22 q2.5 -2.5 5 0 M229 22 q2.5 -2.5 5 0" />
      </g>

      {/* Marqueurs de bâtiments */}
      {Object.keys(BUILDING_SPOTS).map((key) => {
        const { x, y } = BUILDING_SPOTS[key];
        const level = isl.buildings[key];
        const built = level > 0;
        const active = openKey === key;
        const building = (isl.queue || []).some((q) => q.key === key);
        const portrait = BUILDING_PORTRAITS[key];
        return (
          <g key={key} onClick={() => onTap(key)} style={{ cursor: "pointer" }}>
            {active && (
              <ellipse cx={x} cy={y} rx="21" ry="21" fill="none" stroke={goldHi} strokeWidth="1.2" opacity="0.85">
                <animate attributeName="opacity" values="0.85;0.35;0.85" dur="1.8s" repeatCount="indefinite" />
              </ellipse>
            )}
            <g transform={`translate(${x}, ${y})`}>
              <ellipse cx="0" cy="19" rx="15" ry="4" fill="rgba(10,6,2,0.32)" />
              {built ? (
                <>
                  <circle r="17" fill="#0b0704" />
                  <image href={portrait} x="-16" y="-16" width="32" height="32" clipPath="url(#markerClip)" preserveAspectRatio="xMidYMid slice" />
                  <circle r="16" fill="none" stroke={active ? goldHi : "#f0ead6"} strokeWidth="1.4" opacity={active ? 1 : 0.8} />
                </>
              ) : (
                <>
                  <circle r="15" fill="rgba(20,14,6,0.28)" stroke="#f0ead6" strokeWidth="1" strokeDasharray="2.4 3" opacity="0.85" />
                  <line x1="-4.5" y1="0" x2="4.5" y2="0" stroke="#f0ead6" strokeWidth="1.3" strokeLinecap="round" />
                  <line x1="0" y1="-4.5" x2="0" y2="4.5" stroke="#f0ead6" strokeWidth="1.3" strokeLinecap="round" />
                </>
              )}
            </g>
            {built && (
              <g>
                <circle cx={x + 14} cy={y - 15} r="7" fill="none" stroke="#c39a3d" strokeWidth="0.8" opacity="0.5" />
                <circle cx={x + 14} cy={y - 15} r="5.8" fill="url(#markerBadgeFill)" stroke="#05090e" strokeWidth="1" />
                <text x={x + 14} y={y - 12.2} textAnchor="middle" fontSize="7.4" fontFamily="'Manrope', sans-serif" fontWeight="800" fill="#170f06">{level}</text>
              </g>
            )}
            {building && (
              <circle cx={x - 14} cy={y - 15} r="3.8" fill="#e8c96a">
                <animate attributeName="opacity" values="1;0.25;1" dur="1.1s" repeatCount="indefinite" />
              </circle>
            )}
            {/* zone tapable élargie invisible */}
            <rect x={x - 22} y={y - 24} width="44" height="46" fill="transparent" />
          </g>
        );
      })}

      {/* Profondeur atmosphérique */}
      <rect width="300" height="200" fill="url(#sceneVignette)" style={{ pointerEvents: "none" }} />
    </svg>
  );
}
