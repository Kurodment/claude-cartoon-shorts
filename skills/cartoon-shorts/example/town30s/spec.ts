// 1930s town kit test sheet: grocery + downtown sets, meter / shopCart / sedan / streetClock props, the 19 town outfits.
import { Spec, Word } from "../engine/spec";

const line = (os: string[]) => os.map((o, i) => ({ o, p: [(i - (os.length - 1) / 2) * 1.05, -6.2] as [number, number], expr: (["smile", "neutral", "grin", "stern", "smile_closed"] as const)[i % 5], pose: ["hip,hip", null, "hang,point", "cross,cross", "hang,thumb"][i % 5] }));
const lineCam = (f: number) => [{ f, frame: { size: "full" as const, el: 6 } }];

export const town30sSpec: Spec = {
  id: "Town30s", total: 630, words: [] as Word[],
  sets: { store: "grocery", main: "downtown" },
  dof: [[0, 0]],
  shots: [
    { a: 0, set: "store", sun: [150, 40],
      cam: [{ f: 0, frame: { size: "full", pts: [[-2.4, 0.9, 0.6], [2, 2.6, -3.8], [-2, 2.6, -3.8]] } }, { f: 30, frame: { size: "ms", on: [0, 2], az: 15 }, dur: 36 }],
      cast: [{ o: "grocer", p: [0, -2.7], expr: "grin", pose: "hip,lift" }, { o: "shopper", p: [-1.3, 0.2], expr: "smile", facing: 1 }, { o: "dandy", p: [1.4, 0.5], expr: "stern", facing: -1, pose: "cross,cross" }],
      props: [{ k: "shopCart", p: [-2.4, 0, 0.6], yaw: 0.5 }] },
    { a: 90, set: "main",
      cam: [{ f: 90, pos: [2, 2.2, 9], look: [0, 2.2, -8], fov: 44 }, { f: 120, frame: { size: "full", on: [0, 1], pts: [[7.5, 1.6, -4.4]] }, dur: 40, ease: "rc" }],
      cast: [{ o: "cop", p: [8.4, 0.15, -5.2], expr: "stern", pose: "hip,hip", facing: -1 }, { o: "paperboy", p: [5.6, 0.15, -5.6], expr: "grin", pose: "hang,up" }, { o: "belle", p: [-1.2, 0.15, -6.2], expr: "smile" }],
      props: [{ k: "sedan", p: [3.4, 0, -2.7], color: "#2f4f6a" }, { k: "sedan", p: [-3.6, 0, -2.7], color: "#c9a24a" },
        { k: "meter", p: [7.5, 0.15, -4.4], lift: [[110, 0], [140, 1]] }, { k: "meter", p: [0.5, 0.15, -4.4] }] },
    { a: 180, set: "main", cam: lineCam(180), cast: line(["grocer", "shopper", "strongman", "granny", "dandy"]) },
    { a: 270, set: "main", cam: lineCam(270), cast: line(["belle", "shopper2", "squire", "paperboy", "inventor"]) },
    { a: 360, set: "main", cam: lineCam(360), cast: line(["preacher", "rancher", "cop", "nurse2", "schoolmarm"]) },
    { a: 450, set: "main", cam: lineCam(450), cast: line(["banker", "oldman", "mechanic2", "baker"]) },
    { a: 540, set: "store", light: "night", sun: [120, 35],
      cam: [{ f: 540, frame: { size: "full", on: [0, 1, 2], pts: [[0, 2.9, -3.9]] } }],
      cast: [{ o: "grocer", p: [-1.1, -0.4], expr: "rage", pose: "fist,fist" }, { o: "shopper", p: [0.2, -0.2], expr: "cry", pose: "cheek,cheek" }, { o: "oldman", p: [1.5, -0.5], expr: "snore" }],
      fx: [{ k: "sign", style: "board", text: "GÜN 3", p: [0, 2.75, -3.8], w: 1.3 }, { k: "sign", style: "news", text: "ARABA|FİYASKOSU", p: [2.7, 1.5, 0.6], w: 0.5 }, { k: "sign", style: "tag", text: "5 KURUŞ", p: [-1.6, 1.25, 1.0], w: 0.4 }] },
  ],
};
