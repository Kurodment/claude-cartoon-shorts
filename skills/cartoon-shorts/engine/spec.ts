// The one file a new short needs: a Spec. Everything is keyed to word onsets of the voice (words.json) through w(),
// positions are relative to the shot's set origin, the engine builds sets, cast, props, effects, camera and lens.
import type { Expr, Outfit } from "./toon";
import type { SetKind } from "./sets";

export type V3 = [number, number, number];
export type Word = { w: string; s: number; e: number; line?: number };
export const FPS = 30;

/** word onset (frame) of the n-th occurrence (1-based) of a word; matches case- and punctuation-free, Turkish-aware */
export const wordsAt = (words: Word[]) => {
  const n = (s: string) => s.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase().replace(/[^a-zçğıöşüâîû0-9']/g, "");
  return (word: string, k = 1) => {
    let c = 0;
    for (const x of words) if (n(x.w) === n(word) && ++c === k) return Math.round(x.s * FPS);
    throw new Error(`word "${word}" #${k} not in words.json`);
  };
};

/** camera key: glide (dur frames, default 24) or cut to a framing that creeps in at `push` per frame (+ `punch` for ~n f) */
export type CamKey = { f: number; pos: V3; look: V3; fov?: number; roll?: number; push?: number; punch?: number; n?: number; dur?: number; cut?: boolean };
/** expression / wave / reach timelines: a value, or {frame: value} switching LEAD before each frame */
export type Timeline<T> = T | Record<number, T>;
export type ActorSpec = {
  o: string | Outfit; // outfit preset name (toon OUTFITS) or a full outfit
  p: V3 | [number, number]; // position (x, z) or (x, y, z), set-relative
  to?: { p: [number, number]; f0: number; f1: number; ease?: boolean }; // walk / run from p to p2
  mode?: "stand" | "stroll" | "march" | "sit"; rate?: number; // step rate (Hz) when moving
  expr?: Timeline<Expr>; wave?: Timeline<boolean>; reach?: [number, number][]; // reach: (frame, 0..1) ramp keys
  facing?: -1 | 0 | 1; look?: number; tilt?: Timeline<number>; scale?: number; shadow?: boolean;
  from?: number; until?: number; // visible frames
  swap?: [number, string | Outfit][]; // outfit changes at frames (disguise, costume)
  cape?: number; // a hero cape from this frame
  dust?: boolean; // dust puffs behind while moving
  /** a card drawing held in the hand on the screen-right side (guide, tyre, paper, sack, dish, tablets, ...); null = empty hand */
  hold?: Timeline<string | null>; holdW?: number;
};
/** effect cards; f/f0 frames, p set-relative; see engine/fxlib.ts for each kind's parameters */
export type FxSpec = { k: string; f?: number; f0?: number; f1?: number; dur?: number; p: V3; s?: number; w?: number; h?: number;
  col?: string; flat?: boolean; rot?: number; until?: number; path?: [number, number, number, number, number?][]; [key: string]: unknown };
/** 3D props: bottle / flask / pillbox / bottleShelf; path = [frame, x, y, z, rotZ?] keys (smooth) */
export type PropSpec = { k: "bottle" | "flask" | "pillbox" | "bottleShelf" | "crate" | "books" | "coins" | "building" | "logs" | "pipe" | "car" | "slab" | "oldCar" | "tyres"; p: V3; d?: number; seed?: number; jacks?: boolean; steps?: boolean;
  /** building / car: [frame, metres] keys, eased between keys (body rises, screws and steps stretch) */
  lift?: [number, number][]; color?: string; h?: number; r?: number;
  liquidTo?: { color: string; f: number; dur: number }; path?: [number, number, number, number, number?][]; spin?: number; len?: number; rows?: number[]; yaw?: number };
export type ShotSpec = {
  a: number; set: string; light?: "day" | "golden"; sun?: [number, number]; // sun az/el (deg, camera-relative)
  cam: CamKey[]; cast?: ActorSpec[]; fx?: FxSpec[]; props?: PropSpec[];
};
export type Spec = {
  id: string; total: number; words: Word[];
  sets: Record<string, SetKind>; // instance name -> kind
  shots: ShotSpec[];
  xfade?: Record<number, number>; // shot index (1-based) -> crossfade frames
  flashAt?: number; kicks?: [number, number][]; // (frame, strength)
  dof: [number, number, number?][]; // (frame, cInf px, glide frames)
  captions?: [number, number, number][]; // (from, to, y 0..1) caption height overrides
};
