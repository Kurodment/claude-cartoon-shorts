// Chicago'nun kaldırılması (1856-1861): ElevenLabs Can Seçkin, no music. Positions are set-relative.
import { Spec, wordsAt, Word, V3, PropSpec, ActorSpec } from "../engine/spec";
import words from "./words.json";

const W = words as Word[];
const w = wordsAt(W);
const ENG = "engineer";
/** the Tremont: six storeys, cream, front at z -7.5 */
const hotel = (lift: [number, number][], steps = false): PropSpec => ({ k: "building", p: [0, 0, -12], len: 10, h: 15, d: 9, seed: 1, lift, steps, jacks: true });
/** a stepwise lift: n small turns from m0, one every `every` frames, each `dm` metres */
const turns = (f0: number, n: number, every: number, m0: number, dm: number): [number, number][] => {
  const k: [number, number][] = [[f0, m0]];
  for (let i = 0; i < n; i++) k.push([f0 + i * every + 2, m0 + dm * i], [f0 + i * every + 8, m0 + dm * (i + 1)]);
  return k;
};
const ROW = [[-6.75, 6.5, 0], [-2.25, 7.5, 1], [2.25, 6.0, 2], [6.75, 8.0, 3]] as const;
const crew = (n: number, x0: number, dx: number, z: number, f: number): ActorSpec[] =>
  Array.from({ length: n }, (_, i) => ({ o: ["worker", "worker2", "worker3", "worker4", "worker5"][i % 5], p: [x0 + i * dx, z + (i % 2) * 0.9] as [number, number],
    expr: i % 3 ? "pained" : "stern", reach: [[f, 0], [f + 8, 1]] as [number, number][], facing: 0 }));

export const chicagoSpec: Spec = {
  id: "ChicagoShort", total: 2298, words: W,
  sets: { town: "mudTown", office: "office", field: "meadow" },
  flashAt: 196,
  xfade: { 3: 8, 7: 8, 16: 10, 20: 8, 22: 10 },
  kicks: [[w("kaldırdı"), 0.8], [w("altında"), 0.6], [w("kaldırıyor"), 0.6], [w("havalanıyor"), 0.7], [w("dik"), 0.5], [1365, 0.25], [1385, 0.25], [1405, 0.25]],
  dof: [[0, 0], [134, 9], [196, 0], [406, 9], [584, 10], [662, 0], [912, 9], [1087, 0], [1204, 8], [1255, 0], [1355, 10], [1414, 0], [1501, 8],
    [1604, 10], [1670, 13], [1778, 8], [1885, 0], [2114, 6], [2211, 12]],
  captions: [[1670, 1778, 0.24]],
  shots: [
    { a: 0, set: "town", // 1 hook: a shop rises on jacks
      cam: [{ f: 0, pos: [3.2, 2.0, 16], look: [0, 3.0, -5], fov: 44, push: 0.0025 }, { f: w("kaldırdı") - 6, dur: 18, pos: [2.6, 1.8, 13.5], look: [0, 3.2, -5], fov: 44, push: 0.003, punch: 0.008, n: 22 }],
      cast: [{ o: "worker", p: [-2.1, -1.7], expr: "pained", reach: [[0, 1]] }, { o: "worker3", p: [2.2, -1.5], expr: "pained", reach: [[0, 1]], facing: -1 }],
      fx: [{ k: "puff", f: w("kaldırdı") - 2, p: [0, 0.3, -2.8], s: 2.2 }],
      props: [{ k: "building", p: [0, 0, -6], len: 6, h: 6.5, d: 6, seed: 0, lift: [[0, 0], [20, 0], [110, 1.8]] }] },
    { a: 134, set: "town", // 2 with people inside
      cam: [{ f: 134, pos: [1.2, 2.6, 4.5], look: [0.5, 3.0, -3], fov: 40, push: 0.003 }],
      cast: [{ o: "gent", p: [-0.2, 2.1, -2.85], expr: "whistle", shadow: false }, { o: "lady", p: [1.5, 2.1, -2.85], expr: "smile", wave: true, shadow: false, facing: -1 }],
      fx: [{ k: "notes", f: 140, p: [0.3, 4.3, -2.8], s: 0.8 }],
      props: [{ k: "building", p: [0, 0, -6], len: 6, h: 6.5, d: 6, seed: 0, lift: [[134, 1.8]] }] },
    { a: 196, set: "town", // 3 1856, Chicago
      cam: [{ f: 196, pos: [0, 10, 44], look: [0, 2, -10], fov: 44, push: 0.002 }, { f: w("Chicago") - 8, dur: 30, pos: [2.5, 3.6, 27], look: [0, 2, -20], fov: 42, push: 0.0025 }],
      cast: [{ o: "lady", p: [-4, 12], to: { p: [-4, -2], f0: 196, f1: 294 }, mode: "stroll" }, { o: "man", p: [3.6, 0], to: { p: [3.6, 14], f0: 196, f1: 294 }, mode: "stroll" },
        { o: "gent", p: [-1.8, 22], to: { p: [-1.8, 10], f0: 196, f1: 294 }, mode: "stroll" }, { o: "merchant", p: [5.0, 18], expr: "smile" }] },
    { a: 294, set: "town", // 4 flat swamp by the lake
      cam: [{ f: 294, pos: [4.5, 1.6, -44], look: [1.2, 0.9, -60], fov: 40, push: 0.0025 }],
      cast: [{ o: "man", p: [2.6, -54], expr: { 0: "neutral", [w("bataklığın")]: "nervous" }, facing: -1 }],
      fx: [{ k: "puff", f: w("bataklığın") - 2, p: [2.6, 0.2, -53.6], s: 1.2 }] },
    { a: 406, set: "town", // 5 rain, the water stays
      cam: [{ f: 406, pos: [1.5, 1.7, 8], look: [0, 1.5, 1], fov: 40, push: 0.003 }],
      cast: [{ o: "man", p: [0, 1.6], expr: { 0: "neutral", [w("gitmiyor")]: "pained" } }],
      fx: [{ k: "rain", f: w("Yağmur") - 2, p: [0, 3.2, 1.6], s: 1.3 }] },
    { a: 484, set: "town", // 6 streets sink into mud, epidemics
      cam: [{ f: 484, pos: [0.6, 1.5, 7.6], look: [0.5, 1.0, 1.0], fov: 40, push: 0.003 }],
      cast: [{ o: "man", p: [0.05, -0.5, 1.2], expr: "dazed" }, { o: "lady2", p: [1.0, 0.4], expr: { 0: "nervous", [w("salgınlar")]: "pained" }, facing: -1 }],
      fx: [{ k: "puff", f: 486, p: [0.05, 0, 1.4], s: 1.4 }, { k: "cough", f: w("salgınlar"), p: [1.2, 1.6, 0.6], s: 0.6 }] },
    { a: 584, set: "office", sun: [150, 40], // 7 the engineer
      cam: [{ f: 584, pos: [0.6, 1.7, 4.6], look: [0, 1.3, -0.6], fov: 40, push: 0.0025 }, { f: w("çözüm") - 6, dur: 18, pos: [0.4, 1.65, 3.2], look: [0, 1.5, -1.0], fov: 38, push: 0.003, punch: 0.008, n: 20 }],
      cast: [{ o: ENG, p: [0, -1.2], expr: { 0: "neutral", [w("çözüm")]: "grin" } }],
      fx: [{ k: "bulb", f: w("çözüm") - 2, p: [0.25, 2.3, -1.1], s: 0.5 }],
      props: [{ k: "books", p: [-0.8, 0.78, 0.2] }] },
    { a: 662, set: "town", // 8 pipes on top of the street, covered with soil
      cam: [{ f: 662, pos: [1.0, 2.3, 10], look: [0, 0.8, 0.5], fov: 40, push: 0.0025 }],
      cast: [{ o: ENG, p: [-0.25, 3.0], expr: "grin", wave: { 0: false, [w("üstüne")]: true }, facing: 1 }, { o: "worker2", p: [0.75, 2.9], expr: "stern", reach: [[w("toprakla"), 0], [w("toprakla") + 8, 1]], facing: -1 }],
      fx: [{ k: "puff", f: w("toprakla"), p: [0, 0.5, 0], s: 2.4 }],
      props: [{ k: "pipe", p: [0, 0, 0], len: 10 }, { k: "slab", p: [0, -2.1, 0], len: 12, d: 3, path: [[w("toprakla") - 4, 0, -2.1, 0], [w("kapatalım") + 14, 0, 0.95, 0]] }] },
    { a: 778, set: "town", // 9 the buildings end up two metres below the street
      cam: [{ f: 778, pos: [-3.5, 2.4, 9], look: [-2, 1.4, -2], fov: 42, push: 0.0025 }],
      cast: [{ o: ENG, p: [-3.4, 0.5], expr: { 0: "nervous", [w("altında")]: "shock" }, facing: 1 }],
      props: [{ k: "building", p: [0, 0, -6], len: 6, h: 6, d: 6, seed: 2, jacks: false },
        { k: "slab", p: [0, 0, 1.4], len: 6, d: 8.6, path: [[w("altında") - 10, 0, 0, 1.4], [w("altında") + 10, 0, 1.8, 1.4]] }] },
    { a: 912, set: "office", sun: [150, 40], // 10 deadpan: luckily, the city had a plan
      cam: [{ f: 912, pos: [0.5, 1.8, 6.2], look: [0, 1.3, -0.6], fov: 40, push: 0.0025 }],
      cast: [{ o: "official", p: [0, -1.2], expr: "grin" }, { o: "gent", p: [-1.0, 0.3], expr: "smile", facing: 1 }, { o: "merchant", p: [1.0, 0.4], expr: "smile", facing: -1 }],
      fx: [{ k: "card", draw: "paper", p: [0, 0.786, -0.1], w: 0.42, flat: true, rot: 0.06 }, { k: "sparkle", f: w("planı") - 2, dur: 26, p: [0, 1.0, -0.1], s: 0.5 }] },
    { a: 986, set: "office", sun: [150, 40], // 11 deadpan: unfortunately, the plan was to lift the whole city
      cam: [{ f: 986, pos: [0.5, 1.8, 6.2], look: [0, 1.3, -0.6], fov: 40, push: 0.0025, cut: true }, { f: w("kaldırmaktı") - 4, dur: 10, pos: [0.45, 1.75, 5.4], look: [0, 1.4, -0.6], fov: 40, push: 0.003, punch: 0.01, n: 22 }],
      cast: [{ o: "official", p: [0, -1.2], expr: { 0: "grin", [w("kaldırmaktı")]: "shock" } }, { o: "gent", p: [-1.0, 0.3], expr: { 0: "smile", [w("kaldırmaktı")]: "shock" }, facing: 1 },
        { o: "merchant", p: [1.0, 0.4], expr: { 0: "smile", [w("kaldırmaktı")]: "dazed" }, facing: -1 }],
      fx: [{ k: "card", draw: "paper", p: [0, 0.786, -0.1], w: 0.42, flat: true, rot: 0.06 }, { k: "arrow", f: w("yukarı") - 2, dur: 14, p: [0, 2.3, -0.6], w: 0.8, rot: 1.57 }] },
    { a: 1087, set: "town", // 12 600 men, 6000 jacks, a whole street
      cam: [{ f: 1087, pos: [2, 3.2, 14], look: [0, 3, -8], fov: 44, push: 0.0025 }, { f: w("kaldırıyor") - 6, dur: 20, pos: [1, 3.0, 15], look: [0, 3.2, -8], fov: 46, push: 0.003, punch: 0.007, n: 20 }],
      cast: crew(8, -4.9, 1.4, -4.2, 1095),
      fx: [{ k: "puff", f: w("kaldırıyor") - 2, p: [0, 0.3, -4.8], s: 3.0 }],
      props: ROW.map(([x, h, s]) => ({ k: "building", p: [x, 0, -8], len: 4.4, h, d: 6, seed: s, lift: [[1087, 0], [1105, 0], [1200, 1.4]] }) as PropSpec) },
    { a: 1204, set: "town", // 13 the shops stay open
      cam: [{ f: 1204, pos: [2.6, 2.0, 6], look: [0, 2.0, -3], fov: 40, push: 0.003 }],
      cast: [{ o: "merchant", p: [0.2, 1.7, -2.85], expr: "grin", wave: true, shadow: false }, { o: "lady2", p: [-1.0, 1.2], to: { p: [-0.5, -0.9], f0: 1204, f1: 1250 }, expr: "smile", facing: 1 }],
      props: [{ k: "building", p: [0, 0, -6], len: 6, h: 6.5, d: 6, seed: 4, lift: [[1204, 1.4]], steps: true }] },
    { a: 1255, set: "town", // 14 wooden houses rolled away on logs
      cam: [{ f: 1255, pos: [-2, 2.4, 11], look: [-5.5, 2.0, -6], fov: 50, push: 0.002 }, { f: 1262, dur: 88, pos: [-0.5, 2.4, 11], look: [0.2, 2.0, -6], fov: 50, push: 0.002 }],
      cast: [{ o: "worker2", p: [-9.0, -3.0], to: { p: [0.0, -3.0], f0: 1255, f1: 1350, ease: false }, mode: "march", expr: "pained", reach: [[0, 1]], dust: true },
        { o: "worker4", p: [-9.6, -4.4], to: { p: [-0.6, -4.4], f0: 1255, f1: 1350, ease: false }, mode: "march", expr: "pained", reach: [[0, 1]] }],
      props: [{ k: "building", p: [-6, 0.34, -6], len: 5, h: 5, d: 5, seed: 2, jacks: false, path: [[1255, -6, 0.34, -6], [1350, 3, 0.34, -6]] },
        { k: "logs", p: [-1.5, 0, -6], len: 6, rows: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }] },
    { a: 1355, set: "office", sun: [150, 40], // 15 the people inside keep eating
      cam: [{ f: 1355, pos: [0.4, 1.65, 3.4], look: [0, 1.4, -1.0], fov: 38, push: 0.002, roll: 0.035 },
        { f: 1372, dur: 18, pos: [0.4, 1.65, 3.3], look: [0, 1.4, -1.0], fov: 38, roll: -0.035, push: 0.002 },
        { f: 1392, dur: 18, pos: [0.4, 1.65, 3.2], look: [0, 1.4, -1.0], fov: 38, roll: 0.035, push: 0.002 }],
      cast: [{ o: "man", p: [-0.45, -1.2], expr: "smile_closed" }, { o: "lady", p: [0.45, -1.2], expr: "smile" }],
      fx: [{ k: "notes", f: 1360, p: [0, 2.1, -1.1], s: 0.7 }, { k: "coins", f: w("yemeğe") - 2, p: [0, 0.8, -0.3], s: 0.4 }] },
    { a: 1414, set: "town", // 16 the six-storey Tremont
      cam: [{ f: 1414, pos: [2, 1.4, 14], look: [0, 4, -7], fov: 46, push: 0.002 }, { f: w("Tremont") - 8, dur: 30, pos: [2.4, 1.3, 13], look: [0, 8, -12], fov: 48, push: 0.0025 }],
      cast: [{ o: "lady", p: [-1.8, 4.5], expr: "smile", facing: 1 }, { o: "gent", p: [2.8, 4.6], expr: "grin", facing: -1 }],
      props: [hotel([[1414, 0.4]])] },
    { a: 1501, set: "town", // 17 500 men turn the jacks at every whistle
      cam: [{ f: 1501, pos: [2.8, 1.6, 2.6], look: [0, 1.4, -7], fov: 40, push: 0.0025 }],
      cast: [...crew(3, -1.6, 1.4, -6.9, 1501).map((a) => ({ ...a, reach: turns(w("düdükte"), 4, 18, 0, 1).map(([f, v]) => [f, v % 1 ? 1 : (v % 2 ? 1 : 0)]) as [number, number][] })),
        { o: "police", p: [2.3, -4.4], expr: { 0: "neutral", [w("düdükte") - 4]: "whistle" }, facing: -1 }],
      props: [hotel(turns(w("düdükte"), 4, 18, 0.4, 0.05))] },
    { a: 1604, set: "office", sun: [150, 40], // 18 the guests notice nothing
      cam: [{ f: 1604, pos: [0.4, 1.65, 3.2], look: [0, 1.4, -1.0], fov: 38, push: 0.003 }],
      cast: [{ o: "gent", p: [0, -1.2], expr: "smile_closed" }],
      fx: [{ k: "card", draw: "paper", p: [-0.25, 0.79, 0.0], w: 0.32, flat: true, rot: 0.15 }, { k: "notes", f: 1608, p: [0.3, 2.0, -1.0], s: 0.7 }] },
    { a: 1670, set: "town", // 19 millimetre by millimetre (a jack close-up)
      cam: [{ f: 1670, pos: [-3.9, 0.55, -5.6], look: [-4.65, 0.45, -7.75], fov: 32, push: 0.003 }],
      cast: [{ o: "worker3", p: [-5.6, -7.0], expr: "stern", reach: turns(w("milim"), 6, 14, 0, 1).map(([f, v]) => [f, v % 2 ? 1 : 0.3]) as [number, number][], facing: 1 }],
      fx: [{ k: "clock", f: w("milim"), dur: 40, p: [-4.1, 1.25, -7.3], s: 0.3 }],
      props: [hotel(turns(w("milim"), 6, 14, 0.6, 0.03))] },
    { a: 1778, set: "field", // 20 like changing a car tyre
      cam: [{ f: 1778, pos: [3.5, 2.2, 11.5], look: [0.3, 0.8, 0], fov: 44, push: 0.003 }],
      cast: [{ o: "man", p: [1.6, 1.2], expr: { 0: "stern", [w("krikoyu")]: "grin" }, reach: turns(w("krikoyu"), 4, 10, 0, 1).map(([f, v]) => [f, v % 2 ? 1 : 0.4]) as [number, number][], facing: -1 }],
      props: [{ k: "car", p: [0, 0, 0], color: "#c8323a", lift: turns(w("krikoyu"), 4, 10, 0, 0.07) }] },
    { a: 1885, set: "town", // 21 hundreds of jacks together: the hotel takes off
      cam: [{ f: 1885, pos: [6, 1.8, 16], look: [0, 5.5, -12], fov: 46, push: 0.002 }, { f: w("havalanıyor") - 6, dur: 16, pos: [5, 1.6, 14], look: [0, 6, -12], fov: 46, push: 0.003, punch: 0.008, n: 20 }],
      cast: crew(8, -4.9, 1.4, -6.4, 1885),
      fx: [{ k: "sparkle", f: w("havalanıyor"), dur: 30, p: [0, 9, -7.3], s: 2.4 }, { k: "puff", f: w("havalanıyor") - 2, p: [0, 0.3, -7.2], s: 3.2 }],
      props: [hotel([[1885, 0.8], [1900, 0.8], [w("havalanıyor") + 10, 1.8]])] },
    { a: 2034, set: "town", light: "golden", sun: [140, 16], // 22 Chicago gets out of the mud
      cam: [{ f: 2034, pos: [0, 2.2, 10.5], look: [0, 1.8, 2], fov: 44, push: 0.0025 }],
      cast: [["lady", -2.6, 3], ["man", -0.9, 2], ["gent", 0.9, 2.6], ["merchant", 2.6, 3.4], ["girl", 0, 4.4]].map(([o, x, z], i) => ({ o: o as string, p: [x as number, z as number] as [number, number], expr: i % 2 ? "laugh" : "grin", wave: true })),
      fx: [{ k: "sparkle", f: w("kurtuluyor") - 2, dur: 30, p: [0, 3.2, 3], s: 1.6 }] },
    { a: 2114, set: "town", // 23 a guest walks out and stops
      cam: [{ f: 2114, pos: [2.4, 1.4, 0.5], look: [0, 2.4, -7.4], fov: 40, push: 0.0025 }],
      cast: [{ o: "gent", p: [0, 2.1, -7.35], expr: { 0: "smile", [w("durup")]: "dazed" }, shadow: false }],
      props: [hotel([[2114, 1.8]], true)] },
    { a: 2211, set: "town", // 24 "were these stairs this steep yesterday?"
      cam: [{ f: 2211, pos: [0.9, 2.6, -4.2], look: [0, 3.2, -7.35], fov: 36, push: 0.003 }, { f: w("dik") - 4, dur: 8, pos: [0.7, 2.8, -4.9], look: [0, 3.5, -7.35], fov: 36, push: 0.003, punch: 0.01, n: 24 }],
      cast: [{ o: "gent", p: [0, 2.1, -7.35], expr: { 0: "dazed", [w("dik")]: "shock" }, shadow: false }],
      fx: [{ k: "stars", f: w("dik"), p: [0, 4.2, -7.3], s: 0.5 }],
      props: [hotel([[2211, 1.8]], true)] },
  ],
};
void ([] as V3[]);
