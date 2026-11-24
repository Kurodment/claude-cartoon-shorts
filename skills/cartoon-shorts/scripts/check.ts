// Geometry check of a whole short WITHOUT rendering pixels (seconds): walks every 2nd frame through the real camera and
// stage code and reports, per shot and frame range:
//   CUT      an actor's side or head leaves the frame
//   OVERLAP  two actors at about the same depth overlap on screen (they look stuck together)
//   HIDDEN   a nearer actor covers another actor's face
//   INSIDE   an actor stands inside a prop or set furniture (desk, table, bench, counter, car, building)
//   CARD     a static card (guide, paper, tyre, dish...) covers an actor's face
// and a CAMERA GRAMMAR line measured like the reference premium shorts (Version Six kit, 03_CAMERA_GRAMMAR): average
// take length between edits, hard cuts vs dissolves, % of frames the camera moves > 10 %/s and drifts > 2 %/s.
// Run from the Remotion project root (render.py check does it):  npx tsx scripts/shorts-check.ts src/shorts/<name>/spec.ts
import { pathToFileURL } from "node:url";
import path from "node:path";

// the card engine creates canvases at import time: give node a stub document
(globalThis as Record<string, unknown>).document = { createElement: () => ({ width: 0, height: 0, getContext: () => null }) };

type V3 = [number, number, number];
type Box = { x0: number; z0: number; x1: number; z1: number; top: number; name: string; r?: number; cx?: number; cz?: number };
const rect = (name: string, x0: number, z0: number, x1: number, z1: number, top = 1): Box => ({ name, x0, z0, x1, z1, top });
const disc = (name: string, cx: number, cz: number, r: number, top = 0.8): Box => ({ name, x0: cx - r, z0: cz - r, x1: cx + r, z1: cz + r, top, r, cx, cz });
/** set furniture footprints (set-relative) */
const SOLIDS: Record<string, Box[]> = {
  office: [rect("desk", -1.25, -0.62, 1.25, 0.62, 0.78)],
  bistro: [disc("table", 0, 0, 0.55), disc("table", -2.7, -1.6, 0.5), disc("table", 2.7, -1.6, 0.5), rect("bar", -2, -3.6, 2, -3.1, 1.05)],
  garage: [rect("workbench", -1.4, -3.55, 1.4, -2.85, 0.95)],
  shop: [rect("counter", -3.2, -0.45, 3.2, 0.45, 1.05)],
  lab: [rect("table", -1.75, -0.8, 1.75, 0.8, 0.92), rect("bench", -6, -4, 6, -3.5, 0.95)],
  kitchen: [rect("counter", -6, -4, 6, -3.35, 0.92), disc("table", 0, 0, 0.9)],
  grocery: [rect("counter", -1.9, -2.05, 1.9, -1.3, 1.0), rect("shelves", -5.9, -4, 5.9, -3.42, 2.9), disc("barrel", -4.8, -1.2, 0.38), disc("barrel", -5.3, 0.2, 0.38),
    rect("crate", -3.45, 0.9, -2.55, 1.5, 0.45), rect("crate", 2.55, 0.9, 3.45, 1.5, 0.45)],
  downtown: [rect("shops", -80, -20, 80, -8, 5), rect("shops", -80, 14, 80, 24, 5)],
};
const STATIC_CARDS = new Set(["tablets", "paper", "tophat", "moustache", "sack", "stamp", "guide", "tyre", "rosette", "dish"]);

const main = async () => {
  const specPath = process.argv[2];
  if (!specPath) throw new Error("usage: tsx check.ts src/shorts/<name>/spec.ts");
  const root = process.cwd();
  const THREE = await import(pathToFileURL(path.join(root, "node_modules/three/build/three.module.js")).href);
  const D = await import(pathToFileURL(path.join(root, "src/shorts/engine/direct.ts")).href);
  const mod = await import(pathToFileURL(path.resolve(specPath)).href);
  const spec = Object.values(mod).find((v: unknown) => v && typeof v === "object" && "shots" in (v as object)) as {
    total: number; sets: Record<string, string>; shots: { a: number; set: string; cast?: { o: unknown; from?: number; until?: number; p: number[] }[]; props?: { k: string; p: V3; len?: number; h?: number; d?: number; r?: number; yaw?: number; path?: [number, number, number, number][] }[] }[];
  };
  const O: V3 = [0, 0, 0];
  const issues = new Map<string, { shot: number; f0: number; f1: number; n: number; msg: string }>();
  const note = (shot: number, f: number, key: string, msg: string) => {
    const k = `${shot}|${key}`, e = issues.get(k);
    if (e && f - e.f1 <= 6) { e.f1 = f; e.n++; } else if (!e) issues.set(k, { shot, f0: f, f1: f, n: 1, msg }); else issues.set(k + "|" + f, { shot, f0: f, f1: f, n: 1, msg });
  };
  const cam = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 2000);
  const name = (o: unknown) => (typeof o === "string" ? o : "custom");
  for (let f = 0; f < spec.total; f += 2) {
    const si = D.shotIndexAt(spec, f), shot = spec.shots[si];
    const c = D.camAt(spec, O, shot, f);
    cam.fov = c.fov; cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
    const st = D.stage(shot, O, f, { pos: cam.position, right, sun: new THREE.Vector3(0.3, 0.8, 0.4) });
    const vis = (shot.cast ?? []).map((a, i) => ({ a, i })).filter(({ a }) => f >= (a.from ?? -1e9) && f < (a.until ?? 1e9));
    const v = new THREE.Vector3();
    const P = (x: number, y: number, z: number) => v.set(x, y, z).project(cam).clone();
    const acts = st.places.map((p: { x: number; y: number; z: number; scale?: number }, j: number) => {
      const s = p.scale ?? 1, l = P(p.x - right.x * 0.38 * s, p.y + 1.0 * s, p.z - right.z * 0.38 * s), r = P(p.x + right.x * 0.38 * s, p.y + 1.0 * s, p.z + right.z * 0.38 * s);
      const top = P(p.x, p.y + 1.85 * s, p.z), foot = P(p.x, p.y + 0.1, p.z), face = P(p.x, p.y + 1.55 * s, p.z);
      const depth = v.set(p.x, p.y + 1, p.z).sub(cam.position).dot(fwd);
      return { j, i: vis[j]?.i ?? j, who: name(vis[j]?.a.o), p, x0: Math.min(l.x, r.x), x1: Math.max(l.x, r.x), y0: foot.y, y1: top.y, face, depth, fy0: P(p.x, p.y + 1.35 * s, p.z).y };
    }).filter((a: { depth: number }) => a.depth > 0.3);
    const onScreen = (a: { x0: number; x1: number; y0: number; y1: number }) => a.x1 > -1 && a.x0 < 1 && a.y1 > -1 && a.y0 < 1;
    for (const a of acts) {
      if (!onScreen(a)) continue;
      if ((a.x0 < -1 && a.x1 > -1) || (a.x1 > 1 && a.x0 < 1) || (a.y1 > 1 && a.y0 < 0.9)) note(si, f, `cut${a.i}`, `CUT     actor ${a.i} (${a.who}) leaves the frame`);
    }
    for (let m = 0; m < acts.length; m++) for (let n = m + 1; n < acts.length; n++) {
      const A = acts[m], B = acts[n]; if (!onScreen(A) || !onScreen(B)) continue;
      const ix = Math.max(0, Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0)), iy = Math.max(0, Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0));
      const area = (q: typeof A) => (q.x1 - q.x0) * (q.y1 - q.y0), ov = (ix * iy) / Math.max(1e-6, Math.min(area(A), area(B)));
      const [near, far] = A.depth < B.depth ? [A, B] : [B, A];
      if (Math.abs(A.depth - B.depth) < 0.6 && ov > 0.25) note(si, f, `ov${A.i}-${B.i}`, `OVERLAP actors ${A.i} (${A.who}) + ${B.i} (${B.who}) stuck together (${Math.round(ov * 100)} %)`);
      else if (far.face.x > near.x0 + 0.02 && far.face.x < near.x1 - 0.02 && far.face.y < near.y1 && far.face.y > near.y0) note(si, f, `hid${far.i}`, `HIDDEN  actor ${far.i} (${far.who})'s face is behind actor ${near.i} (${near.who})`);
    }
    // feet inside furniture / props
    const solids: Box[] = [...(SOLIDS[spec.sets[shot.set]] ?? [])];
    for (const pr of shot.props ?? []) {
      let [x, y, z] = pr.p; if (pr.path) { const [q] = D.pathAt(pr.path, f); [x, y, z] = q; }
      const yaw = pr.yaw ?? 0, swap = Math.abs(Math.sin(yaw)) > 0.5;
      const hx = { sedan: 2.15, shopCart: 0.45, meter: 0.1, streetClock: 0.25, building: (pr.len ?? 8) / 2, oldCar: 1.25, car: 1.9, crate: (pr.h ?? 1) / 2, tyres: 0.42, pipe: (pr.len ?? 8) / 2, slab: (pr.len ?? 10) / 2 }[pr.k];
      const hz = { sedan: 0.85, shopCart: 0.3, meter: 0.1, streetClock: 0.25, building: (pr.d ?? 7) / 2, oldCar: 0.7, car: 0.82, crate: (pr.h ?? 1) / 2, tyres: 0.42, pipe: pr.r ?? 0.35, slab: (pr.d ?? 3) / 2 }[pr.k];
      if (hx === undefined || hz === undefined) continue;
      const [ax, az] = swap ? [hz, hx] : [hx, hz];
      solids.push(rect(pr.k, x - ax, z - az, x + ax, z + az, pr.k === "slab" ? y : 1));
    }
    for (const a of acts) {
      const ax = a.p.x, az = a.p.z, ay = a.p.y;
      if (ay > 0.3) continue; // seated in a car, on a dais, on a raised floor: intended
      for (const b of solids) {
        const inside = b.r !== undefined ? Math.hypot(ax - b.cx!, az - b.cz!) < b.r + 0.12 : ax > b.x0 - 0.12 && ax < b.x1 + 0.12 && az > b.z0 - 0.12 && az < b.z1 + 0.12;
        if (inside && b.top > ay + 0.05) note(si, f, `in${a.i}${b.name}`, `INSIDE  actor ${a.i} (${a.who}) stands inside the ${b.name}`);
      }
    }
    for (const x of st.fx as { key: string; x: number; y: number; z: number; w: number; h: number }[]) {
      if (!STATIC_CARDS.has(x.key)) continue;
      const c0 = P(x.x - right.x * x.w / 2, x.y - x.h / 2, x.z - right.z * x.w / 2), c1 = P(x.x + right.x * x.w / 2, x.y + x.h / 2, x.z + right.z * x.w / 2);
      const cd = v.set(x.x, x.y, x.z).sub(cam.position).dot(fwd);
      for (const a of acts) {
        if (cd > a.depth + 0.05) continue;
        const fx0 = a.face.x - 0.05, fx1 = a.face.x + 0.05;
        if (Math.min(c0.x, c1.x) < fx1 && Math.max(c0.x, c1.x) > fx0 && Math.min(c0.y, c1.y) < a.face.y && Math.max(c0.y, c1.y) > a.fy0) note(si, f, `card${a.i}${x.key}`, `CARD    a ${x.key} card covers actor ${a.i} (${a.who})'s face`);
      }
    }
  }
  // ---- camera grammar (every frame, camera only) ----
  {
    const sp = spec as unknown as { xfade?: Record<number, number>; shots: { a: number; cam: { f: number; cut?: boolean }[] }[] };
    const FPS = 30, Ln = 6;
    let hard = 0, soft = 0;
    sp.shots.forEach((sh, i) => { if (i) (sp.xfade?.[i + 1] ? soft++ : hard++); hard += sh.cam.filter((k, j) => j && k.cut).length; });
    const cutF = new Set<number>();
    sp.shots.forEach((sh) => { cutF.add(sh.a); for (const k of sh.cam) if (k.cut) cutF.add(k.f); });
    const c0 = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 2000), c1 = c0.clone();
    const put = (cm: typeof c0, f: number) => { const sh = spec.shots[D.shotIndexAt(spec, f)], c = D.camAt(spec, O, sh, f); cm.fov = c.fov; cm.position.set(...c.pos); cm.up.set(0, 1, 0); cm.lookAt(...c.look); cm.updateMatrixWorld(); cm.updateProjectionMatrix(); return c; };
    const sp5: number[] = [];
    for (let f = 1; f < spec.total; f++) {
      if (cutF.has(f)) { sp5.push(NaN); continue; }
      put(c0, f - 1); put(c1, f);
      const d0 = new THREE.Vector3(); c0.getWorldDirection(d0);
      const q = c0.position.clone().addScaledVector(d0, Ln).project(c1);
      const zoom = Math.log(Math.tan((c0.fov * Math.PI) / 360) / Math.tan((c1.fov * Math.PI) / 360));
      const d1 = new THREE.Vector3(); c1.getWorldDirection(d1);
      const dolly = Math.log(Ln / Math.max(0.1, Ln - c1.position.clone().sub(c0.position).dot(d1)));
      sp5.push((Math.hypot(q.x / 2, q.y / 2 * (1920 / 1080)) + Math.abs(zoom + dolly) * 0.89) * 100 * FPS);
    }
    const med = sp5.map((_, i) => { const w = sp5.slice(Math.max(0, i - 2), i + 3).filter((x) => !isNaN(x)).sort((a, b) => a - b); return w.length ? w[w.length >> 1] : NaN; }).filter((x) => !isNaN(x));
    const pct = (t: number) => Math.round((100 * med.filter((x) => x > t).length) / Math.max(1, med.length));
    const asl = spec.total / FPS / (hard + soft + 1);
    console.log(`camera: takes ${hard + soft + 1}, hard cuts ${hard}, dissolves ${soft}, avg take ${asl.toFixed(1)} s, moving>10%/s ${pct(10)} %, drift>2%/s ${pct(2)} %, fast>60%/s ${pct(60)} %` +
      `  (reference: avg take 3.4-5 s, ~1 hard cut, moving 77 %, drift 97 %, fast ~30 %)`);
  }
  const list = [...issues.values()].filter((e) => e.n >= 2).sort((a, b) => a.shot - b.shot || a.f0 - b.f0);
  console.log("shots: " + spec.shots.map((x) => x.a).join(",") + " total " + spec.total);
  if (!list.length) { console.log("check: OK - no cut, overlapping, hidden or clipping actor in any frame"); return; }
  console.log(`check: ${list.length} issue(s) (every 2nd frame of ${spec.total}):`);
  for (const e of list) console.log(`  shot ${e.shot + 1} f${e.f0}-${e.f1}  ${e.msg}`);
};
main().catch((e) => { console.error(e); process.exit(1); });
