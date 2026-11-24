// Lamartine'in Aydın çiftliği: Edge Ahmet, no music. Positions are set-relative.
import { Spec, wordsAt, Word, V3 } from "../engine/spec";
import type { Outfit } from "../engine/toon";
import words from "./words.json";

const W = words as Word[];
const w = wordsAt(W);
const LAM: Outfit = { jacket: "#2f3442", pants: "#3b3f52", boots: "#2a201a", skin: "#ffe2c2", hat: "tophat" };
const LAM_FARM: Outfit = { ...LAM, jacket: "#6b7a3a", hat: "cap", cap: "#d9c08a" };
const SULTAN: Outfit = { jacket: "#1f2a44", pants: "#1f2a44", boots: "#2a201a", skin: "#f5c9a0", hat: "hair", hair: "#2a201a", moustache: "#2a201a", sash: "#c8323a", buttons: "#e0b43c" };
const desk = (f: number, cut = true) => ({ f, pos: [0.35, 1.45, 1.35] as V3, look: [-0.3, 0.85, 0] as V3, fov: 34, push: 0.003, cut });
const office = (f: number) => ({ f, pos: [0.6, 1.7, 4.6] as V3, look: [0, 1.3, -0.6] as V3, fov: 40, push: 0.0025 });
const plain = (f: number, cut = true) => ({ f, pos: [2.2, 1.6, 8.5] as V3, look: [0, 1.5, 0] as V3, fov: 40, push: 0.0022, cut });
const palace = (f: number) => ({ f, pos: [0.4, 1.9, 6.0] as V3, look: [0.2, 1.5, -2.0] as V3, fov: 40, push: 0.0025 });

export const lamartineSpec: Spec = {
  id: "LamartineShort", total: 2149, words: W,
  sets: { plain: "meadow", office: "office", cap: "capitol", palace: "palace", harbor: "harbor", street: "street" },
  flashAt: 153,
  xfade: { 4: 8, 8: 8, 9: 8, 10: 8, 14: 8, 19: 10 },
  kicks: [[w("yenilgi"), 0.9], [w("kabul"), 0.5], [w("yoktu") + 2, 0.6], [w("sekiz", 2), 0.6]],
  dof: [[0, 0], [153, 10], [317, 0], [414, 13], [466, 9], [699, 13], [777, 8], [921, 0], [1003, 0], [1391, 9], [1569, 9],
    [1667, 8], [1804, 10], [1876, 12], [1984, 0], [2062, 8]],
  captions: [[317, 414, 0.86], [921, 1003, 0.86], [414, 466, 0.24], [699, 777, 0.24], [1876, 1984, 0.24]],
  shots: [
    { a: 0, set: "plain", // 1 hook: the politician turns farmer
      cam: [{ f: 0, pos: [2.5, 1.7, 9.5], look: [0, 1.6, 0], fov: 42, push: 0.0025 }, { f: w("çiftçi") - 8, dur: 20, pos: [1.4, 1.6, 5.2], look: [0.2, 1.5, 0.4], fov: 40, push: 0.003, punch: 0.008, n: 22 }],
      cast: [{ o: LAM, p: [-0.4, 3], to: { p: [0.2, 0.6], f0: 0, f1: w("çiftçi") - 6 }, swap: [[w("çiftçi") - 1, LAM_FARM]], expr: { 0: "smile", [w("çiftçi")]: "grin" } }],
      fx: [{ k: "puff", f: w("çiftçi") - 2, p: [0.2, 1.2, 0.8], s: 2.0 }] },
    { a: 153, set: "office", sun: [150, 40], // 2 name
      cam: [office(153), { f: w("Lamartine") - 6, dur: 20, pos: [0.4, 1.65, 3.2], look: [0, 1.5, -1.0], fov: 38, push: 0.003, punch: 0.008, n: 22 }],
      cast: [{ o: LAM, p: [0, -1.2], expr: "smile_closed" }],
      fx: [{ k: "sparkle", f: w("Lamartine") - 2, dur: 30, p: [0, 1.9, -1.0], s: 0.9 }] },
    { a: 214, set: "office", sun: [150, 40], // 3 poet, foreign minister
      cam: [{ f: 214, pos: [0.4, 1.65, 3.2], look: [0, 1.4, -0.9], fov: 38, push: 0.003 }, { f: w("dışişleri") - 8, dur: 26, pos: [3.6, 1.6, 3.6], look: [1.6, 1.3, -0.2], fov: 40, push: 0.003 }],
      cast: [{ o: LAM, p: [0, -1.2], expr: { 0: "smile", [w("şair")]: "grin" }, wave: { 0: false, [w("dışişleri")]: true } }],
      fx: [{ k: "notes", f: w("şair"), until: w("dışişleri"), p: [0.3, 2.0, -1.0], s: 1.2 },
        { k: "card", draw: "paper", f: w("şair"), p: [-0.4, 1.4, -0.6], w: 0.24, path: [[w("şair"), -0.4, 0.9, -0.4, 0], [w("şair") + 30, -0.8, 1.9, -0.8, 0.6]] }],
      props: [{ k: "books", p: [-0.8, 0.78, 0.2] }] },
    { a: 317, set: "cap", // 4 1848 election (Paris)
      cam: [{ f: 317, pos: [10, 4, 80], look: [0, 14, 0], fov: 42, push: 0.003 }, { f: w("aday") - 8, dur: 30, pos: [1.6, 1.9, 34], look: [0, 2.0, 22], fov: 40, push: 0.003 }],
      cast: ["official", "gent", "lady", "man", "lady2", "merchant"].map((o, i) => ({ o, p: [-1.9 + i * 0.75, 24 + (i % 2) * 1.2] as [number, number], expr: { 0: "neutral", [w("aday")]: i % 2 ? "grin" : "smile" } as Record<number, "neutral" | "grin" | "smile"> }))
        .concat([{ o: LAM as unknown as string, p: [0.2, 28] as [number, number], expr: { 0: "grin" } as Record<number, "neutral" | "grin" | "smile">, wave: true } as never]) },
    { a: 414, set: "cap", // 5 heavy defeat
      cam: [{ f: 414, pos: [0.9, 2.2, 38.2], look: [0, 1.4, 34], fov: 40, push: 0.003 }, { f: w("yenilgi") - 4, dur: 12, pos: [0.6, 2.0, 37.3], look: [0, 1.35, 34], fov: 38, push: 0.003 }],
      cast: [{ o: LAM, p: [-0.1, 33], expr: { 0: "nervous", [w("yenilgi")]: "shock" } }],
      fx: [{ k: "card", draw: "paper", p: [-0.12, 0.957, 34.05], w: 0.42, flat: true, rot: 0.08 },
        { k: "card", draw: "stamp", p: [-0.12, 1.75, 34.06], w: 0.22, path: [[w("yenilgi") - 8, -0.12, 1.75, 34.06], [w("yenilgi"), -0.12, 1.03, 34.06], [w("yenilgi") + 6, -0.12, 1.03, 34.06], [w("yenilgi") + 18, -0.12, 1.63, 34.06]] },
        { k: "ban", f: w("yenilgi"), p: [-0.12, 0.962, 34.05] }] },
    { a: 466, set: "office", sun: [150, 40], // 6 debts
      cam: [{ f: 466, pos: [1.0, 1.6, 3.8], look: [-0.1, 1.3, -0.7], fov: 40, push: 0.0028, roll: 0.03 }],
      cast: [{ o: LAM, p: [0, -1.2], expr: "pained" }, { o: "merchant", p: [-1.4, 0.4], expr: "stern", facing: 1, wave: true }, { o: "gent", p: [1.3, 0.6], expr: "stern", facing: -1 }],
      fx: [{ k: "coins", f: w("borç") - 2, p: [0, 1.0, -0.6], s: 0.7 }, { k: "shiver", f: w("borç"), p: [0, 1.6, -1.2], s: 0.55 }] },
    { a: 540, set: "office", sun: [150, 40], // 7 a different plan: a farm in Ottoman lands
      cam: [office(540), { f: w("Osmanlı") - 8, dur: 28, pos: [3.4, 1.55, 3.0], look: [2.2, 1.2, 0.3], fov: 38, push: 0.003 }],
      cast: [{ o: LAM, p: [0, -1.2], expr: { 0: "nervous", [w("plan")]: "grin" }, wave: { 0: false, [w("Osmanlı")]: true } }],
      fx: [{ k: "bulb", f: w("plan") - 2, p: [0.3, 2.3, -1.1], s: 0.55 }, { k: "arrow", f: w("Osmanlı"), dur: 14, p: [1.6, 1.6, 0.3], w: 0.7, rot: -0.3 }, { k: "sparkle", f: w("çiftlik") - 2, dur: 26, p: [2.4, 1.15, 0.7], s: 0.6 }] },
    { a: 699, set: "office", sun: [150, 40], // 8 a letter to the Sultan
      cam: [desk(699, false)],
      cast: [{ o: LAM, p: [0, -1.2], expr: "grin" }],
      fx: [{ k: "card", draw: "paper", p: [-0.4, 0.786, 0.05], w: 0.3, flat: true, rot: 0.1, until: w("mektup") + 22 },
        { k: "card", draw: "paper", f: w("mektup") + 22, p: [-0.4, 0.8, 0.05], w: 0.3, path: [[w("mektup") + 22, -0.4, 0.9, 0.05, 0], [w("mektup") + 50, 0.8, 2.6, 0.5, 1.2]] },
        { k: "sparkle", f: w("yazıyor"), dur: 24, p: [-0.4, 0.95, 0.1], s: 0.35 }] },
    { a: 777, set: "palace", sun: [150, 40], // 9 the Sultan says yes
      cam: [palace(777), { f: w("kabul") - 6, dur: 20, pos: [0.2, 1.75, 2.8], look: [0, 1.45, -2.8], fov: 38, push: 0.003, punch: 0.008, n: 22 }],
      cast: [{ o: SULTAN, p: [0, 0.6, -3.0], expr: { 0: "neutral", [w("kabul")]: "smile" }, shadow: false, wave: { 0: false, [w("ova")]: true } }, { o: "official", p: [1.5, 0.3, -2.4], expr: "smile", facing: -1, shadow: false }],
      fx: [{ k: "card", draw: "paper", p: [1.1, 1.25, -2.2], w: 0.26 }, { k: "burst", f: w("kabul") - 2, p: [0, 2.0, -3.2], s: 1.6, col: "#ffe27a", dur: 14 }] },
    { a: 921, set: "harbor", // 10 to İzmir by steamship
      cam: [{ f: 921, pos: [-7, 2.4, -9], look: [0, 3.4, 11], fov: 44, push: 0.002 }, { f: w("İzmir'e") - 8, dur: 30, pos: [-8.5, 2.2, -13], look: [-3, 1.9, -2], fov: 40, push: 0.003 }],
      cast: [{ o: LAM, p: [-4.6, -3.2], to: { p: [-5.2, -7.6], f0: w("İzmir'e"), f1: 1003 }, expr: "grin" }, { o: "sailor", p: [-3.6, -1.8], expr: "smile", facing: -1 }],
      fx: [{ k: "smoke", p: [-3, 10.5, 12] }, { k: "smoke", p: [3, 10.5, 12] }],
      props: [{ k: "crate", p: [-7.2, 0, -3.6], h: 0.8 }] },
    { a: 1003, set: "plain", // 11 touring the fields, dreaming
      cam: [{ f: 1003, pos: [4.5, 1.8, 12], look: [0, 1.4, 2], fov: 42, push: 0.0025 }, { f: w("hayaller") - 8, dur: 26, pos: [2.0, 1.6, 6.5], look: [0, 1.6, 1.2], fov: 40, push: 0.003 }],
      cast: [{ o: LAM_FARM, p: [1.2, 8], to: { p: [0, 1.4], f0: 1003, f1: w("hayaller") }, expr: { 0: "smile", [w("hayaller")]: "grin" }, wave: { 0: false, [w("hayaller")]: true } }],
      fx: [{ k: "heart", f: w("büyük"), p: [0.3, 2.1, 1.4], s: 0.35 }, { k: "sparkle", f: w("hayaller"), p: [0, 2.3, 1.2], s: 0.7 }] },
    { a: 1091, set: "plain", // 12 deadpan: luckily, a huge plain
      cam: [plain(1091, false)],
      cast: [{ o: LAM_FARM, p: [0, 0.4], expr: "grin", wave: true }],
      fx: [{ k: "sparkle", f: w("ova", 2), dur: 30, p: [0.4, 2.2, 0.4], s: 0.7 }] },
    { a: 1165, set: "plain", // 13 deadpan: unfortunately, no money
      cam: [plain(1165)],
      cast: [{ o: LAM_FARM, p: [0, 0.4], expr: { 0: "grin", [w("yoktu")]: "shock" }, wave: { 0: true, [w("parası")]: false } }],
      fx: [{ k: "rain", f: w("yoktu"), p: [0, 2.9, 0.4], s: 1.3 }] },
    { a: 1250, set: "plain", // 14 because land needs seed, workers and tools
      cam: [{ f: 1250, pos: [2.0, 1.7, 10.0], look: [0, 1.2, 0], fov: 42, push: 0.0025 }],
      cast: [{ o: LAM_FARM, p: [-1.1, 0.4], expr: "nervous", facing: 1 }, { o: "farmer", p: [-0.1, -0.5], expr: "smile", from: w("işçi") - 2 }, { o: "worker3", p: [0.8, -1.6], expr: "smile", from: w("işçi") + 4 }],
      fx: [{ k: "card", draw: "sack", f: w("Tohum") - 2, p: [-0.4, 0.3, 1.2], w: 0.5 }, { k: "puff", f: w("Tohum") - 2, p: [-0.4, 0.4, 1.3], s: 1.0 },
        { k: "puff", f: w("işçi") - 2, p: [0.4, 1.0, -0.3], s: 1.6 }, { k: "coins", f: w("alet") - 2, p: [1.0, 1.4, 1.0], s: 0.7 }],
      props: [{ k: "crate", p: [1.8, 0, 1.2], h: 0.7 }] },
    { a: 1391, set: "street", // 15 like a free car without fuel money
      cam: [{ f: 1391, pos: [1.5, 2.0, 21], look: [6.0, 1.1, 14.5], fov: 40, push: 0.0025 }, { f: w("durur") - 20, dur: 30, pos: [2.6, 1.7, 19.2], look: [5.8, 1.1, 14.8], fov: 38, push: 0.003 }],
      cast: [{ o: "man", p: [5.0, 15.6], expr: { 0: "grin", [w("Benzin")]: "nervous", [w("durur")]: "dazed" }, facing: 1, wave: { 0: true, [w("Benzin")]: false } }],
      fx: [{ k: "sparkle", f: w("bedava") - 2, dur: 30, p: [6.5, 1.4, 14.3], s: 1.0 }, { k: "clock", f: w("öylece"), p: [6.6, 2.8, 14.2], s: 0.7, dur: 30 }, { k: "stars", f: w("durur"), p: [5.0, 2.2, 15.6], s: 0.5 }] },
    { a: 1569, set: "office", sun: [150, 40], // 16 no investors
      cam: [{ f: 1569, pos: [0.8, 1.7, 5.0], look: [0, 1.3, -0.2], fov: 42, push: 0.0025 }],
      cast: [{ o: LAM, p: [0, -1.2], expr: { 0: "grin", [w("bulamıyor")]: "pained" }, wave: { 0: true, [w("ama")]: false } },
        { o: "merchant", p: [-1.2, 1.0], to: { p: [-3.4, 3.8], f0: w("ama"), f1: w("ama") + 40 }, expr: { 0: "stern" }, facing: -1 },
        { o: "gent", p: [1.3, 1.1], to: { p: [3.4, 3.8], f0: w("kimseyi"), f1: w("kimseyi") + 40 }, expr: "stern", facing: 1 }] },
    { a: 1667, set: "palace", sun: [150, 40], // 17 the state takes the plain back, pays a yearly sum
      cam: [palace(1667), { f: w("ödeme") - 8, dur: 22, pos: [2.4, 1.75, 3.6], look: [0.2, 1.4, -2.2], fov: 38, push: 0.003 }],
      cast: [{ o: SULTAN, p: [0, 0.6, -3.0], expr: "smile", shadow: false }, { o: LAM, p: [1.0, -1.8], expr: { 0: "nervous", [w("ödeme")]: "relief" }, facing: -1 },
        { o: "official", p: [-1.4, 0.3, -2.3], expr: "neutral", facing: 1, shadow: false }],
      fx: [{ k: "coins", f: w("ödeme") - 2, p: [1.0, 2.0, -1.7], s: 0.6 }] },
    { a: 1804, set: "office", sun: [150, 40], // 18 he never forgets
      cam: [{ f: 1804, pos: [0.4, 1.65, 3.2], look: [0, 1.5, -1.0], fov: 38, push: 0.003 }],
      cast: [{ o: LAM, p: [0, -1.2], expr: "smile_closed" }],
      fx: [{ k: "heart", f: w("unutmuyor") - 2, p: [0.2, 2.0, -1.0], s: 0.4 }] },
    { a: 1876, set: "office", sun: [150, 40], // 19 eight volumes
      cam: [desk(1876, false), { f: w("sekiz") - 6, dur: 18, pos: [0.1, 1.5, 2.4], look: [-0.2, 1.2, -0.4], fov: 38, push: 0.003, punch: 0.01, n: 22 }],
      cast: [{ o: LAM, p: [0, -1.2], expr: { 0: "smile", [w("sekiz")]: "grin" } }],
      fx: [{ k: "clock", p: [0.6, 1.5, -0.5], s: 0.35, dur: 20 }, { k: "sparkle", f: w("sekiz") - 2, dur: 30, p: [-0.4, 1.15, 0.1], s: 0.5 }],
      props: [{ k: "books", p: [-0.4, 0.78, 0.05], rows: [0, 1, 2, 3, 4, 5, 6, 7] }] },
    { a: 1984, set: "plain", light: "golden", sun: [140, 16], // 20 he lost a farm
      cam: [{ f: 1984, pos: [3.5, 2.0, 12], look: [0, 1.4, -2], fov: 44, push: 0.002 }],
      cast: [{ o: LAM_FARM, p: [0, 2], to: { p: [0.3, -6], f0: 1984, f1: 2062, ease: false }, expr: "smile_closed" }] },
    { a: 2062, set: "palace", sun: [150, 40], // 21 but the Ottomans gained a friend of eight volumes
      cam: [{ f: 2062, pos: [0.3, 1.7, 4.6], look: [0.3, 1.4, -1.8], fov: 38, push: 0.0028 }],
      cast: [{ o: SULTAN, p: [0, 0.6, -3.0], expr: "grin", shadow: false }, { o: LAM, p: [0.8, -1.8], expr: "laugh", facing: -1, wave: true }],
      fx: [{ k: "heart", f: w("dost") - 2, p: [0.4, 2.3, -1.5], s: 0.5 }, { k: "sparkle", f: w("kazandı"), p: [0.4, 2.0, -1.4], s: 0.9 }],
      props: [{ k: "books", p: [0.15, 0.3, -1.9], rows: [0, 1, 2, 3, 4, 5, 6, 7] }] },
  ],
};
