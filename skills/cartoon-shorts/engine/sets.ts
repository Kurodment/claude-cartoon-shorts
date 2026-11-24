// The sets of the heroin short, each its own group (world.ts shows one per shot): the Bayer lab (1897), the chemist's
// (~1900), a hospital ward, the Elberfeld street with the Bayer works, the brain castle (analogy), the capitol (1924)
// and a bathroom today. Interiors are open toward the lens like a stage set; everything is two-tone Lambert so it
// shares the bridge/Pisa look (ink, lens, grade).
import * as THREE from "three";
import { Batch, boxGeo, V, lam, house, prop, Kit } from "./build";
import { ctex, planksHD, stoneHD, cobbleHD, grassHD, brick, rep, facadeHD, roofHD } from "./paint";
import { twoTone } from "./shade";
export type V3 = [number, number, number];
export const TABLE_Y = 0.92, COUNTER_Y = 1.05;
/** desk on the capitol plaza, relative to the set origin */
const DESK_REL: V3 = [0, 0, 34];

const M = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const box = (b: Batch, o: V3, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, mat: THREE.Material, tile = 0) =>
  b.add(boxGeo(V(o[0] + x0, o[1] + y0, o[2] + z0), V(o[0] + x1, o[1] + y1, o[2] + z1), tile), mat);
const cylG = (r0: number, r1: number, h: number, seg = 16) => new THREE.CylinderGeometry(r1, r0, h, seg).translate(0, h / 2, 0);
const flatTile = (w: number, d: number, tile: number) => {
  const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv as THREE.BufferAttribute, p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tile);
  return g;
};
const floor = (b: Batch, o: V3, x0: number, z0: number, x1: number, z1: number, mat: THREE.Material, tile: number, y = 0) =>
  b.add(flatTile(x1 - x0, z1 - z0, tile).translate(o[0] + (x0 + x1) / 2, o[1] + y, o[2] + (z0 + z1) / 2), mat);

// ---------------- painted surfaces ----------------
/** plaster wall with a dark wood wainscot (1 m) and a picture rail; one tile = 4 m wide x 4.6 m high */
const plaster = (key: string, wall: string, wood: string) => ctex(key, 512, 588, (g, r) => {
  g.fillStyle = wall; g.fillRect(0, 0, 512, 588);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "120,100,80"},0.05)`; g.fillRect(r() * 512, r() * 460, 6 + r() * 30, 3 + r() * 12); }
  g.fillStyle = wood; g.fillRect(0, 460, 512, 128);
  g.fillStyle = "rgba(0,0,0,0.25)"; for (let x = 0; x < 512; x += 128) g.fillRect(x, 470, 5, 118);
  g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(0, 458, 512, 6);
  g.fillStyle = "rgba(40,25,20,0.5)"; g.fillRect(0, 96, 512, 8);
});
/** tall window (frame, glazing bars, bright day outside), 1.6 x 2.6 m */
const windowTex = () => ctex("window", 256, 416, (g) => {
  g.fillStyle = "#6a4a32"; g.fillRect(0, 0, 256, 416);
  const gr = g.createLinearGradient(0, 0, 0, 416); gr.addColorStop(0, "#e9f4ff"); gr.addColorStop(1, "#bcd9f2");
  g.fillStyle = gr; g.fillRect(18, 18, 220, 380);
  g.fillStyle = "#6a4a32"; g.fillRect(122, 18, 12, 380); for (const y of [140, 266]) g.fillRect(18, y, 220, 10);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(30, 380); g.lineTo(80, 30); g.lineTo(104, 30); g.lineTo(54, 380); g.fill();
});
const tiles = (key: string, a: string, b: string, n = 8) => ctex(key, 512, 512, (g) => {
  const s = 512 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = (x + y) % 2 ? a : b; g.fillRect(x * s, y * s, s, s); }
  g.strokeStyle = "rgba(60,50,50,0.35)"; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
});
const wallTiles = () => ctex("bathTiles", 512, 512, (g) => {
  g.fillStyle = "#e9f1f2"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#b9c7cc"; g.lineWidth = 5;
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke(); }
});
/** blank paper label with a printed border and an emblem dot (no letters), wraps once around a bottle */
const labelTex = (key: string, paper: string, ink: string) => ctex(key, 512, 128, (g) => {
  g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, 512, 128);
  g.fillStyle = paper; g.fillRect(0, 0, 512, 128);
  g.strokeStyle = ink; g.lineWidth = 6; g.strokeRect(150, 12, 212, 104);
  g.lineWidth = 3; g.strokeRect(162, 24, 188, 80);
  g.fillStyle = ink; g.beginPath(); g.arc(256, 64, 20, 0, Math.PI * 2); g.fill();
  g.fillRect(186, 92, 140, 5);
});
const brainTex = () => ctex("brainFolds", 1024, 512, (g, r) => {
  g.fillStyle = "#f2a7b8"; g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = "#c86f88"; g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    let x = r() * 1024, y = r() * 512, a = r() * Math.PI * 2;
    g.lineWidth = 7 + r() * 6; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 9; k++) { a += (r() - 0.5) * 2.2; x += Math.cos(a) * 22; y += Math.sin(a) * 22; g.lineTo(x, y); }
    g.stroke();
  }
  g.strokeStyle = "rgba(255,230,236,0.6)"; g.lineWidth = 4;
  for (let i = 0; i < 40; i++) { const x = r() * 1024, y = r() * 512; g.beginPath(); g.arc(x, y, 10 + r() * 14, 0, 2); g.stroke(); }
});

// ---------------- glassware (shared by the sets and the props world.ts moves) ----------------
const lathe = (pts: [number, number][], seg = 28) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const glassMat = (key: string, col: string) => lam("glass" + key, () => ({ color: col }));
/** round-bottom flask (r = bulb radius) with a liquid of colour `liq` filling the bulb */
export const flask = (liq: string, r = 0.1, key = liq) => {
  const g = new THREE.Group();
  const bulb = lathe(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + (i / 12) * Math.PI * 0.86; return [Math.max(0.001, r * Math.cos(a)), r + r * Math.sin(a)] as [number, number]; })
    .concat([[r * 0.26, r * 2.0], [r * 0.26, r * 3.3], [r * 0.34, r * 3.35], [r * 0.3, r * 3.42]]));
  const liquid = lathe(Array.from({ length: 9 }, (_, i) => { const a = -Math.PI / 2 + (i / 8) * Math.PI * 0.42; return [Math.max(0.001, r * 0.93 * Math.cos(a)), r + r * 0.93 * Math.sin(a)] as [number, number]; }).concat([[0.001, r * 1.15]]));
  const shell = new THREE.Mesh(bulb, twoTone(new THREE.MeshLambertMaterial({ color: "#e3f4f8", transparent: true, opacity: 0.32, depthWrite: false }))), liqM = new THREE.Mesh(liquid, lam("liq" + key, () => ({ color: liq })));
  liqM.scale.setScalar(1.02);
  shell.castShadow = liqM.castShadow = true; shell.receiveShadow = liqM.receiveShadow = true;
  g.add(shell, liqM);
  g.userData.liquid = liqM;
  return g;
};
/** apothecary bottle (h tall) in glass colour col, cork, and a blank paper label */
export const bottle = (col: string, h = 0.24, key = col, label = true) => {
  const g = new THREE.Group(), r = h * 0.26;
  const body = lathe([[0.001, 0], [r, 0], [r, h * 0.62], [r * 0.9, h * 0.7], [r * 0.38, h * 0.78], [r * 0.36, h * 0.9], [r * 0.46, h * 0.92], [r * 0.4, h * 0.95], [0.001, h * 0.95]]);
  const m = new THREE.Mesh(body, glassMat("b" + key, col));
  const cork = new THREE.Mesh(cylG(r * 0.33, r * 0.36, h * 0.12, 12).translate(0, h * 0.92, 0), lam("cork", () => ({ color: "#b0804c" })));
  g.add(m, cork);
  if (label) {
    const tex = labelTex("label" + key, "#f3ead2", col === "#a8652a" ? "#7a3a1a" : "#24406e");
    const lb = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.015, r * 1.015, h * 0.32, 28, 1, true).translate(0, h * 0.33, 0), twoTone(new THREE.MeshLambertMaterial({ map: tex })));
    g.add(lb);
  }
  g.traverse((o) => { const x = o as THREE.Mesh; if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } });
  return g;
};
const addBottle = (b: Batch, col: string, x: number, y: number, z: number, h: number) => {
  const r = h * 0.26, mat = glassMat("s" + col, col);
  b.add(lathe([[0.001, 0], [r, 0], [r, h * 0.62], [r * 0.9, h * 0.7], [r * 0.38, h * 0.78], [r * 0.36, h * 0.92], [0.001, h * 0.92]], 10), mat, M(x, y, z));
  b.add(cylG(r * 0.33, r * 0.36, h * 0.12, 6), lam("cork", () => ({ color: "#b0804c" })), M(x, y + h * 0.88, z));
};
const SHELF_COLS = ["#3a6fb0", "#6a8a3a", "#7a5a3a", "#e8e4d8", "#2f5f6a", "#9a3a3a", "#c9b28a"];

/** shelf row of bottles along x at height y (deterministic colours); amber = only heroin amber */
const shelfRow = (b: Batch, o: V3, x0: number, x1: number, y: number, z: number, seed: number, amber = false) => {
  let x = x0, i = 0;
  while (x < x1) {
    const h = 0.18 + ((seed * 7 + i * 13) % 5) * 0.035;
    addBottle(b, amber ? "#a8652a" : SHELF_COLS[(seed + i * 3) % SHELF_COLS.length], o[0] + x, o[1] + y, o[2] + z, h);
    x += h * 0.62 + 0.03; i++;
  }
};

// ---------------- the lab ----------------
export const buildLab = (kit: Kit, o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  const wood = lam("labWood", () => ({ color: "#7a4f33" })), top = lam("labTop", () => ({ color: "#4a3a32" })), dark = lam("ironDark", () => ({ color: "#3a3f48" }));
  const wall = lam("labWall", () => ({ map: rep(plaster("labPlaster", "#e7dcc0", "#6a4a32"), 1, 1) }));
  floor(b, o, -8, -4.4, 8, 9, lam("planksHD", () => ({ map: planksHD() })), 3);
  const W = (x0: number, z0: number, x1: number, z1: number, len: number) => {
    const gg = boxGeo(V(o[0] + x0, 0, o[2] + z0), V(o[0] + x1, 4.6, o[2] + z1), 0);
    const uv = gg.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (len / 4));
    b.add(gg, wall);
  };
  W(-6.4, -4.4, 6.4, -4.0, 12.8); W(-6.4, -4.4, -6.0, 6, 10.4); W(6.0, -4.4, 6.4, 6, 10.4);
  const win = lam("window", () => ({ map: windowTex() }));
  for (const x of [-3.6, 3.6]) b.add(new THREE.PlaneGeometry(1.6, 2.6).translate(o[0] + x, 2.55, o[2] - 3.98), win);
  b.add(new THREE.PlaneGeometry(1.6, 2.6).rotateY(-Math.PI / 2).translate(o[0] + 5.98, 2.55, o[2] + 2.6), win);
  // back bench with glassware, a retort stand and a burner
  box(b, o, -5.4, 0, -3.98, 5.4, 0.88, -3.15, wood); box(b, o, -5.5, 0.88, -4.0, 5.5, 0.95, -3.05, top);
  const flaskCols = ["#7fc6e6", "#e2c34a", "#b7e07a", "#e88a6a", "#c9a0e0"];
  for (let i = 0; i < 9; i++) {
    const x = -4.8 + i * 1.18, f = flask(flaskCols[i % 5], 0.06 + (i % 3) * 0.02, "bench" + i);
    f.position.set(o[0] + x, 0.95, o[2] - 3.55 + (i % 2) * 0.18); f.updateMatrixWorld(true);
    b.addObject(f, new THREE.Matrix4());
  }
  for (let i = 0; i < 5; i++) addBottle(b, SHELF_COLS[i], o[0] - 2.2 + i * 1.05, 0.95, o[2] - 3.3, 0.22);
  // shelves between the windows
  for (const y of [1.75, 2.45, 3.15]) { box(b, o, -2.4, y - 0.05, -3.98, 2.4, y, -3.62, wood); shelfRow(b, o, -2.3, 2.3, y, -3.8, Math.round(y * 10)); }
  // centre table
  box(b, o, -1.75, TABLE_Y - 0.07, -0.8, 1.75, TABLE_Y, 0.8, top);
  for (const [x, z] of [[-1.6, -0.7], [1.6, -0.7], [-1.6, 0.7], [1.6, 0.7]]) box(b, o, x - 0.05, 0, z - 0.05, x + 0.05, TABLE_Y - 0.07, z + 0.05, wood);
  b.add(cylG(0.05, 0.05, 0.16, 10), lam("brass", () => ({ color: "#c9a043" })), M(o[0] - 0.95, TABLE_Y, o[2] - 0.42)); // burner
  b.add(cylG(0.012, 0.012, 0.75, 6), dark, M(o[0] - 1.25, TABLE_Y, o[2] - 0.5)); // retort stand
  box(b, o, -1.35, TABLE_Y, -0.6, -1.15, TABLE_Y + 0.02, -0.4, dark);
  b.add(new THREE.TorusGeometry(0.06, 0.01, 6, 16).rotateX(Math.PI / 2), dark, M(o[0] - 1.25, TABLE_Y + 0.45, o[2] - 0.44));
  for (let i = 0; i < 4; i++) b.add(cylG(0.015, 0.015, 0.14, 8), glassMat("tube", "#d6eef4"), M(o[0] - 1.0 + i * 0.05, TABLE_Y + 0.06, o[2] - 0.55));
  box(b, o, -1.05, TABLE_Y, -0.6, -0.82, TABLE_Y + 0.07, -0.5, wood);
  // tall glass cabinet + a chair near the right wall
  box(b, o, 4.4, 0, 2.8, 5.95, 2.4, 4.2, wood);
  for (const y of [0.7, 1.3, 1.9]) shelfRow(b, o, 4.55, 5.85, y, 3.5, Math.round(y * 7));
  prop(b, kit, "cart", o[0] + 99, 0, 0, 0.1); // (keeps the kit import used even when the cart is absent)
  b.build(g);
  return g;
};

// ---------------- the chemist's ----------------
export const buildPharm = (_kit: Kit, o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  const wood = lam("phWood", () => ({ color: "#5a3826" })), woodL = lam("phWoodL", () => ({ color: "#8a5a3a" })), marble = lam("phMarble", () => ({ color: "#ece6da" }));
  const wall = lam("phWall", () => ({ map: plaster("phPlaster", "#cfe0c8", "#5a3826") }));
  floor(b, o, -8, -4.4, 8, 9, lam("phFloor", () => ({ map: tiles("phTiles", "#e8e0cc", "#4a5a6a") })), 2);
  b.add(boxGeo(V(o[0] - 6.4, 0, o[2] - 4.4), V(o[0] + 6.4, 4.6, o[2] - 4.0)), wall);
  b.add(boxGeo(V(o[0] - 6.4, 0, o[2] - 4.4), V(o[0] - 6.0, 4.6, o[2] + 6)), wall);
  b.add(boxGeo(V(o[0] + 6.0, 0, o[2] - 4.4), V(o[0] + 6.4, 4.6, o[2] + 6)), wall);
  b.add(new THREE.PlaneGeometry(1.6, 2.6).rotateY(-Math.PI / 2).translate(o[0] + 5.98, 2.55, o[2] + 1.8), lam("window", () => ({ map: windowTex() })));
  // the cabinets: dark wood wall unit with five shelves of bottles; a carved top
  box(b, o, -5.6, 0, -4.0, 5.6, 0.9, -3.4, wood);
  box(b, o, -5.6, 0.9, -4.0, 5.6, 3.5, -3.78, wood);
  for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) box(b, o, x - 0.07, 0.9, -3.95, x + 0.07, 3.5, -3.5, woodL);
  box(b, o, -5.8, 3.5, -4.0, 5.8, 3.75, -3.4, woodL);
  [1.35, 1.9, 2.45, 3.0].forEach((y, k) => {
    box(b, o, -5.6, y - 0.04, -3.95, 5.6, y, -3.5, woodL);
    for (const [x0, x1] of [[-5.5, -2.9], [-2.7, -0.1], [0.1, 2.7], [2.9, 5.5]]) shelfRow(b, o, x0, x1, y, -3.7, k * 5 + Math.round(x0 * 3));
  });
  shelfRow(b, o, -5.5, 5.5, 0.9, -3.62, 3);
  // the counter: dark wood with panels, marble top; big jars, scales, a till
  box(b, o, -3.2, 0, -0.45, 3.2, COUNTER_Y - 0.05, 0.45, wood);
  for (let i = 0; i < 6; i++) box(b, o, -3.0 + i * 1.03, 0.15, 0.45, -2.2 + i * 1.03, 0.85, 0.48, woodL);
  box(b, o, -3.3, COUNTER_Y - 0.05, -0.52, 3.3, COUNTER_Y, 0.52, marble);
  for (const [x, col] of [[-2.6, "#e2453c"], [-2.15, "#3f9fd8"]] as const) {
    b.add(cylG(0.13, 0.13, 0.34, 20), glassMat("jar", "#d6eef4"), M(o[0] + x, COUNTER_Y, o[2] - 0.1));
    b.add(cylG(0.11, 0.11, 0.2, 16), lam("jar" + col, () => ({ color: col })), M(o[0] + x, COUNTER_Y + 0.02, o[2] - 0.1));
    b.add(new THREE.SphereGeometry(0.07, 12, 8), glassMat("jar", "#d6eef4"), M(o[0] + x, COUNTER_Y + 0.38, o[2] - 0.1));
  }
  const brass = lam("brass", () => ({ color: "#c9a043" }));
  box(b, o, 1.6, COUNTER_Y, -0.3, 2.3, COUNTER_Y + 0.28, 0.2, brass); box(b, o, 1.65, COUNTER_Y + 0.28, -0.25, 2.25, COUNTER_Y + 0.4, 0.0, wood); // till
  b.add(cylG(0.01, 0.01, 0.35, 6), brass, M(o[0] - 1.2, COUNTER_Y, o[2] - 0.1)); // scales
  b.add(new THREE.BoxGeometry(0.5, 0.02, 0.02), brass, M(o[0] - 1.2, COUNTER_Y + 0.35, o[2] - 0.1));
  for (const s of [-1, 1]) b.add(cylG(0.08, 0.06, 0.03, 12), brass, M(o[0] - 1.2 + s * 0.24, COUNTER_Y + 0.22, o[2] - 0.1));
  b.build(g);
  return g;
};
/** the extra shelf of heroin bottles that appears once Bayer sells it (shot 8) */
export const buildPharmAmber = (o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  for (const y of [0.9, 1.35]) shelfRow(b, o, -2.7, 2.7, y, -3.55 + (y > 1 ? -0.06 : 0.1), 9, true);
  shelfRow(b, o, -0.4, 1.2, COUNTER_Y, 0.2, 2, true);
  b.build(g);
  return g;
};

// ---------------- the ward ----------------
export const BEDS = [-4.5, -1.5, 1.5, 4.5];
export const buildWard = (_kit: Kit, o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  const wall = lam("wdWall", () => ({ map: plaster("wdPlaster", "#e6ecdf", "#7d8f86") }));
  const iron = lam("bedIron", () => ({ color: "#4a5560" })), sheet = lam("sheet", () => ({ color: "#f4f2ea" })), blanket = lam("blanket", () => ({ color: "#8fb0c9" }));
  floor(b, o, -8, -4.4, 8, 9, lam("wdFloor", () => ({ map: tiles("wdTiles", "#ddd6c6", "#c7bfae", 10) })), 2.5);
  b.add(boxGeo(V(o[0] - 7.4, 0, o[2] - 4.4), V(o[0] + 7.4, 4.6, o[2] - 4.0)), wall);
  b.add(boxGeo(V(o[0] - 7.4, 0, o[2] - 4.4), V(o[0] - 7.0, 4.6, o[2] + 6)), wall);
  b.add(boxGeo(V(o[0] + 7.0, 0, o[2] - 4.4), V(o[0] + 7.4, 4.6, o[2] + 6)), wall);
  for (const x of [-3, 0, 3]) b.add(new THREE.PlaneGeometry(1.5, 2.4).translate(o[0] + x, 2.7, o[2] - 3.98), lam("window", () => ({ map: windowTex() })));
  for (const x of BEDS) {
    box(b, o, x - 0.52, 0, -3.95, x + 0.52, 1.05, -3.85, iron); // head frame
    box(b, o, x - 0.52, 0, -1.42, x + 0.52, 0.72, -1.35, iron); // foot frame
    box(b, o, x - 0.5, 0.35, -3.85, x + 0.5, 0.52, -1.42, sheet); // mattress
    box(b, o, x - 0.36, 0.52, -3.8, x + 0.36, 0.64, -3.45, sheet); // pillow
    box(b, o, x - 0.52, 0.5, -2.75, x + 0.52, 0.62, -1.4, blanket); // blanket over the legs
    box(b, o, x + 0.62, 0, -3.8, x + 1.0, 0.62, -3.45, lam("wdWood", () => ({ color: "#8a6a4a" }))); // bedside table
  }
  b.build(g);
  return g;
};

// ---------------- the street and the Bayer works ----------------
export const CHIMNEYS: [number, number][] = [[-9, -11], [9, -11]];
export const CHIMNEY_H = 26;
export const buildStreet = (kit: Kit, o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  floor(b, o, -150, -120, 150, 120, lam("cobbleHD", () => ({ map: cobbleHD() })), 4);
  const brk = lam("brickWall", () => ({ map: brick() }));
  const front = lam("worksFront", () => ({ map: facadeHD("worksFront", 32, 9, { wall: "#b5583c", shutter: "#3a3f48", door: true, brick: true }) }));
  // factory hall: brick box, painted front, saw-tooth roof
  box(b, o, -16, 0, -16, 16, 9, -4.02, brk, 2);
  b.add(new THREE.PlaneGeometry(32, 9).translate(o[0], 4.5, o[2] - 4.0), front);
  const roofM = lam("worksRoof", () => ({ map: roofHD("#5a5f6a", true), side: THREE.DoubleSide })), glassR = lam("worksGlass", () => ({ color: "#9fc4d8" }));
  for (let i = 0; i < 6; i++) {
    const z0 = o[2] - 16 + i * 2, z1 = z0 + 2;
    const sl = new THREE.PlaneGeometry(32, Math.hypot(2, 2.2)); sl.rotateX(-Math.atan2(2.2, 2) + Math.PI / 2 - Math.PI / 2);
    const geo = new THREE.BufferGeometry().setFromPoints([V(o[0] - 16, 9, z0), V(o[0] + 16, 9, z0), V(o[0] + 16, 11.2, z1), V(o[0] - 16, 9, z0), V(o[0] + 16, 11.2, z1), V(o[0] - 16, 11.2, z1)]);
    geo.computeVertexNormals(); geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 8, 0, 8, 1, 0, 0, 8, 1, 0, 1], 2));
    b.add(geo, roofM); void sl;
    b.add(new THREE.PlaneGeometry(32, 2.2).translate(o[0], 10.1, z1 - 0.01).rotateX(0), glassR);
  }
  // chimneys (tapered brick, dark band at the top)
  for (const [x, z] of CHIMNEYS) {
    b.add(cylG(1.25, 0.85, CHIMNEY_H, 20), brk, M(o[0] + x, 0, o[2] + z));
    b.add(cylG(1.0, 1.0, 0.8, 20), lam("sootBand", () => ({ color: "#3a2f2c" })), M(o[0] + x, CHIMNEY_H - 0.8, o[2] + z));
  }
  // yard wall and gate pillars
  box(b, o, -16, 0, -2.3, -4.4, 1.9, -1.8, brk, 2); box(b, o, 4.4, 0, -2.3, 16, 1.9, -1.8, brk, 2);
  for (const x of [-4.4, 4.4]) { box(b, o, x - 0.5, 0, -2.5, x + 0.5, 3.6, -1.6, brk, 2); box(b, o, x - 0.6, 3.6, -2.6, x + 0.6, 3.85, -1.5, lam("stoneCap", () => ({ map: stoneHD() })), 1); }
  // houses down both sides of the street, fronts facing the street
  for (let i = 0; i < 6; i++) {
    const z = 6 + i * 9.5;
    house(b, o[0] - 14, o[2] + z, Math.PI / 2, 8.6, 8, 8.5 + (i % 3) * 1.4, i, 0);
    house(b, o[0] + 14, o[2] + z + 3, -Math.PI / 2, 8.6, 8, 8.4 + ((i + 1) % 3) * 1.4, i + 3, 0);
  }
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) prop(b, kit, "lantern", o[0] + s * 8.6, 0, o[2] + 4 + i * 11, 3.4);
  prop(b, kit, "cart", o[0] + 6.5, 0, o[2] + 14, 2.2, 0.4);
  prop(b, kit, "stall-green", o[0] - 7.5, 0, o[2] + 24, 3.0, Math.PI / 2);
  b.build(g);
  return g;
};

// ---------------- the brain castle ----------------
export const buildBrain = (kit: Kit, o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  floor(b, o, -150, -150, 150, 150, lam("grassHD", () => ({ map: grassHD() })), 4);
  floor(b, o, -1.7, -14, 1.7, 60, lam("cobbleHD", () => ({ map: cobbleHD() })), 4, 0.012);
  const st = lam("castleStone", () => ({ map: stoneHD("castleHD", ["#d9cfc0", "#cfc4b3", "#e2d9cb", "#c7bba8"], "#a89c88") }));
  // wall with a gate opening (x -1.4..1.4, up to 3.0 m) and a lintel above
  box(b, o, -34, 0, -0.6, -1.4, 4.6, 0.6, st, 1.5); box(b, o, 1.4, 0, -0.6, 34, 4.6, 0.6, st, 1.5);
  box(b, o, -1.4, 3.0, -0.6, 1.4, 4.6, 0.6, st, 1.5);
  for (let x = -33; x <= 33; x += 2.2) if (Math.abs(x) > 3.4) box(b, o, x - 0.55, 4.6, -0.6, x + 0.55, 5.4, 0.6, st, 1.5); // crenels
  // two round gate towers with pointed roofs
  const roof = lam("towerRoof", () => ({ map: roofHD("#c25a5a") }));
  for (const x of [-2.9, 2.9]) {
    const c = new THREE.CylinderGeometry(1.5, 1.5, 7.2, 24); c.translate(0, 3.6, 0);
    const uv = c.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 4.5);
    b.add(c, st, M(o[0] + x, 0, o[2]));
    b.add(new THREE.ConeGeometry(1.85, 3.0, 24).translate(0, 8.7, 0), roof, M(o[0] + x, 0, o[2]));
  }
  // the brain: a big folded pink dome with a centre fissure, behind the wall
  const brain = new THREE.SphereGeometry(10, 48, 32); brain.scale(1.35, 0.8, 1.0); brain.translate(o[0], 4.2, o[2] - 15);
  b.add(brain, lam("brain", () => ({ map: rep(brainTex(), 2, 1) })));
  b.add(new THREE.BoxGeometry(0.5, 2, 20).translate(o[0], 12.0, o[2] - 15), lam("fissure", () => ({ color: "#b85f78" })));
  for (const [x, z] of [[-9, 6], [8, 7], [-14, 14], [13, 16], [-6, -5], [6, -4]]) prop(b, kit, "tree_oak", o[0] + x, 0, o[2] + z, 5.5);
  for (let i = 0; i < 8; i++) prop(b, kit, i % 2 ? "flower_redA" : "flower_yellowA", o[0] + (i % 2 ? 2.6 : -2.6), 0, o[2] + 4 + i * 2.6, 0.45);
  b.build(g);
  return g;
};

// ---------------- the capitol ----------------
export const buildCap = (kit: Kit, o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  floor(b, o, -200, -150, 200, 200, lam("grassHD", () => ({ map: grassHD() })), 4);
  floor(b, o, -10, 12, 10, 120, lam("cobbleHD", () => ({ map: cobbleHD() })), 4, 0.012);
  const white = lam("capStone", () => ({ map: stoneHD("capHD", ["#f4f0e7", "#ece7dc", "#f7f3ec", "#e6e0d3"], "#d2c9b8") })), col = lam("capCol", () => ({ color: "#f3efe6" }));
  box(b, o, -15, 0, -10, 15, 12, 10, white, 2);
  for (const s of [-1, 1]) box(b, o, s < 0 ? -48 : 15, 0, -8, s < 0 ? -15 : 48, 10, 8, white, 2);
  for (const s of [-1, 1]) box(b, o, s * 38 - 6, 0, 8, s * 38 + 6, 10, 11, white, 2);
  // portico: 8 columns, entablature and pediment, steps
  for (let i = 0; i < 8; i++) b.add(cylG(0.55, 0.5, 9.6, 14), col, M(o[0] - 8.75 + i * 2.5, 0.8, o[2] + 12));
  box(b, o, -10, 10.4, 10, 10, 11.6, 13, white, 2);
  const ped = new THREE.BufferGeometry().setFromPoints([V(o[0] - 10.2, 11.6, o[2] + 13.01), V(o[0] + 10.2, 11.6, o[2] + 13.01), V(o[0], 14.2, o[2] + 13.01)]);
  ped.computeVertexNormals(); b.add(ped, white);
  for (let k = 0; k < 6; k++) box(b, o, -11 - k * 0.3, 0, 13 + k * 0.9, 11 + k * 0.3, 0.8 - k * 0.13, 14 + k * 0.9, white, 2);
  // drum, colonnade, dome, lantern
  b.add(cylG(7.6, 7.6, 1.2, 40), white, M(o[0], 12, o[2]));
  b.add(cylG(6.6, 6.6, 7.5, 40), white, M(o[0], 13.2, o[2]));
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; b.add(cylG(0.32, 0.3, 6.4, 10), col, M(o[0] + Math.sin(a) * 7.25, 13.2, o[2] + Math.cos(a) * 7.25)); }
  b.add(cylG(7.7, 7.7, 0.8, 40), white, M(o[0], 19.6, o[2]));
  const dome = new THREE.SphereGeometry(6.9, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2); dome.scale(1, 1.25, 1);
  b.add(dome, white, M(o[0], 20.4, o[2]));
  b.add(cylG(1.0, 1.0, 2.6, 16), col, M(o[0], 28.8, o[2]));
  b.add(new THREE.ConeGeometry(1.2, 1.6, 16).translate(0, 0.8, 0), white, M(o[0], 31.4, o[2]));
  for (const x of [-42, -30, -18, 18, 30, 42]) prop(b, kit, "tree_default", o[0] + x, 0, o[2] + 40 + (Math.abs(x) % 4), 7);
  // the desk on the plaza for the stamp
  box(b, o, -0.9 + DESK_REL[0], 0, -0.5 + DESK_REL[2], 0.9 + DESK_REL[0], 0.95, 0.5 + DESK_REL[2], lam("deskWood", () => ({ color: "#6a4430" })));
  b.build(g);
  return g;
};

// ---------------- the bathroom today ----------------
export const buildBath = (_kit: Kit, o: V3) => {
  const g = new THREE.Group(), b = new Batch();
  const tile = lam("bathTiles", () => ({ map: wallTiles() })), white = lam("bathWhite", () => ({ color: "#f7f8f8" })), inner = lam("cabInner", () => ({ color: "#dfe6ea" }));
  floor(b, o, -6, -1, 6, 8, lam("bathFloor", () => ({ map: tiles("bathFloorT", "#c9d2d6", "#b5c0c5", 8) })), 2);
  box(b, o, -6, 0, -0.62, 6, 3.6, -0.5, tile, 0.8);
  // cabinet: frame, back, two glass shelves
  const [cx, cy, cz] = [0, 1.55, -0.32];
  box(b, o, cx - 0.42, cy - 0.47, cz - 0.18, cx + 0.42, cy - 0.43, cz + 0.17, white);
  box(b, o, cx - 0.42, cy + 0.43, cz - 0.18, cx + 0.42, cy + 0.47, cz + 0.17, white);
  for (const s of [-1, 1]) box(b, o, cx + s * 0.42 - 0.02, cy - 0.47, cz - 0.18, cx + s * 0.42 + 0.02, cy + 0.47, cz + 0.17, white);
  box(b, o, cx - 0.42, cy - 0.47, cz - 0.19, cx + 0.42, cy + 0.47, cz - 0.17, inner);
  for (const y of [-0.17, 0.15]) box(b, o, cx - 0.4, cy + y - 0.01, cz - 0.17, cx + 0.4, cy + y + 0.01, cz + 0.15, lam("glassShelf", () => ({ color: "#d4ecef" })));
  // open mirror door on the right hinge
  const door = new THREE.BoxGeometry(0.84, 0.94, 0.03); door.translate(0.42, 0, 0); door.rotateY(-0.8); door.translate(o[0] + cx + 0.42, cy, o[2] + cz + 0.17);
  b.add(door, lam("mirror", () => ({ color: "#bcd0d8" })));
  // things on the shelves (the aspirin box is its own mesh, world.ts)
  b.add(cylG(0.035, 0.035, 0.12, 12), lam("cupBlue", () => ({ color: "#4a9ad8" })), M(o[0] - 0.28, cy - 0.16, o[2] + cz - 0.02));
  b.add(cylG(0.006, 0.006, 0.17, 6), lam("brushPink", () => ({ color: "#e86a8a" })), M(o[0] - 0.29, cy - 0.12, o[2] + cz - 0.02));
  box(b, o, cx - 0.33, cy + 0.16, cz - 0.08, cx - 0.12, cy + 0.27, cz + 0.02, lam("plasters", () => ({ color: "#e8a23a" })));
  for (const [x, colr] of [[0.18, "#5fb07a"], [0.3, "#f2f2f2"]] as const) b.add(cylG(0.03, 0.03, 0.13, 12), lam("pot" + colr, () => ({ color: colr })), M(o[0] + x, cy + 0.16, o[2] + cz - 0.03));
  // sink
  box(b, o, -0.45, 0.78, -0.5, 0.45, 0.92, -0.05, white);
  b.add(cylG(0.02, 0.02, 0.16, 8), lam("chrome", () => ({ color: "#c9d2d8" })), M(o[0], 0.92, o[2] - 0.42));
  b.build(g);
  return g;
};
/** aspirin box: white, a coloured band, a white cross on the band (no letters) */
export const aspirinBox = () => {
  const tex = ctex("aspirinBox", 256, 160, (g) => {
    g.fillStyle = "#fbfbfb"; g.fillRect(0, 0, 256, 160);
    g.fillStyle = "#2f8a4f"; g.fillRect(0, 58, 256, 44);
    g.fillStyle = "#ffffff"; g.fillRect(118, 64, 20, 32); g.fillRect(112, 70, 32, 20);
    g.fillStyle = "#c8323a"; g.fillRect(0, 140, 256, 8);
  });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.06), twoTone(new THREE.MeshLambertMaterial({ map: tex })));
  m.castShadow = true; m.receiveShadow = true;
  return m;
};

/** the set library: kind -> builder (origin = where the engine places this set instance) */
export const SET_KINDS = {
  lab: buildLab, shop: buildPharm, ward: buildWard, street: buildStreet, brainCastle: buildBrain, capitol: buildCap, bathroom: buildBath,
} as const;
export type SetKind = keyof typeof SET_KINDS;
/** what each set sounds like (audio.py room tones) and where its open side is */
export const SET_AMBIENCE: Record<SetKind, string> = { lab: "lab", shop: "shop", ward: "room", street: "street", brainCastle: "outdoor", capitol: "outdoor", bathroom: "room" };
/** bottle shelf row for props: all one colour when color is given */
export const shelfRowExport = (b: Batch, o: V3, x0: number, x1: number, y: number, z: number, seed: number, color?: string) => {
  let x = x0, i = 0;
  while (x < x1) { const h = 0.18 + ((seed * 7 + i * 13) % 5) * 0.035; addBottle(b, color ?? SHELF_COLS[(seed + i * 3) % SHELF_COLS.length], o[0] + x, o[1] + y, o[2] + z, h); x += h * 0.62 + 0.03; i++; }
};
