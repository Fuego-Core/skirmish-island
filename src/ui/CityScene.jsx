// ════════════════════════════════════════════════════════════
// SCÈNE DE CITÉ — acropole en terrasses, mini-illustrations en volume
// ════════════════════════════════════════════════════════════
export const PAL = {
  marble: "#e8dfc8", marbleShade: "#c3b795", marbleDark: "#a89a76",
  roof: "#a4553a", roofShade: "#7e3f2c",
  wood: "#7a5a37", woodDark: "#57402a",
  stoneWall: "#6f6a58", stoneWallHi: "#8b8570",
  field: "#8a9a4a", fieldDark: "#6d7c39",
  shadow: "rgba(10,18,14,0.35)",
};

// Chaque bâtiment = petite illustration en volume, ancrée au sol en (x, y)
export function BSprite({ k }) {
  const P = PAL;
  switch (k) {
    case "senat": return (<g>
      <ellipse cx="0" cy="1.5" rx="21" ry="4.5" fill={P.shadow} />
      <rect x="-19" y="-3" width="38" height="4" fill={P.marbleShade} />
      <rect x="-17" y="-6" width="34" height="3" fill={P.marble} />
      {[-13.5, -6.5, 0.5, 7.5].map((cx, i) => (
        <g key={i}><rect x={cx} y="-20" width="5" height="14" fill={P.marble} />
        <rect x={cx} y="-20" width="1.6" height="14" fill={P.marbleShade} /></g>
      ))}
      <rect x="-17" y="-23" width="34" height="3.5" fill={P.marbleShade} />
      <path d="M-19 -23 L0 -33 L19 -23 Z" fill={P.marble} />
      <path d="M-19 -23 L0 -33 L0 -23 Z" fill={P.marbleShade} opacity="0.55" />
      <path d="M-15 -24.5 L0 -32 L15 -24.5" fill="none" stroke={P.marbleDark} strokeWidth="0.8" />
    </g>);
    case "caserne": return (<g>
      <ellipse cx="0" cy="1" rx="15" ry="3.5" fill={P.shadow} />
      <rect x="-13" y="-15" width="26" height="15" fill={P.stoneWallHi} />
      <rect x="-13" y="-15" width="9" height="15" fill={P.stoneWall} />
      {[-13, -8, -3, 2, 7].map((cx, i) => <rect key={i} x={cx} y="-18" width="4" height="3.5" fill={P.stoneWallHi} />)}
      <rect x="-3" y="-9" width="6" height="9" fill={P.woodDark} rx="2.5" />
      <circle cx="-8" cy="-10" r="3" fill="none" stroke="#c9a13b" strokeWidth="1.1" />
      <line x1="-8" y1="-12.5" x2="-8" y2="-7.5" stroke="#c9a13b" strokeWidth="0.9" />
    </g>);
    case "marche": return (<g>
      <ellipse cx="0" cy="1" rx="14" ry="3.5" fill={P.shadow} />
      <rect x="-11" y="-9" width="22" height="9" fill={P.wood} />
      <rect x="-11" y="-9" width="7" height="9" fill={P.woodDark} />
      <path d="M-14 -9 L0 -16 L14 -9 Z" fill={P.roof} />
      <path d="M-14 -9 L0 -16 L0 -9 Z" fill={P.roofShade} />
      <rect x="-9" y="-6" width="7" height="6" fill="#caa54a" opacity="0.85" />
      <rect x="2" y="-6" width="7" height="6" fill="#9c5a3a" opacity="0.85" />
    </g>);
    case "entrepot": return (<g>
      <ellipse cx="0" cy="1" rx="15" ry="3.5" fill={P.shadow} />
      <rect x="-13" y="-12" width="26" height="12" fill={P.wood} />
      <rect x="-13" y="-12" width="9" height="12" fill={P.woodDark} />
      <path d="M-15 -12 L0 -19 L15 -12 Z" fill={P.roof} />
      <path d="M-15 -12 L0 -19 L0 -12 Z" fill={P.roofShade} />
      <rect x="-4" y="-8" width="8" height="8" fill={P.woodDark} />
      <line x1="-4" y1="-4" x2="4" y2="-4" stroke={P.wood} strokeWidth="0.8" />
      <line x1="0" y1="-8" x2="0" y2="0" stroke={P.wood} strokeWidth="0.8" />
    </g>);
    case "grenier": return (<g>
      <ellipse cx="0" cy="1" rx="11" ry="3" fill={P.shadow} />
      <path d="M-8 0 C-9 -8, -6 -13, 0 -13 C6 -13, 9 -8, 8 0 Z" fill={P.marbleShade} />
      <path d="M-8 0 C-9 -8, -6 -13, 0 -13 C1 -13, 1.5 -8, 1 0 Z" fill={P.marbleDark} opacity="0.5" />
      <path d="M-6 -13 L0 -18 L6 -13 Z" fill={P.roof} />
      <path d="M-6 -13 L0 -18 L0 -13 Z" fill={P.roofShade} />
      <line x1="-7.5" y1="-4" x2="7.5" y2="-4" stroke={P.marbleDark} strokeWidth="0.7" opacity="0.7" />
      <line x1="-8" y1="-8" x2="8" y2="-8" stroke={P.marbleDark} strokeWidth="0.7" opacity="0.7" />
    </g>);
    case "scierie": return (<g>
      <ellipse cx="0" cy="1" rx="14" ry="3.5" fill={P.shadow} />
      <rect x="-12" y="-11" width="16" height="11" fill={P.wood} />
      <rect x="-12" y="-11" width="5" height="11" fill={P.woodDark} />
      <path d="M-14 -11 L-4 -17 L6 -11 Z" fill={P.roofShade} />
      {[0, 3.2, 6.4].map((dy, i) => (
        <g key={i}><rect x="5" y={-4 - dy} width="9" height="2.6" rx="1.3" fill={P.wood} />
        <circle cx="6.3" cy={-2.7 - dy} r="1" fill={P.marbleShade} /></g>
      ))}
    </g>);
    case "carriere": return (<g>
      <ellipse cx="0" cy="1" rx="15" ry="3.5" fill={P.shadow} />
      <path d="M-14 0 L-9 -13 L-1 -9 L4 -15 L14 0 Z" fill={P.stoneWall} />
      <path d="M-14 0 L-9 -13 L-6 -11 L-9 0 Z" fill={P.stoneWallHi} />
      <rect x="-4" y="-5" width="5" height="4" fill={P.marbleShade} />
      <rect x="2" y="-4" width="5" height="3.5" fill={P.marble} />
      <rect x="-1" y="-8" width="4.5" height="3.5" fill={P.marbleShade} />
    </g>);
    case "mine_fer": case "mine_or": return (<g>
      <ellipse cx="0" cy="1" rx="13" ry="3.5" fill={P.shadow} />
      <path d="M-12 0 C-12 -10, 12 -10, 12 0 Z" fill={P.stoneWall} />
      <path d="M-12 0 C-12 -10, -2 -10, -3 0 Z" fill={P.stoneWallHi} opacity="0.6" />
      <path d="M-5 0 C-5 -6.5, 5 -6.5, 5 0 Z" fill="#120e0a" />
      <rect x="-6" y="-7" width="2" height="7" fill={P.woodDark} />
      <rect x="4" y="-7" width="2" height="7" fill={P.woodDark} />
      <rect x="-6.5" y="-7.5" width="13" height="2" fill={P.wood} />
      {k === "mine_or" && <circle cx="0" cy="-3" r="1.4" fill="#e8c96a"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" /></circle>}
    </g>);
    case "ferme": return (<g>
      <ellipse cx="0" cy="1" rx="17" ry="4" fill={P.shadow} />
      {[-12, -5, 2, 9].map((cx, i) => (
        <path key={i} d={`M${cx} 0 C ${cx} -3, ${cx + 1} -5.5, ${cx + 1.5} -6.5 M${cx + 3} 0 C ${cx + 3} -3.5, ${cx + 3.5} -5, ${cx + 4} -7`}
          stroke={i % 2 ? P.field : P.fieldDark} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ))}
      <rect x="-16" y="-1" width="32" height="1.6" fill={P.fieldDark} opacity="0.7" />
    </g>);
    case "muraille": return (<g>
      <ellipse cx="0" cy="1" rx="17" ry="3.5" fill={P.shadow} />
      <rect x="-16" y="-10" width="32" height="10" fill={P.stoneWallHi} />
      <rect x="-16" y="-10" width="11" height="10" fill={P.stoneWall} />
      {[-16, -10, -4, 2, 8].map((cx, i) => <rect key={i} x={cx} y="-13" width="4.5" height="3.4" fill={P.stoneWallHi} />)}
      <path d="M-4 0 C-4 -6.5, 4 -6.5, 4 0 Z" fill={P.woodDark} />
      <line x1="-16" y1="-5" x2="16" y2="-5" stroke={P.stoneWall} strokeWidth="0.6" opacity="0.6" />
    </g>);
    case "colosse": return (<g>
      <ellipse cx="0" cy="1" rx="10" ry="3" fill={P.shadow} />
      <rect x="-7" y="-4" width="14" height="4" fill={P.marbleShade} />
      <rect x="-5" y="-7" width="10" height="3" fill={P.marble} />
      <path d="M-2.5 -7 L-3 -20 L-1 -22 L1 -22 L3 -20 L2.5 -7 Z" fill="#caa54a" />
      <path d="M-2.5 -7 L-3 -20 L-1 -22 L-0.5 -7 Z" fill="#8a6d1f" />
      <circle cx="0" cy="-24" r="2.4" fill="#caa54a" />
      <path d="M2 -20 L7 -25 M7 -25 L8.5 -24" stroke="#caa54a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="8.5" cy="-25" r="1.5" fill="#eed88a"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" /></circle>
    </g>);
    case "port": return (<g>
      <rect x="-3" y="-1" width="30" height="4.5" rx="1" fill={P.wood} transform="rotate(8)" />
      <line x1="2" y1="3" x2="2" y2="7.5" stroke={P.woodDark} strokeWidth="1.8" />
      <line x1="12" y1="4.5" x2="12" y2="9" stroke={P.woodDark} strokeWidth="1.8" />
      <line x1="22" y1="6" x2="22" y2="10.5" stroke={P.woodDark} strokeWidth="1.8" />
      <path d="M-16 2 h13 l-2.5 3.5 h-8 Z" fill={P.woodDark} />
      <line x1="-9.5" y1="2" x2="-9.5" y2="-7" stroke={P.woodDark} strokeWidth="1.2" />
      <path d="M-9.5 -7 L-4 -2.5 L-9.5 -2.5 Z" fill={P.marble} />
    </g>);
    default: return null;
  }
}

export const BUILDING_SPOTS = {
  senat:    { x: 150, y: 66 },
  caserne:  { x: 92,  y: 92 },
  marche:   { x: 208, y: 92 },
  scierie:  { x: 44,  y: 122 },
  entrepot: { x: 104, y: 126 },
  ferme:    { x: 152, y: 124 },
  grenier:  { x: 198, y: 126 },
  carriere: { x: 256, y: 122 },
  mine_fer: { x: 74,  y: 152 },
  muraille: { x: 178, y: 152 },
  colosse:  { x: 250, y: 170 },
  mine_or:  { x: 226, y: 152 },
  port:     { x: 138, y: 172 },
};

export function CityScene({ isl, onTap, openKey, gold, goldHi, ink }) {
  return (
    <svg viewBox="0 0 300 205" style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1a2a" /><stop offset="55%" stopColor="#1a3d54" /><stop offset="100%" stopColor="#316688" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c6787" /><stop offset="100%" stopColor="#102c3c" />
        </linearGradient>
        <linearGradient id="terr1" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#7c9660" /><stop offset="55%" stopColor="#5c7548" /><stop offset="100%" stopColor="#465c37" />
        </linearGradient>
        <linearGradient id="terr2" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#6c8552" /><stop offset="55%" stopColor="#4f6740" /><stop offset="100%" stopColor="#3c4f32" />
        </linearGradient>
        <linearGradient id="terr3" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#5f7a4c" /><stop offset="55%" stopColor="#465937" /><stop offset="100%" stopColor="#33452a" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0d078" stopOpacity="0.95" /><stop offset="40%" stopColor="#e6c469" stopOpacity="0.3" /><stop offset="100%" stopColor="#e6c469" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunGlowSoft" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e6c469" stopOpacity="0.22" /><stop offset="100%" stopColor="#e6c469" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="horizonHaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c987" stopOpacity="0.22" /><stop offset="100%" stopColor="#e8c987" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="vignette" cx="50%" cy="42%" r="72%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" /><stop offset="100%" stopColor="#020608" stopOpacity="0.38" />
        </radialGradient>
        <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
        </filter>
        <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <radialGradient id="badgeFill" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f0d078" /><stop offset="100%" stopColor="#c39a3d" />
        </radialGradient>
      </defs>

      {/* Ciel */}
      <rect width="300" height="205" fill="url(#sky)" />
      <circle cx="248" cy="36" r="42" fill="url(#sunGlowSoft)" />
      <circle cx="248" cy="36" r="26" fill="url(#sunGlow)" />
      <circle cx="248" cy="36" r="9" fill="#f5e2a0" />
      {/* nuages plats */}
      <g fill="#c9d6dc" opacity="0.13">
        <ellipse cx="66" cy="30" rx="26" ry="4" /><ellipse cx="84" cy="26" rx="16" ry="3" />
        <ellipse cx="180" cy="48" rx="20" ry="3" />
      </g>
      {/* goélands */}
      <g stroke="#c9d6dc" strokeWidth="0.9" fill="none" opacity="0.5">
        <path d="M96 44 q3 -3 6 0 M102 44 q3 -3 6 0" />
        <path d="M204 62 q2.5 -2.5 5 0 M209 62 q2.5 -2.5 5 0" />
      </g>
      {/* îles lointaines (perspective atmosphérique) */}
      <path d="M-5 158 Q 25 146 55 158 Z" fill="#375669" opacity="0.55" />
      <path d="M255 156 Q 280 143 305 156 Z" fill="#375669" opacity="0.55" />
      <path d="M195 159 Q 215 151 235 159 Z" fill="#43647a" opacity="0.4" />
      <rect x="0" y="130" width="300" height="35" fill="url(#horizonHaze)" />

      {/* Mer */}
      <rect y="156" width="300" height="49" fill="url(#sea)" />
      {/* reflet du soleil (scintillement) */}
      <g fill="#f5e2a0">
        <ellipse cx="248" cy="162" rx="13" ry="1.3" opacity="0.4"><animate attributeName="opacity" values="0.4;0.75;0.4" dur="3.2s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="245" cy="168" rx="9" ry="1.1" opacity="0.28"><animate attributeName="opacity" values="0.28;0.6;0.28" dur="2.6s" begin="0.4s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="250" cy="175" rx="11" ry="1.2" opacity="0.2"><animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.6s" begin="0.9s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="246" cy="184" rx="7" ry="1" opacity="0.14"><animate attributeName="opacity" values="0.14;0.35;0.14" dur="2.9s" begin="1.3s" repeatCount="indefinite" /></ellipse>
      </g>
      <g stroke="#4d8aa8" strokeWidth="0.8" fill="none" opacity="0.4">
        <path d="M8 166 q8 -2 16 0 M40 172 q8 -2 16 0 M20 184 q8 -2 16 0 M70 178 q8 -2 16 0 M120 190 q8 -2 16 0 M180 186 q8 -2 16 0" />
      </g>

      {/* Île en 3 terrasses */}
      <path d="M22 165 C 40 118, 70 104, 150 104 C 230 104, 260 118, 278 165 L 278 168 C 240 174, 60 174, 22 168 Z" fill="url(#terr3)" />
      <path d="M22 165 C 40 118, 70 104, 150 104 C 230 104, 260 118, 278 165 L 278 168 C 240 174, 60 174, 22 168 Z" fill="url(#grain)" opacity="0.5" />
      <path d="M52 118 C 70 88, 100 78, 150 78 C 200 78, 230 88, 248 118 C 220 126, 80 126, 52 118 Z" fill="url(#terr2)" />
      <path d="M52 118 C 70 88, 100 78, 150 78 C 200 78, 230 88, 248 118 C 220 126, 80 126, 52 118 Z" fill="url(#grain)" opacity="0.5" />
      <path d="M104 80 C 114 62, 130 56, 150 56 C 170 56, 186 62, 196 80 C 178 86, 122 86, 104 80 Z" fill="url(#terr1)" />
      <path d="M104 80 C 114 62, 130 56, 150 56 C 170 56, 186 62, 196 80 C 178 86, 122 86, 104 80 Z" fill="url(#grain)" opacity="0.5" />
      {/* murs de soutènement (lumière rasante côté soleil) */}
      <path d="M52 118 C 90 127, 210 127, 248 118" stroke="#9a9377" strokeWidth="2.6" fill="none" opacity="0.9" />
      <path d="M180 119 C 210 121, 235 119, 248 118" stroke="#e6c469" strokeWidth="1.1" fill="none" opacity="0.35" />
      <path d="M52 121 C 90 130, 210 130, 248 121" stroke="#4a4432" strokeWidth="1.4" fill="none" opacity="0.65" />
      <path d="M104 80 C 130 87, 170 87, 196 80" stroke="#9a9377" strokeWidth="2.4" fill="none" opacity="0.9" />
      <path d="M160 81 C 180 83, 190 82, 196 80" stroke="#e6c469" strokeWidth="1" fill="none" opacity="0.35" />
      <path d="M104 83 C 130 90, 170 90, 196 83" stroke="#4a4432" strokeWidth="1.3" fill="none" opacity="0.65" />
      {/* rivage */}
      <path d="M22 165 C 60 172, 240 172, 278 165" stroke="#d9c99a" strokeWidth="2.6" fill="none" opacity="0.55" />
      <path d="M22 165 C 60 172, 240 172, 278 165" stroke="#f0e2b8" strokeWidth="0.9" fill="none" opacity="0.4" transform="translate(0,-1)" />
      {/* escalier monumental */}
      <g stroke="#d9c99a" strokeWidth="1.6" opacity="0.75">
        <line x1="146" y1="86" x2="154" y2="86" /><line x1="144" y1="92" x2="156" y2="92" />
        <line x1="143" y1="98" x2="157" y2="98" /><line x1="141" y1="112" x2="159" y2="112" />
        <line x1="140" y1="120" x2="160" y2="120" /><line x1="139" y1="130" x2="161" y2="130" />
        <line x1="138" y1="142" x2="162" y2="142" /><line x1="137" y1="154" x2="163" y2="154" />
      </g>
      {/* rochers et broussailles (densité végétale) */}
      {[[30,160,1],[270,158,0.9],[96,110,0.8],[206,112,0.85],[130,90,0.7],[172,90,0.7]].map(([rx, ry, sc], i) => (
        <g key={i} transform={`translate(${rx},${ry}) scale(${sc})`} opacity="0.9">
          <ellipse cx="0" cy="3.5" rx="6" ry="1.6" fill={PAL.shadow} />
          <path d="M-5 3 C-6 -1 -3 -3 0 -3 C3 -3 6 -1 5 3 Z" fill="#5c6352" />
          <path d="M-5 3 C-6 -1 -3 -3 -1 -3 C-1.5 -1 -2 1 -3 3 Z" fill="#454b3c" opacity="0.7" />
        </g>
      ))}
      {[[46,156],[256,152],[112,102],[190,104]].map(([bx, by], i) => (
        <g key={i} transform={`translate(${bx},${by})`}>
          <ellipse cx="0" cy="1" rx="4.5" ry="1.3" fill={PAL.shadow} />
          <circle cx="-1.5" cy="-1.5" r="2.6" fill="#41562f" />
          <circle cx="1.8" cy="-1" r="2.2" fill="#4d6636" />
          <circle cx="0" cy="-2.8" r="2.1" fill="#587339" />
        </g>
      ))}
      {/* cyprès */}
      {[[36,146],[266,146],[118,78],[182,78],[64,116],[238,116],[150,100],[86,150],[222,150]].map(([cx, cy], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy + 1} rx="3.4" ry="1.2" fill={PAL.shadow} />
          <path d={`M${cx} ${cy} C ${cx - 3.4} ${cy - 7}, ${cx - 2.6} ${cy - 14}, ${cx} ${cy - 18} C ${cx + 2.6} ${cy - 14}, ${cx + 3.4} ${cy - 7}, ${cx} ${cy}`} fill="#2c4630" />
          <path d={`M${cx} ${cy} C ${cx - 3.4} ${cy - 7}, ${cx - 2.6} ${cy - 14}, ${cx} ${cy - 18}`} fill="#22381f" />
          <path d={`M${cx} ${cy} C ${cx + 1.6} ${cy - 7}, ${cx + 1.4} ${cy - 13}, ${cx} ${cy - 18}`} fill="#3c5c3a" opacity="0.55" />
        </g>
      ))}

      {/* Bâtiments */}
      {Object.keys(BUILDING_SPOTS).map((key) => {
        const { x, y } = BUILDING_SPOTS[key];
        const level = isl.buildings[key];
        const built = level > 0;
        const active = openKey === key;
        const building = isl.queue && isl.queue.key === key;
        return (
          <g key={key} onClick={() => onTap(key)} style={{ cursor: "pointer" }}>
            {active && <ellipse cx={x} cy={y + 1} rx="24" ry="7" fill="none" stroke={goldHi} strokeWidth="1" opacity="0.85"><animate attributeName="opacity" values="0.85;0.35;0.85" dur="1.8s" repeatCount="indefinite" /></ellipse>}
            {built ? (
              <g transform={`translate(${x}, ${y})`} filter="url(#softShadow)"><BSprite k={key} /></g>
            ) : (
              <g opacity="0.6">
                <ellipse cx={x} cy={y + 1} rx="15" ry="4.5" fill="rgba(0,0,0,0.22)" stroke="#c3b795" strokeWidth="0.9" strokeDasharray="2.5 3" />
                <line x1={x - 3.5} y1={y - 3} x2={x + 3.5} y2={y - 3} stroke="#d9c99a" strokeWidth="1.1" strokeLinecap="round" />
                <line x1={x} y1={y - 6.5} x2={x} y2={y + 0.5} stroke="#d9c99a" strokeWidth="1.1" strokeLinecap="round" />
              </g>
            )}
            {built && (
              <g>
                <circle cx={x + 15} cy={y - 20} r="6.5" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.5" />
                <circle cx={x + 15} cy={y - 20} r="5.4" fill="url(#badgeFill)" stroke="#05090e" strokeWidth="1" />
                <text x={x + 15} y={y - 17.4} textAnchor="middle" fontSize="7" fontFamily="'Manrope', sans-serif" fontWeight="800" fill={ink}>{level}</text>
              </g>
            )}
            {building && (
              <circle cx={x - 15} cy={y - 20} r="3.6" fill="#e8c96a">
                <animate attributeName="opacity" values="1;0.25;1" dur="1.1s" repeatCount="indefinite" />
              </circle>
            )}
            {/* zone tapable élargie invisible */}
            <rect x={x - 22} y={y - 30} width="44" height="38" fill="transparent" />
          </g>
        );
      })}

      {/* Profondeur atmosphérique */}
      <rect width="300" height="205" fill="url(#vignette)" style={{ pointerEvents: "none" }} />
    </svg>
  );
}
