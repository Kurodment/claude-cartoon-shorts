// "Eroin: bağımlılık yapmayan morfin" as a Spec (the example short). Voice: Edge Ahmet; positions are set-relative.
import { Spec, wordsAt, Word } from "../engine/spec";
import words from "./words.json";

const W = words as Word[];
const w = wordsAt(W);
const T = 0.92, C = 1.05; // lab table top, shop counter top
const BM: [number, number, number] = [-0.17, T, 0.15], BH: [number, number, number] = [0.17, T, 0.15]; // the two bottles
const tableWide = (f: number) => ({ f, pos: [0, 1.42, 1.95] as [number, number, number], look: [0, 1.15, 0.12] as [number, number, number], fov: 36, push: 0.0022, cut: true });
const beds = [-4.5, -1.5, 1.5, 4.5];
const patients = (expr: (i: number) => import("../engine/spec").Timeline<import("../engine/toon").Expr>) =>
  beds.map((x, i) => ({ o: ["patient", "patient2", "patient3", "patient4"][i], p: [x, 0.45, -2.95] as [number, number, number], mode: "sit" as const, expr: expr(i), shadow: false }));

export const eroinSpec: Spec = {
  id: "EroinShort", total: 2144, words: W,
  sets: { shop: "shop", lab: "lab", ward: "ward", street: "street", brain: "brainCastle", cap: "capitol", bath: "bathroom" },
  flashAt: 123,
  xfade: { 8: 6, 9: 6, 15: 8, 18: 10, 19: 8, 21: 12 },
  kicks: [[w("Eroin", 2), 0.6], [w("yapıyordu") + 4, 0.8], [w("dönüşür"), 0.5], [w("yasakladı"), 1.0], [w("bıraktı") + 4, 0.4]],
  dof: [[0, 9], [w("satılıyordu") - 4, 15], [123, 0], [209, 6], [w("kimyager") - 8, 11, 24], [w("iki") - 8, 13, 24], [396, 15], [532, 8], [633, 11],
    [w("Eroin", 2) - 3, 15], [791, 9], [860, 8], [924, 12], [w("Morfin") - 8, 15, 24], [1078, 5], [1204, 10], [1287, 13], [1359, 12],
    [w("yapıyordu") - 4, 15, 20], [1525, 0], [w("morfinden") - 10, 8, 26], [1615, 10], [1753, 8], [1813, 0], [w("bıraktı") - 12, 5, 26],
    [1910, 0], [1964, 14], [2017, 9], [w("aspirin", 2) - 8, 14, 30]],
  captions: [[924, 1078, 0.85], [1359, 1525, 0.85], [1964, 2017, 0.24]],
  shots: [
    { a: 0, set: "shop", sun: [150, 40], // 1 hook: cough medicine at the chemist's
      cam: [{ f: 0, pos: [1.5, 1.65, 5.0], look: [-0.35, 1.35, 0.1], fov: 42, push: 0.0028 },
        { f: w("öksürük") - 6, dur: 26, pos: [0.9, 1.55, 3.2], look: [-0.4, 1.42, 0.3], fov: 38, roll: -0.03, push: 0.003 },
        { f: w("satılıyordu") - 4, cut: true, pos: [1.05, 1.32, 1.25], look: [0.35, 1.22, 0.12], fov: 32, push: 0.0035, punch: 0.009, n: 24 }],
      cast: [{ o: "pharmacist", p: [0.25, -1.15], expr: { 0: "smile", [w("satılıyordu")]: "grin" }, facing: -1 },
        { o: "gent", p: [-0.7, 1.0], expr: { 0: "nervous", [w("öksürük") - 2]: "pained", [w("öksürük") + 18]: "nervous" }, facing: 1 },
        { o: "lady", p: [-1.9, 1.8], expr: "smile", facing: 1 }],
      fx: [{ k: "cough", f: w("öksürük"), p: [-0.58, 1.62, 1.1], s: 0.42 }],
      props: [{ k: "bottle", p: [0.35, C, 0.12], h: 0.26 }] },
    { a: 123, set: "street", // 2 1897, the Bayer works
      cam: [{ f: 123, pos: [4, 16, 44], look: [0, 9, -8], fov: 42, push: 0.002 }, { f: 170, dur: 34, pos: [7, 2.2, 22], look: [0, 5.5, -6], fov: 44, roll: 0.02 }],
      cast: [0, 1, 2, 3, 4].map((i) => ({ o: ["worker", "worker2", "worker3", "worker4", "worker5"][i], p: [[-2.4, 1.8, -0.6, 3.2, -3.4][i], 10 + i * 2.6] as [number, number],
        to: { p: [[-2.4, 1.8, -0.6, 3.2, -3.4][i], 10 + i * 2.6 - 3.6] as [number, number], f0: 123, f1: 209, ease: false }, expr: i % 2 ? "smile" : "whistle" })),
      fx: [{ k: "smoke", p: [-9, 26, -11] }, { k: "smoke", p: [9, 26, -11] }] },
    { a: 209, set: "lab", sun: [150, 42], // 3 young chemist, two drugs
      cam: [{ f: 209, pos: [0.4, 2.1, 8.4], look: [0, 1.45, -1.6], fov: 42, push: 0.0022 },
        { f: w("kimyager") - 8, dur: 30, pos: [0.75, 1.58, 2.9], look: [0, 1.5, -1.05], fov: 38, push: 0.0028, punch: 0.007, n: 24 },
        { f: w("iki") - 8, dur: 26, pos: [0, 1.36, 1.55], look: [0, 1.1, 0.05], fov: 36, push: 0.003 }],
      cast: [{ o: "chemist", p: [0, -1.15], expr: { 0: "smile_closed", [w("Hoffmann")]: "smile", [w("iki")]: "grin" } }, { o: "professor", p: [-3.2, -2.6], expr: "stern", facing: 1 }],
      fx: [{ k: "flame", p: [-0.95, T + 0.22, -0.42] }],
      props: [{ k: "flask", p: [-0.42, T, 0.05], color: "#eef1f4" }, { k: "flask", p: [0.42, T, 0.05], color: "#3a6fb0" }] },
    { a: 396, set: "lab", sun: [150, 42], // 4 aspirin
      cam: [{ f: 396, pos: [-0.18, 1.32, 1.4], look: [-0.42, 1.12, 0.05], fov: 30, roll: 0.03, push: 0.003, punch: 0.008, n: 22 }],
      cast: [{ o: "chemist", p: [0, -1.15], expr: "grin", look: 0.6 }],
      fx: [{ k: "burst", f: w("aspirin") - 2, p: [-0.42, T + 0.2, 0.02], s: 0.5 }, { k: "card", draw: "tablets", f: w("aspirin") - 2, p: [-0.2, T + 0.03, 0.22], w: 0.16 }],
      props: [{ k: "flask", p: [-0.42, T, 0.05], color: "#eef1f4" }, { k: "flask", p: [0.42, T, 0.05], color: "#3a6fb0" }] },
    { a: 445, set: "lab", sun: [150, 42], // 5 the changed morphine
      cam: [{ f: 445, pos: [0.66, 1.32, 1.4], look: [0.42, 1.12, 0.05], fov: 30, roll: -0.03, push: 0.003 },
        { f: w("değiştirilmiş") - 6, dur: 24, pos: [0.56, 1.26, 1.05], look: [0.42, 1.12, 0.05], fov: 30, push: 0.003, punch: 0.008, n: 22 }],
      cast: [{ o: "chemist", p: [0, -1.15], expr: "grin", look: 0.6 }],
      fx: [{ k: "sparkle", f: w("değiştirilmiş") - 4, dur: 34, p: [0.42, T + 0.14, 0.08], s: 0.42 }],
      props: [{ k: "flask", p: [-0.42, T, 0.05], color: "#eef1f4" }, { k: "flask", p: [0.42, T, 0.05], color: "#3a6fb0", liquidTo: { color: "#c27a2c", f: w("değiştirilmiş"), dur: 26 } }] },
    { a: 532, set: "lab", sun: [150, 42], // 6 testers feel like heroes
      cam: [{ f: 532, pos: [-1.05, 1.5, 6.6], look: [-1.2, 1.35, 1.2], fov: 40 },
        { f: w("kahraman") - 6, dur: 20, pos: [-1.15, 1.15, 5.5], look: [-1.2, 1.55, 1.2], fov: 40, roll: 0.05, push: 0.003, punch: 0.008, n: 24 }],
      cast: [[-1.85, 1.0, "worker"], [-1.2, 1.55, "worker2"], [-0.55, 1.0, "worker5"]].map(([x, z, o], i) => ({ o: o as string, p: [x as number, z as number] as [number, number],
        expr: { 0: "neutral", [w("güçlü")]: "grin", [w("kahraman")]: i === 1 ? "laugh" : "grin" } as Record<number, import("../engine/toon").Expr>, wave: { 0: false, [w("güçlü")]: true }, cape: w("kahraman"),
        facing: (i === 0 ? 1 : i === 2 ? -1 : 0) as -1 | 0 | 1 })),
      fx: [{ k: "burst", f: w("kahraman") - 2, p: [-1.2, 1.6, 1.0], s: 3.2, col: "#ffe27a", dur: 14 }] },
    { a: 633, set: "lab", sun: [150, 42], // 7 the name
      cam: [{ f: 633, pos: [2.6, 1.6, 3.6], look: [2.1, 1.55, 0.7], fov: 38, push: 0.0028 },
        { f: w("kahramanca") - 6, dur: 24, pos: [2.5, 1.62, 2.6], look: [2.15, 1.6, 0.7], fov: 36, roll: -0.03, push: 0.003 },
        { f: w("Eroin", 2) - 3, cut: true, pos: [2.9, 1.74, 1.85], look: [2.5, 1.68, 0.95], fov: 32, push: 0.003, punch: 0.012, n: 20 }],
      cast: [{ o: "professor", p: [2.1, 0.7], expr: { 0: "smile", [w("kahramanca")]: "grin", [w("Eroin", 2)]: "laugh" }, wave: { 0: false, [w("kahramanca") - 6]: true } }],
      fx: [{ k: "burst", f: w("Eroin", 2) - 2, p: [2.52, 1.7, 0.85], s: 1.1, col: "#ffe27a", dur: 14 }, { k: "stars", f: w("Eroin", 2) + 4, p: [2.52, 1.98, 0.95], s: 0.5 }],
      props: [{ k: "bottle", p: [2.47, 1.05, 0.86], path: [[w("kahramanca") - 6, 2.47, 1.05, 0.86], [w("kahramanca") + 8, 2.52, 1.55, 0.86, -0.08]], spin: 0.4 }] },
    { a: 791, set: "shop", sun: [150, 40], // 8 sold for coughs
      cam: [{ f: 791, pos: [2.5, 1.65, 4.8], look: [-0.7, 1.35, 1.0], fov: 42, push: 0.003 },
        { f: w("öksürük", 2) - 4, dur: 26, pos: [1.7, 1.55, 3.7], look: [-0.8, 1.4, 1.2], fov: 40, roll: 0.02, push: 0.003 }],
      cast: [{ o: "pharmacist", p: [0.25, -1.15], expr: "grin", facing: -1, wave: true },
        ...["gent", "lady", "man", "lady2"].map((o, i) => ({ o, p: [-0.55 - i * 0.6, 1.0 + i * 0.95] as [number, number], facing: 1 as const,
          expr: { 0: i % 2 ? "smile" : "nervous", [795 + i * 17 - 2]: "pained", [795 + i * 17 + 18]: i % 2 ? "smile" : "nervous" } as Record<number, import("../engine/toon").Expr> }))],
      fx: [0, 1, 2, 3].flatMap((i) => [{ k: "cough", f: 795 + i * 17, p: [-0.43 - i * 0.6, 1.62, 1.1 + i * 0.95] as [number, number, number] }, { k: "cough", f: 829 + i * 17, p: [-0.43 - i * 0.6, 1.62, 1.1 + i * 0.95] as [number, number, number] }]),
      props: [{ k: "bottle", p: [0.35, C, 0.12], h: 0.26 }, { k: "bottleShelf", p: [-2.7, 0, -3.45], color: "#a8652a", len: 5.4, rows: [0.9, 1.35] }, { k: "bottleShelf", p: [-0.4, C, 0.2], color: "#a8652a", len: 1.6 }] },
    { a: 860, set: "ward", sun: [150, 40], // 9 pneumonia, TB
      cam: [{ f: 860, pos: [2.6, 1.7, 4.6], look: [-0.6, 1.0, -2.4], fov: 42, push: 0.003 }, { f: w("verem") - 6, dur: 24, pos: [1.4, 1.45, 2.4], look: [-0.6, 1.05, -2.5], fov: 40, push: 0.003 }],
      cast: [...patients((i) => (i % 2 ? "pained" : "nervous")), { o: "nurse", p: [0.35, -1.2], expr: "smile", facing: -1, wave: true }, { o: "doctor", p: [2.6, -0.9], expr: "smile_closed", facing: -1 }],
      fx: beds.map((x, i) => ({ k: "cough", f: 862 + i * 13, p: [x, 1.55, -2.85] as [number, number, number], s: 0.4 })),
      props: beds.map((x) => ({ k: "bottle" as const, p: [x + 0.8, 0.62, -3.62] as [number, number, number], h: 0.18 })) },
    { a: 924, set: "lab", sun: [150, 42], // 10 the promise: chains vs halo
      cam: [tableWide(924), { f: w("Morfin") - 8, dur: 26, pos: [-0.13, 1.32, 1.1], look: [-0.17, 1.16, 0.15], fov: 32, roll: 0.03, push: 0.003 },
        { f: w("eroin", 3) - 8, dur: 24, pos: [0.21, 1.34, 1.15], look: [0.17, 1.2, 0.15], fov: 32, roll: -0.03, push: 0.003 }],
      cast: [{ o: "professor", p: [0.15, -1.25], expr: { 0: "smile", [w("eroin", 3)]: "grin" }, wave: true }],
      fx: [{ k: "chains", f: w("Morfin") - 4, p: [BM[0], BM[1] + 0.13, BM[2] + 0.06] }, { k: "halo", f: w("eroin", 3) - 4, p: [BH[0], BH[1] + 0.33, BH[2]] },
        { k: "sparkle", f: w("eroin", 3) - 2, p: [BH[0], BH[1] + 0.16, BH[2] + 0.04], s: 0.34 }],
      props: [{ k: "bottle", p: BM, color: "#3a6fb0" }, { k: "bottle", p: BH }] },
    { a: 1078, set: "lab", sun: [140, 40], // 11 the map
      cam: [{ f: 1078, pos: [0.6, 2.2, 0.3], look: [-5.94, 2.25, 0.22], fov: 40, push: 0.002 }, { f: w("yirmiden") - 10, dur: 30, pos: [-0.6, 2.4, 0.22], look: [-5.94, 2.45, 0.2], fov: 40, push: 0.0022 }],
      cast: [{ o: "professor", p: [-4.9, 1.95], expr: { 0: "grin", [w("ülkeye")]: "laugh" }, facing: -1, wave: true }],
      fx: [{ k: "map", f0: w("reçetesiz"), f1: 1192, p: [-5.94, 2.45, 0.2] }] },
    { a: 1204, set: "ward", sun: [150, 40], // 12 doctors notice
      cam: [{ f: 1204, pos: [-0.3, 1.75, 4.2], look: [-1.1, 1.4, -1.2], fov: 40, push: 0.003 },
        { f: w("garip") - 6, dur: 22, pos: [-0.6, 1.65, 3.0], look: [-1.15, 1.5, -1.1], fov: 38, roll: 0.04, push: 0.003, punch: 0.007, n: 22 }],
      cast: [...patients(() => ({ 0: "pained", [w("garip")]: "nervous" })), { o: "doctor", p: [-1.75, -0.75], expr: { 0: "stern", [w("garip")]: "nervous" }, facing: 1 },
        { o: "doctor2", p: [-0.55, -1.15], expr: { 0: "stern", [w("garip")]: "shock" }, facing: -1, tilt: { 0: 0, [w("garip")]: 0.12 } }] },
    { a: 1287, set: "ward", sun: [150, 40], // 13 the patient won't let go
      cam: [{ f: 1287, pos: [1.6, 1.5, -0.55], look: [1.5, 1.25, -2.45], fov: 36, push: 0.003 },
        { f: w("bırakamıyor") - 6, dur: 20, pos: [1.58, 1.45, -0.95], look: [1.5, 1.27, -2.45], fov: 34, roll: -0.05, push: 0.003, punch: 0.008, n: 20 }],
      cast: [...patients((i) => (i === 2 ? { 0: "nervous", [w("bırakamıyor")]: "pained" } : "pained")),
        { o: "doctor", p: [2.35, -1.85], expr: "nervous", facing: -1, reach: [[w("bırakamıyor") - 8, 0.3], [w("bırakamıyor") + 2, 0.7], [w("bırakamıyor") + 10, 0.7], [w("bırakamıyor") + 18, 0.3]] }],
      fx: [{ k: "shiver", p: [1.5, 1.62, -2.75], s: 0.62 }],
      props: [{ k: "bottle", p: [1.5, 0.93, -2.6], h: 0.2, path: [[w("bırakamıyor") - 6, 1.5, 0.93, -2.6, 0], [w("bırakamıyor") + 2, 1.62, 0.93, -2.6, -0.3], [w("bırakamıyor") + 16, 1.5, 0.93, -2.6, 0]] }] },
    { a: 1359, set: "lab", sun: [150, 42], // 14 deadpan pair: same framing twice
      cam: [tableWide(1359), tableWide(w("Ne") - 2), { f: w("yapıyordu") - 4, dur: 22, pos: [0.21, 1.32, 1.15], look: [0.17, 1.18, 0.15], fov: 32, roll: -0.04, push: 0.003, punch: 0.009, n: 20 }],
      fx: [{ k: "chains", f: 0, dur: 1, p: [BM[0], BM[1] + 0.13, BM[2] + 0.06] }, { k: "halo", f: 0, breakAt: w("yapıyordu") + 2, p: [BH[0], BH[1] + 0.33, BH[2]] },
        { k: "chains", f: w("yapıyordu"), dur: 18, p: [BH[0], BH[1] + 0.13, BH[2] + 0.06] }, { k: "burst", f: w("yapıyordu") + 2, p: [BH[0], BH[1] + 0.15, BH[2] + 0.1], s: 0.45, col: "#ffffff", dur: 10 }],
      props: [{ k: "bottle", p: BM, color: "#3a6fb0" }, { k: "bottle", p: BH }] },
    { a: 1525, set: "brain", // 15 fast to the brain: the disguised thief runs past the guard
      cam: [{ f: 1525, pos: [6, 7, 42], look: [0, 6, -4], fov: 44, push: 0.0025 }, { f: w("morfinden") - 10, dur: 28, pos: [5.2, 1.8, 13], look: [0.2, 1.4, 2.0], fov: 42, roll: 0.03, push: 0.003 }],
      cast: [{ o: "guard", p: [2.0, 1.4], expr: { 0: "neutral", [w("morfinden")]: "stern" }, facing: -1, wave: { 0: false, [w("morfinden")]: true } },
        { o: "thief", p: [-0.5, 22], to: { p: [-0.5, 3.4], f0: 1525, f1: 1615, ease: false }, rate: 1.1, expr: "neutral", facing: 1 },
        { o: "disguise", p: [0.5, 30], to: { p: [0.5, -0.5], f0: w("beyne") - 6, f1: w("hızlı") + 4 }, mode: "march", expr: "grin", dust: true, from: w("beyne") - 6, until: w("hızlı") + 4 }] },
    { a: 1615, set: "brain", // 16 inside: back into morphine; the same thief
      cam: [{ f: 1615, pos: [1.6, 1.5, -6.2], look: [0, 1.4, -0.8], fov: 40, push: 0.003 },
        { f: w("aynı", 2) - 8, dur: 26, pos: [0.9, 1.6, -5.4], look: [0.2, 1.5, -2.4], fov: 38, push: 0.003, punch: 0.007, n: 24 }],
      cast: [{ o: "disguise", p: [0.25, -0.2], to: { p: [0.25, -2.4], f0: 1615, f1: 1633 }, mode: "march", swap: [[w("dönüşür") - 1, "thief"]],
        expr: { 0: "grin", [w("kılık")]: "laugh" }, wave: { 0: false, [w("kılık")]: true } }],
      fx: [{ k: "puff", f: w("dönüşür"), p: [0.25, 1.0, -2.15], s: 2.2 },
        { k: "card", draw: "tophat", f: w("dönüşür"), until: w("kılık"), p: [0.8, 2, -2.25], w: 0.36, path: [[w("dönüşür"), 0.8, 2.0, -2.25, 0], [w("dönüşür") + 12, 0.8, 0.15, -2.25, -1.2]] },
        { k: "card", draw: "tophat", f: w("kılık"), p: [0.67, 1.95, -2.3], w: 0.32 },
        { k: "card", draw: "moustache", f: w("dönüşür"), p: [-0.1, 1.5, -2.2], w: 0.22, path: [[w("dönüşür"), -0.1, 1.5, -2.2, 0], [w("dönüşür") + 14, -0.1, 0.08, -2.2, 0.8]] },
        { k: "card", draw: "sack", f: w("dönüşür"), p: [-0.25, 0.42, -2.28], w: 0.48 }] },
    { a: 1753, set: "brain", // 17 the guard is left dizzy
      cam: [{ f: 1753, pos: [-2.6, 1.7, 9.8], look: [0.8, 1.4, 1.4], fov: 40, roll: -0.03, push: 0.003 }],
      cast: [{ o: "guard", p: [2.0, 1.4], expr: "dazed", facing: -1 }, { o: "thief", p: [-0.5, 3.4], to: { p: [-0.5, 2.3], f0: w("girmişti"), f1: w("girmişti") + 30 }, expr: "nervous", facing: 1 }],
      fx: [{ k: "stars", p: [2.0, 2.45, 1.4], s: 0.75 }] },
    { a: 1813, set: "street", light: "golden", sun: [140, 16], // 18 1913: the works go quiet
      cam: [{ f: 1813, pos: [-6, 2.4, 24], look: [0, 6, -6], fov: 44, push: 0.0022 }, { f: w("bıraktı") - 12, dur: 28, pos: [-2.5, 1.7, 10.5], look: [0, 3.2, -3], fov: 42, push: 0.0025 }],
      cast: [0, 1, 2, 3, 4].map((i) => ({ o: ["worker", "worker2", "worker3", "worker4", "worker5"][i], p: [[-2.4, 1.8, -0.6, 3.2, -3.4][i], -1 + i * 2.2] as [number, number],
        to: { p: [[-2.4, 1.8, -0.6, 3.2, -3.4][i], -1 + i * 2.2 + 4] as [number, number], f0: 1813, f1: 1910, ease: false }, expr: i % 2 ? "nervous" : "neutral" })),
      fx: [{ k: "smoke", p: [-9, 26, -11], f1: 1845, warm: true }, { k: "smoke", p: [9, 26, -11], f1: 1845, warm: true }, { k: "gate", f0: 1862, f1: 1892, p: [0, 1.7, -2.0] }] },
    { a: 1910, set: "cap", // 19 America
      cam: [{ f: 1910, pos: [10, 4, 80], look: [0, 14, 0], fov: 42, push: 0.003 }],
      cast: ["official", "gent", "lady", "man", "lady2"].map((o, i) => ({ o, p: [-6 + i * 3.1, 24 + (i % 2) * 3] as [number, number], expr: "neutral" as const })) },
    { a: 1964, set: "cap", // 20 1924: banned
      cam: [{ f: 1964, pos: [0.9, 2.1, 36.4], look: [0, 1.0, 34], fov: 38, push: 0.003 }, { f: w("yasakladı") - 4, dur: 14, pos: [0.6, 1.85, 35.6], look: [0, 1.0, 34], fov: 36, push: 0.003 }],
      cast: [{ o: "official", p: [-0.1, 33], expr: { 0: "neutral", [w("yasakladı")]: "stern" } }],
      fx: [{ k: "card", draw: "paper", p: [-0.12, 0.957, 34.05], w: 0.42, flat: true, rot: 0.08 },
        { k: "card", draw: "stamp", p: [-0.12, 1.75, 34.06], w: 0.22, path: [[w("yasakladı") - 8, -0.12, 1.75, 34.06], [w("yasakladı"), -0.12, 1.03, 34.06], [w("yasakladı") + 6, -0.12, 1.03, 34.06], [w("yasakladı") + 18, -0.12, 1.63, 34.06]] },
        { k: "ban", f: w("yasakladı"), p: [-0.12, 0.962, 34.05] }],
      props: [{ k: "bottle", p: [0.38, 0.95, 33.88], h: 0.24 }] },
    { a: 2017, set: "bath", sun: [160, 35], // 21 aspirin is still in the cabinet
      cam: [{ f: 2017, pos: [0.6, 1.5, 2.2], look: [0, 1.5, -0.35], fov: 40, push: 0.002 }, { f: w("aspirin", 2) - 8, dur: 32, pos: [0.12, 1.52, 0.55], look: [0.1, 1.43, -0.38], fov: 36, push: 0.0018 }],
      props: [{ k: "pillbox", p: [0.1, 1.435, -0.34], yaw: -0.12 }] },
  ],
};
