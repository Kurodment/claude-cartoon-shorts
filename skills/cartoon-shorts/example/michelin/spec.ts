// Michelin Rehberi (roleplay, 2nd person): ElevenLabs Can Seçkin, no music. Positions are set-relative.
import { Spec, wordsAt, Word, ActorSpec, FxSpec, PropSpec } from "../engine/spec";
import type { Outfit } from "../engine/toon";
import words from "./words.json";

const W = words as Word[];
const w = wordsAt(W);
/** the viewer's role: the tyre-company boss, the same look in every shot */
const YOU: Outfit = { jacket: "#2f5f6a", pants: "#3b3f52", boots: "#2a201a", skin: "#ffe2c2", hat: "tophat", moustache: "#5a3b2a", buttons: "#e8c45a" };
const office = (f: number) => ({ f, pos: [0.6, 1.7, 4.6] as [number, number, number], look: [0, 1.3, -0.6] as [number, number, number], fov: 40, push: 0.0025 });
const ALONG_Z = Math.PI / 2; // oldCar front toward -z
const car = (z0: number, z1: number, f0: number, f1: number, x = 0, col?: string): PropSpec => ({ k: "oldCar", p: [x, 0, z0], yaw: ALONG_Z, color: col, path: [[f0, x, 0, z0], [f1, x, 0, z1]] });
const driver = (o: string, z0: number, z1: number, f0: number, f1: number, x = 0): ActorSpec => ({ o, p: [x, 0.5, z0 + 0.3], to: { p: [x, z1 + 0.3], f0, f1, ease: false }, expr: "grin", shadow: false });
const rosettes = (f: number, y: number, z: number, gap = 10): FxSpec[] => [-0.62, 0, 0.62].map((x, i) => ({ k: "card", draw: "rosette", f: f + i * gap, p: [x, y + (i === 1 ? 0.12 : 0), z], w: 0.42 }));

export const michelinSpec: Spec = {
  id: "MichelinShort", total: 2302, words: W,
  sets: { shop: "garage", office: "office", town: "street", road: "meadow", bistro: "bistro" },
  flashAt: w("Michelin'di") - 2,
  xfade: { 3: 8, 6: 8, 16: 10, 20: 8, 26: 10 },
  kicks: [[w("sorunun"), 0.6], [w("batıyor"), 0.7], [w("sıkıştırılmış"), 0.8], [w("senden"), 0.5]],
  dof: [[0, 8], [114, 13], [180, 0], [266, 9], [363, 9], [458, 0], [614, 13], [707, 8], [864, 0], [972, 8], [1060, 14], [1155, 12], [1231, 9],
    [1307, 8], [1462, 12], [1525, 12], [1595, 0], [1676, 6], [1780, 10], [1870, 8], [1929, 11], [2056, 13], [2150, 8]],
  captions: [[1060, 1155, 0.24], [1462, 1525, 0.82]],
  shots: [
    { a: 0, set: "shop", sun: [150, 40], // 1 you are a tyre company
      cam: [{ f: 0, pos: [0.8, 1.7, 5.4], look: [0, 1.3, -1.5], fov: 40, push: 0.0025 }, { f: w("şirketisin") - 6, dur: 16, pos: [0.6, 1.65, 4.2], look: [0, 1.35, -1.4], fov: 40, push: 0.003, punch: 0.008, n: 20 }],
      cast: [{ o: YOU, p: [0, -1.0], expr: { 0: "smile", [w("şirketisin")]: "grin" }, hold: "tyre", holdW: 0.38 }],
      props: [{ k: "tyres", p: [-1.5, 0, -0.6], rows: [0, 1, 2, 3, 4] }, { k: "tyres", p: [1.6, 0, -0.9], rows: [0, 1, 2] }] },
    { a: 114, set: "shop", sun: [150, 40], // 2 a huge problem
      cam: [{ f: 114, pos: [0.6, 1.65, 2.2], look: [0.1, 1.55, -1.0], fov: 36, push: 0.003 }],
      cast: [{ o: YOU, p: [0, -1.0], expr: { 0: "nervous", [w("sorunun")]: "shock" }, pose: "temple,cheek" }],
      fx: [{ k: "shiver", f: w("sorunun"), p: [0, 1.6, -1.0], s: 0.5 }] },
    { a: 180, set: "town", // 3 fewer than three thousand cars in the whole country
      cam: [{ f: 180, pos: [5, 2.4, 8], look: [1.5, 1.2, 30], fov: 40, push: 0.0025 }, { f: 200, dur: 60, pos: [3.5, 1.8, 13], look: [2, 1.1, 26], fov: 40, push: 0.0025, ease: "out", via: [[5.5, 2.2, 10.5]] }],
      cast: [driver("driver", 44, 18, 180, 266, 2)],
      fx: [{ k: "clock", f: w("3000'den"), dur: 40, p: [-2.5, 3.2, 22], s: 1.0 }],
      props: [car(44, 18, 180, 266, 2, "#8c2f3c")] },
    { a: 266, set: "shop", sun: [150, 40], // 4 no cars, no tyres, sinking
      cam: [{ f: 266, pos: [1.6, 1.7, 4.8], look: [-0.4, 1.2, -1.4], fov: 40, push: 0.003 }],
      cast: [{ o: YOU, p: [0, -1.0], expr: { 0: "nervous", [w("batıyor")]: "shock" }, pose: { 0: "hang", [w("batıyor")]: "cheek,cheek" } }],
      fx: [{ k: "rain", f: w("satılmıyor"), p: [0, 3.0, -1.0], s: 1.2 }],
      props: [{ k: "tyres", p: [-1.4, 0, -0.4], rows: [0, 1, 2, 3, 4, 5] }, { k: "tyres", p: [1.4, 0, -0.6], rows: [0, 1, 2, 3, 4] }] },
    { a: 363, set: "office", sun: [150, 40], // 5 first move: make people drive more
      cam: [office(363), { f: w("hamlen") - 6, dur: 18, pos: [0.4, 1.65, 3.2], look: [0, 1.5, -1.0], fov: 38, push: 0.003, punch: 0.008, n: 20 }],
      cast: [{ o: YOU, p: [0, -1.2], expr: { 0: "squint", [w("hamlen")]: "grin" }, pose: { 0: "cross,cross", [w("hamlen")]: "hang,up" } }],
      fx: [{ k: "bulb", f: w("hamlen") - 2, p: [0.25, 2.3, -1.1], s: 0.5 }] },
    { a: 458, set: "road", // 6 nobody knows where to drive
      cam: [{ f: 458, pos: [3.4, 1.9, 6.4], look: [0, 1.0, -1.6], fov: 40, push: 0.0025 }],
      cast: [{ o: "driver", p: [0, 0.5, -1.7], expr: { 0: "neutral", [w("bilmiyor")]: "dazed" }, shadow: false, look: 1, pose: { 0: "hang", [w("bilmiyor") - 6]: "shrug,shrug" } }],
      fx: [{ k: "stars", f: w("bilmiyor"), p: [0, 2.6, -1.7], s: 0.5 }],
      props: [{ k: "oldCar", p: [0, 0, -2], yaw: ALONG_Z }] },
    { a: 542, set: "road", // 7 finding petrol is an adventure
      cam: [{ f: 542, pos: [2.4, 1.6, 5.0], look: [0.3, 1.1, -1.4], fov: 40, push: 0.003 }],
      cast: [{ o: "driver", p: [0.9, -0.9], expr: "nervous", facing: -1, pose: "temple,hip" }],
      fx: [{ k: "clock", f: w("macera") - 4, dur: 30, p: [1.3, 2.5, -1.0], s: 0.4 }],
      props: [{ k: "oldCar", p: [0, 0, -2], yaw: ALONG_Z }] },
    { a: 614, set: "office", sun: [150, 40], // 8 so you give them a little red book
      cam: [{ f: 614, pos: [0.1, 1.55, 2.3], look: [-0.05, 1.2, -0.5], fov: 40, push: 0.003 }, { f: w("kitap") - 4, dur: 10, pos: [0.05, 1.5, 2.0], look: [-0.05, 1.2, -0.5], fov: 40, push: 0.003, punch: 0.01, n: 20 }],
      cast: [{ o: YOU, p: [0, -1.2], expr: { 0: "smile", [w("kitap")]: "grin" } }],
      fx: [{ k: "card", draw: "guide", p: [-0.3, 2.0, 0.05], w: 0.3, path: [[w("kitap") - 14, -0.3, 1.7, 0.05, 0.4], [w("kitap"), -0.3, 0.98, 0.05, 0]] },
        { k: "sparkle", f: w("kitap"), dur: 26, p: [-0.3, 1.0, 0.1], s: 0.45 }] },
    { a: 707, set: "office", sun: [150, 40], // 9 maps and petrol stations inside
      cam: [office(707)],
      cast: [{ o: YOU, p: [0, -1.2], expr: "grin", pose: "hip,lift" }],
      fx: [{ k: "map", f0: w("haritalar") - 4, f1: w("benzinlikler") + 10, p: [0, 2.6, -2.6], w: 2.4, h: 1.5 }] },
    { a: 779, set: "shop", sun: [150, 40], // 10 it even explains how to change a tyre
      cam: [{ f: 779, pos: [1.2, 1.7, 5.2], look: [0, 1.0, -1.4], fov: 40, push: 0.0025 }],
      cast: [{ o: "mechanic", p: [-0.4, -0.6], expr: "stern", hold: "tyre", holdW: 0.4, facing: 1 }, { o: YOU, p: [0.7, 0.5], expr: "grin", hold: "guide", facing: -1 }],
      props: [{ k: "oldCar", p: [0.4, 0, -2.2] }] },
    { a: 864, set: "town", // 11 thirty-five thousand printed and given away free
      cam: [{ f: 864, pos: [0.5, 2.0, 24], look: [0, 1.9, 10], fov: 42, push: 0.0025 }],
      cast: [{ o: YOU, p: [0, 13.5], expr: "laugh", wave: true }, { o: "lady", p: [-1.6, 12.6], expr: "grin", wave: { 0: false, [w("bedava")]: true } },
        { o: "man", p: [1.6, 12.8], expr: "grin", wave: { 0: false, [w("bedava") + 6]: true } }, { o: "gent", p: [-0.9, 11.2], expr: "smile", hold: "guide" }, { o: "girl", p: [1.0, 11.4], expr: "laugh", hold: "guide" }],
      fx: [-1.4, -0.5, 0.4, 1.3].map((x, i) => ({ k: "card", draw: "guide", p: [x, 4, 13], w: 0.26, path: [[w("bedava") - 20 + i * 6, x, 4.2, 13, 0.5 * (i % 2 ? 1 : -1)], [w("bedava") + 10 + i * 6, x * 0.8, 1.4, 13.2, 0]] }) as FxSpec) },
    { a: 972, set: "shop", sun: [150, 40], // 12 one day you walk into a tyre shop
      cam: [{ f: 972, pos: [0.4, 1.8, 6.4], look: [0, 1.2, -2.0], fov: 40, push: 0.0025 }],
      cast: [{ o: YOU, p: [1.4, 3.2], to: { p: [0.4, 0.2], f0: 975, f1: 1050 }, expr: "smile", mode: "stroll" }, { o: "mechanic", p: [-0.8, -2.2], expr: "neutral", facing: 1, pose: "hip,hip" }] },
    { a: 1060, set: "shop", sun: [150, 40], // 13 your book is propping up the workbench leg
      cam: [{ f: 1060, pos: [-0.8, 0.45, -1.4], look: [-1.32, 0.2, -2.93], fov: 34, push: 0.003 }, { f: w("sıkıştırılmış") - 4, dur: 8, pos: [-0.95, 0.38, -1.75], look: [-1.32, 0.12, -2.93], fov: 34, push: 0.003, punch: 0.012, n: 22 }],
      fx: [{ k: "sparkle", f: w("ayağının"), dur: 24, p: [-1.32, 0.2, -2.8], s: 0.3 }] },
    { a: 1155, set: "shop", sun: [150, 40], // 14 people don't value free things
      cam: [{ f: 1155, pos: [0.5, 1.6, 2.6], look: [0.2, 1.3, -1.0], fov: 38, push: 0.003 }],
      cast: [{ o: YOU, p: [0.2, -1.0], expr: "stubborn", tilt: 0.12, pose: "cross,cross" }] },
    { a: 1231, set: "office", sun: [150, 40], // 15 so you start charging
      cam: [{ f: 1231, pos: [0.4, 1.65, 3.2], look: [0, 1.4, -1.0], fov: 38, push: 0.003 }],
      cast: [{ o: YOU, p: [0, -1.2], expr: { 0: "neutral", [w("para")]: "grin" }, hold: "guide" }],
      fx: [{ k: "coins", f: w("para") - 2, p: [-0.4, 0.8, -0.2], s: 0.5 }] },
    { a: 1307, set: "bistro", sun: [150, 40], // 16 you add the best restaurants
      cam: [{ f: 1307, pos: [0.4, 2.0, 7.0], look: [0, 1.0, -0.8], fov: 44, push: 0.0025 }],
      cast: [{ o: "gent", p: [-0.95, 0], mode: "sit", expr: "smile", facing: 1 }, { o: "lady", p: [0.95, 0], mode: "sit", expr: "smile", facing: -1 },
        { o: "chef", p: [1.4, -1.6], to: { p: [0.55, -0.9], f0: 1312, f1: 1350 }, expr: "grin", hold: "dish", holdW: 0.42 }, { o: YOU, p: [-1.5, 1.2], expr: "grin", hold: "guide" }] },
    { a: 1382, set: "bistro", sun: [150, 40], // 17 then you give them stars
      cam: [{ f: 1382, pos: [0.4, 1.9, 4.4], look: [0, 1.6, -0.6], fov: 40, push: 0.003 }],
      cast: [{ o: "chef", p: [0.4, -1.1], expr: { 0: "neutral", [w("yıldız")]: "laugh" }, pose: { 0: "belly,belly", [w("yıldız")]: "hang,point" } }],
      fx: rosettes(w("yıldız") - 2, 2.5, -0.6) },
    { a: 1462, set: "bistro", sun: [150, 40], // 18 three stars mean one thing
      cam: [{ f: 1462, pos: [0, 2.3, 3.4], look: [0, 2.5, -0.6], fov: 44, push: 0.003 }],
      fx: [...rosettes(1462, 2.5, -0.6, 0), { k: "sparkle", f: w("net") - 2, dur: 24, p: [0, 2.6, -0.5], s: 0.8 }] },
    { a: 1525, set: "bistro", sun: [150, 40], // 19 worth a special journey
      cam: [{ f: 1525, pos: [0.5, 1.7, 2.4], look: [0.3, 1.35, -1.0], fov: 36, push: 0.003 }],
      cast: [{ o: "chef", p: [0.3, -1.0], expr: "grin", hold: "dish", holdW: 0.45 }],
      fx: [{ k: "sparkle", f: w("yolculuğa") - 2, dur: 26, p: [0.8, 1.2, -0.9], s: 0.4 }] },
    { a: 1595, set: "road", // 20 and people really hit the road
      cam: [{ f: 1595, pos: [3, 2.2, 10], look: [0, 1.0, -4], fov: 42, push: 0.0025 }],
      cast: [driver("driver", 4, -14, 1595, 1676), driver("gent", 9, -9, 1595, 1676), driver("lady", 14, -4, 1595, 1676)],
      props: [car(4, -14, 1595, 1676, 0, "#2f5f6a"), car(9, -9, 1595, 1676, 0, "#8c2f3c"), car(14, -4, 1595, 1676, 0, "#c9a043")] },
    { a: 1676, set: "bistro", sun: [150, 40], // 21 driving city to city for one dinner
      cam: [{ f: 1676, pos: [0, 2.3, 7.2], look: [0, 1.2, -1.4], fov: 44, push: 0.0025 }],
      cast: [{ o: "gent", p: [-0.95, 0], mode: "sit", expr: "laugh", facing: 1 }, { o: "lady", p: [0.95, 0], mode: "sit", expr: "smile", facing: -1 },
        { o: "man", p: [-3.5, -1.6], mode: "sit", expr: "grin", facing: 1 }, { o: "lady2", p: [3.5, -1.6], mode: "sit", expr: "smile", facing: -1 },
        { o: "driver", p: [1.8, 4.5], to: { p: [1.6, 1.4], f0: 1680, f1: 1750 }, expr: "grin", mode: "stroll" }, { o: "waiter", p: [-1.1, -1.5], expr: "smile", hold: "dish" }] },
    { a: 1780, set: "road", // 22 every kilometre wears the tyres a little more
      cam: [{ f: 1780, pos: [-3, 0.7, 3.4], look: [-3, 0.5, 0.6], fov: 40, push: 0.002 }, { f: 1786, dur: 70, pos: [3, 0.7, 3.4], look: [3, 0.5, 0.6], fov: 40, push: 0.002 }],
      cast: [{ o: "driver", p: [-4.3, 0.5, 0], to: { p: [3.7, 0], f0: 1780, f1: 1870, ease: false }, expr: "grin", shadow: false }],
      fx: [{ k: "puff", f: w("aşınıyor") - 2, p: [0.2, 0.3, 0.9], s: 1.2 }],
      props: [{ k: "oldCar", p: [-4, 0, 0], color: "#8c2f3c", path: [[1780, -4, 0, 0], [1870, 4, 0, 0]] }] },
    { a: 1870, set: "shop", sun: [150, 40], // 23 and they buy the new tyre from you
      cam: [{ f: 1870, pos: [0.8, 1.85, 7.0], look: [0, 1.3, -1.2], fov: 40, push: 0.0025 }, { f: w("senden") - 4, dur: 10, pos: [0.6, 1.8, 6.2], look: [0, 1.35, -1.4], fov: 40, push: 0.003, punch: 0.009, n: 20 }],
      cast: [{ o: YOU, p: [0, -1.2], expr: { 0: "grin", [w("senden")]: "laugh" }, pose: { 0: "hip,thumb", [w("senden")]: "fist,fist" } },
        { o: "driver", p: [-0.75, -0.5], expr: "smile", hold: "tyre", facing: 1 }, { o: "gent", p: [0.75, -0.4], expr: "smile", hold: "tyre", facing: -1 }],
      fx: [{ k: "coins", f: w("senden") - 2, p: [0, 1.0, -0.9], s: 0.6 }] },
    { a: 1929, set: "office", sun: [150, 40], // 24 the food guide is a tyre advert in disguise
      cam: [{ f: 1929, pos: [0.4, 1.65, 3.0], look: [0, 1.5, -1.0], fov: 38, push: 0.003 }],
      cast: [{ o: YOU, p: [0, -1.2], expr: { 0: "smile_closed", [w("lastik", 4)]: "grin" }, hold: "guide" }],
      fx: [{ k: "card", draw: "tyre", f: w("lastik", 4) - 2, p: [-0.6, 1.9, -1.0], w: 0.4 }, { k: "puff", f: w("lastik", 4) - 2, p: [-0.6, 1.9, -0.9], s: 0.8 }] },
    { a: 2056, set: "office", sun: [150, 40], // 25 the company that really did it was Michelin
      cam: [{ f: 2056, pos: [0.4, 1.65, 2.4], look: [0.1, 1.6, -1.0], fov: 36, push: 0.003 }, { f: w("Michelin'di") - 4, dur: 8, pos: [0.35, 1.65, 2.0], look: [0.1, 1.62, -1.0], fov: 36, push: 0.003, punch: 0.012, n: 24 }],
      cast: [{ o: YOU, p: [0, -1.2], expr: { 0: "smile", [w("Michelin'di")]: "laugh" }, hold: { 0: "guide", [w("Michelin'di")]: null }, pose: { 0: null, [w("Michelin'di")]: "up,up" } }],
      fx: [{ k: "sparkle", f: w("Michelin'di"), dur: 30, p: [0, 2.2, -1.1], s: 0.9 }] },
    { a: 2150, set: "bistro", sun: [150, 40], // 26 today the stars still come from a tyre company
      cam: [{ f: 2150, pos: [0.3, 1.8, 3.8], look: [0, 1.6, -0.8], fov: 40, push: 0.002 }, { f: 2160, dur: 110, pos: [0.6, 2.3, 7.4], look: [0, 1.5, -0.8], fov: 42, push: 0.002 }],
      cast: [{ o: "chef", p: [0.6, -1.2], expr: "laugh", wave: true }, { o: YOU, p: [-0.7, -1.2], expr: "grin", hold: "guide" }],
      fx: rosettes(2150, 2.7, -0.9, 0),
      props: [{ k: "tyres", p: [1.7, 0, -0.6], rows: [0, 1, 2, 3, 4, 5] }] },
  ],
};
