# Story + camera rules measured on premium story shorts

Source: the free "Version Six – animated-shorts-kit" (Ep1), which measured top story-short channels (16-35 M views per
short, 1080x1920, 30 fps) frame by frame. These are rules, not copies. Read this only when planning shots or improving
a version; SKILL.md already has the short form.

## Story formula (45-65 s)
- Hook (first 1.7-5 s): ONE sentence, no intro, no year, no "once upon a time", built on a contradiction:
  strange action by a person ("Dükkânına boş araba itsinler diye yabancılara para verdi."), a paradox fact ("Burada X
  yasak ama her sokakta bir tane var."), or a conditional promise ("X yaparsan Y olabilir."). Strange action + underdog did best.
- Arc: someone does something that looks stupid -> people laugh (short quoted lines) -> it gets worse -> he was right
  all along ("Çünkü...") -> the people who laughed pay for it or are left speechless.
- Details: small exact numbers, not statistics; grow things in threes; show the RESULT first, then the reason in 1-3
  sentences with an everyday analogy.
- Ending: the last line is a twist, punchline or callback; the video ends 0.1-0.5 s after the last word. No goodbye.
- Pace: 3.3-3.8 words/s in English (Turkish ~2.3-2.6), longest pause ~0.4 s. 3rd person for history, 2nd for explainers.
- Picture: something moves in ~90 % of frames; a new view every 1-3.5 s (a cut OR the travelling camera).
- Captions: 1-3 words, bold white with a dark outline, ~70 % height. Extra text lives inside the world.
- Sound: -14 LUFS master; one narrator; a bed that never stops 10-15 dB under the voice; SFX tucked under the voice.

## Camera grammar (3 videos measured in depth)
| | mean |
|---|---|
| true hard cuts per ~65 s video | **1** |
| short cross-dissolves (3-6 frames) | 13 (at place / time changes: "ertesi gün", "bu sırada") |
| average take length | **4.2 s** (3.4-5.0) |
| camera moving > 10 % of frame width / s | **77 %** of frames |
| any drift > 2 %/s | 97 % |
| fast > 60 %/s (whips, fast pushes) | ~30 % |
| distinct moves | one every 2.2 s, median 1.3 s long, holds between them ~0.4 s |
| move types | push-in 53 %, pull-back 22 %, tilt/crane 13 %, pan/truck/arc 12 % |
| velocity profile | ramps up in ~0.3 s, peak at ~40 % of the move, longer settle; no linear moves, no hard stops |

What it means for a Spec:
- **Push-in is the default move** and it LANDS ON THE WORD: the subject is reached on its noun or verb
  (`f: w("word") - 6`, `dur` 18-36).
- **Pull-back = reveal** (often fast, `ease: "out"`): from a detail to the whole room / the next person.
- **Subject-to-subject travel**, never a cut: push or pull combined with an arc (`via` points or `frame.az` change).
- **Follow the action**: tilt down with a falling object to the splash, then pan / pull back to the next subject.
- **Never hold still**: every hold creeps (`push` 0.002-0.0035).
- Hard cuts only for a mood switch or a punchline; place / time changes get a 4-6 frame dissolve (`xfade`).
- A whip (fast `ease: "out"` glide with a big look change) can hide an unavoidable staging change.
- `render.py check` prints these numbers for our Spec so versions can be compared by numbers, not by opinion.

## Character shape notes (for the quality ladder, not needed per video)
- Heads: egg with a jaw, never a perfect circle; widest just below the centre; tilted 3-8 deg per character.
- Two neighbours in a shot should not share the same head family (round / egg / square jaw / pear / long bean).
- Outline heavier on the lower / shadow side (ratio ~2.3), thin on the light side; brows are blunt tapered wedges.
- Hats oversized and tilted 5-15 deg, brims with pointed upturned tips, crowns tapered / pinched (fedora, cloche,
  boater are in the engine now). At most 3 asymmetric cues per character; stiff characters (police, preacher) stay upright.
- Props: posts taper, bases flare, vehicles lean forward; change the silhouette, never add trim or bolts.

## Workflow habits worth keeping
- Measure, don't describe: numbers per version (check issues, camera line, QA loudness) decide between v1 / v2.
- Watch the whole video before calling it done; a few stills hide props sinking into the floor or a camera inside a face.
- Every improvement goes into the shared engine, never into one video's copy, so the next video starts better.
- Keep every version (render.py final archives the previous file as `_vN`). The user is the final judge; cartoon
  magic (a chair becoming a cart) is fine, only fix what a viewer would notice.
