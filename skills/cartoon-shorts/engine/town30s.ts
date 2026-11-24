// 1930s town kit: a corner grocery interior and a downtown main street (shop row, awnings, lamp posts, hydrants,
// parked sedans, parking meters, a street clock) + props (parking meter with an expired flag, shopping cart, 1930s
// sedan, street clock). Layout and palette ported from the Version Six "animated-shorts-kit" (grocery + downtown kits),
// rebuilt for this engine (Batch + two-tone Lambert, ink pass). Signs carry NO text (Turkish shorts): colour bands and
// simple emblems instead of words, so any story can use them.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex } from "./paint";
export type V3 = [number, number, number];

const M = (x: number, y: number, z: number) => new THREE.Matrix4().makeTranslation(x, y, z);
const box = (b: Batch, o: V3, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, mat: THREE.Material, tile = 0) =>
  b.add(boxGeo(V(o[0] + x0, o[1] + y0, o[2] + z0), V(o[0] + x1, o[1] + y1, o[2] + z1), tile), mat);
const cylG = (r0: number, r1: number, h: number, seg = 16) => new THREE.CylinderGeometry(r1, r0, h, seg).translate(0, h / 2, 0);
const col = (c: string) => lam("t30" + c, () => ({ color: c }));
const flat = (b: Batch, o: V3, x0: number, z0: number, x1: number, z1: number, mat: THREE.Material, tile: number, y = 0) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv as THREE.BufferAttribute, p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / tile, -p.getZ(i) / tile);
  b.add(g.translate(o[0] + (x0 + x1) / 2, o[1] + y, o[2] + (z0 + z1) / 2), mat);
};
const INK = "#241726";
/** kit palette: warm oranges vs teals, creams, browns */
export const PAL30 = { ink: INK, warm: ["#d0532f", "#c8432a", "#b2391f", "#f2992a", "#f2b234"], teal: ["#2f6f73", "#3f9a8c", "#3f8a86", "#2a5f9a", "#5b7fb5", "#3d4a66"],
  cream: ["#f4ead6", "#f2e3c0", "#fbf3e0", "#e8d8b0", "#efe0c0"], wood: ["#7a3b22", "#8a5a32", "#6b5240", "#4a2418"] };

// ---------------- painted surfaces ----------------
/** cream / teal checker linoleum, bevelled, scuffed; 1 tile = 1 m with 4 x 4 checks */
const lino = () => ctex("t30lino", 512, 512, (g, r) => {
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const teal = (i + j) % 2 === 0; g.fillStyle = teal ? "#3b8884" : "#eadfc4"; g.fillRect(i * 128, j * 128, 128, 128);
    g.fillStyle = teal ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.35)"; g.fillRect(i * 128 + 4, j * 128 + 4, 120, 5); g.fillRect(i * 128 + 4, j * 128 + 4, 5, 120);
    g.fillStyle = "rgba(36,23,38,.18)"; g.fillRect(i * 128 + 4, j * 128 + 119, 120, 5); g.fillRect(i * 128 + 119, j * 128 + 4, 5, 120);
  }
  g.strokeStyle = "rgba(36,23,38,.5)"; g.lineWidth = 4;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); }
  for (let k = 0; k < 1200; k++) { g.fillStyle = `rgba(36,23,38,${r() * 0.08})`; g.fillRect(r() * 512, r() * 512, 3, 3); }
});
/** striped wallpaper with diamonds over a panelled wainscot (1.1 m), chair rail and crown; tile 4 m x 4.4 m */
const wallpaper = () => ctex("t30paper", 512, 564, (g, r) => {
  const top = 564 - 141;
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#e0a85a" : "#eec47e"; g.fillRect(i * 40, 0, 40, top); }
  for (let i = 0; i < 13; i += 2) for (let y = 60; y < top - 20; y += 52) {
    const x = i * 40 + 40, yy = y + (i % 4 ? 26 : 0);
    g.fillStyle = "rgba(160,80,40,.35)"; g.beginPath(); g.moveTo(x, yy - 12); g.lineTo(x + 8, yy); g.lineTo(x, yy + 12); g.lineTo(x - 8, yy); g.closePath(); g.fill();
  }
  for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(90,50,20,${r() * 0.05})`; g.fillRect(r() * 512, r() * top, 4, 4); }
  g.fillStyle = "#f2e3c0"; g.fillRect(0, 0, 512, 20); g.fillStyle = "rgba(36,23,38,.3)"; g.fillRect(0, 20, 512, 6);
  g.fillStyle = "#7a3b22"; g.fillRect(0, top, 512, 141);
  for (let i = 0; i < 2; i++) { const x = i * 256 + 14; g.fillStyle = "#6a3019"; g.fillRect(x, top + 26, 228, 90); g.fillStyle = "#8b4a2b"; g.fillRect(x + 8, top + 34, 212, 74); }
  g.fillStyle = "#f2e3c0"; g.fillRect(0, top - 6, 512, 16); g.fillStyle = "rgba(36,23,38,.35)"; g.fillRect(0, top + 10, 512, 6);
  g.fillStyle = "#4e2314"; g.fillRect(0, 564 - 18, 512, 18);
});
/** can / box / jar label without letters: band colours + an emblem */
const labelTex = (k: number) => ctex("t30lab" + k, 256, 128, (g) => {
  const C = ["#c8432a", "#2f6f73", "#f2b234", "#2a5f9a", "#3f6a4a", "#8a3a5a"][k % 6];
  g.fillStyle = "#f6f1e4"; g.fillRect(0, 0, 256, 128); g.fillStyle = C; g.fillRect(0, 0, 256, 30); g.fillRect(0, 98, 256, 30);
  g.fillStyle = INK; g.fillRect(0, 30, 256, 3); g.fillRect(0, 95, 256, 3);
  for (const cx of [64, 192]) { g.beginPath(); g.ellipse(cx, 64, 30, 24, 0, 0, 7); g.fillStyle = "#fff"; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.arc(cx, 64, 11, 0, 7); g.fillStyle = C; g.fill(); }
});
const windowDay = () => ctex("t30window", 256, 384, (g) => {
  g.fillStyle = "#5a3826"; g.fillRect(0, 0, 256, 384);
  const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, "#9cc8ec"); gr.addColorStop(0.6, "#f3d29a"); gr.addColorStop(1, "#d8b088");
  g.fillStyle = gr; g.fillRect(14, 14, 228, 356);
  g.fillStyle = "rgba(120,90,80,.45)"; for (let i = 0; i < 4; i++) g.fillRect(20 + i * 58, 210 - (i % 2) * 40, 50, 160);
  g.fillStyle = "#5a3826"; g.fillRect(122, 14, 12, 356); g.fillRect(14, 180, 228, 10);
  g.fillStyle = "rgba(255,255,255,.45)"; g.beginPath(); g.moveTo(30, 360); g.lineTo(80, 30); g.lineTo(100, 30); g.lineTo(50, 360); g.fill();
});
const clockFace = () => ctex("t30clock", 128, 128, (g) => {
  g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, 128, 128);
  g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fillStyle = "#fbf3e0"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillStyle = INK; g.fillRect(64 + Math.cos(a) * 46 - 3, 64 + Math.sin(a) * 46 - 3, 6, 6); }
  g.lineCap = "round"; g.lineWidth = 7; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 30); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(92, 70); g.stroke();
});

// ---------------- grocery (1930s corner store) ----------------
/** interior open toward +z. Back wall z -4 with shelves of cans / boxes / jars (x ±1.3..5.8, shelf tops y 0.45-2.45),
 *  counter x -1.8..1.8 z -2.0..-1.35 top **1.0** (register at x 1.2), grocer behind at (0, -2.7), customers z >= -0.6.
 *  Barrels (-4.8, -1.2) (-5.3, 0.2), sacks (4.6, -1.0) (5.2, 0.3), fruit crates x ±3 z 1.2, window on the left wall x -6.4,
 *  wall clock (0, 3.3, -3.97), pendant lamps y 3.5. Wide: camera (0.6, 1.8, 7.2) -> (0, 1.3, -2), fov 42. */
export const GROCERY_COUNTER_Y = 1.0;
export const buildGrocery = (kit: Kit, o: V3) => {
  void kit;
  const g = new THREE.Group(), b = new Batch(), wd = col("#7a3b22"), wdL = col("#8a5a32");
  const paper = lam("t30paperM", () => ({ map: wallpaper() }));
  flat(b, o, -9, -4.4, 9, 22, lam("t30linoM", () => ({ map: lino() })), 1);
  b.add(boxGeo(V(o[0] - 6.8, 0, o[2] - 4.4), V(o[0] + 6.8, 4.4, o[2] - 4.0), 4), paper);
  box(b, o, -6.8, 4.4, -4.4, 6.8, 6.5, -4.0, col("#eadbb2")); // tin frieze above the paper
  b.add(boxGeo(V(o[0] - 6.8, 0, o[2] - 4.4), V(o[0] - 6.4, 4.4, o[2] + 14)), paper); box(b, o, -6.8, 4.4, -4.4, -6.4, 6.5, 14, col("#eadbb2"));
  b.add(boxGeo(V(o[0] + 6.4, 0, o[2] - 4.4), V(o[0] + 6.8, 4.4, o[2] + 14)), paper); box(b, o, 6.4, 4.4, -4.4, 6.8, 6.5, 14, col("#eadbb2"));
  b.add(new THREE.PlaneGeometry(2.4, 2.4).rotateY(Math.PI / 2).translate(o[0] - 6.39, 2.1, o[2] - 0.6), lam("t30winM", () => ({ map: windowDay() })));
  // shelves full of goods on the back wall
  const shelf = (x0: number, x1: number, seed: number) => {
    box(b, o, x0 - 0.08, 0, -4.0, x0, 2.9, -3.45, wd); box(b, o, x1, 0, -4.0, x1 + 0.08, 2.9, -3.45, wd);
    box(b, o, x0, 2.85, -4.0, x1, 2.95, -3.42, wd);
    let k = seed;
    for (const y of [0.45, 0.95, 1.45, 1.95, 2.45]) {
      box(b, o, x0, y - 0.05, -4.0, x1, y, -3.45, wdL);
      let x = x0 + 0.06;
      while (x < x1 - 0.2) {
        const kind = (k * 7 + Math.floor(y * 10)) % 3, lab = lam("t30labM" + (k % 6), () => ({ map: labelTex(k % 6) }));
        if (kind === 0) { // a short row of cans
          for (const dz of [-3.82, -3.62]) b.add(cylG(0.07, 0.07, 0.17, 14), lab, M(o[0] + x + 0.07, o[1] + y, o[2] + dz));
          x += 0.17;
        } else if (kind === 1) { // a cereal / soap box
          box(b, o, x, y, -3.85, x + 0.18, y + 0.32, -3.6, lab); x += 0.21;
        } else { // a glass jar with a coloured lid
          b.add(cylG(0.08, 0.08, 0.2, 14), col("#d8eaf0"), M(o[0] + x + 0.08, o[1] + y, o[2] - 3.72));
          b.add(cylG(0.085, 0.085, 0.04, 14), col(PAL30.warm[k % 5]), M(o[0] + x + 0.08, o[1] + y + 0.2, o[2] - 3.72)); x += 0.19;
        }
        k++;
      }
    }
  };
  shelf(-5.8, -1.3, 1); shelf(1.3, 5.8, 4);
  // back door between the shelves + wall clock above
  box(b, o, -0.9, 0, -4.02, 0.9, 2.5, -3.98, col("#5a3826")); box(b, o, -0.7, 1.3, -3.99, 0.7, 2.3, -3.97, col("#e8d8b0"));
  b.add(new THREE.CircleGeometry(0.34, 32).translate(o[0], 3.35, o[2] - 3.96), lam("t30clockM", () => ({ map: clockFace(), transparent: true })));
  // counter with a marble top, cash register, scales, a jar of sweets
  box(b, o, -1.8, 0, -2.0, 1.8, 0.94, -1.35, col("#2f6f73")); box(b, o, -1.9, 0.94, -2.05, 1.9, GROCERY_COUNTER_Y, -1.3, col("#efe7d6"));
  for (let i = 0; i < 4; i++) box(b, o, -1.6 + i * 0.95, 0.15, -1.36, -1.0 + i * 0.95, 0.8, -1.33, col("#3f8a86"));
  box(b, o, 0.9, 1.0, -1.95, 1.5, 1.32, -1.45, col("#d9a84a")); box(b, o, 0.95, 1.32, -1.9, 1.45, 1.52, -1.7, col("#c9922e"));
  box(b, o, 1.05, 1.15, -1.46, 1.35, 1.27, -1.44, col("#f6f1e4"));
  b.add(cylG(0.11, 0.11, 0.26, 18), col("#d8eaf0"), M(o[0] - 1.2, 1.0, o[2] - 1.65)); b.add(cylG(0.12, 0.12, 0.04, 18), col("#c8432a"), M(o[0] - 1.2, 1.26, o[2] - 1.65));
  b.add(cylG(0.13, 0.13, 0.02, 20), col("#c9a043"), M(o[0] - 0.4, 1.12, o[2] - 1.7)); b.add(cylG(0.02, 0.02, 0.12, 8), col("#c9a043"), M(o[0] - 0.4, 1.0, o[2] - 1.7));
  // barrels, burlap sacks, fruit crates
  for (const [x, z] of [[-4.8, -1.2], [-5.3, 0.2]] as const) {
    b.add(cylG(0.38, 0.38, 0.95, 20), col("#b8864e"), M(o[0] + x, 0, o[2] + z));
    for (const y of [0.15, 0.75]) b.add(cylG(0.395, 0.395, 0.06, 20), col("#3a3d47"), M(o[0] + x, y, o[2] + z));
  }
  for (const [x, z] of [[4.6, -1.0], [5.2, 0.3]] as const) b.add(new THREE.SphereGeometry(0.4, 16, 12).scale(1, 1.3, 0.8), col("#d6b98a"), M(o[0] + x, 0.5, o[2] + z));
  for (const s of [-1, 1]) {
    box(b, o, s * 3 - 0.45, 0, 0.9, s * 3 + 0.45, 0.45, 1.5, col("#c79a5c"));
    for (let i = 0; i < 6; i++) b.add(new THREE.SphereGeometry(0.1, 12, 8), col(s < 0 ? "#d0532f" : "#f2b234"), M(o[0] + s * 3 - 0.3 + (i % 3) * 0.3, 0.5, o[2] + 1.05 + Math.floor(i / 3) * 0.3));
  }
  // pendant lamps (warm emissive shades) and a pressed-tin ceiling edge
  for (const x of [-2.6, 0, 2.6]) {
    b.add(cylG(0.012, 0.012, 1.0, 6), col("#2a2830"), M(o[0] + x, 3.4, o[2] - 1.2));
    b.add(new THREE.ConeGeometry(0.3, 0.22, 18, 1, true).translate(0, -0.11, 0), lam("t30shade", () => ({ color: "#2f6f73", side: THREE.DoubleSide })), M(o[0] + x, 3.42, o[2] - 1.2));
    b.add(new THREE.SphereGeometry(0.1, 12, 8), lam("t30bulb", () => ({ color: "#ffe9b0", emissive: "#ffcf70", emissiveIntensity: 0.7 })), M(o[0] + x, 3.24, o[2] - 1.2));
  }
  b.build(g);
  return g;
};

// ---------------- downtown (1930s main street) ----------------
type Unit = { x0: number; x1: number; floors: number; wall: string; brick: boolean; trim: string; sign: string; awn?: [string, string]; tank?: boolean; blade?: string };
const UNITS: Unit[] = [
  { x0: -42, x1: -36, floors: 4, wall: "#b9552f", brick: true, trim: "#f2e3c0", sign: "#241726", blade: "#e9b64a" },
  { x0: -36, x1: -31, floors: 2, wall: "#efe0c0", brick: false, trim: "#2f6f73", sign: "#2f6f73", awn: ["#2f6f73", "#fbf3e0"] },
  { x0: -31, x1: -25.4, floors: 3, wall: "#6b3a2a", brick: true, trim: "#e8d8b0", sign: "#5a3a5a", blade: "#f2c23a", tank: true },
  { x0: -25.4, x1: -20, floors: 3, wall: "#d9a050", brick: true, trim: "#f2e3c0", sign: "#c8432a", awn: ["#c8432a", "#f6e7b4"] },
  { x0: -20, x1: -14.6, floors: 1, wall: "#a8d0b8", brick: false, trim: "#f8efe0", sign: "#b2391f", awn: ["#c8432a", "#fbf3e0"] },
  { x0: -14.6, x1: -9.6, floors: 2, wall: "#b9552f", brick: true, trim: "#f2e3c0", sign: "#2e5a4a", awn: ["#2e5a4a", "#f2e3c0"], blade: "#2e5a4a" },
  { x0: -9.6, x1: -4.1, floors: 2, wall: "#e9b0a0", brick: false, trim: "#f8efe0", sign: "#8a3a5a", awn: ["#d0607a", "#fbf3e0"] },
  { x0: -4.1, x1: 4.1, floors: 2, wall: "#efe0c0", brick: false, trim: "#c8432a", sign: "#c8432a", awn: ["#c8432a", "#f4e8c8"] }, // the hero shop (grocery front)
  { x0: 4.1, x1: 9.6, floors: 2, wall: "#d9a050", brick: true, trim: "#f2e3c0", sign: "#27493f", awn: ["#2f6f53", "#f2e3c0"] },
  { x0: 9.6, x1: 14.4, floors: 3, wall: "#6b3a2a", brick: true, trim: "#e8d8b0", sign: "#241726", blade: "#f2e3c0" },
  { x0: 14.4, x1: 19.4, floors: 2, wall: "#efe0c0", brick: false, trim: "#b2391f", sign: "#b2391f", awn: ["#c8432a", "#fbf3e0"], blade: "#b2391f" },
  { x0: 19.4, x1: 25.4, floors: 3, wall: "#d8cdb4", brick: false, trim: "#8a8070", sign: "#3a4a5a", tank: true },
  { x0: 25.4, x1: 30.4, floors: 2, wall: "#b9552f", brick: true, trim: "#f2e3c0", sign: "#2a5f9a", awn: ["#2a5f9a", "#f2e3c0"] },
  { x0: 30.4, x1: 36, floors: 1, wall: "#3f8a86", brick: false, trim: "#f2e3c0", sign: "#f2992a", awn: ["#f2992a", "#fbf3e0"] },
  { x0: 36, x1: 42, floors: 4, wall: "#b9552f", brick: true, trim: "#f2e3c0", sign: "#241726", blade: "#e9b64a", tank: true },
];
const GF = 4.4, FLH = 3.3;
/** one painted facade per unit: brick or paint, upper windows, display windows + door, an empty sign board, cornice */
const facadeTex = (u: Unit, i: number) => {
  const wm = u.x1 - u.x0, hm = GF + (u.floors - 1) * FLH + 0.7, PX = 48, W = Math.round(wm * PX), H = Math.round(hm * PX), m = (v: number) => v * PX;
  return ctex("t30fac" + i, W, H, (g, r) => {
    g.fillStyle = u.wall; g.fillRect(0, 0, W, H);
    if (u.brick) {
      g.fillStyle = "#d8c9a8"; g.fillRect(0, 0, W, H);
      const bw = m(0.25), bh = m(0.085);
      for (let y = 0, row = 0; y < H; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < W; x += bw) {
        const c = new THREE.Color(u.wall).offsetHSL(0, 0, (r() - 0.5) * 0.08); g.fillStyle = "#" + c.getHexString(); g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
      }
    } else for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "90,60,40"},0.06)`; g.fillRect(r() * W, r() * H, 8 + r() * 30, 4 + r() * 10); }
    // cornice
    g.fillStyle = u.trim; g.fillRect(0, 0, W, m(0.45)); g.fillStyle = "rgba(36,23,38,.35)"; g.fillRect(0, m(0.45), W, m(0.08));
    // upper floors: windows with sills and a lit / dark pane
    const nw = Math.max(2, Math.round(wm / 1.8));
    for (let f = 1; f < u.floors; f++) {
      const y0 = H - m(GF + f * FLH) + m(0.8);
      for (let k = 0; k < nw; k++) {
        const x = (k + 0.5) * (W / nw) - m(0.45);
        g.fillStyle = u.trim; g.fillRect(x - m(0.08), y0 - m(0.1), m(1.06), m(1.9));
        g.fillStyle = r() < 0.3 ? "#f3d9a0" : "#3d4a66"; g.fillRect(x, y0, m(0.9), m(1.6));
        g.fillStyle = u.trim; g.fillRect(x + m(0.42), y0, m(0.06), m(1.6)); g.fillRect(x, y0 + m(0.75), m(0.9), m(0.06));
        g.fillStyle = "rgba(36,23,38,.4)"; g.fillRect(x - m(0.1), y0 + m(1.6), m(1.1), m(0.1));
      }
    }
    // ground floor: sign board, display windows, door
    const gy = H - m(GF);
    g.fillStyle = u.sign; g.fillRect(m(0.3), gy + m(0.25), W - m(0.6), m(0.85));
    g.strokeStyle = u.trim; g.lineWidth = m(0.06); g.strokeRect(m(0.4), gy + m(0.33), W - m(0.8), m(0.69));
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(W / 2 + (k - 1) * m(0.5), gy + m(0.67), m(0.13), 0, 7); g.fillStyle = u.trim; g.fill(); } // emblem dots (no letters)
    const dw = m(1.1), dx = W / 2 - dw / 2;
    g.fillStyle = u.trim; g.fillRect(m(0.25), gy + m(1.3), W - m(0.5), m(GF - 1.3));
    const wy = gy + m(1.45), wh = m(GF - 1.45 - 0.55);
    for (const [x0, x1] of [[m(0.4), dx - m(0.15)], [dx + dw + m(0.15), W - m(0.4)]]) {
      const gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, "#9ec3d6"); gr.addColorStop(1, "#3d4a66");
      g.fillStyle = gr; g.fillRect(x0, wy, x1 - x0, wh);
      for (let q = 0; q < 4; q++) { g.fillStyle = PAL30.warm[(i + q) % 5]; g.fillRect(x0 + (q + 0.3) * (x1 - x0) / 4.4, wy + wh * 0.62, (x1 - x0) / 6, wh * 0.38); } // display goods
      g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(x0 + m(0.2), wy + wh); g.lineTo(x0 + m(0.7), wy); g.lineTo(x0 + m(0.95), wy); g.lineTo(x0 + m(0.45), wy + wh); g.fill();
    }
    g.fillStyle = "#4a2418"; g.fillRect(dx, wy - m(0.1), dw, H - wy + m(0.1));
    g.fillStyle = "#9ec3d6"; g.fillRect(dx + m(0.15), wy + m(0.1), dw - m(0.3), m(1.3));
    g.fillStyle = "#e9b64a"; g.beginPath(); g.arc(dx + dw - m(0.2), H - m(1.0), m(0.05), 0, 7); g.fill();
    g.fillStyle = "rgba(36,23,38,.5)"; g.fillRect(0, H - m(0.35), W, m(0.35));
  });
};
const awningTex = (a: [string, string]) => ctex("t30awn" + a[0], 512, 128, (g) => {
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a[1] : a[0]; g.fillRect(i * 32, 0, 32, 128); g.fillStyle = "rgba(36,23,38,.18)"; g.fillRect(i * 32, 0, 3, 128); }
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(36,23,38,.28)"); gr.addColorStop(0.35, "rgba(36,23,38,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 128);
});
const asphalt = () => ctex("t30asph", 256, 256, (g, r) => {
  g.fillStyle = "#5c5e6c"; g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 1800; k++) { g.fillStyle = `rgba(255,255,255,${r() * 0.2})`; g.fillRect(r() * 256, r() * 256, 2, 2); }
  for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(36,23,38,${r() * 0.3})`; g.fillRect(r() * 256, r() * 256, 3, 3); }
});
const sidewalk = () => ctex("t30walk", 256, 256, (g, r) => {
  g.fillStyle = "#b9b3a8"; g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 1200; k++) { g.fillStyle = `rgba(255,255,255,${r() * 0.2})`; g.fillRect(r() * 256, r() * 256, 2, 2); }
  g.strokeStyle = "rgba(36,23,38,.55)"; g.lineWidth = 4; g.strokeRect(0, 0, 256, 256);
});

/** main street along x. Shop row facing +z with facades at z -8 (x -42..42; the hero shop with the red-cream awning at
 *  x -4.1..4.1, its door at (0, -8)), sidewalk z -8..-4 (y 0.15), curb z -4, road z -4..10 (centre line z 3),
 *  far sidewalk z 10..14, a second shop row facing -z at z 14 (reverse shots; keep the camera at z < 12). Lamp posts on the near sidewalk at
 *  z -4.6 every 9 m (x ±4.5, ±13.5, ...), hydrant (-6.5, -4.7), mailbox (6.6, -4.7), bins, a street clock (11, -4.8).
 *  Parked cars / meters are props (sedan, meter). People on the sidewalk: y 0.15, z -7..-4.8.
 *  Wide: camera (2, 2.2, 9) -> (0, 2.2, -8), fov 44; along the street: camera (-14, 1.8, -2.5) -> (6, 1.6, -6). */
export const buildDowntown = (kit: Kit, o: V3) => {
  void kit;
  const g = new THREE.Group(), b = new Batch(), iron = col("#2a2f38"), trimC = col("#f2e3c0");
  flat(b, o, -80, -4, 80, 10, lam("t30asphM", () => ({ map: asphalt() })), 3);
  for (let x = -78; x < 78; x += 4) box(b, o, x, 0, 2.92, x + 2, 0.012, 3.08, col("#e9d68a")); // dashed centre line
  const walk = lam("t30walkM", () => ({ map: sidewalk() }));
  box(b, o, -80, 0, -8.5, 80, 0.15, -4, walk, 1.5); box(b, o, -80, 0, 10, 80, 0.15, 14, walk, 1.5);
  box(b, o, -80, 0, -4.12, 80, 0.16, -4, col("#8f8a80")); box(b, o, -80, 0, 10, 80, 0.16, 10.12, col("#8f8a80"));
  flat(b, o, -200, -200, 200, -40, col("#c9b28a"), 10, -0.01); // far ground
  const row = (side: 1 | -1, zf: number, shift: number) => UNITS.forEach((u0, i) => {
    const u = side > 0 ? u0 : { ...UNITS[(i + 5) % UNITS.length], x0: u0.x0, x1: u0.x1, floors: UNITS[(i + 5) % UNITS.length].floors };
    const h = GF + (u.floors - 1) * FLH + 0.7, w = u.x1 - u.x0, cx = (u.x0 + u.x1) / 2 + shift, D = 6;
    const zb = side > 0 ? zf - D : zf, ze = side > 0 ? zf : zf + D;
    box(b, o, u.x0 + shift, 0, zb, u.x1 + shift, h, ze, col(u.wall));
    const face = new THREE.PlaneGeometry(w, h); if (side < 0) face.rotateY(Math.PI);
    b.add(face.translate(o[0] + cx, h / 2, o[2] + zf + side * 0.02), lam("t30facM" + (side > 0 ? i : 100 + i), () => ({ map: facadeTex(u, side > 0 ? i : 100 + i) })));
    box(b, o, u.x0 + shift - 0.05, h - 0.45, zf - (side > 0 ? 0 : 0.35), u.x1 + shift + 0.05, h, zf + (side > 0 ? 0.35 : 0), trimC); // cornice lip
    if (u.awn) { // sloped striped awning + valance
      const d = 1.6, a = new THREE.PlaneGeometry(w - 0.4, Math.hypot(d, 0.6));
      a.rotateX(side > 0 ? -Math.PI / 2 + Math.atan2(0.6, d) : Math.PI / 2 - Math.atan2(0.6, d)); if (side < 0) a.rotateY(Math.PI);
      b.add(a.translate(o[0] + cx, 3.35, o[2] + zf + side * d / 2), lam("t30awnM" + u.awn[0], () => ({ map: awningTex(u.awn!), side: THREE.DoubleSide })));
      box(b, o, u.x0 + shift + 0.2, 2.8, zf + side * d - 0.02, u.x1 + shift - 0.2, 3.05, zf + side * d + 0.02, col(u.awn[0]));
    }
    if (u.blade) { // blade sign sticking out (blank board, two-colour)
      box(b, o, cx + w / 2 - 0.6 - 0.05, 4.6, zf + side * 0.2, cx + w / 2 - 0.6 + 0.05, 7.2, zf + side * 1.3, col(u.blade));
      box(b, o, cx + w / 2 - 0.6 - 0.06, 4.8, zf + side * 0.35, cx + w / 2 - 0.6 + 0.06, 7.0, zf + side * 1.15, col(u.sign));
    }
    if (u.tank) { // rooftop water tank on legs
      const tz = zf - side * 3;
      for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) box(b, o, cx + dx - 0.05, h, tz + dz - 0.05, cx + dx + 0.05, h + 1.4, tz + dz + 0.05, iron);
      b.add(cylG(0.9, 0.9, 1.6, 18), col("#8a5a32"), M(o[0] + cx, h + 1.4, o[2] + tz));
      b.add(new THREE.ConeGeometry(1.0, 0.6, 18).translate(0, 0.3, 0), col("#4a2418"), M(o[0] + cx, h + 3.0, o[2] + tz));
    }
  });
  row(1, -8, 0); row(-1, 14, 0);
  // end towers closing the street at both ends
  for (const s of [-1, 1]) box(b, o, s * 44 - 4, 0, -14, s * 44 + 4, 22, 20, col(s < 0 ? "#b9552f" : "#d8cdb4"), 2);
  // lamp posts (tapered, flared foot, globe)
  for (const x of [-31.5, -22.5, -13.5, -4.5, 4.5, 13.5, 22.5, 31.5]) for (const z of [-4.6, 10.6]) {
    b.add(cylG(0.16, 0.09, 0.4, 12), iron, M(o[0] + x, 0.15, o[2] + z)); b.add(cylG(0.07, 0.045, 3.6, 10), iron, M(o[0] + x, 0.5, o[2] + z));
    b.add(new THREE.SphereGeometry(0.22, 14, 10), lam("t30globe", () => ({ color: "#fff3d0", emissive: "#ffe0a0", emissiveIntensity: 0.4 })), M(o[0] + x, 4.3, o[2] + z));
  }
  // hydrant, mailbox, bins
  b.add(cylG(0.16, 0.12, 0.6, 12), col("#c8432a"), M(o[0] - 6.5, 0.15, o[2] - 4.7)); b.add(new THREE.SphereGeometry(0.13, 12, 8), col("#c8432a"), M(o[0] - 6.5, 0.75, o[2] - 4.7));
  box(b, o, 6.35, 0.15, -4.95, 6.85, 1.25, -4.45, col("#2a5f9a")); b.add(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 14, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), col("#2a5f9a"), M(o[0] + 6.6, 1.25, o[2] - 4.7));
  for (const x of [-17, 9.5, 27]) b.add(cylG(0.24, 0.3, 0.75, 14), col("#5a6a5a"), M(o[0] + x, 0.15, o[2] - 4.7));
  b.build(g);
  const clk = streetClockProp(); clk.position.set(o[0] + 11, o[1] + 0.15, o[2] - 4.8); g.add(clk);
  return g;
};

// ---------------- props ----------------
/** parking meter on a tapered post; `lift` keys 0..1 raise the red EXPIRED flag (the engine turns userData.flag) */
export const meterProp = () => {
  const g = new THREE.Group(), b = new Batch(), O: V3 = [0, 0, 0], iron = col("#3a3f48"), head = col("#7d848c");
  b.add(cylG(0.09, 0.05, 0.12, 12), iron, M(0, 0, 0)); b.add(cylG(0.045, 0.035, 1.1, 10), iron, M(0, 0.1, 0));
  box(b, O, -0.11, 1.08, -0.08, 0.11, 1.36, 0.08, head);
  b.add(new THREE.CylinderGeometry(0.11, 0.11, 0.16, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), head, M(0, 1.36, 0));
  for (const z of [0.081, -0.081]) { const f = new THREE.CircleGeometry(0.075, 20); if (z < 0) f.rotateY(Math.PI); b.add(f, col("#fbf3e0"), M(0, 1.28, z)); }
  box(b, O, 0.06, 1.44, -0.02, 0.1, 1.46, 0.02, iron); // coin slot
  b.build(g);
  const flag = new THREE.Group(), fb = new Batch(), red = col("#c8323a");
  box(fb, O, -0.006, 0, 0.088, 0.006, 0.18, 0.096, red); box(fb, O, -0.006, 0.12, 0.088, 0.1, 0.2, 0.094, red);
  fb.build(flag); flag.position.set(0, 1.2, 0); flag.rotation.z = -Math.PI / 2; flag.scale.setScalar(0.3);
  g.add(flag); g.userData = { flag };
  g.traverse((m) => { if ((m as THREE.Mesh).isMesh) m.castShadow = true; });
  return g;
};
/** wire shopping cart (two stacked baskets, wheels, push handle at x -0.45, y 1.0); length along x, front +x */
export const shopCartProp = () => {
  const g = new THREE.Group(), b = new Batch(), O: V3 = [0, 0, 0], wire = col("#c9ced6"), dark = col("#2a2830");
  const basket = (y: number, h: number) => {
    for (const [x0, x1, z0, z1] of [[-0.4, 0.4, -0.26, -0.24], [-0.4, 0.4, 0.24, 0.26], [-0.42, -0.4, -0.26, 0.26], [0.4, 0.42, -0.26, 0.26]] as const) {
      box(b, O, x0, y, z0, x1, y + 0.02, z1, wire); box(b, O, x0, y + h - 0.02, z0, x1, y + h, z1, wire);
    }
    for (let i = 0; i <= 8; i++) { const x = -0.4 + i * 0.1; for (const z of [-0.25, 0.25]) box(b, O, x - 0.008, y, z - 0.008, x + 0.008, y + h, z + 0.008, wire); }
    for (let i = 0; i <= 5; i++) { const z = -0.25 + i * 0.1; for (const x of [-0.41, 0.41]) box(b, O, x - 0.008, y, z - 0.008, x + 0.008, y + h, z + 0.008, wire); }
    box(b, O, -0.4, y, -0.25, 0.4, y + 0.015, 0.25, wire);
  };
  basket(0.55, 0.3); basket(0.2, 0.22);
  for (const [x, z] of [[-0.42, -0.26], [-0.42, 0.26], [0.42, -0.26], [0.42, 0.26]] as const) box(b, O, x - 0.015, 0.1, z - 0.015, x + 0.015, 0.85, z + 0.015, wire);
  for (const z of [-0.26, 0.26]) box(b, O, -0.62, 0.85, z - 0.015, -0.42, 1.0, z + 0.015, wire);
  b.add(cylG(0.02, 0.02, 0.6).rotateX(Math.PI / 2), col("#c8432a"), M(-0.62, 1.0, 0.3));
  for (const [x, z] of [[-0.38, -0.24], [-0.38, 0.24], [0.38, -0.24], [0.38, 0.24]] as const) b.add(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 14).rotateX(Math.PI / 2), dark, M(x, 0.07, z));
  b.build(g); g.traverse((m) => { if ((m as THREE.Mesh).isMesh) m.castShadow = true; }); return g;
};
/** 1930s sedan: rounded body, separate fenders, running boards, chrome grille + bumpers, white-wall tyres; 4.4 m along x, front +x */
export const sedanProp = (c = "#7a2f2a") => {
  const g = new THREE.Group(), b = new Batch(), O: V3 = [0, 0, 0], paint = col(c), chrome = col("#d9dde2"), tyre = col("#1f1d24"), glass = col("#9ec3d6");
  box(b, O, -2.1, 0.45, -0.78, 2.05, 1.05, 0.78, paint); // body
  b.add(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.25, 0.72, 0.78), paint, M(-0.35, 1.0, 0)); // cabin dome
  for (const z of [-0.79, 0.79]) { const w = new THREE.PlaneGeometry(1.6, 0.42); if (z < 0) w.rotateY(Math.PI); b.add(w, glass, M(-0.35, 1.3, z * 0.97)); }
  box(b, O, 0.75, 1.05, -0.5, 0.8, 1.45, 0.5, glass);
  for (const x of [-1.35, 1.35]) for (const z of [-0.8, 0.8]) {
    b.add(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.6, 0.45, 0.24), paint, M(x, 0.48, z));
    b.add(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 18).rotateX(Math.PI / 2), tyre, M(x, 0.36, z * 1.04));
    b.add(new THREE.CylinderGeometry(0.24, 0.24, 0.23, 18).rotateX(Math.PI / 2), col("#f4f1ea"), M(x, 0.36, z * 1.04));
    b.add(new THREE.CylinderGeometry(0.12, 0.12, 0.24, 14).rotateX(Math.PI / 2), chrome, M(x, 0.36, z * 1.04));
  }
  for (const z of [-0.8, 0.8]) box(b, O, -0.75, 0.3, z - 0.11, 0.75, 0.36, z + 0.11, tyre); // running boards
  for (const x of [-2.18, 2.12]) box(b, O, x - 0.04, 0.38, -0.85, x + 0.04, 0.5, 0.85, chrome);
  box(b, O, 2.04, 0.55, -0.32, 2.08, 0.98, 0.32, chrome);
  for (const z of [-0.5, 0.5]) b.add(new THREE.SphereGeometry(0.13, 12, 10), chrome, M(1.95, 1.05, z));
  b.build(g); g.traverse((m) => { if ((m as THREE.Mesh).isMesh) m.castShadow = m.receiveShadow = true; }); return g;
};
/** cast-iron street clock on a post, two faces (+z / -z), dial centre y 3.4 */
export const streetClockProp = () => {
  const g = new THREE.Group(), b = new Batch(), iron = col("#2a3a34");
  b.add(cylG(0.28, 0.2, 0.35, 14), iron, M(0, 0, 0)); b.add(cylG(0.1, 0.08, 2.8, 12), iron, M(0, 0.35, 0));
  b.add(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 28).rotateX(Math.PI / 2), iron, M(0, 3.4, 0));
  for (const s of [1, -1]) { const f = new THREE.CircleGeometry(0.36, 28); if (s < 0) f.rotateY(Math.PI); b.add(f, lam("t30clockM", () => ({ map: clockFace(), transparent: true })), M(0, 3.4, s * 0.115)); }
  b.add(new THREE.SphereGeometry(0.12, 12, 8), col("#c9a043"), M(0, 3.9, 0));
  b.build(g); return g;
};
