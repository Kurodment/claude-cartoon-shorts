// Turkish word-by-word captions for the cartoon shorts (HTML overlay above the three.js canvas, so the grade, lens blur
// and ink never touch the text). Words come from the voice words.json ([{w, s, e, line?}], seconds), the same timing
// file the shots and the sound mix are cut to, so captions always land on the spoken word.
// Look: rounded heavy Baloo 2 (has ç ğ ı İ ö ş ü), white fill + thick near-black ink stroke like the world's lines,
// the spoken word in yellow, a 4-frame pop when a new group appears. All sizes are specified at 1080x1920.
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Baloo2";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] });

export type Word = { w: string; s: number; e: number; line?: number };

export type CaptionStyle = {
  /** vertical centre of the caption block, 0 = top, 1 = bottom (0.70 keeps clear of the Shorts/TikTok UI) */
  y: number;
  size: number; // font px at 1080 wide
  maxWords: number; // words per group
  maxChars: number; // characters per group (Turkish words are long: keep groups short)
  gap: number; // a pause longer than this (s) starts a new group
  upper: boolean; // Turkish-aware upper case (i -> İ, ı -> I)
  fill: string;
  active: string; // colour of the word being spoken
  stroke: string;
  strokePx: number;
  lead: number; // show a group this many seconds before its first word
  hold: number; // keep the last group up this long after its last word if nothing follows
};

export const CAPTION_DEFAULT: CaptionStyle = {
  y: 0.7, size: 104, maxWords: 3, maxChars: 18, gap: 0.35, upper: true,
  fill: "#ffffff", active: "#ffd23f", stroke: "#0b0a0c", strokePx: 14, lead: 0.05, hold: 0.5,
};

type Group = { words: Word[]; s: number; e: number };

/** Splits the words into short readable groups: never across a sentence (line), a long pause, or the size limits. */
export const groupWords = (words: Word[], st: CaptionStyle): Group[] => {
  const groups: Group[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) groups.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
  for (const w of words) {
    const prev = cur[cur.length - 1];
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (prev && (cur.length >= st.maxWords || chars > st.maxChars || w.s - prev.e > st.gap || (w.line ?? 0) !== (prev.line ?? 0)
      || /[.!?…]$/.test(prev.w))) flush();
    cur.push(w);
  }
  flush();
  return groups;
};

const clean = (w: string) => w.replace(/^[«"“'(]+|[»"”',;:.!?…)]+$/g, "");

export const Captions: React.FC<{ words: Word[]; style?: Partial<CaptionStyle>; offset?: number }> = ({ words, style, offset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const st = useMemo(() => ({ ...CAPTION_DEFAULT, ...style }), [style]);
  const groups = useMemo(() => groupWords(words, st), [words, st]);
  const t = frame / fps - offset;
  const k = width / 1080;
  const gi = groups.findIndex((g, i) => {
    const next = groups[i + 1];
    const end = next ? Math.min(next.s - st.lead, g.e + st.hold) : g.e + st.hold;
    return t >= g.s - st.lead && t < Math.max(end, g.e);
  });
  if (gi < 0) return null;
  const g = groups[gi];
  const age = (t - (g.s - st.lead)) * fps; // frames since the group appeared
  const pop = interpolate(age, [0, 2, 4], [0.82, 1.06, 1], { extrapolateRight: "clamp" });
  const fade = interpolate(age, [0, 2], [0, 1], { extrapolateRight: "clamp" });
  const activeIdx = g.words.reduce((a, w, i) => (t >= w.s - 0.03 ? i : a), -1);
  const up = (s: string) => (st.upper ? s.toLocaleUpperCase("tr-TR") : s);
  // long Turkish words (CUMHURBAŞKANLIĞINA) must never leave the frame: shrink the group until its longest word fits
  const longest = Math.max(...g.words.map((x) => clean(x.w).length));
  const size = Math.min(st.size, 940 / (longest * 0.66));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 60 * k, right: 60 * k, top: `${st.y * 100}%`, transform: `translateY(-50%) scale(${pop})`,
        opacity: fade, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline",
        columnGap: 0.38 * size * k, rowGap: 0, fontFamily, fontWeight: 800, fontSize: size * k, lineHeight: 1.05,
        textAlign: "center", letterSpacing: 0.5 * k,
      }}>
        {g.words.map((w, i) => {
          const on = i === activeIdx; // the latest word that has started stays lit until the next one starts
          const txt = up(clean(w.w));
          return (
            <span key={i} style={{ position: "relative", display: "inline-block", transform: on ? `scale(1.06)` : undefined, transformOrigin: "50% 60%" }}>
              {/* ink stroke underneath, fill on top: keeps the letter shapes full (a centred -webkit-text-stroke eats them) */}
              <span style={{ position: "absolute", inset: 0, color: st.stroke, WebkitTextStroke: `${st.strokePx * (size / st.size) * k}px ${st.stroke}`,
                textShadow: `0 ${6 * k}px 0 ${st.stroke}` }}>{txt}</span>
              <span style={{ position: "relative", color: on ? st.active : st.fill }}>{txt}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
