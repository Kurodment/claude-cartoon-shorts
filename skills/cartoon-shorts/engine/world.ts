// Generic world for a Spec: sky + light rig (bridge / Pisa look), one group per set instance (placed far apart; only the
// current shot's set is visible), props per shot (bottles, flasks, pillbox, bottle shelves; optional path / liquid
// colour change), and the cast + effect cards from direct.ts. update(i, f, camera) is a pure function of shot + frame.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { V, Kit, Batch } from "./build";
import { ctex, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx } from "./cards";
import { Spec, V3, FPS, PropSpec } from "./spec";
import { camAt, stage, shotEnd, smooth, pathAt } from "./direct";
import { SET_KINDS, flask, bottle, aspirinBox, shelfRowExport, crateProp, booksProp, coinsProp } from "./sets";

const KENNEY = ["tree_oak", "tree_default", "flower_redA", "flower_yellowA", "lantern", "cart", "stall-green"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
/** set instance origins: 400 m apart along x */
export const originsOf = (spec: Spec) => Object.fromEntries(Object.keys(spec.sets).map((k, i) => [k, [i * 400, 0, 0] as V3]));
type PropObj = { obj: THREE.Object3D; shot: number; spec: PropSpec; liq?: THREE.MeshLambertMaterial; c0?: THREE.Color };

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: { m: THREE.Mesh; a: number; d: number; y: number }[] = [];
  private sets: Record<string, THREE.Group> = {};
  private origins: Record<string, V3>;
  private props: PropObj[] = [];
  private spec: Spec;
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit, spec: Spec) {
    this.spec = spec; this.origins = originsOf(spec);
    const R = this.root;
    // ---- sky + light ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.renderOrder = -0.5; this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60, y = 120 + (i % 4) * 38;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push({ m, a, d, y }); R.add(m);
    }
    // ---- sets (one group per instance) and props (one object per shot entry) ----
    for (const [name, kind] of Object.entries(spec.sets)) { const g = SET_KINDS[kind](kit, this.origins[name]); g.visible = false; this.sets[name] = g; R.add(g); }
    spec.shots.forEach((sh, si) => (sh.props ?? []).forEach((p, pi) => {
      const o = this.origins[sh.set];
      let obj: THREE.Object3D, liq: THREE.MeshLambertMaterial | undefined;
      if (p.k === "bottle") obj = bottle(p.color ?? "#a8652a", p.h ?? 0.25, p.color ?? "#a8652a");
      else if (p.k === "flask") { obj = flask(p.color ?? "#3a6fb0", p.r ?? 0.1, `f${si}_${pi}`); liq = (obj.userData.liquid as THREE.Mesh).material as THREE.MeshLambertMaterial; }
      else if (p.k === "pillbox") obj = aspirinBox();
      else if (p.k === "crate") obj = crateProp(p.h ?? 1);
      else if (p.k === "books") obj = booksProp(p.rows?.length ?? 5);
      else if (p.k === "coins") obj = coinsProp();
      else { const g = new THREE.Group(), b = new Batch(); for (const y of p.rows ?? [0]) shelfRowExport(b, [0, 0, 0], 0, p.len ?? 2, y, 0, 9, p.color); b.build(g); obj = g; }
      obj.position.set(o[0] + p.p[0], o[1] + p.p[1], o[2] + p.p[2]); obj.rotation.y = p.yaw ?? 0; obj.visible = false; R.add(obj);
      this.props.push({ obj, shot: si, spec: p, liq, c0: liq ? new THREE.Color(p.color ?? "#3a6fb0") : undefined });
    }));
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el */
  private shotSun(id: number, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const s = this.spec.shots[id], o = this.origins[s.set];
    let fx = 0, fz = 0;
    for (let f = s.a; f < shotEnd(this.spec, id); f += 3) {
      const c = camAt(this.spec, o, s, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.sun?.[0] ?? L.az), el = THREE.MathUtils.degToRad(s.sun?.[1] ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  private poseProps(id: number, f: number) {
    for (const p of this.props) {
      p.obj.visible = p.shot === id;
      if (!p.obj.visible) continue;
      if (p.spec.path) { const [q, rz] = pathAt(p.spec.path, f), o = this.origins[this.spec.shots[id].set]; p.obj.position.set(o[0] + q[0], o[1] + q[1], o[2] + q[2]); p.obj.rotation.z = rz; }
      if (p.spec.spin) p.obj.rotation.y = (p.spec.yaw ?? 0) + p.spec.spin * Math.sin(f / 40);
      if (p.liq && p.c0 && p.spec.liquidTo) p.liq.color.copy(p.c0).lerp(new THREE.Color(p.spec.liquidTo.color), smooth((f - p.spec.liquidTo.f) / p.spec.liquidTo.dur));
    }
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = this.spec.shots[id], light = s.light ?? "day", L = LIGHTS[light], o = this.origins[s.set];
    // ---- camera ----
    const c = camAt(this.spec, o, s, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- sets ----
    for (const [k, g] of Object.entries(this.sets)) g.visible = k === s.set;
    this.poseProps(id, f);
    // ---- light rig ----
    const K = LOOK[light], sunDir = this.shotSun(id, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 10, 110);
    if (["street", "capitol", "brainCastle", "harbor", "meadow"].includes(this.spec.sets[s.set])) Rr = Math.max(Rr, 34);
    this.sun.position.copy(focus).addScaledVector(sunDir, 260); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 560; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[light].bounce); TONE.uSat.value = LOOK[light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, sun disc, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = light === "golden";
    if (this.sunDisc.visible) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const { m, a, d, y } = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.position.set(cam.position.x + Math.cos(a + t * 0.004) * d, y, cam.position.z + Math.sin(a + t * 0.004) * d);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[light][i % 4];
    }
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(s, o, f, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const ef = this.fx(fi++);
      ef.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      ef.use(!!p.soft);
      ef.mesh.visible = true;
      ef.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) ef.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { ef.mesh.quaternion.copy(cam.quaternion); ef.mesh.rotateZ(p.rot ?? 0); }
      ef.mesh.scale.set(p.w, p.h, 1);
      fused.push(ef);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e2 of fused) e2.bind();
    return focus;
  }
}
