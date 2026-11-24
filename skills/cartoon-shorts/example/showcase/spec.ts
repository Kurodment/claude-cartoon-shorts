// Asset showcase: one shot per v2 set with the new outfits, effects and props (a test sheet for the library).
import { Spec, Word } from "../engine/spec";

export const showcaseSpec: Spec = {
  id: "AssetShowcase", total: 600, words: [] as Word[],
  sets: { office: "office", kitchen: "kitchen", harbor: "harbor", palace: "palace", meadow: "meadow" },
  dof: [[0, 8], [240, 0], [360, 9], [480, 0]],
  shots: [
    { a: 0, set: "office", sun: [150, 40],
      cam: [{ f: 0, pos: [0.6, 1.7, 4.6], look: [0, 1.3, -0.6], fov: 40 }],
      cast: [{ o: "teacher", p: [0, -1.2], expr: "grin", wave: true }, { o: "girl", p: [1.2, 0.8], expr: "smile", facing: -1 }],
      fx: [{ k: "bulb", f: 20, p: [0.35, 2.25, -1.1], s: 0.5 }],
      props: [{ k: "books", p: [-0.8, 0.78, 0.2] }, { k: "coins", p: [0.5, 0.78, 0.25] }] },
    { a: 120, set: "kitchen", sun: [150, 40],
      cam: [{ f: 120, pos: [1.6, 1.65, 3.4], look: [-0.7, 1.35, -2.6], fov: 40 }],
      cast: [{ o: "grandma", p: [-1.1, -2.6], expr: "smile", facing: 1 }, { o: "kid", p: [0.3, -0.9], expr: "laugh" }],
      fx: [{ k: "fire", p: [-1.1, 1.05, -3.7], s: 0.35 }, { k: "heart", f: 150, p: [0.4, 1.5, 1.0], s: 0.3 }, { k: "clock", p: [1.0, 2.6, -3.9], s: 0.5 }] },
    { a: 240, set: "harbor",
      cam: [{ f: 240, pos: [-7, 2.4, -9], look: [0, 3.4, 11], fov: 44 }],
      cast: [{ o: "captain", p: [-3.2, -3.0], expr: "stern", facing: 1 }, { o: "sailor", p: [-1.8, -4.2], expr: "grin" }, { o: "merchant", p: [-4.6, -5.0], expr: "smile" }],
      fx: [{ k: "smoke", p: [-3, 10.5, 12] }, { k: "smoke", p: [3, 10.5, 12] }, { k: "coins", f: 280, p: [-4.6, 1.6, -4.8], s: 0.6 }],
      props: [{ k: "crate", p: [-2.6, 0, -2.2], h: 0.8 }] },
    { a: 360, set: "palace", sun: [150, 40],
      cam: [{ f: 360, pos: [0, 1.9, 6.5], look: [0, 1.5, -2.6], fov: 40 }],
      cast: [{ o: "king", p: [0, 0.6, -3.0], expr: "stern", shadow: false }, { o: "queen", p: [-1.3, 0.3, -2.5], expr: "smile", shadow: false }, { o: "police", p: [2.0, 0.2], expr: "neutral", facing: -1 }],
      fx: [{ k: "arrow", f: 380, p: [1.4, 2.6, -1.5], w: 1.0, rot: 2.6 }, { k: "notes", p: [-1.6, 2.2, -2.2], s: 1.2 }] },
    { a: 480, set: "meadow",
      cam: [{ f: 480, pos: [2.5, 1.6, 9], look: [0, 1.6, 0], fov: 42 }],
      cast: [{ o: "farmer", p: [-0.8, 0.5], expr: "nervous", facing: 1 }, { o: "lady", p: [0.9, 0.2], expr: "shock" }],
      fx: [{ k: "rain", p: [-0.8, 3.0, 0.5], s: 1.6 }] },
  ],
};
