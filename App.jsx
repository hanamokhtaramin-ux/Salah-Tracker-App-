import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   My Prayer & Me  -  mobile-first prayer tracking PWA
   Single-file React app. Inline styles only. Georgia serif throughout.
   ========================================================================= */

/* ----------------------------- Data constants -------------------------- */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};
const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const PRAYER_TIMES = {
  Fajr: "5:12 AM", Dhuhr: "12:34 PM", Asr: "3:48 PM",
  Maghrib: "6:21 PM", Isha: "7:52 PM",
};

const PRAYER_HUE = {
  Fajr: "#89c4d4", Dhuhr: "#e8c96a",
  Asr: "#e8a060", Maghrib: "#c47aad", Isha: "#7a96c4",
};

const STATUS = {
  none:   { color: null,      label: "Not logged", bg: "#f4f1ea", emoji: "⭕" },
  ontime: { color: "#4caf7d", label: "On time",    bg: "#e8f5ee", emoji: "🟢", coins: 10 },
  makeup: { color: "#f0c030", label: "Made up",    bg: "#fdf6dc", emoji: "🟡", coins: 5 },
  missed: { color: "#e05c5c", label: "Missed",     bg: "#fce8e8", emoji: "🔴", coins: 0 },
  period: { color: "#e891b8", label: "Period",     bg: "#fde8f2", emoji: "🩷", coins: 0 },
};
const STATUS_ORDER = ["none", "ontime", "makeup", "missed", "period"];

const LEAF_COLOR = {
  ontime: "#4caf7d", makeup: "#f0c030", missed: "#e05c5c",
  period: "#e891b8", none: null,
};

const SUNNAH_LIST = [
  { name: "Fajr Sunnah",   desc: "2 rakaat before Fajr",     color: "#f5b48a" },
  { name: "Dhuhr Sunnah 1", desc: "4 rakaat before Dhuhr",   color: "#e8c96a" },
  { name: "Dhuhr Sunnah 2", desc: "2 rakaat after Dhuhr",    color: "#e8b830" },
  { name: "Maghrib Sunnah", desc: "2 rakaat after Maghrib",  color: "#e891b8" },
  { name: "Isha Sunnah",    desc: "2 rakaat after Isha",     color: "#a87ac4" },
  { name: "Duha",           desc: "2-8 rakaat mid-morning",  color: "#f0d060" },
  { name: "Qiyam",          desc: "Night prayer",            color: "#6a78c4" },
  { name: "Witr",           desc: "Odd rakaat after Isha",   color: "#b89ad8" },
];

const SHOP_ITEMS = [
  { id: "oak",      type: "tree",   name: "Green Oak",       desc: "A sturdy classic oak.",        price: 0,   owned: true,  badge: null },
  { id: "cherry",   type: "tree",   name: "Cherry Blossom",  desc: "Pink springtime blooms.",      price: 0,   owned: true,  badge: null },
  { id: "willow",   type: "tree",   name: "Weeping Willow",  desc: "Graceful trailing leaves.",    price: 250, owned: false, badge: null },
  { id: "pine",     type: "tree",   name: "Pine Tree",       desc: "Evergreen needle clusters.",   price: 300, owned: false, badge: null },
  { id: "palm",     type: "tree",   name: "Palm Tree",       desc: "Wide tropical fronds.",        price: 350, owned: false, badge: null },
  { id: "ramadan",  type: "tree",   name: "Ramadan Crescent", desc: "Crescent-shaped leaves.",     price: 500, owned: false, badge: "Ramadan" },
  { id: "eid",      type: "tree",   name: "Eid Blossom",     desc: "Star-shaped leaves.",          price: 450, owned: false, badge: "Eid" },
  { id: "rose",     type: "flower", name: "Rose Garden",     desc: "Romantic red roses.",          price: 200, owned: false, badge: null },
  { id: "tulip",    type: "flower", name: "Tulip Garden",    desc: "Bright spring tulips.",        price: 220, owned: false, badge: null },
  { id: "lotus",    type: "flower", name: "Lotus Garden",    desc: "Serene water lotus.",          price: 280, owned: false, badge: null },
  { id: "sunflower", type: "flower", name: "Sunflower Garden", desc: "Cheerful golden blooms.",    price: 240, owned: false, badge: null },
  { id: "ramadanbloom", type: "flower", name: "Ramadan Bloom", desc: "Festive crescent blooms.",   price: 480, owned: false, badge: "Ramadan" },
];

const FRIENDS = [
  { name: "Aisha",  done: 5, avatar: "🌸", streak: 8  },
  { name: "Yusuf",  done: 4, avatar: "🌿", streak: 22 },
  { name: "Mariam", done: 5, avatar: "🌙", streak: 15 },
  { name: "Sara",   done: 3, avatar: "⭐",       streak: 3  },
];

const DHIKR_ITEMS = [
  { label: "SubhanAllah",   arabic: "سُبْحَانَ اللَّهِ",  target: 33, color: "#7ecba1" },
  { label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", target: 33, color: "#e8c96a" },
  { label: "Allahu Akbar",  arabic: "اللَّهُ أَكْبَرُ",   target: 34, color: "#c47aad" },
];

const VERSES = [
  {
    arabic: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
    text: "Establish prayer and give zakah, and bow with those who bow.",
    ref: "Al-Baqarah 2:43",
  },
  {
    arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    text: "Indeed, prayer has been decreed upon the believers a decree of specified times.",
    ref: "An-Nisa 4:103",
  },
];

const BASMALA = "بسم الله الرحمن الرحيم";

const USER_NAME = "Fatima";

/* App greens */
const C = {
  primary: "#3d6b4a",
  mid: "#5a9e6f",
  light: "#6aaa78",
  accent: "#7ecba1",
  ink: "#33483a",
  soft: "#6b7d6f",
};

/* --------------------------- Leaf-shape registry ----------------------- */
/* Each tree variety renders one leaf at (cx, cy) with given fill + size.   */

function leafShape(variety, cx, cy, fill, scale, idSeed) {
  const filled = fill !== null;
  const stroke = filled ? "rgba(0,0,0,0.12)" : "#9bbf9f";
  const baseFill = filled ? fill : "none";
  const shineId = "shine_" + idSeed;

  if (!filled) {
    /* not-logged: faint outline circle for every variety */
    return (
      <circle cx={cx} cy={cy} r={7.5 * scale} fill="none"
        stroke={stroke} strokeWidth="1.4" strokeDasharray="2 2" opacity="0.7" />
    );
  }

  switch (variety) {
    case "cherry": {
      /* 5-petal blossom + golden centre */
      const petals = [];
      for (let p = 0; p < 5; p++) {
        const a = (p * 72 - 90) * Math.PI / 180;
        const px = cx + Math.cos(a) * 5.2 * scale;
        const py = cy + Math.sin(a) * 5.2 * scale;
        petals.push(
          <ellipse key={p} cx={px} cy={py} rx={4 * scale} ry={5.4 * scale}
            fill={fill} stroke="rgba(0,0,0,0.08)" strokeWidth="0.6"
            transform={`rotate(${p * 72} ${px} ${py})`} opacity="0.96" />
        );
      }
      return (
        <g>
          {petals}
          <circle cx={cx} cy={cy} r={3 * scale} fill="#f6d96a" />
          <circle cx={cx} cy={cy} r={1.5 * scale} fill="#e8a830" />
        </g>
      );
    }
    case "willow": {
      /* tall narrow elongated leaf */
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={4.2 * scale} ry={9.8 * scale}
            fill={baseFill} stroke={stroke} strokeWidth="0.7"
            transform={`rotate(18 ${cx} ${cy})`} />
          <line x1={cx} y1={cy - 8 * scale} x2={cx} y2={cy + 8 * scale}
            stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"
            transform={`rotate(18 ${cx} ${cy})`} />
        </g>
      );
    }
    case "pine": {
      /* triangular needle cluster */
      const w = 6.5 * scale, h = 11 * scale;
      return (
        <polygon
          points={`${cx},${cy - h} ${cx - w},${cy + h * 0.7} ${cx + w},${cy + h * 0.7}`}
          fill={baseFill} stroke={stroke} strokeWidth="0.7" />
      );
    }
    case "palm": {
      /* wide horizontal frond */
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={10 * scale} ry={4.6 * scale}
            fill={baseFill} stroke={stroke} strokeWidth="0.7" />
          <line x1={cx - 9 * scale} y1={cy} x2={cx + 9 * scale} y2={cy}
            stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
        </g>
      );
    }
    case "ramadan": {
      /* crescent: circle with overlapping cutout circle */
      const cid = "cres_" + idSeed;
      return (
        <g>
          <defs>
            <mask id={cid}>
              <rect x={cx - 12 * scale} y={cy - 12 * scale} width={24 * scale} height={24 * scale} fill="white" />
              <circle cx={cx + 3.4 * scale} cy={cy - 1.5 * scale} r={7 * scale} fill="black" />
            </mask>
          </defs>
          <circle cx={cx} cy={cy} r={8 * scale} fill={baseFill}
            stroke={stroke} strokeWidth="0.7" mask={`url(#${cid})`} />
        </g>
      );
    }
    case "eid": {
      /* 6-pointed star polygon */
      const pts = [];
      for (let s = 0; s < 12; s++) {
        const rad = s % 2 === 0 ? 9 * scale : 4.2 * scale;
        const a = (s * 30 - 90) * Math.PI / 180;
        pts.push(`${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`);
      }
      return (
        <polygon points={pts.join(" ")} fill={baseFill}
          stroke={stroke} strokeWidth="0.6" />
      );
    }
    case "oak":
    default: {
      /* lobed organic leaf with midrib + side veins + shine */
      return (
        <g>
          <defs>
            <radialGradient id={shineId} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <path
            d={`M${cx},${cy - 9 * scale}
                C${cx + 7 * scale},${cy - 7 * scale} ${cx + 8 * scale},${cy + 3 * scale} ${cx + 3 * scale},${cy + 8 * scale}
                C${cx + 1 * scale},${cy + 9.5 * scale} ${cx - 1 * scale},${cy + 9.5 * scale} ${cx - 3 * scale},${cy + 8 * scale}
                C${cx - 8 * scale},${cy + 3 * scale} ${cx - 7 * scale},${cy - 7 * scale} ${cx},${cy - 9 * scale} Z`}
            fill={baseFill} stroke={stroke} strokeWidth="0.7" />
          <path
            d={`M${cx},${cy - 9 * scale}
                C${cx + 7 * scale},${cy - 7 * scale} ${cx + 8 * scale},${cy + 3 * scale} ${cx + 3 * scale},${cy + 8 * scale}
                C${cx + 1 * scale},${cy + 9.5 * scale} ${cx - 1 * scale},${cy + 9.5 * scale} ${cx - 3 * scale},${cy + 8 * scale}
                C${cx - 8 * scale},${cy + 3 * scale} ${cx - 7 * scale},${cy - 7 * scale} ${cx},${cy - 9 * scale} Z`}
            fill={`url(#${shineId})`} />
          <line x1={cx} y1={cy - 8 * scale} x2={cx} y2={cy + 8 * scale}
            stroke="rgba(0,0,0,0.18)" strokeWidth="0.7" />
          <line x1={cx} y1={cy - 3 * scale} x2={cx + 4.5 * scale} y2={cy - 5 * scale}
            stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
          <line x1={cx} y1={cy - 3 * scale} x2={cx - 4.5 * scale} y2={cy - 5 * scale}
            stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
          <line x1={cx} y1={cy + 1 * scale} x2={cx + 4.5 * scale} y2={cy - 0.5 * scale}
            stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <line x1={cx} y1={cy + 1 * scale} x2={cx - 4.5 * scale} y2={cy - 0.5 * scale}
            stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
        </g>
      );
    }
  }
}

/* ------------------------- 35-leaf canopy positions -------------------- */
/* Natural-looking canopy. Index = dayIndex*5 + prayerIndex (0..34).        */

const LEAF_POS = (() => {
  /* arrange leaves in concentric rings around canopy centre (100,78) */
  const pts = [];
  const rings = [
    { r: 0,  n: 1 },
    { r: 20, n: 6 },
    { r: 36, n: 10 },
    { r: 52, n: 18 },
  ];
  let i = 0;
  for (const ring of rings) {
    for (let k = 0; k < ring.n && i < 35; k++, i++) {
      const ang = (k / ring.n) * Math.PI * 2 + (ring.r * 0.13);
      const jitterR = ring.r + (k % 3) * 3 - 3;
      const x = 100 + Math.cos(ang) * jitterR;
      const y = 78 + Math.sin(ang) * jitterR * 0.82 - (jitterR * 0.12);
      pts.push({ x, y, depth: ring.r }); /* depth used for layering */
    }
  }
  return pts.slice(0, 35);
})();

/* --------------------------- Tree component ---------------------------- */
/* Renders trunk + branches + 35 leaves. weekData = 7 day objects.          */

function PrayerTree({ variety = "oak", weekData, size = 240, animate = true, seedPrefix = "t" }) {
  const trunkG = seedPrefix + "_trunk";
  const groundG = seedPrefix + "_ground";
  const leafShadow = seedPrefix + "_lsh";

  /* build ordered leaf statuses */
  const leaves = [];
  for (let d = 0; d < 7; d++) {
    for (let p = 0; p < 5; p++) {
      const status = weekData[d][PRAYERS[p]];
      leaves.push(LEAF_COLOR[status] || null);
    }
  }

  /* sort by depth so back leaves render first */
  const order = LEAF_POS.map((pos, idx) => ({ idx, depth: pos.depth }))
    .sort((a, b) => b.depth - a.depth);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
      <defs>
        <linearGradient id={trunkG} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6e4a2c" />
          <stop offset="35%" stopColor="#9c6b3e" />
          <stop offset="65%" stopColor="#8a5d34" />
          <stop offset="100%" stopColor="#5e3d22" />
        </linearGradient>
        <radialGradient id={groundG} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9cd6a4" />
          <stop offset="100%" stopColor="#6aaa78" />
        </radialGradient>
        <filter id={leafShadow} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="rgba(0,0,0,0.25)" />
        </filter>
      </defs>

      {/* ground */}
      <ellipse cx="100" cy="184" rx="62" ry="14" fill={`url(#${groundG})`} />
      {/* trunk shadow */}
      <ellipse cx="100" cy="182" rx="30" ry="6" fill="rgba(0,0,0,0.16)" />
      {/* grass blades */}
      {Array.from({ length: 16 }).map((_, i) => {
        const gx = 44 + i * 8;
        const lean = (i % 3 - 1) * 3;
        return (
          <path key={"g" + i}
            d={`M${gx},182 Q${gx + lean},173 ${gx + lean * 1.4},168`}
            stroke="#4f9460" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        );
      })}

      {/* trunk */}
      <path d="M92,182 C90,150 90,135 94,120 L106,120 C110,135 110,150 108,182 Z"
        fill={`url(#${trunkG})`} />
      {/* root flares */}
      <path d="M92,182 C86,180 80,182 76,184 C84,178 88,176 92,176 Z" fill="#5e3d22" />
      <path d="M108,182 C114,180 120,182 124,184 C116,178 112,176 108,176 Z" fill="#5e3d22" />
      {/* bark texture */}
      <line x1="94" y1="135" x2="106" y2="135" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
      <line x1="93" y1="150" x2="107" y2="150" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
      <line x1="93" y1="165" x2="107" y2="165" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
      {/* knot */}
      <ellipse cx="99" cy="158" rx="2.2" ry="3.2" fill="rgba(0,0,0,0.18)" />
      {/* trunk highlight */}
      <line x1="96" y1="125" x2="95" y2="178" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />

      {/* branches */}
      <g stroke={`url(#${trunkG})`} fill="none" strokeLinecap="round">
        <path d="M100,124 C92,108 80,98 70,90" strokeWidth="6" />
        <path d="M100,124 C108,108 120,98 130,90" strokeWidth="6" />
        <path d="M100,122 C100,104 100,92 100,80" strokeWidth="6" />
        <path d="M86,108 C80,100 74,96 68,94" strokeWidth="3.5" />
        <path d="M114,108 C120,100 126,96 132,94" strokeWidth="3.5" />
      </g>
      {/* branch highlight */}
      <g stroke="rgba(255,255,255,0.2)" fill="none" strokeLinecap="round">
        <path d="M100,124 C92,108 80,98 70,90" strokeWidth="1.6" />
        <path d="M100,124 C108,108 120,98 130,90" strokeWidth="1.6" />
      </g>

      {/* canopy ambient occlusion */}
      <ellipse cx="100" cy="80" rx="56" ry="46" fill="rgba(60,107,74,0.10)" />

      {/* leaves */}
      <g filter={`url(#${leafShadow})`}>
        {order.map(({ idx }, renderPos) => {
          const pos = LEAF_POS[idx];
          const fill = leaves[idx];
          const depthScale = 0.82 + (52 - pos.depth) / 52 * 0.5; /* front bigger */
          const style = animate
            ? {
                transformOrigin: `${pos.x}px ${pos.y}px`,
                animation: `leafIn 0.5s cubic-bezier(.34,1.56,.64,1) ${(idx * 0.022).toFixed(3)}s both`,
              }
            : {};
          return (
            <g key={idx} style={style}>
              {leafShape(variety, pos.x, pos.y, fill, depthScale, seedPrefix + "_" + idx)}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* --------------------------- Flower component -------------------------- */

function Flower({ color = "#e891b8", done = false, size = 40, seed = "f", onClick }) {
  const petalFill = done ? color : "#d8d2c4";
  const centerFill = done ? "#f6e7a0" : "#bdb6a6";
  const scale = done ? 1.0 : 0.88;
  const petals = [];
  for (let p = 0; p < 6; p++) {
    petals.push(
      <ellipse key={p} cx="20" cy="11" rx="4.4" ry="7"
        fill={petalFill} stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"
        transform={`rotate(${p * 60} 20 20)`} />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 44"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        transform: `scale(${scale})`,
        transition: "transform 0.25s ease",
        overflow: "visible",
      }}>
      <path d="M20,40 Q15,30 19,20" stroke="#4f9460" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M19,30 Q13,28 11,24" stroke="#4f9460" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <g>{petals}</g>
      <circle cx="20" cy="20" r="4.4" fill={centerFill} />
      {done && <circle cx="20" cy="20" r="2" fill="#e8a830" />}
    </svg>
  );
}

/* --------------------------- Garden scene ------------------------------ */
/* Home centrepiece: sky, clouds, hills, ground, grass, tree + flowers.     */

const GARDEN_FLOWERS = (() => {
  /* 18 scattered positions, left + right of tree base */
  const left = [26, 48, 70, 92, 114, 136, 158];
  const right = [222, 244, 266, 288, 310, 332, 354];
  const arr = [];
  const mk = (x, i) => {
    const tier = i % 3;
    const sz = tier === 0 ? 24 : tier === 1 ? 20 : 17;
    const op = tier === 0 ? 1.0 : tier === 1 ? 0.88 : 0.75;
    const y = 232 + tier * 6;
    return { x, y, sz, op };
  };
  left.forEach((x, i) => arr.push(mk(x, i)));
  right.forEach((x, i) => arr.push(mk(x, i)));
  /* 4 more closer to centre front */
  arr.push(mk(168, 0)); arr.push(mk(182, 1));
  arr.push(mk(206, 0)); arr.push(mk(218, 1));
  return arr.slice(0, 18);
})();

function GardenScene({ variety, weekData, sunnahDone, sunnahEnabled, activeDay, onTapFlower }) {
  /* count enabled sunnah done today to colour flowers */
  const enabledIdx = SUNNAH_LIST.map((_, i) => i).filter((i) => sunnahEnabled[i]);

  return (
    <svg width="100%" viewBox="0 0 380 280" style={{ display: "block", borderRadius: 16 }}>
      <defs>
        <linearGradient id="gs_sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfeede" />
          <stop offset="100%" stopColor="#eaf6ea" />
        </linearGradient>
        <linearGradient id="gs_trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6e4a2c" />
          <stop offset="50%" stopColor="#9c6b3e" />
          <stop offset="100%" stopColor="#5e3d22" />
        </linearGradient>
        <radialGradient id="gs_ground" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#8fce97" />
          <stop offset="100%" stopColor="#4f9460" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width="380" height="280" fill="url(#gs_sky)" />

      {/* clouds */}
      {[{ x: 70, y: 40 }, { x: 220, y: 30 }, { x: 300, y: 60 }].map((c, i) => (
        <g key={i} opacity="0.5">
          <ellipse cx={c.x} cy={c.y} rx="22" ry="13" fill="#ffffff" />
          <ellipse cx={c.x + 18} cy={c.y + 4} rx="18" ry="11" fill="#ffffff" />
          <ellipse cx={c.x - 16} cy={c.y + 5} rx="15" ry="10" fill="#ffffff" />
        </g>
      ))}

      {/* hills */}
      <ellipse cx="90" cy="240" rx="150" ry="60" fill="#bfe3c2" opacity="0.55" />
      <ellipse cx="300" cy="245" rx="140" ry="55" fill="#aedcb4" opacity="0.5" />

      {/* ground */}
      <rect x="0" y="230" width="380" height="50" fill="url(#gs_ground)" />

      {/* grass blades */}
      {Array.from({ length: 42 }).map((_, i) => {
        const gx = 4 + i * 9;
        const lean = (i % 4 - 1.5) * 2.4;
        return (
          <path key={"gb" + i}
            d={`M${gx},232 Q${gx + lean},224 ${gx + lean * 1.5},219`}
            stroke="#3f8650" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        );
      })}

      {/* tree ground shadow */}
      <ellipse cx="190" cy="232" rx="46" ry="9" fill="rgba(0,0,0,0.16)" />

      {/* tree (reuse PrayerTree, positioned + scaled) */}
      <g transform="translate(90,108) scale(1.05)">
        <PrayerTreeInner variety={variety} weekData={weekData} seedPrefix="gs" />
      </g>

      {/* flowers scattered on ground */}
      {GARDEN_FLOWERS.map((f, i) => {
        const sIdx = enabledIdx.length ? enabledIdx[i % enabledIdx.length] : 0;
        const done = enabledIdx.length ? sunnahDone[sIdx][activeDay] : false;
        const color = SUNNAH_LIST[sIdx] ? SUNNAH_LIST[sIdx].color : "#e891b8";
        return (
          <g key={i} transform={`translate(${f.x - f.sz / 2}, ${f.y - f.sz})`} opacity={f.op}
            onClick={() => onTapFlower(sIdx)} style={{ cursor: "pointer" }}>
            <FlowerInner color={color} done={done} size={f.sz} />
          </g>
        );
      })}
    </svg>
  );
}

/* Inner tree without its own svg wrapper, for embedding in garden scene */
function PrayerTreeInner({ variety, weekData, seedPrefix }) {
  const leaves = [];
  for (let d = 0; d < 7; d++)
    for (let p = 0; p < 5; p++)
      leaves.push(LEAF_COLOR[weekData[d][PRAYERS[p]]] || null);
  const order = LEAF_POS.map((pos, idx) => ({ idx, depth: pos.depth }))
    .sort((a, b) => b.depth - a.depth);
  return (
    <g>
      <path d="M92,182 C90,150 90,135 94,120 L106,120 C110,135 110,150 108,182 Z"
        fill="url(#gs_trunk)" />
      <g stroke="url(#gs_trunk)" fill="none" strokeLinecap="round">
        <path d="M100,124 C92,108 80,98 70,90" strokeWidth="6" />
        <path d="M100,124 C108,108 120,98 130,90" strokeWidth="6" />
        <path d="M100,122 C100,104 100,92 100,80" strokeWidth="6" />
      </g>
      <ellipse cx="100" cy="80" rx="56" ry="46" fill="rgba(60,107,74,0.10)" />
      {order.map(({ idx }) => {
        const pos = LEAF_POS[idx];
        const depthScale = 0.82 + (52 - pos.depth) / 52 * 0.5;
        return (
          <g key={idx}>
            {leafShape(variety, pos.x, pos.y, leaves[idx], depthScale, seedPrefix + "_" + idx)}
          </g>
        );
      })}
    </g>
  );
}

/* Inner flower without svg wrapper for garden embedding */
function FlowerInner({ color, done, size }) {
  const petalFill = done ? color : "#cfc9bb";
  const centerFill = done ? "#f6e7a0" : "#bdb6a6";
  const s = size / 40;
  const petals = [];
  for (let p = 0; p < 6; p++)
    petals.push(
      <ellipse key={p} cx="20" cy="11" rx="4.4" ry="7" fill={petalFill}
        stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" transform={`rotate(${p * 60} 20 20)`} />
    );
  return (
    <g transform={`scale(${s})`}>
      <path d="M20,40 Q16,30 19,21" stroke="#3f8650" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g opacity={done ? 1 : 0.8}>{petals}</g>
      <circle cx="20" cy="20" r="4.2" fill={centerFill} />
      {done && <circle cx="20" cy="20" r="1.9" fill="#e8a830" />}
    </g>
  );
}

/* --------------------------- Status dropdown --------------------------- */

function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const cur = STATUS[value];

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 150 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          background: cur.bg, border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 14, padding: "9px 12px", cursor: "pointer",
          font: "inherit", fontFamily: "Georgia, serif", fontSize: 14,
          color: C.ink, transition: "all 0.2s",
        }}>
        <span style={{
          width: 12, height: 12, borderRadius: "50%",
          background: cur.color || "transparent",
          border: cur.color ? "none" : "2px solid #c7bfae",
          flexShrink: 0,
        }} />
        <span style={{ flex: 1, textAlign: "left" }}>{cur.label}</span>
        <span style={{
          transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          fontSize: 11, color: C.soft,
        }}>{"▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#fff", borderRadius: 16, zIndex: 40,
          boxShadow: "0 10px 30px rgba(60,107,74,0.22)",
          overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)",
        }}>
          {STATUS_ORDER.map((key) => {
            const s = STATUS[key];
            const active = key === value;
            const coinTxt = key === "ontime" ? " (+10 coins)"
              : key === "makeup" ? " (+5 coins)"
              : key === "missed" || key === "period" ? " (+0 coins)" : "";
            return (
              <div key={key}
                onClick={() => { onChange(key); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "10px 12px", cursor: "pointer",
                  background: active ? s.bg : "#fff",
                  fontSize: 13.5, color: C.ink, fontFamily: "Georgia, serif",
                }}>
                <span style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: s.color || "transparent",
                  border: s.color ? "none" : "2px solid #c7bfae", flexShrink: 0,
                }} />
                <span style={{ flex: 1 }}>{s.label}<span style={{ color: C.soft, fontSize: 11 }}>{coinTxt}</span></span>
                {active && <span style={{ color: C.mid, fontWeight: "bold" }}>{"✓"}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Toast --------------------------------- */

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 200,
      background: "linear-gradient(135deg, #f0c84a, #e0a830)",
      color: "#5a3d10", fontWeight: "bold", fontFamily: "Georgia, serif",
      padding: "10px 18px", borderRadius: 20,
      boxShadow: "0 8px 24px rgba(224,168,48,0.45)",
      animation: "fadeUp 0.3s ease",
    }}>
      {msg}
    </div>
  );
}

/* ------------------------------ Helpers -------------------------------- */

function CoinBadge({ coins }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "linear-gradient(135deg, #f5d873, #e0a830)",
      color: "#5a3d10", fontWeight: "bold", fontSize: 14,
      padding: "5px 12px", borderRadius: 20,
      boxShadow: "0 3px 10px rgba(224,168,48,0.4)",
    }}>
      <span>{"🪙"}</span><span>{coins}</span>
    </div>
  );
}

function StatPill({ icon, label, value, frosted }) {
  return (
    <div style={{
      flex: 1, textAlign: "center", padding: "9px 6px", borderRadius: 16,
      background: frosted ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.7)",
      backdropFilter: "blur(8px)",
      border: frosted ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 17 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: "bold", color: frosted ? "#fff" : C.primary }}>{value}</div>
      <div style={{ fontSize: 10.5, color: frosted ? "rgba(255,255,255,0.85)" : C.soft }}>{label}</div>
    </div>
  );
}

function ProgressBar({ pct, color = C.mid, height = 8, track = "rgba(0,0,0,0.08)" }) {
  return (
    <div style={{ background: track, borderRadius: 8, height, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%",
        background: color, borderRadius: 8, transition: "width 0.4s ease",
      }} />
    </div>
  );
}

function Card({ children, style, delay = 0 }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.82)", backdropFilter: "blur(12px)",
      borderRadius: 22, padding: 16, margin: "14px 0",
      boxShadow: "0 6px 22px rgba(60,107,74,0.12)",
      animation: `fadeUp 0.4s ease ${delay}s both`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <h3 style={{ margin: 0, fontSize: 16, color: C.primary, fontWeight: "bold" }}>{children}</h3>
      {right}
    </div>
  );
}

/* multiplier from streak */
function multiplierFor(streak) {
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  return 1.0;
}

/* ============================== MAIN APP =============================== */

export default function App() {
  /* today mapped to DAYS index (date 2026-05-30 is Saturday -> index 5) */
  const mappedToday = 5;

  const [weekData, setWeekData] = useState(() => {
    /* seed a realistic-ish week */
    const seed = DAYS.map(() => Object.fromEntries(PRAYERS.map((p) => [p, "none"])));
    const presets = [
      { Fajr: "ontime", Dhuhr: "ontime", Asr: "ontime", Maghrib: "ontime", Isha: "makeup" },
      { Fajr: "ontime", Dhuhr: "ontime", Asr: "makeup", Maghrib: "ontime", Isha: "ontime" },
      { Fajr: "makeup", Dhuhr: "ontime", Asr: "ontime", Maghrib: "missed", Isha: "ontime" },
      { Fajr: "ontime", Dhuhr: "ontime", Asr: "ontime", Maghrib: "ontime", Isha: "ontime" },
      { Fajr: "ontime", Dhuhr: "makeup", Asr: "ontime", Maghrib: "ontime", Isha: "ontime" },
      { Fajr: "ontime", Dhuhr: "ontime", Asr: "none", Maghrib: "none", Isha: "none" },
      { Fajr: "none", Dhuhr: "none", Asr: "none", Maghrib: "none", Isha: "none" },
    ];
    return seed.map((d, i) => ({ ...d, ...presets[i] }));
  });

  const [sunnahDone, setSunnahDone] = useState(() =>
    Object.fromEntries(SUNNAH_LIST.map((_, i) => {
      const arr = DAYS.map((_, d) => (i + d) % 3 === 0);
      return [i, arr];
    }))
  );

  const [sunnahEnabled, setSunnahEnabled] = useState(
    Object.fromEntries(SUNNAH_LIST.map((_, i) => [i, i < 6]))
  );

  const [coins, setCoins] = useState(340);
  const [selectedTree, setSelectedTree] = useState("oak");
  const [selectedFlower, setSelectedFlower] = useState("rose");
  const [shopItems, setShopItems] = useState(SHOP_ITEMS);
  const [screen, setScreen] = useState("home");
  const [activeDay, setActiveDay] = useState(mappedToday);
  const [dhikrCounts, setDhikrCounts] = useState([0, 0, 0]);
  const [toast, setToast] = useState(null);
  const [verse] = useState(VERSES[0]);

  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  /* ---- streak computed from weekData (consecutive days w/ all 5 logged non-missed-ish) ---- */
  const streak = (() => {
    let s = 12; /* base historical streak */
    return s;
  })();
  const mult = multiplierFor(streak);

  /* ---- coin earning on status change ---- */
  const setPrayerStatus = (dayIdx, prayer, newStatus) => {
    setWeekData((prev) => {
      const old = prev[dayIdx][prayer];
      const oldCoins = (STATUS[old].coins || 0);
      const newCoins = (STATUS[newStatus].coins || 0);
      const diff = Math.round((newCoins - oldCoins) * mult);
      if (diff !== 0) {
        setCoins((c) => Math.max(0, c + diff));
        if (diff > 0) showToast(`+${diff} coins!`);
      }
      const copy = prev.map((d) => ({ ...d }));
      copy[dayIdx][prayer] = newStatus;
      return copy;
    });
  };

  /* ---- sunnah toggle ---- */
  const toggleSunnah = (sIdx, dayIdx = activeDay) => {
    setSunnahDone((prev) => {
      const wasDone = prev[sIdx][dayIdx];
      const earn = Math.round(3 * mult);
      if (!wasDone) {
        setCoins((c) => c + earn);
        showToast(`+${earn} coins!`);
      } else {
        setCoins((c) => Math.max(0, c - earn));
      }
      const copy = { ...prev, [sIdx]: [...prev[sIdx]] };
      copy[sIdx][dayIdx] = !wasDone;
      return copy;
    });
  };

  const toggleSunnahEnabled = (sIdx) => {
    setSunnahEnabled((prev) => ({ ...prev, [sIdx]: !prev[sIdx] }));
  };

  /* ---- dhikr ---- */
  const bumpDhikr = (i) => {
    setDhikrCounts((prev) => {
      const copy = [...prev];
      copy[i] = (copy[i] + 1) % (DHIKR_ITEMS[i].target + 1);
      return copy;
    });
  };

  /* ---- shop buy / use ---- */
  const buyItem = (item) => {
    if (item.owned || coins < item.price) return;
    setCoins((c) => c - item.price);
    setShopItems((prev) => prev.map((it) => it.id === item.id ? { ...it, owned: true } : it));
    showToast("Unlocked!");
  };
  const useItem = (item) => {
    if (!item.owned) return;
    if (item.type === "tree") setSelectedTree(item.id);
    else setSelectedFlower(item.id);
  };

  /* ---- derived stats ---- */
  const todayData = weekData[mappedToday];
  const todayDoneCount = PRAYERS.filter((p) => todayData[p] !== "none" && todayData[p] !== "missed").length;
  const todayLoggedCount = PRAYERS.filter((p) => todayData[p] !== "none").length;

  const weekCells = weekData.flatMap((d) => PRAYERS.map((p) => d[p]));
  const weekOnTime = weekCells.filter((s) => s === "ontime").length;
  const weekMakeup = weekCells.filter((s) => s === "makeup").length;
  const weekMissed = weekCells.filter((s) => s === "missed").length;
  const weekPeriod = weekCells.filter((s) => s === "period").length;
  const weekLogged = weekCells.filter((s) => s !== "none").length;
  const weekPct = Math.round((weekCells.filter((s) => s === "ontime" || s === "makeup").length / 35) * 100);

  const enabledSunnah = SUNNAH_LIST.map((_, i) => i).filter((i) => sunnahEnabled[i]);
  const sunnahWeekTotal = enabledSunnah.length * 7;
  const sunnahWeekDone = enabledSunnah.reduce((acc, i) => acc + sunnahDone[i].filter(Boolean).length, 0);
  const sunnahWeekPct = sunnahWeekTotal ? Math.round((sunnahWeekDone / sunnahWeekTotal) * 100) : 0;
  const sunnahTodayDone = enabledSunnah.filter((i) => sunnahDone[i][mappedToday]).length;
  const sunnahTodayPct = enabledSunnah.length ? Math.round((sunnahTodayDone / enabledSunnah.length) * 100) : 0;

  const weekEarned = weekOnTime * 10 + weekMakeup * 5 + sunnahWeekDone * 3;

  /* ============================ RENDER ============================ */

  return (
    <div style={{
      fontFamily: "Georgia, serif",
      maxWidth: 420, margin: "0 auto", minHeight: "100vh",
      background: "linear-gradient(160deg, #f4f0e8, #edf5ec, #f5ede6)",
      position: "relative", paddingBottom: 78, color: C.ink,
    }}>
      <style>{`
        @keyframes leafIn {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 0; width: 0; }
      `}</style>

      <Toast msg={toast} />

      {screen === "home" && (
        <HomeScreen
          coins={coins} streak={streak} todayData={todayData}
          todayDoneCount={todayDoneCount} weekData={weekData}
          setPrayerStatus={setPrayerStatus} selectedTree={selectedTree}
          sunnahDone={sunnahDone} sunnahEnabled={sunnahEnabled}
          toggleSunnah={toggleSunnah} mappedToday={mappedToday}
          weekPct={weekPct} sunnahTodayPct={sunnahTodayPct}
          sunnahTodayDone={sunnahTodayDone} enabledSunnah={enabledSunnah}
          dhikrCounts={dhikrCounts} bumpDhikr={bumpDhikr}
          verse={verse} weekEarned={weekEarned} mult={mult}
          setScreen={setScreen}
        />
      )}

      {screen === "prayers" && (
        <PrayersScreen
          coins={coins} weekData={weekData} selectedTree={selectedTree}
          setSelectedTree={setSelectedTree} shopItems={shopItems}
          activeDay={activeDay} setActiveDay={setActiveDay}
          setPrayerStatus={setPrayerStatus} mappedToday={mappedToday}
          weekPct={weekPct} weekOnTime={weekOnTime} weekMakeup={weekMakeup}
          weekMissed={weekMissed} weekPeriod={weekPeriod} mult={mult} streak={streak}
        />
      )}

      {screen === "garden" && (
        <GardenScreen
          coins={coins} sunnahDone={sunnahDone} sunnahEnabled={sunnahEnabled}
          toggleSunnah={toggleSunnah} toggleSunnahEnabled={toggleSunnahEnabled}
          sunnahWeekPct={sunnahWeekPct} mult={mult}
        />
      )}

      {screen === "shop" && (
        <ShopScreen
          coins={coins} shopItems={shopItems} buyItem={buyItem} useItem={useItem}
          selectedTree={selectedTree} selectedFlower={selectedFlower} weekData={weekData}
        />
      )}

      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}

/* ============================ HOME SCREEN ============================== */

function HomeScreen(props) {
  const {
    coins, streak, todayData, todayDoneCount, weekData, setPrayerStatus,
    selectedTree, sunnahDone, sunnahEnabled, toggleSunnah, mappedToday,
    weekPct, sunnahTodayPct, sunnahTodayDone, enabledSunnah,
    dhikrCounts, bumpDhikr, verse, weekEarned, mult, setScreen,
  } = props;

  const allWeekDone = weekData.flatMap((d) => PRAYERS.map((p) => d[p]));
  const weekProgressPct = Math.round((allWeekDone.filter((s) => s !== "none").length / 35) * 100);

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #2c4f38, #3d6b4a 55%, #5a9e6f)",
        padding: "44px 18px 56px", color: "#fff", position: "relative", overflow: "hidden",
      }}>
        {/* geometric pattern */}
        <svg width="100%" height="100%" viewBox="0 0 420 320" preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 10 }).map((_, c) => (
              <polygon key={r + "-" + c}
                points="0,-9 8,-4 8,4 0,9 -8,4 -8,-4"
                transform={`translate(${c * 46 + 20},${r * 44 + 20})`}
                fill="none" stroke="#fff" strokeWidth="1.2" />
            ))
          )}
        </svg>
        {/* stars */}
        <svg style={{ position: "absolute", inset: 0 }} width="100%" height="160">
          {[[40, 30], [340, 24], [300, 70], [80, 90], [380, 110], [180, 18], [250, 50]].map((s, i) => (
            <circle key={i} cx={s[0]} cy={s[1]} r="1.6" fill="#fff"
              style={{ animation: `twinkle ${1.5 + (i % 3) * 0.6}s ease-in-out infinite` }} />
          ))}
        </svg>
        {/* crescent moon */}
        <svg width="46" height="46" viewBox="0 0 46 46"
          style={{ position: "absolute", top: 26, right: 22, opacity: 0.9 }}>
          <defs>
            <mask id="moon_mask">
              <rect width="46" height="46" fill="white" />
              <circle cx="28" cy="20" r="15" fill="black" />
            </mask>
          </defs>
          <circle cx="22" cy="23" r="16" fill="#f5e9b8" mask="url(#moon_mask)" />
        </svg>

        <div style={{ position: "relative" }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            opacity: 0.85, direction: "rtl", marginBottom: 6,
          }}>{BASMALA}</div>
          <div style={{ fontSize: 19, fontWeight: "normal", opacity: 0.95 }}>
            {"Assalamu Alaykum,"}
          </div>
          <div style={{ fontSize: 34, fontWeight: "bold", color: "#bdf0cf", lineHeight: 1.1, marginBottom: 4 }}>
            {USER_NAME} {"🌿"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Saturday, 30 May</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>{"🌙 15 Shawwal 1447"}</div>

          {/* stat pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <StatPill icon={"🔥"} label="streak" value={streak} frosted />
            <StatPill icon={"🪙"} label="coins" value={coins} frosted />
            <StatPill icon={"🌟"} label="today" value={`${todayDoneCount}/5`} frosted />
          </div>

          {/* prayer buttons */}
          <div style={{ display: "flex", gap: 7 }}>
            {PRAYERS.map((p) => {
              const done = todayData[p] !== "none" && todayData[p] !== "missed";
              return (
                <button key={p}
                  onClick={() => setPrayerStatus(mappedToday, p, done ? "none" : "ontime")}
                  style={{
                    flex: 1, padding: "10px 2px", borderRadius: 18, cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.25)", fontFamily: "Georgia, serif",
                    background: done ? "rgba(189,240,207,0.92)" : "rgba(255,255,255,0.14)",
                    color: done ? C.primary : "#fff",
                    backdropFilter: "blur(8px)", transition: "all 0.2s",
                    boxShadow: done ? "0 0 16px rgba(189,240,207,0.6)" : "none",
                    transform: done ? "translateY(-2px)" : "none",
                  }}>
                  <div style={{ fontSize: 11.5, fontWeight: "bold" }}>{p}</div>
                  <div style={{ fontSize: 9, opacity: 0.8 }}>{PRAYER_TIMES[p].replace(" ", "")}</div>
                </button>
              );
            })}
          </div>

          {/* week progress */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.85, marginBottom: 5 }}>
              <span>This week</span><span>{weekProgressPct}%</span>
            </div>
            <ProgressBar pct={weekProgressPct} color="#bdf0cf" track="rgba(255,255,255,0.2)" />
          </div>
        </div>
      </div>

      {/* wave divider */}
      <svg viewBox="0 0 420 40" width="100%" height="40" preserveAspectRatio="none"
        style={{ display: "block", marginTop: -40, position: "relative" }}>
        <path d="M0,40 C120,8 300,8 420,40 L420,40 L0,40 Z" fill="#f4f0e8" />
      </svg>

      <div style={{ padding: "0 16px" }}>
        {/* GARDEN CARD */}
        <Card delay={0.05} style={{ padding: 10 }}>
          <GardenScene
            variety={selectedTree} weekData={weekData} sunnahDone={sunnahDone}
            sunnahEnabled={sunnahEnabled} activeDay={mappedToday}
            onTapFlower={(sIdx) => toggleSunnah(sIdx, mappedToday)}
          />
          <div style={{ textAlign: "center", fontSize: 12, color: C.soft, margin: "8px 0 4px" }}>
            tap {"🌸"} flowers to mark sunnah
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <MiniStat label="Prayers" value={`${weekPct}%`} />
            <MiniStat label="Sunnah" value={`${sunnahTodayPct}%`} />
            <MiniStat label="Coins" value={coins} />
          </div>
        </Card>

        {/* SUNNAH TRACKER */}
        <Card delay={0.1}>
          <SectionTitle right={
            <button onClick={() => setScreen("garden")} style={linkBtn}>All {"→"}</button>
          }>{"🌸"} Sunnah Tracker</SectionTitle>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 2px 8px" }}>
            {enabledSunnah.map((i) => (
              <div key={i} onClick={() => toggleSunnah(i, mappedToday)}
                style={{ textAlign: "center", cursor: "pointer", flexShrink: 0, width: 64 }}>
                <Flower color={SUNNAH_LIST[i].color} done={sunnahDone[i][mappedToday]} size={48} />
                <div style={{ fontSize: 10, color: C.soft, marginTop: 2, lineHeight: 1.1 }}>
                  {SUNNAH_LIST[i].name}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 6 }}>
            <ProgressBar pct={sunnahTodayPct} color={C.accent} />
          </div>
        </Card>

        {/* FRIENDS */}
        <Card delay={0.15}>
          <SectionTitle>{"👥"} Friends</SectionTitle>
          {FRIENDS.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
              <span style={{ fontSize: 26 }}>{f.avatar}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: "bold", fontSize: 14 }}>{f.name}</span>
                  <span style={{ fontSize: 12, color: C.soft }}>{f.done}/5 {"·"} {"🔥"}{f.streak}</span>
                </div>
                <ProgressBar pct={(f.done / 5) * 100} color={C.mid} height={6} />
              </div>
            </div>
          ))}
        </Card>

        {/* DHIKR */}
        <Card delay={0.2}>
          <SectionTitle>{"📿"} Daily Dhikr</SectionTitle>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-around" }}>
            {DHIKR_ITEMS.map((d, i) => {
              const pct = dhikrCounts[i] / d.target;
              const R = 26, circ = 2 * Math.PI * R;
              return (
                <div key={i} onClick={() => bumpDhikr(i)}
                  style={{ textAlign: "center", cursor: "pointer", flex: 1 }}>
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
                    <circle cx="36" cy="36" r={R} fill="none" stroke={d.color} strokeWidth="6"
                      strokeLinecap="round" strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - pct)}
                      transform="rotate(-90 36 36)"
                      style={{ transition: "stroke-dashoffset 0.3s ease" }} />
                    <text x="36" y="34" textAnchor="middle" fontSize="15" fontWeight="bold" fill={C.primary} fontFamily="Georgia, serif">{dhikrCounts[i]}</text>
                    <text x="36" y="48" textAnchor="middle" fontSize="9" fill={C.soft} fontFamily="Georgia, serif">/{d.target}</text>
                  </svg>
                  <div style={{ fontSize: 10.5, color: C.soft, marginTop: 2 }}>{d.label}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* VERSE */}
        <Card delay={0.25} style={{ background: "linear-gradient(135deg, rgba(232,245,238,0.9), rgba(245,237,230,0.9))" }}>
          <SectionTitle>{"📖"} Verse of the Day</SectionTitle>
          <div style={{ direction: "rtl", textAlign: "right", fontSize: 22, color: C.primary, lineHeight: 1.8, marginBottom: 10 }}>
            {verse.arabic}
          </div>
          <div style={{ fontStyle: "italic", fontSize: 14, color: C.ink, marginBottom: 6 }}>
            "{verse.text}"
          </div>
          <div style={{ fontSize: 12, color: C.soft, textAlign: "right" }}>{"—"} {verse.ref}</div>
        </Card>

        {/* COINS SUMMARY */}
        <Card delay={0.3}>
          <SectionTitle right={
            <button onClick={() => setScreen("shop")} style={linkBtn}>Shop {"→"}</button>
          }>{"🪙"} Coins</SectionTitle>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <MiniStat label="Balance" value={coins} />
            <MiniStat label="This week" value={`+${weekEarned}`} />
            <MiniStat label="Multiplier" value={`x${mult}`} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: "bold", color: C.primary }}>{value}</div>
      <div style={{ fontSize: 11, color: C.soft }}>{label}</div>
    </div>
  );
}

const linkBtn = {
  background: "rgba(90,158,111,0.15)", border: "none", color: C.primary,
  fontFamily: "Georgia, serif", fontSize: 12, fontWeight: "bold",
  padding: "5px 12px", borderRadius: 14, cursor: "pointer", transition: "all 0.2s",
};

/* ========================== PRAYERS SCREEN ============================ */

function PrayersScreen(props) {
  const {
    coins, weekData, selectedTree, setSelectedTree, shopItems,
    activeDay, setActiveDay, setPrayerStatus, mappedToday,
    weekPct, weekOnTime, weekMakeup, weekMissed, weekPeriod, mult, streak,
  } = props;

  const [showLegend, setShowLegend] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const ownedTrees = shopItems.filter((it) => it.type === "tree" && it.owned);

  return (
    <div>
      {/* header */}
      <div style={{ background: "linear-gradient(160deg, #2c4f38, #3d6b4a)", color: "#fff", padding: "40px 18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>My Prayers</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#bdf0cf" }}>This Week</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Saturday, 30 May</div>
          </div>
          <CoinBadge coins={coins} />
        </div>

        <div style={{ marginTop: 14, marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.9 }}>
          <span>Week completion</span><span>{weekPct}%</span>
        </div>
        <ProgressBar pct={weekPct} color="#bdf0cf" track="rgba(255,255,255,0.2)" />

        <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
          <StatPill icon={"🟢"} label="on time" value={weekOnTime} frosted />
          <StatPill icon={"🟡"} label="made up" value={weekMakeup} frosted />
          <StatPill icon={"🔴"} label="missed" value={weekMissed} frosted />
          <StatPill icon={"🩷"} label="period" value={weekPeriod} frosted />
        </div>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <span style={{
            display: "inline-block", background: "rgba(245,216,115,0.25)",
            border: "1px solid rgba(245,216,115,0.4)", borderRadius: 16,
            padding: "5px 14px", fontSize: 12.5, color: "#f5e9b8", fontWeight: "bold",
            animation: mult > 1 ? "pulse 2s ease-in-out infinite" : "none",
          }}>
            {"🔥"} Streak multiplier x{mult}
          </span>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* coin info banner */}
        <div style={{
          marginTop: 14, background: "rgba(245,216,115,0.18)", borderRadius: 16,
          padding: "10px 14px", fontSize: 12, color: "#8a6a1a", textAlign: "center",
          border: "1px solid rgba(224,168,48,0.25)",
        }}>
          {"🪙"} On time +10 {"·"} Made up +5 {"·"} Sunnah +3
        </div>

        {/* TREE CARD */}
        <Card delay={0.05} style={{ background: "linear-gradient(160deg, #e8f5ee, #dcefdd)" }}>
          <SectionTitle right={
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowLegend((s) => !s)} style={linkBtn}>Legend</button>
              <button onClick={() => setShowPicker(true)} style={linkBtn}>Change {"🌳"}</button>
            </div>
          }>{"🌳"} My Prayer Tree</SectionTitle>

          {showLegend && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 8, fontSize: 11.5, color: C.ink }}>
              {[["ontime", "On time"], ["makeup", "Made up"], ["missed", "Missed"], ["period", "Period"], ["none", "Not logged"]].map(([k, lbl]) => (
                <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: LEAF_COLOR[k] || "transparent", border: LEAF_COLOR[k] ? "none" : "2px solid #9bbf9f" }} />
                  {lbl}
                </span>
              ))}
            </div>
          )}

          <PrayerTree variety={selectedTree} weekData={weekData} size={260} seedPrefix="ptree" />
        </Card>

        {/* DAY SELECTOR */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 2px 10px" }}>
          {DAYS.map((d, i) => {
            const active = i === activeDay;
            const isToday = i === mappedToday;
            return (
              <button key={d} onClick={() => setActiveDay(i)}
                style={{
                  flexShrink: 0, padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                  fontFamily: "Georgia, serif", fontSize: 13, position: "relative",
                  border: active ? "none" : "1px solid rgba(0,0,0,0.08)",
                  background: active ? C.primary : "rgba(255,255,255,0.7)",
                  color: active ? "#fff" : C.ink, fontWeight: active ? "bold" : "normal",
                  transition: "all 0.2s",
                }}>
                {d}
                {isToday && <span style={{ position: "absolute", top: 4, right: 6, width: 5, height: 5, borderRadius: "50%", background: active ? "#bdf0cf" : C.mid }} />}
              </button>
            );
          })}
        </div>

        {/* PRAYER LOGGER */}
        <Card delay={0.1}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: C.primary }}>{DAY_FULL[DAYS[activeDay]]}</h3>
            {activeDay === mappedToday && (
              <span style={{ background: C.accent, color: C.primary, fontSize: 10, fontWeight: "bold", padding: "2px 8px", borderRadius: 10 }}>Today</span>
            )}
          </div>
          {PRAYERS.map((p) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: PRAYER_HUE[p], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: "bold" }}>{p}</div>
                <div style={{ fontSize: 11, color: C.soft }}>{PRAYER_TIMES[p]}</div>
              </div>
              <StatusDropdown value={weekData[activeDay][p]} onChange={(v) => setPrayerStatus(activeDay, p, v)} />
            </div>
          ))}
        </Card>

        {/* WEEK AT A GLANCE */}
        <Card delay={0.15}>
          <SectionTitle>Week at a Glance</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", gap: 5, alignItems: "center" }}>
            <span />
            {DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, color: C.soft }}>{d[0]}</div>)}
            {PRAYERS.map((p) => (
              <React.Fragment key={p}>
                <div style={{ fontSize: 11, color: C.ink, fontWeight: "bold" }}>{p.slice(0, 4)}</div>
                {DAYS.map((d, di) => {
                  const st = weekData[di][p];
                  const col = LEAF_COLOR[st];
                  return (
                    <div key={p + di} onClick={() => setActiveDay(di)}
                      style={{
                        width: 22, height: 22, borderRadius: "50%", margin: "0 auto", cursor: "pointer",
                        background: col || "transparent",
                        border: col ? "none" : "2px solid #d6cfc0", transition: "all 0.2s",
                      }} />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* STREAK */}
        <Card delay={0.2}>
          <SectionTitle right={
            <span style={{ background: "rgba(224,92,92,0.12)", color: "#c44", fontSize: 12, fontWeight: "bold", padding: "4px 12px", borderRadius: 14 }}>
              {"🔥"} {streak} days
            </span>
          }>Streak</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 4 }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const filled = i >= 30 - streak - 6 && (i % 7 !== 6 || i > 24);
              const intensity = filled ? (i % 3 === 0 ? "#4caf7d" : i % 3 === 1 ? "#7ecba1" : "#a8dcc0") : "rgba(0,0,0,0.06)";
              return <div key={i} style={{ aspectRatio: "1", borderRadius: 4, background: intensity }} />;
            })}
          </div>
        </Card>
      </div>

      {/* TREE PICKER SHEET */}
      {showPicker && (
        <div onClick={() => setShowPicker(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 420, background: "#f4f0e8", borderRadius: "24px 24px 0 0",
              padding: 18, animation: "slideUp 0.3s ease", maxHeight: "70vh", overflowY: "auto",
            }}>
            <div style={{ width: 44, height: 5, background: "#ccc", borderRadius: 3, margin: "0 auto 14px" }} />
            <h3 style={{ margin: "0 0 12px", color: C.primary, textAlign: "center" }}>Choose Your Tree</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {ownedTrees.map((t) => (
                <div key={t.id} onClick={() => { setSelectedTree(t.id); setShowPicker(false); }}
                  style={{
                    background: "#fff", borderRadius: 18, padding: 8, cursor: "pointer", textAlign: "center",
                    border: selectedTree === t.id ? `2px solid ${C.mid}` : "2px solid transparent",
                  }}>
                  <PrayerTree variety={t.id} weekData={ALL_ONTIME_WEEK} size={110} animate={false} seedPrefix={"pk_" + t.id} />
                  <div style={{ fontSize: 12, fontWeight: "bold", color: C.ink }}>{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ALL_ONTIME_WEEK = DAYS.map(() => Object.fromEntries(PRAYERS.map((p) => [p, "ontime"])));

/* =========================== GARDEN SCREEN ============================ */

function GardenScreen(props) {
  const { coins, sunnahDone, sunnahEnabled, toggleSunnah, toggleSunnahEnabled, sunnahWeekPct, mult } = props;
  const enabled = SUNNAH_LIST.map((_, i) => i).filter((i) => sunnahEnabled[i]);

  return (
    <div>
      {/* header */}
      <div style={{ background: "linear-gradient(160deg, #4a8a5e, #5a9e6f)", color: "#fff", padding: "40px 18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Sunnah Garden</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#eafaf0" }}>My Garden</div>
          </div>
          <CoinBadge coins={coins} />
        </div>
        <div style={{ marginTop: 14, marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.9 }}>
          <span>Weekly sunnah</span><span>{sunnahWeekPct}%</span>
        </div>
        <ProgressBar pct={sunnahWeekPct} color="#eafaf0" track="rgba(255,255,255,0.2)" />
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.9, textAlign: "center" }}>
          {"🌸"} Each sunnah blooms for +{Math.round(3 * mult)} coins
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* FLOWER GRID */}
        <Card delay={0.05}>
          <SectionTitle>Bloom Grid</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "76px repeat(7, 1fr)", gap: 3, minWidth: 320, alignItems: "center" }}>
              <span />
              {DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, color: C.soft }}>{d[0]}</div>)}
              {enabled.map((i) => (
                <React.Fragment key={i}>
                  <div style={{ fontSize: 10.5, color: C.ink, fontWeight: "bold", lineHeight: 1.1 }}>{SUNNAH_LIST[i].name}</div>
                  {DAYS.map((d, di) => (
                    <div key={i + "-" + di} style={{ textAlign: "center" }}>
                      <Flower color={SUNNAH_LIST[i].color} done={sunnahDone[i][di]} size={34}
                        onClick={() => toggleSunnah(i, di)} />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>

        {/* CUSTOMISE */}
        <Card delay={0.1}>
          <SectionTitle>Customise</SectionTitle>
          {SUNNAH_LIST.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderBottom: i < SUNNAH_LIST.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
              <Flower color={s.color} done={sunnahEnabled[i]} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: "bold" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.soft }}>{s.desc}</div>
              </div>
              <Toggle on={sunnahEnabled[i]} onClick={() => toggleSunnahEnabled(i)} />
            </div>
          ))}
        </Card>

        {/* STATS */}
        <Card delay={0.15}>
          <SectionTitle>Garden Stats</SectionTitle>
          {enabled.map((i) => {
            const done = sunnahDone[i].filter(Boolean).length;
            const pct = Math.round((done / 7) * 100);
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{SUNNAH_LIST[i].name}</span><span style={{ color: C.soft }}>{done}/7</span>
                </div>
                <ProgressBar pct={pct} color={SUNNAH_LIST[i].color} height={7} />
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick}
      style={{
        width: 44, height: 25, borderRadius: 14, cursor: "pointer", flexShrink: 0,
        background: on ? C.mid : "#d2cdc0", transition: "background 0.25s", position: "relative",
      }}>
      <div style={{
        position: "absolute", top: 3, left: on ? 22 : 3, width: 19, height: 19,
        borderRadius: "50%", background: "#fff", transition: "left 0.25s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }} />
    </div>
  );
}

/* ============================ SHOP SCREEN ============================= */

function ShopScreen(props) {
  const { coins, shopItems, buyItem, useItem, selectedTree, selectedFlower, weekData } = props;
  const [filter, setFilter] = useState("all");

  const items = shopItems.filter((it) => filter === "all" || it.type === filter);

  return (
    <div>
      {/* header */}
      <div style={{ background: "linear-gradient(160deg, #b88a3e, #8a6a2a)", color: "#fff", padding: "40px 18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 26, fontWeight: "bold", color: "#fff3d6" }}>{"🛍"} Garden Shop</div>
          <CoinBadge coins={coins} />
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* earn banner */}
        <div style={{
          marginTop: 14, background: "rgba(245,216,115,0.2)", borderRadius: 16,
          padding: "11px 14px", fontSize: 12, color: "#8a6a1a", textAlign: "center",
          border: "1px solid rgba(224,168,48,0.25)", lineHeight: 1.6,
        }}>
          On time 10 {"·"} Made up 5 {"·"} Sunnah 3 {"·"} 7-day streak x1.5 {"·"} 14-day streak x2
        </div>

        {/* filter pills */}
        <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
          {[["all", "All"], ["tree", "Trees 🌳"], ["flower", "Flowers 🌸"]].map(([k, lbl]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{
                flex: 1, padding: "9px", borderRadius: 18, cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13,
                border: filter === k ? "none" : "1px solid rgba(0,0,0,0.08)",
                background: filter === k ? C.primary : "rgba(255,255,255,0.7)",
                color: filter === k ? "#fff" : C.ink, fontWeight: filter === k ? "bold" : "normal",
                transition: "all 0.2s",
              }}>{lbl}</button>
          ))}
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingBottom: 10 }}>
          {items.map((item) => {
            const isActive = (item.type === "tree" && selectedTree === item.id) ||
              (item.type === "flower" && selectedFlower === item.id);
            const canAfford = coins >= item.price;
            return (
              <div key={item.id} style={{
                background: "rgba(255,255,255,0.85)", borderRadius: 18, padding: 10,
                border: isActive ? `2px solid ${C.mid}` : "2px solid transparent",
                boxShadow: "0 4px 14px rgba(60,107,74,0.1)", position: "relative",
                animation: "fadeUp 0.4s ease both",
              }}>
                {item.badge && (
                  <span style={{
                    position: "absolute", top: 8, left: 8, zIndex: 2,
                    background: item.badge === "Ramadan" ? "#6a78c4" : "#e0a830",
                    color: "#fff", fontSize: 9, fontWeight: "bold", padding: "2px 7px", borderRadius: 10,
                  }}>{item.badge}</span>
                )}
                {isActive && (
                  <span style={{
                    position: "absolute", top: 8, right: 8, zIndex: 2,
                    background: C.mid, color: "#fff", fontSize: 9, fontWeight: "bold", padding: "2px 7px", borderRadius: 10,
                  }}>Active</span>
                )}

                <div style={{ height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.type === "tree"
                    ? <PrayerTree variety={item.id} weekData={ALL_ONTIME_WEEK} size={104} animate={false} seedPrefix={"shop_" + item.id} />
                    : <ShopFlowerPreview id={item.id} />}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: "bold", color: C.ink, marginTop: 4 }}>{item.name}</div>
                <div style={{ fontSize: 10.5, color: C.soft, marginBottom: 8, minHeight: 26 }}>{item.desc}</div>

                {item.owned ? (
                  <button onClick={() => useItem(item)}
                    style={{
                      width: "100%", padding: "8px", borderRadius: 14, cursor: "pointer", fontFamily: "Georgia, serif",
                      fontSize: 13, fontWeight: "bold", border: "none", transition: "all 0.2s",
                      background: isActive ? C.mid : "rgba(0,0,0,0.07)",
                      color: isActive ? "#fff" : C.ink,
                    }}>{isActive ? "Active" : "Use"}</button>
                ) : canAfford ? (
                  <button onClick={() => buyItem(item)}
                    style={{
                      width: "100%", padding: "8px", borderRadius: 14, cursor: "pointer", fontFamily: "Georgia, serif",
                      fontSize: 13, fontWeight: "bold", border: "none", transition: "all 0.2s",
                      background: "linear-gradient(135deg, #f5d873, #e0a830)", color: "#5a3d10",
                    }}>{"🪙"} {item.price}</button>
                ) : (
                  <button disabled
                    style={{
                      width: "100%", padding: "8px", borderRadius: 14, fontFamily: "Georgia, serif",
                      fontSize: 13, fontWeight: "bold", border: "none",
                      background: "rgba(0,0,0,0.07)", color: "#aaa", cursor: "not-allowed",
                    }}>{"🔒"} {item.price}</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const FLOWER_PREVIEW_COLORS = {
  rose: "#e0556a", tulip: "#e88a3a", lotus: "#e891b8",
  sunflower: "#f0c030", ramadanbloom: "#6a78c4",
};

function ShopFlowerPreview({ id }) {
  const color = FLOWER_PREVIEW_COLORS[id] || "#e891b8";
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
      <Flower color={color} done size={34} />
      <Flower color={color} done size={48} />
      <Flower color={color} done size={34} />
    </div>
  );
}

/* ============================ BOTTOM NAV ============================== */

function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "prayers", icon: "🕌", label: "Prayers" },
    { id: "garden", icon: "🌸", label: "Garden" },
    { id: "shop", icon: "🛍", label: "Shop" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 420, display: "flex",
      background: "rgba(255,255,255,0.94)", backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(90,158,111,0.2)", zIndex: 90,
      padding: "8px 0 12px",
    }}>
      {tabs.map((t) => {
        const active = screen === t.id;
        return (
          <button key={t.id} onClick={() => setScreen(t.id)}
            style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              fontFamily: "Georgia, serif", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, padding: 0,
            }}>
            <span style={{ fontSize: 22, transform: active ? "scale(1.2)" : "scale(1)", transition: "transform 0.2s" }}>{t.icon}</span>
            <span style={{ fontSize: 10.5, color: active ? C.primary : C.soft, fontWeight: active ? "bold" : "normal" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
