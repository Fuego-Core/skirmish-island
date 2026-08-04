// ════════════════════════════════════════════════════════════
// ICÔNES SVG — set antique dessiné sur mesure (trait, 24×24)
// ════════════════════════════════════════════════════════════
export const ICON_PATHS = {
  // Ressources
  bois: ["M12 20V9", "M12 9C8 9 6 6 6 3c3 0 6 1 6 6 0-5 3-6 6-6 0 3-2 6-6 6", "M8 20h8"],
  pierre: ["M4 20h7v-5H4z", "M13 20h7v-5h-7z", "M8 15h8v-5H8z"],
  fer: ["M12 6v14", "M4 8c4-4 12-4 16 0", "M10 20h4"],
  or: ["M12 19a7 7 0 100-14 7 7 0 000 14", "M9.5 12c.8-1.6 4.2-1.6 5 0", "M12 8.5v1", "M12 14.5v1"],
  ble: ["M12 21V5", "M12 8l3.5-2.5M12 8L8.5 5.5", "M12 12l3.5-2.5M12 12 8.5 9.5", "M12 16l3.5-2.5M12 16l-3.5-2.5"],
  // Bâtiments
  senat: ["M3 9.5 12 4l9 5.5", "M4 9.5h16", "M6 9.5V19M10 9.5V19M14 9.5V19M18 9.5V19", "M4 19h16", "M3 21h18"],
  scierie: ["M6 18 18 6", "m15 3 6 6-3 3-6-6z", "M6 18l-2 2", "M8 20l10-10"],
  carriere: ["m3 20 6-10 4 7 3-4 5 7z", "M3 20h18"],
  mine_fer: ["M12 7v13", "M4 9c4-4.5 12-4.5 16 0", "M10 20h4"],
  mine_or: ["M12 21a4 4 0 100-8 4 4 0 000 8", "M4 7c4-3.5 12-3.5 16 0", "M12 7v4"],
  ferme: ["M8 21c0-7 1-11 4-15", "M16 21c0-7-1-11-4-15", "M12 21V6", "M9 15h6", "M4 21h16"],
  entrepot: ["M3 10 12 5l9 5", "M5 10v10h14V10", "M5 15h14", "M12 10v10"],
  grenier: ["M9 3h6", "M10 3c0 3-3 4.5-3 8 0 5.5 2 9 5 9s5-3.5 5-9c0-3.5-3-5-3-8", "M7 9c-1.5.5-2 2-1 3", "M17 9c1.5.5 2 2 1 3"],
  marche: ["M12 4v16", "M9 20h6", "M5 7h14", "M5 7l-2.5 5h5z", "M19 7l-2.5 5h5z", "M2.5 12a2.5 2 0 005 0", "M16.5 12a2.5 2 0 005 0"],
  port: ["M12 8a2 2 0 100-4 2 2 0 000 4", "M12 8v13", "M8 11h8", "M5 15c1 4.5 4 6 7 6s6-1.5 7-6", "M5 15l-2 1M19 15l2 1"],
  caserne: ["M7 21V10a5 5 0 0110 0v11", "M7 13h3.5v8", "M13.5 13H17v8", "M10.5 13v8h3v-8", "M7 6.5C9 3.5 15 3.5 17 6.5"],
  muraille: ["M4 20V9h16v11", "M4 9V6h3.5v3M10.2 9V6h3.6v3M16.5 9V6H20v3", "M9 20v-5a3 3 0 016 0v5", "M3 20h18"],
  colosse: ["M7 21h10", "M9 21v-3h6v3", "M12 18v-5", "M12 13c-1.8 0-2.8-1.8-2.8-4.2S10.2 4 12 4s2.8 2.4 2.8 4.8S13.8 13 12 13", "M13.5 6.5 17 3.5", "M17 3.5l1.5 1"],
  // Bateaux (coque commune + signe distinctif)
  explorateur: ["M3 15h18l-3 4.5H6z", "M12 3v12", "M12 3l6.5 9H12"],
  peche: ["M3 15h18l-3 4.5H6z", "M9 15 16 4", "M16 4v5", "M16 9c1.5 0 2 1.5 1 2.5"],
  transport: ["M3 15h18l-3 4.5H6z", "M7 10h10v5H7z", "M12 10v5", "M7 12.5h10"],
  colonisation: ["M3 15h18l-3 4.5H6z", "M12 3v12", "M12 3.5h6l-2 2.25 2 2.25h-6"],
  siege: ["M3 15h18l-3 4.5H6z", "M8 15 17 5", "M17 5a2 2 0 102 2"],
  eclaireur: ["M3 15h18l-3 4.5H6z", "M12 3v12", "M12 3.5h4.5L15 5l1.5 1.5H12", "M8 9a4 4 0 018 0"],
  // Troupes
  hoplite: ["M12 18a6 6 0 100-12 6 6 0 000 12", "M12 9v6M9 12h6", "M4 21 20 4"],
  archer: ["M7 3a13 13 0 010 18", "M7 3v18", "M7 12h12", "m16 8.5 3.5 3.5L16 15.5"],
  cavalier: ["M6 21c0-6 2-10 6-12", "M12 9 14 4l4 3-2 3.5", "M16 10.5c2 2.5 2 6.5 2 10.5", "M9 21h11"],
  belier: ["M3 13h12", "M19 13a3.5 3.5 0 10-3.5 3.5", "M19 9.5c2 .5 2.5 3 1 4.5", "M5 13v4M9 13v4"],
  catapulte: ["M4 20h16", "M7 20l5.5-8.5", "M8 16 18 5", "M18 5a2 2 0 102 2", "M6.5 20a1.5 1.5 0 103 0M14.5 20a1.5 1.5 0 103 0"],
  // Divers
  esclaves: ["M9 6a3 4 0 100 8 3 4 0 000-8", "M15 10a3 4 0 100 8 3 4 0 000-8"],
  carte: ["M4 5.5 9 3.5l6 2 5-2v15l-5 2-6-2-5 2z", "M9 3.5v15", "M15 5.5v15"],
  rapports: ["M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2", "M9 9h6M9 13h6"],
  epees: ["M4 4l16 16", "M20 4 4 20", "M6 2.5 9 5.5M2.5 6 5.5 9", "M18 21.5 15 18.5M21.5 18l-3-3"],
  drapeau: ["M6 21V3", "M6 4h11l-2.5 3L17 10H6"],
  ile: ["M3 18c2.5-2.5 5-3.5 9-3.5s6.5 1 9 3.5", "M12 14.5V8", "M12 8C10 8 9 6 9 4c2 0 3 .5 3 4 0-3.5 1-4 3-4 0 2-1 4-3 4"],
  athenes: ["M12 20a7 8 0 100-16 7 8 0 000 16", "M8.5 10a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0", "M12.5 10a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0", "M12 12.5l-1 1.5h2z", "M7 6l2 2M17 6l-2 2"],
  sparte: ["M12 19a7 7 0 100-14 7 7 0 000 14", "M9 15.5 12 8.5l3 7"],
  cloche: ["M12 4a5 5 0 015 5v4l2 3H5l2-3V9a5 5 0 015-5", "M10 19a2 2 0 004 0"],
  laurier: ["M12 21V8", "M12 12C9 12 6.5 10 6 6.5 9 7 11.5 8.5 12 12", "M12 12c3 0 5.5-2 6-5.5-3 .5-5.5 2-6 5.5", "M12 17c-2.5 0-4.5-1.5-5-4 2.5.4 4.5 1.7 5 4", "M12 17c2.5 0 4.5-1.5 5-4-2.5.4-4.5 1.7-5 4"],
  couronne: ["M5 18 3.5 8l4.5 3.5L12 5l4 6.5L20.5 8 19 18z", "M5 18h14", "M4.5 21h15"],
  plume: ["M6 20c0-8 4-13 12-15-1 8-6 12-12 15", "M6 20l-2 1", "M10 16l7-7"],
  cadenas: ["M6 11V8a6 6 0 1112 0v3", "M5 11h14v10H5z", "M12 15v3"],
};

export function I({ name, size = 16, color = "currentColor", sw = 1.7, style }) {
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, ...style }}>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

// Frise grecque (méandre) — bande décorative SVG
export function Meander({ height = 7, color }) {
  return (
    <svg width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <pattern id="meander" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 12h10V4H4v4h4" fill="none" stroke={color || "#7d6524"} strokeWidth="1.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#meander)" opacity="0.55" />
    </svg>
  );
}
