// Effect-card drawings for the heroin short (Pen API from toon.ts, plum ink like the characters). No text anywhere:
// labels are blank paper, the map has no names, the ban is a red circle-slash.
import { Pen, INK } from "./toon";

type P2 = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const rr = (x0: number, y0: number, x1: number, y1: number, r: number, n = 6): P2[] => {
  const pts: P2[] = [];
  const corner = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  corner(x1 - r, y1 - r, 0); corner(x0 + r, y1 - r, Math.PI / 2); corner(x0 + r, y0 + r, Math.PI); corner(x1 - r, y0 + r, Math.PI * 1.5);
  return pts;
};
const star4 = (p: Pen, x: number, y: number, r: number, col = "#ffe27a", ol = 5) => {
  const pts: P2[] = [];
  for (let k = 0; k < 8; k++) { const a = rad(k * 45 - 90), q = k % 2 ? r * 0.32 : r; pts.push([x + q * Math.cos(a), y + q * Math.sin(a)]); }
  p.poly(pts, col, ol);
};

/** cough: three grey puffs blown out to the right with two speed ticks, 400 x 300; t 0..1 */
export const fxCough = (p: Pen, t: number) => {
  const a = 1 - t * 0.85;
  for (let i = 0; i < 3; i++) {
    const x = 70 + i * 95 + 90 * t, y = 150 + (i - 1) * 26 - 30 * t, r = 34 + i * 10 + 30 * t;
    p.ell(x, y, r, r * 0.8, `rgba(232,232,236,${a.toFixed(2)})`, t < 0.6 ? 6 : 0);
  }
  if (t < 0.5) for (const y of [92, 212]) p.stroke([[40 + 60 * t, y], [120 + 60 * t, y + (y < 150 ? -10 : 10)]], 8);
};

/** chain links along a straight line from a to b (n links), grey iron with ink */
const chainLine = (p: Pen, a: P2, b: P2, n: number, upto = 1) => {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  for (let i = 0; i < Math.round(n * upto); i++) {
    const u = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
    const flat = i % 2 === 1;
    p.ell(x, y, 26, flat ? 7 : 15, flat ? "#5e6672" : "#8a939e", 6, 0, 360, (ang * 180) / Math.PI);
    if (!flat) p.ell(x, y, 13, 5, "#3a3f48", 0, 0, 360, (ang * 180) / Math.PI);
  }
};
/** chains crossed over a bottle with a padlock, 400 x 520 (bottle centred); t 0..1 = chains wrapping in */
export const fxChains = (p: Pen, t: number) => {
  const u = Math.min(1, t * 1.25);
  chainLine(p, [20, 120], [380, 420], 12, u);
  chainLine(p, [380, 150], [20, 450], 12, u);
  if (t > 0.75) {
    const s = Math.min(1, (t - 0.75) / 0.2);
    p.g.save(); p.g.translate(200, 300); p.g.scale(s, s); p.g.translate(-200, -300);
    p.ell(200, 262, 34, 40, null, 13, 180, 360);
    p.poly(rr(150, 262, 250, 352, 14), "#e0b43c", 9);
    p.ell(200, 300, 10, 10, INK, 0); p.stroke([[200, 304], [200, 330]], 9);
    p.g.restore();
  }
};

/** golden halo seen a little from above, 400 x 200; glow 0..1 adds sparkles; broken = cracked halves dropping */
export const fxHalo = (p: Pen, glow: number, broken = 0) => {
  if (!broken) {
    p.ell(200, 100, 150, 46, null, 30);
    p.ell(200, 100, 150, 46, null, 0);
    p.g.save(); p.g.lineWidth = 18; p.g.strokeStyle = "#ffd84a"; p.g.beginPath(); p.g.ellipse(200, 100, 150, 46, 0, 0, Math.PI * 2); p.g.stroke(); p.g.restore();
    p.g.save(); p.g.lineWidth = 6; p.g.strokeStyle = "#fff6c4"; p.g.beginPath(); p.g.ellipse(200, 96, 140, 40, 0, Math.PI * 1.1, Math.PI * 1.6); p.g.stroke(); p.g.restore();
    for (let i = 0; i < 3; i++) if (glow > 0.2) star4(p, 60 + i * 140, 40 + (i % 2) * 120, 18 + 10 * glow * ((i + 1) % 2), "#fff3b0", 4);
    return;
  }
  const g = p.g, b = Math.min(1, broken);
  for (const s of [-1, 1]) {
    g.save(); g.translate(200 + s * (18 + 40 * b), 100 + 60 * b * b); g.rotate(s * 0.5 * b);
    g.lineCap = "round";
    g.lineWidth = 30; g.strokeStyle = INK; g.beginPath(); g.ellipse(0, 0, 150, 46, 0, s < 0 ? Math.PI * 0.55 : -Math.PI * 0.45, s < 0 ? Math.PI * 1.45 : Math.PI * 0.45); g.stroke();
    g.lineWidth = 18; g.strokeStyle = "#c9a43a"; g.stroke();
    g.restore();
  }
};

/** red hero cape behind a character, 500 x 700 (neck at the top centre); flutter 0..1 */
export const fxCape = (p: Pen, flutter: number) => {
  const w = 30 * Math.sin(flutter * Math.PI * 2);
  p.poly([[200, 40], [300, 40], [380 + w, 600], [330, 640 + w * 0.4], [250, 615], [170, 645 - w * 0.4], [120 - w, 600]], "#d8343c", 11);
  p.stroke([[250, 60], [250 + w * 0.3, 590]], 6, "#a92530");
  p.poly(rr(185, 22, 315, 62, 16), "#e9c03c", 8);
};

// rough world outlines in (lon, lat); just enough to read as a world map
const CONT: [number, number][][] = [
  [[-165, 68], [-140, 70], [-95, 72], [-62, 60], [-55, 50], [-75, 38], [-81, 26], [-97, 27], [-105, 20], [-87, 15], [-80, 9], [-92, 15], [-110, 23], [-117, 33], [-124, 42], [-130, 55], [-150, 60]],
  [[-80, 9], [-75, 11], [-60, 10], [-50, 0], [-35, -7], [-40, -22], [-48, -28], [-58, -38], [-66, -55], [-74, -50], [-71, -30], [-70, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [5, 52], [8, 57], [5, 62], [15, 69], [30, 71], [40, 66], [45, 60], [40, 47], [28, 41], [20, 40], [14, 45], [12, 38], [0, 38]],
  [[-17, 21], [-10, 31], [10, 37], [32, 31], [35, 28], [43, 12], [51, 11], [40, -5], [40, -15], [33, -26], [20, -35], [12, -18], [9, 4], [-8, 5], [-17, 14]],
  [[40, 47], [45, 60], [60, 70], [100, 77], [140, 72], [180, 68], [160, 60], [142, 50], [130, 42], [122, 31], [120, 22], [108, 12], [100, 2], [95, 15], [80, 8], [77, 22], [66, 25], [57, 25], [50, 30], [36, 36], [28, 41]],
  [[114, -22], [122, -18], [136, -12], [145, -15], [153, -27], [150, -37], [140, -38], [130, -32], [115, -34]],
  [[-50, 60], [-28, 70], [-20, 80], [-45, 83], [-60, 77], [-55, 65]],
];
const HOME: [number, number] = [7.1, 51.3]; // Elberfeld
const DEST: [number, number][] = [[-74, 41], [-0.1, 51.5], [2.3, 48.9], [-3.7, 40.4], [12.5, 41.9], [16.4, 48.2], [37.6, 55.8], [18, 59.3],
  [10.7, 59.9], [28.9, 41], [31.2, 30], [72.8, 19], [121.5, 31.2], [139.7, 35.7], [151.2, -33.9], [-58.4, -34.6], [-43.2, -22.9],
  [-99.1, 19.4], [-79.4, 43.7], [18.4, -33.9], [4.9, 52.4], [-9.1, 38.7], [23.7, 37.9]];
export const MAP_W = 1600, MAP_H = 1000;
const mx = (lon: number) => 60 + ((lon + 170) / 350) * (MAP_W - 120);
const my = (lat: number) => 70 + ((84 - lat) / 144) * (MAP_H - 140);
/** framed wall map, 1600 x 1000; prog 0..1 = shipping arcs flying out from Elberfeld to 23 cities, crates landing */
export const fxMap = (p: Pen, prog: number) => {
  p.poly(rr(10, 10, MAP_W - 10, MAP_H - 10, 18), "#7a4f33", 12);
  p.poly(rr(44, 44, MAP_W - 44, MAP_H - 44, 6), "#bfd9de", 8);
  for (const c of CONT) p.poly(c.map(([lo, la]) => [mx(lo), my(la)] as P2), "#e9d9a8", 6);
  const g = p.g;
  DEST.forEach(([lo, la], i) => {
    const t0 = (i / DEST.length) * 0.75, u = Math.max(0, Math.min(1, (prog - t0) / 0.25));
    if (u <= 0) return;
    const a: P2 = [mx(HOME[0]), my(HOME[1])], b: P2 = [mx(lo), my(la)];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]), c: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - Math.min(260, d * 0.35)];
    g.save(); g.setLineDash([16, 12]); g.lineWidth = 7; g.strokeStyle = "#c8323a"; g.lineCap = "round";
    g.beginPath(); g.moveTo(...a);
    const n = 24;
    for (let k = 1; k <= Math.round(n * u); k++) { const s = k / n, q = 1 - s; g.lineTo(q * q * a[0] + 2 * q * s * c[0] + s * s * b[0], q * q * a[1] + 2 * q * s * c[1] + s * s * b[1]); }
    g.stroke(); g.restore();
    if (u >= 1) { p.poly(rr(b[0] - 17, b[1] - 15, b[0] + 17, b[1] + 15, 4), "#c08a52", 5); p.stroke([[b[0] - 15, b[1]], [b[0] + 15, b[1]]], 4, "#7a4f33"); }
  });
  p.ell(mx(HOME[0]), my(HOME[1]), 16, 16, "#c8323a", 6);
};

/** rubber stamp (handle + red pad), side view, 300 x 420 */
export const fxStamp = (p: Pen) => {
  p.ell(150, 70, 62, 56, "#7a4f33", 10);
  p.poly(rr(126, 110, 174, 300, 14), "#8a5a34", 10);
  p.poly(rr(56, 290, 244, 350, 10), "#5a3b2a", 10);
  p.poly(rr(66, 350, 234, 392, 6), "#c8323a", 9);
};
/** red circle-slash stamp mark, 600 x 600; t 0..1 pop-in */
export const fxBan = (p: Pen, t: number) => {
  const s = t < 0.4 ? 1.35 - 0.35 * (t / 0.4) : 1, g = p.g;
  g.save(); g.translate(300, 300); g.scale(s, s); g.translate(-300, -300); g.globalAlpha = Math.min(1, t * 3);
  g.lineWidth = 64; g.strokeStyle = "#c8323a"; g.beginPath(); g.arc(300, 300, 220, 0, Math.PI * 2); g.stroke();
  g.lineCap = "butt"; g.beginPath(); g.moveTo(300 - 156, 300 - 156); g.lineTo(300 + 156, 300 + 156); g.stroke();
  g.restore();
};
/** official paper with a wax seal and scribble lines (no letters), 600 x 800 */
export const fxPaper = (p: Pen) => {
  p.poly(rr(20, 20, 580, 780, 10), "#f6ecd2", 10);
  for (let i = 0; i < 9; i++) {
    const y = 150 + i * 56, w = i % 3 === 2 ? 300 : 440, pts: P2[] = [];
    for (let k = 0; k <= 30; k++) pts.push([80 + (w * k) / 30, y + 5 * Math.sin(k * 1.9 + i)]);
    p.stroke(pts, 6, "#8a7f6a");
  }
  p.stroke([[80, 86], [360, 86]], 14, "#5a5040");
  p.ell(470, 690, 52, 52, "#b03038", 8);
  for (let k = 0; k < 8; k++) { const a = rad(k * 45); p.stroke([[470 + 18 * Math.cos(a), 690 + 18 * Math.sin(a)], [470 + 34 * Math.cos(a), 690 + 34 * Math.sin(a)]], 5, "#7a1f26"); }
};

/** thief's loot sack, 300 x 320 */
export const fxSack = (p: Pen) => {
  p.poly([[70, 150], [110, 110], [190, 110], [230, 150], [262, 240], [240, 300], [60, 300], [38, 240]], "#b08a5a", 10);
  p.poly([[112, 70], [188, 70], [176, 112], [124, 112]], "#b08a5a", 9);
  p.stroke([[108, 112], [192, 112]], 12, "#6a4a2a");
  for (const [x, y] of [[110, 210], [180, 240], [150, 170]]) p.ell(x, y, 12, 8, "#9a774a", 0);
};
/** aspirin tablets, 320 x 200 */
export const fxTablets = (p: Pen) => {
  for (const [x, y, r] of [[80, 120, 46], [180, 90, 50], [250, 140, 40], [150, 160, 36]] as const) {
    p.ell(x, y, r, r * 0.62, "#ffffff", 7); p.ell(x, y - 6, r * 0.8, r * 0.4, "#f4f4f6", 0); p.stroke([[x - r * 0.6, y - 4], [x + r * 0.6, y - 4]], 5, "#c9ccd4");
  }
};
/** Bunsen flame, 120 x 240; t = flicker phase */
export const fxFlame = (p: Pen, t: number) => {
  const w = 6 * Math.sin(t * 20), h = 8 * Math.sin(t * 13);
  p.poly([[60 + w, 20 - h], [96, 150], [86, 210], [34, 210], [24, 150]], "#6fb6ff", 6);
  p.poly([[60 + w * 0.6, 90 - h * 0.5], [80, 170], [72, 204], [48, 204], [40, 170]], "#d6ecff", 0);
};
/** sparkle swirl, 500 x 500; t 0..1 (spins and grows) */
export const fxSparkle = (p: Pen, t: number) => {
  for (let i = 0; i < 6; i++) {
    const a = t * 4 + (i / 6) * Math.PI * 2, d = 60 + 150 * t;
    star4(p, 250 + d * Math.cos(a), 250 + d * Math.sin(a) * 0.8, 20 + 22 * Math.sin(t * Math.PI) * ((i % 2) + 0.5), i % 2 ? "#fff3b0" : "#bfe8ff", 5);
  }
};
/** grey chimney smoke puff, 400 x 400; t 0..1 (grows, fades) */
export const fxSmoke = (p: Pen, t: number, warm = false) => {
  const a = (1 - t) * 0.95, col = warm ? `rgba(214,176,170,${a.toFixed(2)})` : `rgba(196,198,206,${a.toFixed(2)})`;
  for (const [x, y, r] of [[200, 240, 90], [140, 200, 70], [260, 190, 75], [200, 150, 80]] as const) p.ell(x, y - 40 * t, r * (0.6 + 0.6 * t), r * (0.5 + 0.5 * t), col, 0);
};
/** tall hat of the disguise, 300 x 280 */
export const fxTopHat = (p: Pen) => {
  p.ell(150, 236, 130, 30, "#2a2430", 10);
  p.poly(rr(70, 40, 230, 236, 16), "#2a2430", 10);
  p.poly([[70, 180], [230, 180], [230, 212], [70, 212]], "#c8323a", 0);
};
/** fake moustache of the disguise, 300 x 140 */
export const fxMoustache = (p: Pen) => {
  p.poly([[150, 50], [190, 40], [250, 56], [290, 40], [270, 92], [210, 102], [150, 80], [90, 102], [30, 92], [10, 40], [50, 56], [110, 40]], "#2a201a", 8);
};
/** sweat drops / shiver ticks for the patient, 300 x 300; t phase */
export const fxShiver = (p: Pen, t: number) => {
  const j = 8 * Math.sin(t * 50);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x = 150 + s * (95 + k * 18) + j, y = 90 + k * 60;
    p.stroke([[x, y], [x + s * 22, y + 16], [x, y + 32]], 9);
  }
  p.poly([[230, 40], [248, 80], [240, 100], [220, 100], [212, 80]], "#8cc8f0", 6);
};
/** gate bars sliding shut (front view), 600 x 500; k 0..1 closed */
export const fxGate = (p: Pen, k: number) => {
  const half = 300 * k;
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? 0 : 600 - half, x1 = s < 0 ? half : 600;
    if (half < 4) continue;
    p.poly([[x0, 40], [x1, 40], [x1, 60], [x0, 60]], "#3a3f48", 8);
    p.poly([[x0, 440], [x1, 440], [x1, 460], [x0, 460]], "#3a3f48", 8);
    for (let x = x0 + 20; x < x1 - 4; x += 46) { p.stroke([[x, 20], [x, 490]], 22); p.stroke([[x, 20], [x, 490]], 12, "#5e6672"); p.ell(x, 18, 11, 16, "#5e6672", 6); }
  }
};

// ================= more effects (v2) =================
/** idea light bulb with rays, 300 x 400; t 0..1 glow */
export const fxBulb = (p: Pen, t: number) => {
  for (let k = 0; k < 8 && t > 0.2; k++) { const a = rad(k * 45 - 90), r0 = 135, r1 = 135 + 50 * t; p.stroke([[150 + r0 * Math.cos(a), 150 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 150 + r1 * Math.sin(a)]], 12); p.stroke([[150 + r0 * Math.cos(a), 150 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 150 + r1 * Math.sin(a)]], 6, "#ffe27a"); }
  p.ell(150, 150, 85, 90, t > 0.5 ? "#fff3a0" : "#f7f2dc", 10);
  p.poly(rr(110, 228, 190, 300, 10), "#9aa2ac", 9);
  for (const y of [252, 276]) p.stroke([[112, y], [188, y]], 6);
  p.stroke([[130, 200], [140, 150], [150, 185], [160, 150], [170, 200]], 6, "#c9a043");
};
/** clock face with moving hands (time passing), 300 x 300; t 0..1 = one turn of the long hand */
export const fxClock = (p: Pen, t: number) => {
  p.ell(150, 150, 130, 130, "#f6ecd2", 12);
  for (let k = 0; k < 12; k++) { const a = rad(k * 30); p.stroke([[150 + 100 * Math.cos(a), 150 + 100 * Math.sin(a)], [150 + 115 * Math.cos(a), 150 + 115 * Math.sin(a)]], k % 3 ? 5 : 10); }
  const am = rad(t * 360 - 90), ah = rad(t * 30 + 60 - 90);
  p.stroke([[150, 150], [150 + 95 * Math.cos(am), 150 + 95 * Math.sin(am)]], 10); p.stroke([[150, 150], [150 + 60 * Math.cos(ah), 150 + 60 * Math.sin(ah)]], 14);
  p.ell(150, 150, 12, 12, INK, 0);
};
/** gold coins bursting up, 400 x 400; t 0..1 */
export const fxCoins = (p: Pen, t: number) => {
  for (let i = 0; i < 7; i++) {
    const a = rad(-160 + i * 23), d = 40 + 150 * t, x = 200 + d * Math.cos(a), y = 300 + d * Math.sin(a) + 260 * t * t, s = 0.4 + 0.6 * Math.abs(Math.cos(t * 9 + i));
    p.ell(x, y, 32 * s + 4, 32, "#e0b43c", 7); p.ell(x, y, 18 * s + 2, 18, "#f2d36a", 0);
  }
};
/** big curved pointing arrow, 500 x 300 (points right); t 0..1 draws in */
export const fxArrow = (p: Pen, t: number) => {
  const pts: P2[] = []; const n = Math.max(2, Math.round(20 * t));
  for (let i = 0; i <= n; i++) { const u = i / 20; pts.push([40 + 380 * u, 220 - 120 * Math.sin(u * Math.PI * 0.8)]); }
  p.stroke(pts, 46); p.stroke(pts, 28, "#e2453c");
  if (t > 0.95) { const [x, y] = pts[pts.length - 1]; p.poly([[x - 30, y - 50], [x + 55, y + 8], [x - 40, y + 55]], "#e2453c", 10); }
};
/** cartoon fire, 300 x 400; t = flicker phase */
export const fxFire = (p: Pen, t: number) => {
  const j = (k: number) => 14 * Math.sin(t * 20 + k);
  p.poly([[150 + j(1), 30], [235, 190], [260 + j(2), 300], [200, 380], [100, 380], [40 + j(3), 300], [70, 180], [110 + j(4), 120]], "#f08a2c", 10);
  p.poly([[150 + j(5), 140], [210, 260], [190, 360], [110, 360], [90, 260]], "#ffd23f", 0);
};
/** rain cloud with falling drops, 500 x 400; t phase */
export const fxRain = (p: Pen, t: number) => {
  for (let i = 0; i < 9; i++) { const x = 90 + i * 40, y = 200 + ((t * 300 + i * 53) % 180); p.stroke([[x, y], [x - 8, y + 28]], 8, "#69a8e0"); }
  for (const [x, y, r] of [[150, 140, 70], [250, 110, 90], [350, 145, 65]] as const) p.ell(x, y, r, r * 0.75, "#9aa6b8", 9);
  p.poly(rr(90, 140, 410, 200, 30), "#9aa6b8", 0);
};
/** heart pop, 300 x 300; t 0..1 */
export const fxHeart = (p: Pen, t: number) => {
  const s = t < 0.3 ? 0.6 + 1.6 * t : 1, pts: P2[] = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); pts.push([150 + x * 7.5 * s, 150 + y * 7.5 * s]); }
  p.poly(pts, "#e2453c", 10);
};
