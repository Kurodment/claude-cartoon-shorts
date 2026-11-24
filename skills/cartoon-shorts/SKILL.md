---
name: cartoon-shorts
description: Make a ~60-75 s vertical cartoon story short from an idea at the lowest token cost - flat bean-head cartoon characters in a colourful inked 3D world (three.js inside Remotion), narration (ElevenLabs by default, Edge free fallback, any TTS), word-by-word captions, synthesized SFX, 2K vertical export - by writing ONE Spec file for a ready engine; also re-voices a finished short with another narrator. Use when the user gives a video idea or topic for a short / reels / TikTok, asks for an animated / cartoon / çizgi film tarzı kısa video, "bu konuda video yap", wants a different voice for a finished short, or names this skill.
---

# Cartoon shorts (engine + Spec)

A short = `voice.txt` + `src/shorts/<name>/spec.ts` + `sound.json`. The engine (`src/shorts/engine/`) builds sets, cast,
props, effects, camera, lens, grade and captions from the Spec. **Do not read or rewrite engine files**: everything
needed is in this file. Talk to the user in their language (Turkish shorts: Turkish narration + captions).
**Production bible**: `references/production-bible-tr.md` is the channel owner's rule book (story, sound, captions,
camera, light, gates, review); this file implements it, and the bible wins any conflict. Engine changes are general
parameters only (never one story's numbers), bump `engine/version.ts` + `engine/CHANGELOG.md`.

## Token budget (follow strictly)
- Research: at most 2 `WebSearch` (standard) calls; keep facts + source URLs in `SCRIPT.md`, 1-2 lines each.
- Never print or read whole JSON / logs / source; scripts print compact summaries. Look at ONE contact sheet per fix
  round; before delivery read EVERY review sheet of the preview (the whole video, one frame per 0.5 s).
- At most 2 fix rounds on the sheet, then render the final. One QA run on the final.
- Reuse sets / outfits / fx from the libraries below; copy patterns from `example/eroin/spec.ts` and `example/lamartine/spec.ts` (full shorts) and `example/showcase/spec.ts` (every v2 set, one shot each) in this skill instead of inventing.
- Write each file once with the Write tool; fix with small Edits.

## Everything runs on the user's PC
Renders, previews, checks, sound synthesis and whisper alignment all run locally (Ryzen 5 7500F, RTX 5060 Ti, 32 GB:
preview ~15 fps, 2K final ~2-3 min per minute of video; Remotion's default concurrency is already the fastest, 10 is
not faster). Start the long ones (preview, final, sound, longform renders) with `run_in_background` and keep working
or wait for the notification instead of blocking; never render in a cloud sandbox. Only ElevenLabs speech runs in the cloud.
The user can also double-click `render.bat` in the project (1 check, 2 preview + review sheets, 3 final 2K), or
`render.bat <name> <CompId> <1|2|3>` without questions.

## 0. Setup (once per Remotion project; `npx create-video@latest` first)
`python <skill>/scripts/setup.py install` (engine -> `src/shorts/engine`, Kenney assets, pinned npm + pip packages).
Set `REMOTION_TMP` to a big drive (every bundle copies `public/`). Run every command from the project root.

## 1. Idea -> facts -> script (one message to the user for approval)
**Length** (ask together with the script only if the user did not say; Turkish narration runs ~2.3 words/s):
30 s ≈ 70 words / 7-8 shots, 45 s ≈ 105 words / 10-12 shots, 60-72 s ≈ 145-165 words / 14-20 shots.
**Topic filter (viewer psychology)**: Shorts viewers want a quick "now I feel smart" hit. Pick stories that look absurd
at first and turn out brilliant once explained (business tricks, psychology, hidden systems, clever engineering).
Avoid dark or hopeless topics (death tolls, disasters, "how bad things are"); a sensitive topic only if the user asks.
Prefer topics that already did well elsewhere (long-form videos, other platforms): say in one line why it has demand.
**No topic?** Give 10 ideas in one message, ranked by story type, best first:
A) hidden-physics underdog (someone does something that looks stupid, everyone mocks them, a real principle proves them
right), B) a weird real experiment or institution, C) a clever scheme or loophole with a twist. Never a "what if"
fantasy or a plain explainer without a main character. Per idea: a 4-8 word title ("[Normal şey] Neden [Aslında Tuhaf]"
/ "[İmkânsız Şeyi Yapan] [Nesne]"), a one-line hook, the true fact underneath. Then the user picks a number.
**Before the script**, one line: what is true and what is invented (unnamed doubters and rivals may be invented; facts
and real people's words may not - never put an invented quote in a real person's mouth).
**Two structures** (pick one and say which; the user may ask for either):
- **Story (3rd person)**: the beats below. Best for a hero / underdog with doubters.
- **Roleplay (2nd person)**: best for business, strategy and "how did they solve it" topics.
  1. HOOK: put the viewer in the role with personal stakes in the first sentence: "Devasa bir kahve şirketisin ve
     ülkede kimse kahve içmiyor." + what they lose if they fail ("Bunu çözemezsen batarsın.").
  2. Solve it step by step as a puzzle the viewer is working out ("İlk hamlen...", "Ama bir sorun var...", "Sonra...");
     each step = one visible action and its result.
  3. PAYOFF: the whole trick is clear, then the last sentence reveals the real identity / result ("Ve bunu tarihte
     gerçekten yapan şirket Nescafé'ydi."). The real name is held back until this sentence.
  The viewer's role is a character on screen (a neutral outfit, the same one in every shot).
**Numbers**: every big number gets an everyday comparison ("bu altı yıllık kira demek") and a visible prop / fx.
**Ideas** (when pitching): add 2-4 words of thumbnail text that do NOT repeat the title, and the series it could start.
**Retention rules (both structures)**: the first sentence (~2 s) states the stakes, i.e. why the viewer should care,
not just a surprising number. No intro, no slow transition, no empty pause: sentences follow each other directly (voice
pauses: voice.py take re-cuts the take with steady 0.28 s gaps), every shot change lands on a cue (whoosh / pop / thump). End on the payoff
(the real reveal or the result), never on a weak joke or a hanging sentence; a joke is fine only when it IS the payoff.
Write with real enthusiasm and light humour: the narrator is fascinated, not reading a template.
**Story beats**, in order:
- **HOOK** (5-12 words, ONE statement, never a year or "bir zamanlar"): a person named by their role doing the strange action, with one specific number
  ("Genç bir mühendis yepyeni bir demiryolunu her on iki metrede bir kesti."). Never open with Nasıl / Neden / Ne /
  Hiç / Düşünün or a question.
- **SETUP**: present tense from here on; who is up against whom, where, and what is at stake.
- **DOUBT**: the boss or a rival laughs - short quoted mocking lines in their own voice ("Yeterince bebek arabası ittim.",
  <= 14 words each, tag them `[mocking]`); the hero does not explain.
- **ESCALATE**: 2-3 steps over time; the rival seems to win; one small visible clue that the hero is right.
- **TURN**: the big threat arrives. Optional **deadpan pair** ("Neyse ki X... / Ne yazık ki X...", same framing twice).
- **REVEAL**: the narrator says "Çünkü" (or "Meğer") + the real mechanism in one plain true sentence, plus an everyday
  analogy if it helps. The hero never explains.
- **BUTTON**: the last sentence (<= 25 words) is the payoff image: the doubters get exactly what they laughed at.
**Sentence rules** (each sentence = one shot, so each must name something the viewer can SEE: a person, an object, a
place or a number on a prop; a viewer hearing it once always knows where we are and who is who):
- 6-14 words (one 3-6 word punch line somewhere); one sentence per line in `voice.txt`.
- **No commas inside a sentence** (TTS reads a comma as a sentence end); split into two sentences instead.
- Links ("Bu yüzden" result, "Ama" reversal, "Sonra" next step) only where real; many sentences without one.
- At least 2 jokes, said by the doubters; at least 2 specific odd numbers whose meaning the viewer already knows
  (on screen: a prop, a `coins` / `clock` fx, a count of characters). Prefer "o zamanlar" to years unless the year is the hook.
- Numbers as words. No intro, channel name, moral, question to the viewer or call to action.
- Sensitive topics (drugs, violence): history/explanation only, never show use; no text anywhere in the picture.
- (measured on 16-35 M view story shorts, `references/story-camera.md`) Grow things in threes ("Biri düştü. Sonra bir
  diğeri. Sonra sekizi birden."); show the RESULT first, then the reason in 1-3 sentences; small exact numbers ("her on
  iki metrede", "saat altıya kadar"), not statistics; extra text lives INSIDE the world (a sign, a jar label), never as
  a floating title. The video ends 0.1-0.5 s after the last word.
**Storyboard** (shown with the script, one row per sentence, so every line has its own moving picture; no static
slides, no stock-like filler): `| # | beat | sentence | set + shot (who/what is seen) | camera move | fx + SFX |`.
Camera move = cut / glide / push-in / punch / pan; the style stays the engine's cartoon look in every row.
**Camera grammar (measured, see `references/story-camera.md`)**: premium story shorts have ~1 hard cut per minute; one
camera TRAVELS from subject to subject for 3.4-5 s per take and moves ~77 % of the time (push-in 53 %, pull-back reveal
22 %, tilt/crane 13 %, pan/arc 12 %), one move every ~2 s, each ~1.3 s long and landing ON the noun/verb it shows.
So: plan TAKES, not shots. Several sentences in the same place = ONE shot with several cam keys (glide on each subject
word); start a new shot (= cut) only at a place/time change or a punchline, and give those `xfade: 4-6` (a short
dissolve) unless the cut IS the joke. Aim for 12-16 shots per minute, not 20.
Count the words, then show the script + storyboard + the true/invented line + facts with sources once; on approval
("yardır", "tamam", "GO") do everything else without asking.

## 2. Voice -> words + frame table
- **Emotion tags**: write ElevenLabs audio tags at the start of lines in `voice.txt` where the tone changes:
  `[curious]` `[deadpan]` `[conversational]` `[amused]` `[excited]` `[sighs]` `[mocking]` `[sad]` `[mischievously]`
  `[confident]` (one narrator for the whole channel; doubters' quotes are the same voice with `[mocking]`). Send the
  tagged text to ElevenLabs; `voice.py` strips the tags for alignment and captions (and for Edge, which would read them).
- **Default: ElevenLabs** (MCP connected). Reuse the voice already chosen for the channel (Turkish default: "Can Seçkin",
  `rSuyucEH95GpZEfLV0AM`, model `eleven_v4`); otherwise `creative_list_voices` (languages, gender, use_cases) -> pick one
  yourself and say which. `creative_generate_speech` with the joined script, `estimate_only` first (say the credit cost),
  then `generations_count: 1` (never retry: it charges again) -> poll `creative_get_flow_run_status` -> `content_url` ->
  `python <skill>/scripts/voice.py take <url> voice.txt shorts/<name>/voice`. Check `account_get_usage` when credits may
  be low. Free plan = no commercial licence: say so once.
- Fallback only when ElevenLabs is unavailable or out of credits (say why):
  `python <skill>/scripts/voice.py edge voice.txt shorts/<name>/voice [--voice tr-TR-AhmetNeural] [--rate +10%]`
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
  shots: [{ a: startFrame, set, light?: "day"|"golden"|"night", sun?: [az, el], cam: [...], cast?: [...], fx?: [...], props?: [...] }] }
```
**Light follows the story**: warm `day` / `golden` for the setup, `night` (deep blue moonlight / storm, lamps glow) for
the crisis / TURN, back to warm for the REVEAL and BUTTON. Palette: warm orange/red vs teal/blue.
All positions are metres relative to the shot's set origin; y up, the open side of interiors is +z (camera side).
- **cam, default = AUTO-FRAMING**: `{ f, frame: { size: wide|full|ms|mcu|cu, on?: [cast idx], pts?: [[x,y,z]] (props /
  fx to keep in), az?: deg around the subjects (0 = from +z, + = from screen right), el?: deg above (5), side?: -1|1
  (subjects on the left/right third), at?: frame }, fov?, push?, punch?, dur?, cut?, ease?, via? }`. The engine computes
  the camera so every subject fits with margins at the END of the hold (it allows for the creeping push-in and the
  punch). Write `pos`/`look` by hand only for set-pieces with no person (a bench leg, a wheel, a skyline).
  Groups: 3+ people read better in two rows (back row in the gaps, `el: 12-15` lifts the back heads above the front).
- **manual cam**: `{ f, pos, look, fov?=40, roll?, push?=0.0025, punch?, n?, dur?=24, cut?, ease?, via? }` (`ease`: rc
  (default: the measured premium curve, soft 0.3 s start, speed peak at 40 %, long settle) | smooth (symmetric) |
  out = fast start + soft landing for reveals/whips | back = small overshoot for arrivals; `via: [[x,y,z]...]` curves the
  glide through those points: orbit around a subject, crane over a wall, follow a road) - first key at the shot start;
  later keys glide (`dur`) or `cut`. Every hold creeps in (`push` 0.002-0.0035); `punch` 0.007-0.012 for n=20-30 f on a
  punch word. Land changes 4-8 f before their word (`f: w("x") - 6`). Rolls 0.02-0.05 rad on emphasis.
- **Portrait framing**: visible width ≈ 0.41 × distance, height ≈ 0.73 × distance (fov 40). Three people side by
  side need ~6 m; queues read better in depth (a diagonal line). Two table props 0.34 m apart: ~1.9 m away, fov 36.
  Close-ups of a 0.25 m bottle: 1.1-1.4 m, fov 30-32. Interiors: sun `[150, 40]` (from behind the camera).
- **Edge rule (the most common flaw)**: an actor card is ~0.8 m wide when waving, so keep every actor's sideways
  offset from the look line ≤ 0.13 × its depth (fov 38-42) and its depth ≥ 4.5 m for a full body (a closer actor gets
  cut at the frame edge / feet). Check both ends of every glide and of every `to` walk (set props like harbour crates
  can hide the actor at the end). Desk close-ups: keep the person's face in frame too (pull back, look y 1.2-1.4).
- **Crowds** (rallies, queues): 0.75 m spacing, two rows 1.2 m apart, the camera 8-10 m away; a 15 m wide shot makes
  them dots. Put captions low (`0.86`) when the faces sit at 60-70 % height.
- **cast**: `{ o: outfit, p: [x, z] | [x, y, z], to?: { p, f0, f1, ease? }, mode?: stand|stroll|march|sit, rate?,
  expr?: Expr | {frame: Expr}, wave?: bool | {frame: bool}, reach?: [[frame, 0..1]], facing?: -1|0|1, look?, tilt?,
  scale?, shadow?, from?, until?, swap?: [[frame, outfit]], cape?: frame, dust?, hold?: draw | {frame: draw|null}, holdW?, pose?, idle? }`
  (`hold`: a card drawing in the screen-right hand, arm out; e.g. `hold: "guide"`, `holdW: 0.4` for a tyre/dish).
  **Arm poses** `pose: "point"` (right arm) or `"left,right"`, also as a timeline `{0: "hang", [w("x")]: "up,up"}`:
  hang point up hip belly temple (+ a cuckoo swirl) lift cross cheek thumb shrug fist. Acting map: idea = `hang,up`,
  shock = `temple,cheek` / `cheek,cheek`, waiting/stubborn = `cross,cross`, boss = `hip,hip`, confused = `temple,hip` or
  `shrug,shrug`, victory = `up,up` / `fist,fist`, presenting = `hip,lift`, approval = `hip,thumb`, explaining = `point`.
  Give every on-screen person a pose or a prop in most shots: standing with hanging arms reads as a freeze.
  **Idle life** is automatic (a slow sway + head tilt on every standing card); `idle: false` for statues. Adults are 1.8 m, face ~1.6 m,
  hands ~1.0 m, a waving hand ~1.9 m at x+0.45. Sitting in a bed: `p: [x, 0.45, z]`, `mode: "sit"`, `shadow: false`.
  Expressions: neutral stern grin laugh whistle nervous (sweat drop) shock relief relief_open dazed pained smile
  smile_closed snore (Zzz) stubborn squint rage (purple-red face + steam) cry (tear streams).
  Outfits: chemist professor pharmacist doctor doctor2 nurse official guard soldier thief disguise patient patient2-4
  gent lady lady2 man worker worker2-5 king queen sailor captain farmer teacher police merchant girl grandma kid
  tourist tourist2 engineer chef waiter mechanic driver critic
  1930s town (fedora / cloche / boater hats, glasses, ties, aprons, polka dots): grocer shopper shopper2 strongman granny
  dandy belle squire paperboy inventor preacher rancher cop nurse2 schoolmarm banker oldman mechanic2 baker
  (own outfits may add `hat: "fedora"|"cloche"|"boater"`, `hatCol`, `hatBand`, `glasses: true`, `tie`, `apron`, `dots`)
  (or a full Outfit object; a roleplay "you" = one
  custom Outfit reused in every shot). On a dais/throne: `p: [x, 0.6, z]`, `shadow: false`.
- **In-world text** (the story's words live IN the world, never as floating titles): `sign {text, style, p, w, col?,
  ink?, rot?, path?}`; styles `board` (shop / door sign), `news` (headline over grey columns), `tag` (price tag),
  `label` (jar / box label), `calendar` (red top + big text: "GÜN 1" / "GÜN 2" / "GÜN 3"). `text` lines split with `|`,
  write Turkish capitals yourself (İ Ş Ğ Ü Ö Ç), 1-4 words. Not for sensitive topics (no text there).
- **fx** `{ k, ... }`: `cough {f,p,s}` `burst {f,p,s,col,dur}` `puff {f,p,s}` `sparkle {f,dur?,p,s}` `stars {f?,p,s}`
  `shiver {p,s}` `flame {p,s}` `smoke {p: chimney top, f1?: fade, warm?}` `chains {f,dur,p,w,h}` (over a bottle)
  `halo {f,p,s,breakAt?}` `map {f0,f1,p,w,h}` (shipping arcs) `gate {f0,f1,p,w,h}` (bars closing) `ban {f,p,s,flat}`
  `bulb {f,p,s}` (idea) `clock {f?,dur,p,s}` (time passing) `coins {f,p,s}` `arrow {f,dur,p,w,rot}` `fire {p,s}`
  `rain {p,s}` (cloud) `heart {f,p,s}` `notes {p,s}` (music)
  `card {draw: tablets|paper|tophat|moustache|sack|stamp|guide|tyre|rosette|dish, p, w, flat?, rot?, path?: [[f,x,y,z,rot]]}`.
  Every kind takes `until` (and `f` = from). Effects face the camera unless `flat`.
- **props** `{ k: bottle|flask|pillbox|bottleShelf|crate|books|coins, p, color?, h?, r?, liquidTo?: {color,f,dur}, path?, spin?, yaw?, len?, rows? }`.
  Bottles have a blank paper label (no text); flasks show their liquid through the glass.
  Big props (example/chicago): `building {p, len: width, h, d, seed 0-4 (brick/cream/ochre/grey/sand), lift?: [[f, m]...], steps?, jacks?}`
  (front faces +z; `lift` raises the body on jackscrews, `steps` stretch from the ground to the door; actors standing
  in the doorway: `p: [x, lift + 0.3, front z + 0.15]`, `shadow: false`), `logs {len, rows: n}` (rollers along x),
  `pipe {len, r}` (along x), `car {color, lift}` (a jack tilts the front-right corner, a spare wheel lies beside),
  `slab {len, d, path}` (a mud block whose top is its y: raise it with `path` to bury a pipe / raise a street).
  A stepwise lift ("turn by turn"): keys `[f0+i*every+2, m0+dm*i], [f0+i*every+8, m0+dm*(i+1)]`.

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
- **office** (study 1800s-1950s): desk x ±1.25 z ±0.62 top **0.78** (lamp (0.85, .78, -0.3), paper, ink), chair
  at z -1.3, bookshelves on the back wall x -5.6..-1.4 and 1.4..5.6, window at x 0, globe (2.4, 1.15, 0.6), rug.
  Person behind the desk at (0, -1.2); camera (0.6, 1.7, 4.6) -> (0, 1.3, -0.6).
- **kitchen** (today, home analogies): counter along the back wall z -4..-3.35 top **0.92** (stove x -1.6..-0.6 with 4
  burners, sink x 1.9..2.9, window x 2.6), fridge x 4.75..5.85, table x ±0.9 z ±0.6 top 0.76. Camera (1.6, 1.65, 3.4) -> (-0.7, 1.35, -2.6).
- **harbor** (1850-1950): cobbled quay z < 0 (edge z 0), water y -1.2 for z > 0, steamship hull x -13..17 z 9.5..14.5,
  funnel tops (±3, 10.5, 12) for `smoke`, crates on the quay, bollards along z -0.8, warehouses z -26.
  Ship wide: camera (-7, 2.4, -9) -> (0, 3.4, 11); people on the quay: put the camera behind them (z -10..-14).
- **palace** (kings, courts): chequered floor, red walls + gold trim, throne on a dais (seat (0, 0.6, -3)), red carpet
  along x 0 toward +z, columns x ±3.6 at z -2.5/0.5/3.5, blue banners. Camera (0, 1.9, 6.5) -> (0, 1.5, -2.6).
- **meadow** (outdoor analogies, countryside): grass to the horizon, hills, oaks, flowers, a dirt path x ±1.2 along +z.
- **mudTown** (1850s town, Wild West, floods): muddy street with puddles (open x ±6), plank sidewalks x ±6.2..8.6,
  house rows at x ±13.5 from z -36 to 60, lanterns, a cart (4.2, 22), a lake for z < -60 (water y -0.4). Put building
  props in the street at z -6 (small) / -12 (tall); establishing: camera (0, 10, 44) -> (0, 2, -10).
- **garage** (tyre shop / workshop 1900-1930): room 12.8 m wide, workbench x ±1.4 z -3.55..-2.85 top 0.95 with its
  front-left leg on a red book (CU: camera (-0.8, 0.45, -1.4) -> (-1.32, 0.2, -2.93)), tool board on the back wall,
  tyre stacks at x ±3.4..4.6. Person in front of the bench at (0, -1.0); camera (0.8, 1.7, 5.4) -> (0, 1.3, -1.5).
- **bistro** (restaurant 1920s-50s): main round table at the origin (top 0.76, chairs at x ±0.95: diners `mode: "sit"`),
  side tables (±2.7, -1.6), a bar with bottles on the back wall z -3.6..-3.1, wall lamps, two windows, chequered floor.
  Wide: camera (0.4, 2.0, 7.0) -> (0, 1.0, -0.8), fov 44. Stars over the table: three `rosette` cards at y 2.5, x ±0.62.
- props `oldCar {color, yaw, path}` (1900 open car, spoked wheels, length along x; `yaw: Math.PI/2` drives toward -z;
  a driver card at `[x, 0.5, z + 0.3]` with the same `to`), `tyres {rows: n}` (a stack of n tyres).
- **grocery** (1930s corner store): back wall z -4 full of shelves (cans / boxes / jars, x ±1.3..5.8), back door +
  wall clock (0, 3.35, -3.96), counter x -1.9..1.9 z -2.05..-1.3 top **1.0** (register x 1.2, sweets jar x -1.2, scales
  x -0.4), grocer behind at (0, -2.7), customers at z >= -0.6, barrels (-4.8, -1.2) (-5.3, 0.2), sacks (4.6, -1.0)
  (5.2, 0.3), fruit crates x ±3 z 1.2, window on the left wall, teal/cream checker floor, pendant lamps.
  Wide: `frame: {size: "full", pts: [[±2, 2.6, -3.8]]}`; behind-the-counter MS: `frame: {size: "ms", on: [grocer, customer], az: 15}`.
- **downtown** (1930s main street along x): shop row facing +z with facades at z -8 (x -42..42, 15 shopfronts, striped
  awnings, blade signs, water tanks; signs have NO letters), the hero shop with the red/cream awning at x -4.1..4.1
  (door (0, -8)), sidewalk z -8..-4 at **y 0.15** (people: `p: [x, 0.15, z]`, z -7..-4.8), road z -4..10, a second
  row facing -z at z 14 (reverse shots; keep the camera at z < 12), lamp posts every 9 m at z -4.6, hydrant (-6.5, -4.7),
  mailbox (6.6, -4.7), street clock (11, -4.8). Wide: camera (2, 2.2, 9) -> (0, 2.2, -8), fov 44.
- props `sedan {color, yaw, path}` (1930s car 4.4 m along x, front +x; parked at z -2.7), `meter {lift: [[f, 0], [f+30, 1]]}`
  (parking meter on the sidewalk y 0.15 z -4.4; lift 0..1 raises the red expired flag), `shopCart {yaw, path}` (wire
  shopping cart, handle at x -0.62 y 1.0: push it with a `path` and walk the actor behind it), `streetClock`.
New kinds: add a builder to `engine/sets.ts` + `SET_KINDS` (only when no set fits; tell the user it costs more).

## 4. Sound (`shorts/<name>/sound.json`) - the bed NEVER stops
```json
{ "music": "chill", "ambience": [[0, "shop"], [123, "street"]],
  "cues": [["öksürük", "cough", -10, -0.3], ["yasakladı", "thump", -6, 0, {"f0": 75}], [1864, "creak", -16]] }
```
`at` = frame or word ref (`"word"`, `"word#2"`, `"word+4"`); then kind, dB, pan, {params}. Ambience: shop lab room street
outdoor harbor crowd none. Cues: cough clink bell shimmer angel whoosh rattle chainWhip thump pop hurrah oof whoa steps run
creak flutter applause splash tick coins whistle ratchet rain.
`"music": "chill"` (default) = lo-fi bed `musicDb` (default 13, range 10-15) dB under the voice for the whole video, plus
an ambience per set; `"none"` only if the user asks. Master -14.5 LUFS, true peak <= -2 dBTP. Hit every visual impact
with a cue on the same frame, tucked UNDER the voice (cues are placed inside speech, not only in gaps).
`python <skill>/scripts/sound.py shorts/<name>/sound.json src/shorts/<name>/words.json shorts/<name>/voice/voice.wav shorts/<name>/audio --total <frames>`

## 5. Look check -> final
0. `python <skill>/scripts/render.py check src/shorts/<name>/spec.ts` (~5 s, no pixels, every 2nd frame): lists CUT,
   OVERLAP (two people stuck together), HIDDEN (a face behind someone), INSIDE (feet inside a desk/table/car/
   building), CARD (a card over a face) with frame ranges. Fix until only intended ones remain (a car driving out of
   frame, a card falling past a face for 2 frames). Then `render.py sheet <CompId> <total> --spec <spec.ts>` picks the
   frames itself (each shot's middle + the first frame of every remaining issue).
   It also prints a `camera:` line (takes, hard cuts, dissolves, average take length, % of frames moving > 10 %/s,
   drifting > 2 %/s) next to the reference numbers: aim for an average take >= 3 s, moving >= 50 %, drift >= 90 %;
   fix a low number by merging same-place shots into one take with glides, not by adding shakes.
1. `python <skill>/scripts/render.py sheet <CompId> <total> --frames <one mid-frame per shot> --out out/<name>/sheet` -> read the ONE image.
   Check: subject framed (not cut at the edge), captions not over a face or the key prop (`captions` override),
   nothing blocking the lens, expressions readable. Fix by editing numbers in the Spec; re-run the sheet for changed shots only.
   **Hard gates** (must be 0 before the final): CUT OVERLAP INSIDE CAMIN (camera in a wall / under the floor) CAMFACE
   (camera < 0.5 m from a face) CAPT (a face under the captions: move them with `captions`) JITTER (camera jumps > 1.5 px:
   usually a key that starts before the previous glide landed; start it after `f + dur`, or merge the two keys).
   Warnings: HIDDEN, CARD, SIZE (> 80 % of the frame). Cartoon magic is never a bug.
1b. `python <skill>/scripts/render.py preview <CompId> shorts/<name>/audio/mix.wav out/<name>/preview.mp4 --spec <spec.ts>`
   (540x960, fast) -> review sheets `out/<name>/preview_review_NN.jpg`, 40 thumbnails each, one per 0.5 s. Read ALL of
   them before the final: props sinking, a camera inside a face, a frozen crowd show only in motion.
2. `python <skill>/scripts/render.py final <CompId> shorts/<name>/audio/mix.wav out/<name>/final.mp4 --spec <spec.ts> --qa`
   (1440x2560, ~2-3 min). It refuses while a hard gate fails; `--waive "<reason>"` only with a reason the user accepted
   (recorded). `out/<name>/final.json` stamps the engine version, date, gates and camera line.
   QA: no black/frozen frames; the only white frame is `flashAt`; loudness -14..-15 LUFS, LRA ~2-4, true peak <= -2.
   Versions are never lost: an existing final.mp4 is moved to `final_v1.mp4`, `_v2`... before the new render; compare
   versions with numbers (check / camera / QA lines), and the user picks.
3. Cover: `python <skill>/scripts/cover.py <CompId> <frame> <name> "LINE 1|LINE 2|LINE 3" --hl 1,2` -> `out/<name>/kapak.png`
   (1080x1920). Frame: the punchiest shot with a face or the key object (hook / reveal / ending). Title: 2-3 short lines
   (<= 13 characters each) that tease the hook, e.g. "PİSA'YI|BİR SAVAŞ|KURTARDI"; the line(s) in `--hl` turn yellow.
4. Write `out/<name>/youtube.txt` in the video's language (no extra tokens: take it from SCRIPT.md):
   ```
   BAŞLIK
   <the best title, max ~60 characters, e.g. "Astronotlar Uzayda Neden Sifon Çekemez?">
   BAŞLIK SEÇENEKLERİ
   <4 more, 4-8 words, patterns "[Normal şey] Neden [Aslında Tuhaf]" / "[İmkânsız Şeyi Yapan] [Nesne]", no emoji>
   AÇIKLAMA
   <2-3 plain sentences: the hook fact + what the video reveals; sensitive topics add "Bu video tarihî bilgilendirme amaçlıdır.">
   HASHTAG
   <3 hashtags, the last one #shorts>
   ETİKETLER
   <6-10 comma-separated search terms>
   ```
5. Report: video, cover and text paths, length, voice, what to listen for (you cannot hear it). Offer one change round.

## Optional: prompts for AI video tools (only when the user asks: Google Flow / Veo / Kling / Nano Banana)
Write `out/<name>/prompts.md` instead of (or besides) the engine render, from the approved `voice.txt`:
1. **Style sheet** (once): default "Flat 2D cartoon characters with simple round heads, dot eyes, thick clean black outlines
   and flat colours, animated on a detailed stylised 3D-rendered background with soft daylight, warm saturated colours,
   shallow depth of field. Vertical 9:16. Smooth, expressive cartoon acting. No captions, no subtitles, no logos, no
   watermarks; the only writing allowed is a number on a prop." If the user attaches screenshots of a look, describe that
   look in general terms (outlines, faces, colours, background, light) with OUR own characters, never theirs.
2. **Characters**: one fixed sentence each (body, clothes, one identifying colour), reused word for word in every prompt.
3. **Reference image prompt**: style sheet + character sentences + all main characters side by side, full body, facing
   the camera, in the main setting, each with their key prop, no text. Make this image first and attach it to every shot.
4. **One prompt per sentence** (4-6 s each, own code block, "SHOT n (5 s)"): "Use the attached images as the character
   and style reference." + style sheet + the sentences of the characters in the shot + setting with camera position and
   angle + the literal action of that sentence (only what the camera sees, directions: towards/away, left/right; a number
   in the narration appears written on a prop) + "Sound: ambient sound effects only. No dialogue, no narration, no music."

## Premium round (optional, after v1 is approved; ~100-180k tokens per agent, so ask once)
When the user wants a version pushed toward premium quality, run specialist agents in parallel, each writing ONLY its
own files, then merge: SHAPE (engine `toon.ts` / `outfits.ts`), WORLD (`sets.ts` / `town30s.ts` / a new kit file),
LOOK (`lights.ts` / `grade.ts`), CAMERA = director (strongest model; edits only the video's `spec.ts` cam keys after
writing a shot list: who stands where, which word each push-in lands on, where the camera travels instead of cutting).
Simple scans on a lighter model. Then a JUDGE agent scores characters / world / light / camera / logic / overall 1-10
against `references/story-camera.md`; reject "logic" complaints that are cartoon magic. Every improvement goes into
the engine (bump the version), never into one video's copy. Keep v1, v2... and compare with numbers.

## Asset growth + quality ladder (every video)
- **Every new short adds 2-4 reusable assets** the story needs (a set, a prop, an fx card, an outfit, a sound cue),
  written generically (origin-relative, parameters, no story text) into `engine/` + listed in this file, so the library
  grows video by video. Tell the user which assets were added.
- **Quality ladder** toward the reference look (premium cartoon shorts): each video also fixes ONE item from the top of
  this list and moves it to "done" in `QUALITY.md` at the repo root:
  1. acting: hand-held props (a book, a coin, a tyre in the hand), pointing, sitting at a table, running poses
  2. talking: mouth flaps on the speaking character while their line plays
  3. sets: denser dressing (clutter, signs without text, background people), a second light colour per set
  4. sound: real ElevenLabs sound effects for key impacts (sound-effects skill; costs credits, ask once) + room tones
  5. camera: one motivated move per shot (follow the action, reveal), whip-pan transitions on cues
  6. compare: every 3rd video, side-by-side frames with the reference style notes, score 1-10 per area, pick the next item

## Long-form mode (16:9, 3-15 min) - `longform/` (in the repo)
When the user wants a long YouTube video (not a Short): the ReachMora 2D long-form engine (flat ink-on-paper puppets,
graphics shots: table/documents, counter, chart, map, versus, list, stamps, chapter cards, polaroid ending). Read
`longform/SKILL.md` + `longform/references/story-format.md` and follow them, with these changes for this channel:
- Turkish: script, labels and cards in Turkish (write labels in Turkish capitals yourself: İ, Ş, Ğ). Alignment:
  `RM_LANG=tr` (faster-whisper large-v3 on the GPU; the bundled Parakeet model is English-only, do not download it).
- Run with the project venv: `cd <skill>/longform && RM_LANG=tr <project>/.venv/Scripts/python.exe -m engine <cmd> <P>`.
- Voice: ElevenLabs (Can Seçkin) like the shorts, but say the credit cost first: ~150 words/min, so a 5 min video
  ≈ 4,500 credits and 10 min ≈ 9,000 (more than a free month). Edge `tr-TR-AhmetNeural` is the free fallback.
- Story rules above still apply (smart-feeling topic, stakes in the first sentence, payoff ending); add a re-hook every
  60-90 s and a "sen" moment every 30-45 s. Credit "ReachMora" when sharing that engine (`longform/CREDITS.md`).
- Speed here: 1080p renders about 3-4 min per video minute on 8 cores; offer `--res 720` for long ones.

## Re-voice a finished short (another narrator, same picture)
Composition captions read `inputProps.words`; the SFX stem is `shorts/<name>/audio/stem_sfx.wav`.
`python <skill>/scripts/revoice.py --take <file|url> --script voice.txt --ref src/shorts/<name>/words.json --sfx shorts/<name>/audio/stem_sfx.wav --comp <CompId> --out out/<name>/final_<voice>.mp4`
Each sentence lands where the reference voice said it (sped up ≤ 1.15 if needed; the log lists them). Voice part ~15 s.

## Gotchas (learned)
- `@react-three/postprocessing` must stay 3.0.4 (3.1+ renders blank frames in Remotion). 2K = `--scale 1.3333333333333333`.
- A mirror/door rotated toward the lens blanks a shot; opaque glass hides liquids; props < 2 m from the lens become blobs.
- A card's light/face reads best with the sun behind the camera; golden light from the front-side (`sun: [140, 16]`).
- Captions are word-by-word, 70 % height: move them (`captions`) for table/desk close-ups where the subject sits there.
  Long words shrink by themselves to fit the width (CUMHURBAŞKANLIĞINA used to run off both edges).
- Sheet frames: pick one frame AFTER each glide lands (key `f` + `dur`), not only mid-shot: most cut-off actors show there.
- `render.py sheet` also prints a **framing report** (every actor whose side or head leaves the frame at the sheet frames).
  Fix every line it lists before the final (an intentional exit/entry walk may stay); my first guesses were cut ~30 % of the time.
- Whisper reads long takes with context: check a doubtful word by transcribing that sentence alone.
