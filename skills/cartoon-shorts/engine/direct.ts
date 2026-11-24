// Spec interpreter: camera (glides, push-ins, punches, kicks), lens (DOF), shot layers (crossfades), and the stage of
// a shot at a frame (cast cards + effect cards). Pure functions of (spec, shot, frame).
import { Spec, ShotSpec, CamKey, V3, FPS, Timeline, ActorSpec, FxSpec } from "./spec";
import { Stage, CamInfo, person, blob, lidAt, q, hh, LEAD, LIGHT, SUN, findSun, FxPlace } from "./cards";
import { Pen, Expr, Outfit, FrontOpts, fxBurst, fxStars, fxPuff, fxNote } from "./toon";
import * as E from "./efx";
import { OUTFITS } from "./outfits";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const add = (o: V3, p: V3): V3 => [o[0] + p[0], o[1] + p[1], o[2] + p[2]];

// ---------------- shots ----------------
export const shotEnd = (spec: Spec, i: number) => (i + 1 < spec.shots.length ? spec.shots[i + 1].a : spec.total);
export const shotIndexAt = (spec: Spec, f: number) => { let i = 0; while (i + 1 < spec.shots.length && f >= spec.shots[i + 1].a) i++; return i; };
export const layersAt = (spec: Spec, f: number): { i: number; alpha: number }[] => {
  for (let i = 1; i < spec.shots.length; i++) {
    const x = spec.xfade?.[i + 1], a = spec.shots[i].a;
    if (x && f >= a - x / 2 && f < a + x / 2) return [{ i: i - 1, alpha: 1 }, { i, alpha: (f - (a - x / 2) + 1) / (x + 1) }];
  }
  return [{ i: shotIndexAt(spec, f), alpha: 1 }];
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 30) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const frame = (k: CamKey, o: V3, f: number): Cam => {
  const look = add(o, k.look), pos = add(o, k.pos), m = pushK(f, k.f, k.push ?? 0.0025, k.punch ?? 0, k.n ?? 30);
  return { pos: [look[0] + (pos[0] - look[0]) * m, look[1] + (pos[1] - look[1]) * m, look[2] + (pos[2] - look[2]) * m], look, fov: k.fov ?? 40, roll: k.roll ?? 0 };
};
const mixC = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
export const kickAt = (spec: Spec, f: number) => {
  let a = 0;
  for (const [f0, g] of spec.kicks ?? []) { const n = Math.floor(f - f0 + 1e-6); if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; }
  return a;
};
const EASE: Record<string, (t: number) => number> = {
  out: (t) => 1 - (1 - t) ** 3, in: (t) => t ** 3,
  back: (t) => { const s = 1.4, x = t - 1; return x * x * ((s + 1) * x + s) + 1; },
};
const spline = (pts: V3[], u: number): V3 => {
  const n = pts.length - 1, x = Math.max(0, Math.min(1, u)) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)) as V3;
};
export const camAt = (spec: Spec, origin: V3, shot: ShotSpec, f: number): Cam => {
  const keys = shot.cam;
  let c = frame(keys[0], origin, f);
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    if (k.cut) { c = frame(k, origin, f); continue; }
    const t = Math.max(0, Math.min(1, (f - k.f) / (k.dur ?? 24))), e = k.ease && EASE[k.ease] ? EASE[k.ease](t) : glide(t), b = frame(k, origin, f);
    const m = mixC(c, b, e);
    if (k.via?.length && t < 1) m.pos = spline([c.pos, ...k.via.map((v) => add(origin, v)), b.pos], e);
    c = m;
  }
  const a = kickAt(spec, f);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1, m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const dofAt = (spec: Spec, f: number) => {
  const D = spec.dof; let i = 0; while (i + 1 < D.length && f >= D[i + 1][0]) i++;
  const [f0, c, dur] = D[i], p = D[Math.max(0, i - 1)][1];
  return dur ? p + (c - p) * Math.min(1, (f - f0) / dur) : c;
};

// ---------------- timelines ----------------
const tl = <T,>(v: Timeline<T> | undefined, f: number, def: T): T => {
  if (v === undefined) return def;
  if (typeof v !== "object" || v === null) return v as T;
  let out = def;
  for (const k of Object.keys(v).map(Number).sort((a, b) => a - b)) if (f >= k - LEAD * FPS) out = (v as Record<number, T>)[k];
  return out;
};
const swaps = (v: Timeline<unknown> | undefined) => (v && typeof v === "object" ? Object.keys(v).map((k) => Number(k) / FPS) : []);
const keys1 = (ks: [number, number][], f: number) => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (f <= ks[i][0]) return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * smooth((f - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]));
  return ks[ks.length - 1][1];
};
export const pathAt = (path: [number, number, number, number, number?][], f: number): [V3, number] => {
  const ax = (j: number) => keys1(path.map((k) => [k[0], (k[j] ?? 0) as number]), f);
  return [[ax(1), ax(2), ax(3)], ax(4)];
};

// ---------------- effect library: kind -> cards at frame f ----------------
type Ctx = { out: Stage; f: number; t: number; o: V3 };
const card = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, p: V3, w: number, h: number, extra: Partial<FxPlace> = {}) =>
  c.out.fx.push({ key, cw, ch, draw, x: c.o[0] + p[0], y: c.o[1] + p[1], z: c.o[2] + p[2], w, h, ...extra });
const once = (c: Ctx, x: FxSpec, dur: number, fn: (u: number) => void) => { const u = (c.f - (x.f ?? 0)) / (x.dur ?? dur); if (u >= 0 && u < 1) fn(q(u, 24)); };
const live = (c: Ctx, x: FxSpec) => c.f >= (x.f ?? x.f0 ?? -1e9) && c.f < (x.until ?? 1e9);
const STATIC: Record<string, [number, number, (p: Pen) => void]> = {
  tablets: [320, 200, E.fxTablets], paper: [600, 800, E.fxPaper], tophat: [300, 280, E.fxTopHat], moustache: [300, 140, E.fxMoustache],
  sack: [300, 320, E.fxSack], stamp: [300, 420, E.fxStamp],
  guide: [300, 400, E.fxGuide], tyre: [300, 300, E.fxTyre], rosette: [300, 300, E.fxRosette], dish: [360, 260, E.fxDish],
};
export const FX: Record<string, (c: Ctx, x: FxSpec) => void> = {
  cough: (c, x) => once(c, x, 22, (u) => card(c, `cough${u}`, 400, 300, (p) => E.fxCough(p, u), [x.p[0] + (0.25 + 0.2 * u) * (x.s ?? 0.45), x.p[1], x.p[2]], x.s ?? 0.45, (x.s ?? 0.45) * 0.75, { soft: true })),
  burst: (c, x) => once(c, x, 12, (u) => card(c, `burst${u}${x.col ?? ""}`, 500, 500, (p) => fxBurst(p, u, x.col ?? "#fff3b0"), x.p, x.s ?? 1, x.s ?? 1)),
  puff: (c, x) => once(c, x, 14, (u) => card(c, `puff${u}`, 300, 300, (p) => fxPuff(p, u), x.p, x.s ?? 1.5, x.s ?? 1.5, { soft: true })),
  sparkle: (c, x) => { if (!live(c, x)) return; const u = x.dur ? clamp01((c.f - (x.f ?? 0)) / x.dur) : (c.t * 0.9) % 1; if (x.dur && u >= 1) return; const k = q(u, 24); card(c, `sparkle${k}`, 500, 500, (p) => E.fxSparkle(p, k), x.p, x.s ?? 0.4, x.s ?? 0.4); },
  stars: (c, x) => { if (!live(c, x)) return; const k = q((c.t * 0.9) % 1, 30); card(c, `stars${k}`, 420, 210, (p) => fxStars(p, k), x.p, x.s ?? 0.6, (x.s ?? 0.6) / 2); },
  shiver: (c, x) => { if (!live(c, x)) return; const k = q((c.t * 2) % 1, 20); card(c, `shiver${k}`, 300, 300, (p) => E.fxShiver(p, k), x.p, x.s ?? 0.6, x.s ?? 0.6); },
  flame: (c, x) => { if (!live(c, x)) return; const k = q((c.t * 3) % 1, 12); card(c, `flame${k}`, 120, 240, (p) => E.fxFlame(p, k), x.p, (x.s ?? 0.12) / 2, x.s ?? 0.12); },
  smoke: (c, x) => { // chimney smoke: looping puffs rising from p; fades out from f1 over 40 f
    const amount = x.f1 !== undefined ? 1 - smooth((c.f - x.f1) / 40) : 1, warm = !!x.warm;
    for (let k = 0; k < 5; k++) {
      const u = ((c.t * 0.22 + k / 5 + x.p[0] * 0.01) % 1 + 1) % 1;
      if (hh(k, x.p[0]) > amount) continue;
      const uq = q(u, 24); card(c, `smoke${uq}${warm}`, 400, 400, (p) => E.fxSmoke(p, uq, warm), [x.p[0] + 1.5 * u, x.p[1] + 1 + 9 * u, x.p[2]], 3 + 6 * u, 3 + 6 * u, { soft: true });
    }
  },
  chains: (c, x) => { const u = clamp01((c.f - (x.f ?? 0)) / (x.dur ?? 22)); if (c.f < (x.f ?? 0) || !live(c, x)) return; const k = q(u, 20); card(c, `chains${k}`, 400, 520, (p) => E.fxChains(p, k), x.p, x.w ?? 0.27, x.h ?? 0.35); },
  halo: (c, x) => { // pops in at f, breaks and falls at x.breakAt
    if (c.f < (x.f ?? 0)) return;
    const br = x.breakAt as number | undefined, s = x.s ?? 0.2;
    if (br === undefined || c.f < br) { const g = clamp01((c.f - (x.f ?? 0)) / 10), k = q(g, 10), z = Math.min(1, g * 2); card(c, `halo${k}`, 400, 200, (p) => E.fxHalo(p, k), [x.p[0], x.p[1] + 0.01 * Math.sin(c.t * 3), x.p[2]], s * z, s * z / 2); }
    else { const k = q(Math.max(0.01, clamp01((c.f - br) / 22)), 20); card(c, `halob${k}`, 400, 200, (p) => E.fxHalo(p, 0, k), [x.p[0], x.p[1] - 0.25 * k * k, x.p[2]], s, s / 2); }
  },
  map: (c, x) => { const k = q(clamp01((c.f - (x.f0 ?? 0)) / ((x.f1 ?? 1) - (x.f0 ?? 0))), 40); card(c, `map${k}`, E.MAP_W, E.MAP_H, (p) => E.fxMap(p, k), x.p, x.w ?? 2.3, x.h ?? 1.44); },
  gate: (c, x) => { const k = q(smooth((c.f - (x.f0 ?? 0)) / ((x.f1 ?? 30) - (x.f0 ?? 0))), 30); card(c, `gate${k}`, 600, 500, (p) => E.fxGate(p, k), x.p, x.w ?? 7.8, x.h ?? 3.6); },
  ban: (c, x) => { if (c.f < (x.f ?? 0)) return; const k = q(clamp01((c.f - (x.f ?? 0)) / 8), 16); card(c, `ban${k}`, 600, 600, (p) => E.fxBan(p, k), x.p, x.s ?? 0.34, x.s ?? 0.34, { flat: x.flat ?? true }); },
  bulb: (c, x) => { if (!live(c, x)) return; const k = q(clamp01((c.f - (x.f ?? 0)) / 10), 10); card(c, `bulb${k}`, 300, 400, (p) => E.fxBulb(p, k), x.p, (x.s ?? 0.5) * 0.75, x.s ?? 0.5); },
  clock: (c, x) => { if (!live(c, x)) return; const k = q(((c.f - (x.f ?? 0)) / (x.dur ?? 60)) % 1, 60); card(c, `clock${k}`, 300, 300, (p) => E.fxClock(p, k), x.p, x.s ?? 0.6, x.s ?? 0.6); },
  coins: (c, x) => once(c, x, 20, (u) => card(c, `coins${u}`, 400, 400, (p) => E.fxCoins(p, u), x.p, x.s ?? 0.6, x.s ?? 0.6)),
  arrow: (c, x) => { if (!live(c, x)) return; const k = q(clamp01((c.f - (x.f ?? 0)) / (x.dur ?? 12)), 20); card(c, `arrow${k}`, 500, 300, (p) => E.fxArrow(p, k), x.p, x.w ?? 1, (x.w ?? 1) * 0.6, { rot: x.rot ?? 0 }); },
  fire: (c, x) => { if (!live(c, x)) return; const k = q((c.t * 2) % 1, 16); card(c, `fire${k}`, 300, 400, (p) => E.fxFire(p, k), x.p, (x.s ?? 0.6) * 0.75, x.s ?? 0.6); },
  rain: (c, x) => { if (!live(c, x)) return; const k = q((c.t * 1.5) % 1, 20); card(c, `rain${k}`, 500, 400, (p) => E.fxRain(p, k), x.p, x.s ?? 1.2, (x.s ?? 1.2) * 0.8, { soft: true }); },
  heart: (c, x) => once(c, x, 18, (u) => card(c, `heart${u}`, 300, 300, (p) => E.fxHeart(p, u), [x.p[0], x.p[1] + 0.3 * u, x.p[2]], x.s ?? 0.35, x.s ?? 0.35)),
  notes: (c, x) => { if (!live(c, x)) return; for (let i = 0; i < 3; i++) { const u = (c.t * 0.6 + i / 3) % 1, kind = i % 2; card(c, `note${kind}`, 220, 240, (p) => fxNote(p, kind), [x.p[0] + 0.3 * u + 0.1 * i, x.p[1] + 0.5 * u, x.p[2]], 0.2 * (x.s ?? 1), 0.22 * (x.s ?? 1)); } },
  /** a static drawing (tablets, paper, tophat, moustache, sack, stamp) with an optional path [frame, x, y, z, rot] */
  card: (c, x) => {
    if (!live(c, x)) return;
    const [cw, ch, draw] = STATIC[x.draw as string];
    const [p, rot] = x.path ? pathAt(x.path, c.f) : [x.p, x.rot ?? 0];
    card(c, x.draw as string, cw, ch, draw, p, x.w ?? 0.3, x.h ?? (0.3 * ch) / cw, { flat: x.flat, rot });
  },
};

// ---------------- cast ----------------
const outfitOf = (o: string | Outfit): [Outfit, string] => (typeof o === "string" ? [OUTFITS[o], o] : [o, JSON.stringify(o).slice(0, 40)]);
const actor = (c: Ctx, cam: CamInfo, a: ActorSpec, i: number) => {
  if (c.f < (a.from ?? -1e9) || c.f >= (a.until ?? 1e9)) return;
  let [o, okey] = outfitOf(a.o);
  for (const [f, oo] of a.swap ?? []) if (c.f >= f) [o, okey] = outfitOf(oo);
  let [x, y, z] = a.p.length === 3 ? a.p : [a.p[0], 0, a.p[1]];
  let moving = false;
  if (a.to) { const u = clamp01((c.f - a.to.f0) / (a.to.f1 - a.to.f0)), e = a.to.ease === false ? u : smooth(u); x += (a.to.p[0] - x) * e; z += (a.to.p[1] - z) * e; moving = u > 0 && u < 1; }
  const mode = moving ? (a.mode === "march" ? "march" : "stroll") : a.mode === "sit" ? "sit" : a.mode === "stroll" || a.mode === "march" ? a.mode : "stand";
  const wave = tl(a.wave, c.f, false);
  const fo: FrontOpts = {
    mode, phase: q((((c.t * (a.rate ?? (mode === "march" ? 3.2 : 1.6)) + i * 0.37) % 1) + 1) % 1, 30), expr: tl(a.expr, c.f, "neutral" as Expr),
    blink: lidAt(c.t, 100 + i, [...swaps(a.expr), ...(a.swap ?? []).map(([f]) => f / FPS)]), facing: a.facing ?? 0, look: a.look ?? 0, headTilt: tl(a.tilt, c.f, 0),
    wave: wave ? q(0.8 + 0.12 * Math.sin(c.t * 4 + i), 30) : undefined, prop: a.reach ? ["reach", q(keys1(a.reach, c.f), 30)] : null,
  };
  const held = tl(a.hold, c.f, null as string | null);
  const pz = tl(a.pose, c.f, null as string | null);
  if (pz && !held && !wave && !a.reach) { const [l, r] = pz.includes(",") ? pz.split(",") : ["hang", pz]; fo.pose = [l.trim(), r.trim()]; }
  if (a.idle !== false && !moving && mode !== "sit") { // idle life: never a frozen card
    fo.tilt = (fo.tilt ?? 0) + q(1.1 * Math.sin((c.f + i * 7) * 0.05), 8); fo.headTilt = (fo.headTilt ?? 0) + q(1.4 * Math.sin((c.f + i * 5) * 0.037 + 1), 8);
  }
  if (held && !a.reach && !wave) fo.prop = ["reach", 0.55];

  const P: V3 = [c.o[0] + x, c.o[1] + y, c.o[2] + z];
  if (a.cape !== undefined && c.f >= a.cape) { const fl = q((c.t * 1.3 + i * 0.3) % 1, 16); card(c, `cape${fl}`, 500, 700, (p) => E.fxCape(p, fl), [x + 0.02, y + 0.98 * (a.scale ?? 1), z - 0.12], 0.62, 0.86); }
  if (held && STATIC[held]) { // the held card sits at the extended hand, a little toward the lens
    const [cw, ch, draw] = STATIC[held], s = a.scale ?? 1, hw = a.holdW ?? 0.3;
    const dx = cam.pos.x - P[0], dz = cam.pos.z - P[2], n = Math.hypot(dx, dz) || 1;
    card(c, held, cw, ch, draw, [x + cam.right.x * 0.5 * s + (dx / n) * 0.12, y + 0.95 * s, z + cam.right.z * 0.5 * s + (dz / n) * 0.12], hw * s, (hw * s * ch) / cw);
  }
  if (a.dust && moving) { const k = q((c.t * 3) % 1, 12); card(c, `puff${k}`, 300, 300, (p) => fxPuff(p, k), [x, y + 0.3, z + 1.0], 1.1, 1.1, { soft: true }); }
  c.out.places.push(person(cam, { i: 100 + i, o, okey }, P[0], P[1], P[2], { side: false, mirror: false }, fo, {}, a.scale ?? 1));
  if ((a.shadow ?? true) && y < 0.05 && mode !== "sit") blob(c.out, P[0], P[1], P[2], a.scale ?? 1);
};

export const stage = (shot: ShotSpec, origin: V3, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] }, t = f / FPS;
  LIGHT.name = shot.light ?? "day";
  findSun(cam, SUN);
  const c: Ctx = { out, f, t, o: origin };
  (shot.cast ?? []).forEach((a, i) => actor(c, cam, a, i));
  for (const x of shot.fx ?? []) { const fn = FX[x.k]; if (!fn) throw new Error(`unknown fx kind ${x.k}`); fn(c, x); }
  return out;
};
