// ════════════════════════════════════════════════════════════
// TITLE BACKDROP — illustration "clé" pour l'écran titre : crépuscule
// sur l'Égée, temple en ruine sur une falaise. Distincte de CityScene
// (qui reste la vue de jeu tapable) — pensée comme une affiche.
// ════════════════════════════════════════════════════════════
export function TitleBackdrop() {
  return (
    <svg viewBox="0 0 300 500" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="tbSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#150f24" />
          <stop offset="32%" stopColor="#3a2044" />
          <stop offset="58%" stopColor="#87375a" />
          <stop offset="78%" stopColor="#c85f4c" />
          <stop offset="100%" stopColor="#e69a4e" />
        </linearGradient>
        <radialGradient id="tbSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9b8" stopOpacity="1" />
          <stop offset="35%" stopColor="#ffcf7d" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffb15e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tbSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a3f52" />
          <stop offset="35%" stopColor="#4a2c48" />
          <stop offset="100%" stopColor="#160f22" />
        </linearGradient>
        <linearGradient id="tbFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c4468" /><stop offset="100%" stopColor="#4a3557" />
        </linearGradient>
        <linearGradient id="tbMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a44" /><stop offset="100%" stopColor="#2c2036" />
        </linearGradient>
        <radialGradient id="tbVign" cx="50%" cy="30%" r="75%">
          <stop offset="55%" stopColor="#000000" stopOpacity="0" /><stop offset="100%" stopColor="#08050c" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <rect width="300" height="500" fill="url(#tbSky)" />

      {/* étoiles hautes */}
      <g fill="#f3e7d0">
        {[[24,36,0.9],[58,18,0.6],[92,50,0.7],[130,14,0.5],[210,28,0.8],[248,46,0.6],[272,16,0.7],[16,70,0.5],[190,60,0.5]].map(([x,y,o],i) => (
          <circle key={i} cx={x} cy={y} r="1" opacity={o}>
            <animate attributeName="opacity" values={`${o};${o*0.3};${o}`} dur={`${2.4 + (i % 3)}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* soleil bas, halo chaud */}
      <circle cx="150" cy="270" r="95" fill="url(#tbSun)" />
      <circle cx="150" cy="270" r="30" fill="#fff1cf" />

      {/* nuages effilés, lumière rasante */}
      <g opacity="0.5">
        <path d="M-10 150 Q60 140 130 150 T300 145" stroke="#e8a769" strokeWidth="5" fill="none" opacity="0.35" strokeLinecap="round" />
        <path d="M40 190 Q120 178 200 190 T320 185" stroke="#f2c98a" strokeWidth="4" fill="none" opacity="0.3" strokeLinecap="round" />
      </g>

      {/* montagnes lointaines */}
      <path d="M-10 300 L30 250 L70 285 L110 240 L160 288 L205 245 L250 282 L310 255 L310 320 L-10 320 Z" fill="url(#tbFar)" opacity="0.75" />
      {/* falaises moyennes */}
      <path d="M-10 330 L40 270 L90 310 L150 260 L195 305 L240 275 L310 315 L310 340 L-10 340 Z" fill="url(#tbMid)" />

      {/* mer + reflet */}
      <rect y="335" width="300" height="165" fill="url(#tbSea)" />
      <polygon points="150,335 132,500 168,500" fill="#ffcf88" opacity="0.28" />
      <g stroke="#f2c98a" strokeWidth="1.1" opacity="0.3">
        <line x1="120" y1="360" x2="180" y2="360" /><line x1="112" y1="378" x2="188" y2="378" />
        <line x1="122" y1="398" x2="178" y2="398" /><line x1="105" y1="420" x2="195" y2="420" />
        <line x1="118" y1="444" x2="182" y2="444" /><line x1="100" y1="470" x2="200" y2="470" />
      </g>

      {/* falaise avant-plan à droite, temple en ruine */}
      <path d="M195 340 C 210 300 225 270 260 255 C 285 244 300 246 300 246 L300 500 L195 500 Z" fill="#120b17" />
      <g fill="#0e0810">
        {/* colonnes du temple, en silhouette, certaines brisées */}
        <rect x="222" y="238" width="9" height="52" />
        <rect x="238" y="230" width="9" height="60" />
        <rect x="254" y="234" width="9" height="56" />
        <rect x="270" y="226" width="7" height="20" />
        <rect x="284" y="240" width="9" height="50" />
        <path d="M214 238 L300 214 L300 238 L214 246 Z" />
        <path d="M214 292 L300 292 L300 300 L214 300 Z" />
      </g>

      {/* falaise avant-plan à gauche */}
      <path d="M-10 500 L-10 360 C 10 340 30 345 45 365 C 58 382 55 410 40 430 C 25 452 10 470 -10 480 Z" fill="#0d0810" />
      {/* silhouette de mât/navire au loin */}
      <g stroke="#160f1c" strokeWidth="2" opacity="0.85">
        <line x1="70" y1="352" x2="70" y2="335" />
        <path d="M55 352 L88 352 L82 362 L61 362 Z" fill="#160f1c" stroke="none" />
      </g>

      {/* oiseaux */}
      <g stroke="#2a1c2e" strokeWidth="1.3" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M60 120 q5 -5 10 0 M70 120 q5 -5 10 0" />
        <path d="M100 140 q4 -4 8 0 M108 140 q4 -4 8 0" />
      </g>

      <rect width="300" height="500" fill="url(#tbVign)" />
    </svg>
  );
}
