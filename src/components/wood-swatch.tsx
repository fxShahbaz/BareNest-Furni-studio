type SwatchKind = "solid" | "mdf" | "particle";

export default function WoodSwatch({ kind }: { kind: SwatchKind }) {
  if (kind === "solid") return <SolidWoodSwatch />;
  if (kind === "mdf") return <MdfSwatch />;
  return <ParticleSwatch />;
}

/* ------------------------------------------------------------------ */
/* 01 — Solid wood: deep walnut surface with grain, knot, hardwax sheen */
/* ------------------------------------------------------------------ */
function SolidWoodSwatch() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="sw-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6e4525" />
          <stop offset="0.55" stopColor="#5a361a" />
          <stop offset="1" stopColor="#36210f" />
        </linearGradient>
        <linearGradient id="sw-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c69673" stopOpacity="0.35" />
          <stop offset="0.4" stopColor="#c69673" stopOpacity="0" />
        </linearGradient>
        <filter id="sw-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.6"
            numOctaves="2"
            seed="7"
          />
          <feColorMatrix values="0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0 0.02 0 0 0 0.55 0" />
        </filter>
        <filter id="sw-grain-bend">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.05"
            numOctaves="2"
            seed="11"
          />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
      </defs>

      {/* base wood */}
      <rect width="400" height="300" fill="url(#sw-base)" />

      {/* warped grain lines via displacement filter */}
      <g filter="url(#sw-grain-bend)" opacity="0.55">
        <g stroke="#1f1206" fill="none">
          <path d="M-20 30 H420" strokeWidth="1.6" />
          <path d="M-20 58 H420" strokeWidth="1.1" />
          <path d="M-20 82 H420" strokeWidth="0.9" />
          <path d="M-20 108 H420" strokeWidth="1.4" />
          <path d="M-20 138 H420" strokeWidth="1" />
          <path d="M-20 168 H420" strokeWidth="1.7" />
          <path d="M-20 195 H420" strokeWidth="1" />
          <path d="M-20 222 H420" strokeWidth="1.3" />
          <path d="M-20 252 H420" strokeWidth="1" />
          <path d="M-20 282 H420" strokeWidth="1.6" />
        </g>
        <g stroke="#a07042" fill="none" opacity="0.5">
          <path d="M-20 44 H420" strokeWidth="0.6" />
          <path d="M-20 96 H420" strokeWidth="0.5" />
          <path d="M-20 154 H420" strokeWidth="0.5" />
          <path d="M-20 210 H420" strokeWidth="0.6" />
          <path d="M-20 268 H420" strokeWidth="0.5" />
        </g>
      </g>

      {/* knot */}
      <g transform="translate(118 162)">
        <ellipse rx="36" ry="22" fill="#1d1106" opacity="0.55" />
        <ellipse rx="24" ry="15" fill="#0f0803" />
        <ellipse rx="14" ry="9" fill="#22130a" />
        <ellipse rx="7" ry="4" fill="#3a2110" />
        {/* concentric grain wrapping the knot */}
        <ellipse rx="48" ry="28" fill="none" stroke="#1f1206" strokeWidth="0.7" opacity="0.45" />
        <ellipse rx="58" ry="34" fill="none" stroke="#1f1206" strokeWidth="0.5" opacity="0.3" />
      </g>

      {/* fibre noise */}
      <rect width="400" height="300" filter="url(#sw-noise)" />

      {/* top highlight for the hardwax oil sheen */}
      <rect width="400" height="160" fill="url(#sw-sheen)" />

      {/* board edge hint at top */}
      <rect width="400" height="2" fill="#1d1106" opacity="0.4" />
      <rect y="2" width="400" height="1" fill="#a07042" opacity="0.25" />
    </svg>
  );
}

/* ----------------------------------------------------------- */
/* 02 — Dense MDF: clay-tan body with a layered cross-section  */
/* ----------------------------------------------------------- */
function MdfSwatch() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="mdf-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7a37b" />
          <stop offset="1" stopColor="#a07e57" />
        </linearGradient>
        <linearGradient id="mdf-veneer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c4d2a" />
          <stop offset="1" stopColor="#5a3618" />
        </linearGradient>
        <filter id="mdf-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="2.4"
            numOctaves="2"
            seed="3"
          />
          <feColorMatrix values="0 0 0 0 0.12 0 0 0 0 0.07 0 0 0 0 0.03 0 0 0 0.35 0" />
        </filter>
        <filter id="mdf-grain-bend">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.5"
            numOctaves="1"
            seed="5"
          />
          <feDisplacementMap in="SourceGraphic" scale="4" />
        </filter>
      </defs>

      {/* base */}
      <rect width="400" height="300" fill="url(#mdf-base)" />

      {/* fine fibre-board striations (very subtle) */}
      <g filter="url(#mdf-grain-bend)" opacity="0.18">
        <g stroke="#5a3618" fill="none" strokeWidth="0.5">
          {Array.from({ length: 28 }).map((_, i) => (
            <path key={i} d={`M-20 ${10 + i * 10.5} H420`} />
          ))}
        </g>
      </g>

      {/* fibre noise overlay */}
      <rect width="400" height="300" filter="url(#mdf-noise)" />

      {/* top veneer band — thin walnut laminate finish on top */}
      <rect width="400" height="22" fill="url(#mdf-veneer)" />
      <rect y="22" width="400" height="1" fill="#3a210f" opacity="0.6" />
      <rect y="23" width="400" height="2" fill="#d8b387" opacity="0.6" />

      {/* left edge "cross section" — denser layered look on the side */}
      <g>
        <rect width="62" height="300" fill="#9e7d56" />
        {/* dense layered striations on the cut edge */}
        <g opacity="0.55">
          {Array.from({ length: 36 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              x2="62"
              y1={4 + i * 8.3}
              y2={4 + i * 8.3}
              stroke="#5a3618"
              strokeWidth="0.7"
            />
          ))}
        </g>
        {/* a few denser stripes to suggest pressed layers */}
        <line x1="0" x2="62" y1="80" y2="80" stroke="#3a210f" strokeWidth="1.2" opacity="0.7" />
        <line x1="0" x2="62" y1="155" y2="155" stroke="#3a210f" strokeWidth="1.2" opacity="0.7" />
        <line x1="0" x2="62" y1="225" y2="225" stroke="#3a210f" strokeWidth="1.2" opacity="0.7" />
        {/* separator between edge and surface */}
        <line x1="62" y1="22" x2="62" y2="300" stroke="#3a210f" strokeWidth="1.4" opacity="0.6" />
      </g>

      {/* "MDF" stamp at bottom right, like a manufacturer's mark */}
      <g opacity="0.5">
        <rect x="316" y="248" width="68" height="32" rx="6" fill="none" stroke="#3a210f" strokeWidth="1" />
        <text
          x="350"
          y="271"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="13"
          fontWeight="600"
          fill="#3a210f"
        >
          MDF
        </text>
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* 03 — Particle Board: chunky chip aggregate, visually low-quality */
/* ---------------------------------------------------------------- */
function ParticleSwatch() {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="pb-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78457" />
          <stop offset="1" stopColor="#856238" />
        </linearGradient>
        <filter id="pb-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="3.2"
            numOctaves="2"
            seed="9"
          />
          <feColorMatrix values="0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0 0.02 0 0 0 0.7 0" />
        </filter>
        <filter id="pb-blob">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="2"
            seed="14"
          />
          <feColorMatrix values="0 0 0 0 0.45 0 0 0 0 0.32 0 0 0 0 0.18 0 0 0 0.9 -0.35" />
        </filter>
      </defs>

      <rect width="400" height="300" fill="url(#pb-base)" />

      {/* chunky aggregate — large blobs of varied tone */}
      <rect width="400" height="300" filter="url(#pb-blob)" opacity="0.85" />

      {/* fine particulate noise on top */}
      <rect width="400" height="300" filter="url(#pb-noise)" />

      {/* deterministic chip polygons for unmistakable particle-board look */}
      <g opacity="0.85">
        {[
          ["#6a4825", "30,40 56,46 50,68 28,62"],
          ["#9c7849", "82,28 110,34 100,52 78,48"],
          ["#7c5a32", "140,60 168,68 158,90 132,80"],
          ["#b08c5d", "200,38 232,46 222,70 196,62"],
          ["#5e3f1c", "270,52 296,58 290,80 268,72"],
          ["#a07a4a", "324,30 356,38 346,60 320,52"],
          ["#7a572f", "44,110 72,118 62,138 38,128"],
          ["#bd9466", "112,128 142,134 132,158 108,150"],
          ["#65431d", "186,116 218,124 208,148 180,138"],
          ["#a78456", "250,128 282,136 272,160 246,150"],
          ["#8a6532", "316,116 348,124 338,148 310,138"],
          ["#967046", "26,196 56,204 46,228 22,218"],
          ["#6c4923", "96,210 128,216 118,238 90,230"],
          ["#b89066", "166,196 200,204 188,228 162,218"],
          ["#7a572f", "238,210 268,216 256,238 230,228"],
          ["#a8825a", "302,196 336,204 326,228 298,218"],
          ["#5e3f1c", "60,256 86,262 76,282 56,276"],
          ["#9c7849", "130,256 162,262 150,282 124,276"],
          ["#7c5a32", "212,256 240,262 230,282 206,276"],
          ["#b08c5d", "282,256 312,262 300,282 274,276"],
        ].map(([fill, pts], i) => (
          <polygon key={i} points={pts} fill={fill} />
        ))}
      </g>

      {/* dark glue specks */}
      <g fill="#2a1808" opacity="0.55">
        {[
          [42, 70], [120, 90], [200, 75], [280, 92], [340, 78],
          [60, 158], [150, 172], [228, 162], [310, 178],
          [90, 240], [170, 250], [260, 246], [330, 254],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.6} />
        ))}
      </g>

      {/* visible voids / poor binding */}
      <g fill="#2a1808" opacity="0.25">
        <ellipse cx="82" cy="186" rx="6" ry="2" />
        <ellipse cx="232" cy="98" rx="5" ry="2" />
        <ellipse cx="296" cy="206" rx="7" ry="2.5" />
      </g>
    </svg>
  );
}
