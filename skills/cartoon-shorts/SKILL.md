---
name: cartoon-shorts
description: Make a ~60-75 s vertical cartoon story short from an idea at the lowest token cost - flat bean-head cartoon characters in a colourful inked 3D world (three.js inside Remotion), narration (Edge free / ElevenLabs / any TTS), word-by-word captions, synthesized SFX, 2K vertical export - by writing ONE Spec file for a ready engine; also re-voices a finished short with another narrator. Use when the user gives a video idea or topic for a short / reels / TikTok, asks for an animated / cartoon / çizgi film tarzı kısa video, "bu konuda video yap", wants a different voice for a finished short, or names this skill.
---

# Cartoon shorts (engine + Spec)

A short = `voice.txt` + `src/shorts/<name>/spec.ts` + `sound.json`. The engine (`src/shorts/engine/`) builds sets, cast,
props, effects, camera, lens, grade and captions from the Spec. **Do not read or rewrite engine files**: everything
needed is in this file. Talk to the user in their language (Turkish shorts: Turkish narration + captions).

## Token budget (follow strictly)
- Research: at most 2 `WebSearch` (standard) calls; keep facts + source URLs in `SCRIPT.md`, 1-2 lines each.
- Never print or read whole JSON / logs / source; scripts print compact summaries. Look at ONE contact sheet per round.
- At most 2 fix rounds on the sheet, then render the final. One QA run on the final.
- Reuse sets / outfits / fx from the libraries below; copy patterns from `example/eroin/spec.ts` (in this skill) instead of inventing.
- Write each file once with the Write tool; fix with small Edits.

## 0. Setup (once per Remotion project; `npx create-video@latest` first)
`python <skill>/scripts/setup.py install` (engine -> `src/shorts/engine`, Kenney assets, pinned npm + pip packages).
Set `REMOTION_TMP` to a big drive (every bundle copies `public/`). Run every command from the project root.

## 1. Idea -> facts -> script (one message to the user for approval)
- One surprising TRUE story with a physical cause -> effect that can be shown, plus an everyday analogy.
- Formula (~150-170 words, 60-72 s): **hook** (the absurd fact, no intro) -> **setting** (year, place) -> **escalation**
  in 3-4 beats -> **snap** -> **deadpan pair** ("Neyse ki X... / Ne yazık ki X...", same framing twice) -> **"Çünkü"**
  + the analogy -> **consequence** -> **callback** ending. Spoken everyday language, 6-14 words per sentence.
- `voice.txt`: one sentence per line. **No commas inside a sentence** (TTS reads a comma as a sentence end: the pitch
  drops and the sentence sounds broken); split into two sentences if a pause is needed. Write numbers as words.
- Sensitive topics (drugs, violence): history/explanation only, never show use; no text anywhere in the picture.
- Show the script + facts once; on approval ("yardır", "tamam") do everything else without asking.

## 2. Voice -> words + frame table
- Free: `python <skill>/scripts/voice.py edge voice.txt shorts/<name>/voice [--voice tr-TR-AhmetNeural|tr-TR-EmelNeural] [--rate +10%]`
- ElevenLabs (MCP connected): `creative_list_voices` (languages, gender, use_cases) -> pick one yourself and say which ->
  `creative_generate_speech` with the joined script, `estimate_only` first (tell the cost), then `generations_count: 1`
  (never retry: it charges again) -> poll `creative_get_flow_run_status` -> `content_url` ->
  `python <skill>/scripts/voice.py take <url> voice.txt shorts/<name>/voice`. Free plan = no commercial licence: say so.
- Never clone a third party's voice. The user's own voice (their recording) is fine.
- Output: `voice.wav`, `words.json` (spelled-out numbers merged to digits for captions: refer to them as `w("1897")`),
  and a table `L01 Bir@6 zamanlar@19 ...` (word@frame, 30 fps). Copy `words.json` to `src/shorts/<name>/`, then
  `python <skill>/scripts/setup.py new <name> <CompId>` (spec skeleton + Root.tsx registration).

## 3. The Spec (`src/shorts/<name>/spec.ts`) - see `example/eroin/spec.ts` (21 shots, every feature)
```ts
const w = wordsAt(W);                  // w("öksürük") = onset frame, w("eroin", 3) = 3rd occurrence
export const spec: Spec = { id, total, words: W,
  sets: { lab: "lab", shop: "shop" },   // instance name -> kind (library below); each instance gets its own origin
  flashAt?: frame, xfade?: { [shotNo]: frames }, kicks?: [[frame, 0.4..1.2]],
  dof: [[frame, cInf, glideFrames?]],   // lens blur px at 1080p: wides 0, MS 8-11, CU 12-15
  captions?: [[from, to, y]],           // caption height 0..1 (default 0.7) where the subject sits low/high
  shots: [{ a: startFrame, set, light?: "day"|"golden", sun?: [az, el], cam: [...], cast?: [...], fx?: [...], props?: [...] }] }
```
All positions are metres relative to the shot's set origin; y up, the open side of interiors is +z (camera side).
- **cam**: `{ f, pos, look, fov?=40, roll?, push?=0.0025, punch?, n?, dur?=24, cut? }` - first key at the shot start;
  later keys glide (`dur`) or `cut`. Every hold creeps in (`push` 0.002-0.0035); `punch` 0.007-0.012 for n=20-30 f on a
  punch word. Land changes 4-8 f before their word (`f: w("x") - 6`). Rolls 0.02-0.05 rad on emphasis.
- **Portrait framing**: visible width ≈ 0.41 × distance, height ≈ 0.73 × distance (fov 40). Three people side by
  side need ~6 m; queues read better in depth (a diagonal line). Two table props 0.34 m apart: ~1.9 m away, fov 36.
  Close-ups of a 0.25 m bottle: 1.1-1.4 m, fov 30-32. Interiors: sun `[150, 40]` (from behind the camera).
- **cast**: `{ o: outfit, p: [x, z] | [x, y, z], to?: { p, f0, f1, ease? }, mode?: stand|stroll|march|sit, rate?,
  expr?: Expr | {frame: Expr}, wave?: bool | {frame: bool}, reach?: [[frame, 0..1]], facing?: -1|0|1, look?, tilt?,
  scale?, shadow?, from?, until?, swap?: [[frame, outfit]], cape?: frame, dust? }`. Adults are 1.8 m, face ~1.6 m,
  hands ~1.0 m, a waving hand ~1.9 m at x+0.45. Sitting in a bed: `p: [x, 0.45, z]`, `mode: "sit"`, `shadow: false`.
  Expressions: neutral stern grin laugh whistle nervous shock relief relief_open dazed pained smile smile_closed.
  Outfits: chemist professor pharmacist doctor doctor2 nurse official guard soldier thief disguise patient patient2-4
  gent lady lady2 man worker worker2-5 kid tourist tourist2 engineer (or a full Outfit object).
- **fx** `{ k, ... }`: `cough {f,p,s}` `burst {f,p,s,col,dur}` `puff {f,p,s}` `sparkle {f,dur?,p,s}` `stars {f?,p,s}`
  `shiver {p,s}` `flame {p,s}` `smoke {p: chimney top, f1?: fade, warm?}` `chains {f,dur,p,w,h}` (over a bottle)
  `halo {f,p,s,breakAt?}` `map {f0,f1,p,w,h}` (shipping arcs) `gate {f0,f1,p,w,h}` (bars closing) `ban {f,p,s,flat}`
  `card {draw: tablets|paper|tophat|moustache|sack|stamp, p, w, flat?, rot?, path?: [[f,x,y,z,rot]]}`.
  Every kind takes `until` (and `f` = from). Effects face the camera unless `flat`.
- **props** `{ k: bottle|flask|pillbox|bottleShelf, p, color?, h?, r?, liquidTo?: {color,f,dur}, path?, spin?, yaw?, len?, rows? }`.
  Bottles have a blank paper label (no text); flasks show their liquid through the glass.

### Set library (coordinates relative to the set origin)
- **lab** (1890s): back wall z -4 (windows x ±3.6, shelves x ±2.4 at y 1.75/2.45/3.15), bench z -3.5 top .95,
  centre table x ±1.75 z ±0.8 top **0.92**, burner (-0.95, .92, -0.42), left wall x -6 (map spot (-5.94, 2.45, 0.2)),
  glass cabinet x 4.4..5.95 z 2.8..4.2. Chemist behind the table at (0, -1.15).
- **shop** (chemist's / store ~1900): counter x ±3.2 z ±0.45 top **1.05** (jars x -2.6/-2.15, scales x -1.2, till
  x 1.6..2.3), bottle cabinets on the back wall z -4..-3.4; staff at (0.25, -1.15), customers at z ≥ 1.
- **ward** (hospital): beds x -4.5/-1.5/1.5/4.5 from z -3.9 to -1.4 (sit patients at (x, .45, -2.95)), bedside
  tables x+0.8 top .62 z -3.62, windows on the back wall.
- **street** (1900s town + factory): factory front z -4 (h 9), chimney tops (±9, 26, -11), yard wall z -2 with gate
  pillars x ±4.4 (gate fx at (0, 1.7, -2) 7.8×3.6), street toward +z, houses at x ±14, lanterns x ±8.6.
- **brainCastle** (analogy world): wall z 0 (x ±34, h 4.6) with a gate x ±1.4 h 3, two towers x ±2.9, a giant pink
  brain behind (centre (0, 4.2, -15)), cobbled path x ±1.7 toward +z, courtyard z < 0. Reuse for any "gate / barrier".
- **capitol** (government 1900s): domed building at the origin, portico z 10-13, steps to z 19, plaza toward +z,
  desk at (0, 0, 34) top .95 for stamp / signing close-ups.
- **bathroom** (today): tiled wall z -0.5, open cabinet centre (0, 1.55, -0.32), shelves y 1.38 / 1.70, sink y .92.
New kinds: add a builder to `engine/sets.ts` + `SET_KINDS` (only when no set fits; tell the user it costs more).

## 4. Sound (`shorts/<name>/sound.json`) - no music unless the user wants it
```json
{ "music": null, "ambience": [[0, "shop"], [123, "street"]],
  "cues": [["öksürük", "cough", -10, -0.3], ["yasakladı", "thump", -6, 0, {"f0": 75}], [1864, "creak", -16]] }
```
`at` = frame or word ref (`"word"`, `"word#2"`, `"word+4"`); then kind, dB, pan, {params}. Ambience: shop lab room street
outdoor none. Cues: cough clink bell shimmer angel whoosh rattle chainWhip thump pop hurrah oof whoa steps run creak flutter.
`"music": "chill"` = quiet lo-fi bed 18 LU under the voice. Hit every visual impact with a cue (same frame).
`python <skill>/scripts/sound.py shorts/<name>/sound.json src/shorts/<name>/words.json shorts/<name>/voice/voice.wav shorts/<name>/audio --total <frames>`

## 5. Look check -> final
1. `python <skill>/scripts/render.py sheet <CompId> <total> --frames <one mid-frame per shot> --out out/<name>/sheet` -> read the ONE image.
   Check: subject framed (not cut at the edge), captions not over a face or the key prop (`captions` override),
   nothing blocking the lens, expressions readable. Fix by editing numbers in the Spec; re-run the sheet for changed shots only.
2. `python <skill>/scripts/render.py final <CompId> shorts/<name>/audio/mix.wav out/<name>/final.mp4 --qa`
   (1440x2560, ~2-3 min). QA: no black/frozen frames; the only white frame is `flashAt`; loudness -15 LUFS.
3. Report: path, length, voice, what to listen for (you cannot hear it). Offer one change round.

## Re-voice a finished short (another narrator, same picture)
Composition captions read `inputProps.words`; the SFX stem is `shorts/<name>/audio/stem_sfx.wav`.
`python <skill>/scripts/revoice.py --take <file|url> --script voice.txt --ref src/shorts/<name>/words.json --sfx shorts/<name>/audio/stem_sfx.wav --comp <CompId> --out out/<name>/final_<voice>.mp4`
Each sentence lands where the reference voice said it (sped up ≤ 1.15 if needed; the log lists them). Voice part ~15 s.

## Gotchas (learned)
- `@react-three/postprocessing` must stay 3.0.4 (3.1+ renders blank frames in Remotion). 2K = `--scale 1.3333333333333333`.
- A mirror/door rotated toward the lens blanks a shot; opaque glass hides liquids; props < 2 m from the lens become blobs.
- A card's light/face reads best with the sun behind the camera; golden light from the front-side (`sun: [140, 16]`).
- Captions are word-by-word, 70 % height: move them (`captions`) for table/desk close-ups where the subject sits there.
- Whisper reads long takes with context: check a doubtful word by transcribing that sentence alone.
