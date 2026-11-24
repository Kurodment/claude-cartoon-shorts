# Quality ladder (toward premium cartoon-shorts quality)

Each new short fixes one open item and adds 2-4 reusable assets (see SKILL.md "Asset growth + quality ladder").

## Done
- [x] Framing report: render.py sheet lists every actor cut at a frame edge (Chicago)
- [x] Long captions auto-fit the width (Lamartine fix)
- [x] Acting 1/3: hand-held props (`hold`) - guide, tyre, dish (Michelin)
- [x] Acting 2/3: 13 arm poses (point, up, hip, cross, temple...), 3 faces, idle sway on every card, camera ease + curved via-paths (from the cartoon-short-kit)
- [x] Auto-framing camera keys (`frame: {size, on, side...}`) + `render.py check`: every-2nd-frame geometry check (CUT / OVERLAP / HIDDEN / INSIDE / CARD) in ~5 s (Michelin: 19 issues -> only intended ones)
- [x] Long-form 16:9 mode (ReachMora engine, Turkish alignment + fonts), local install
- [x] Camera 1/2 (from the Version Six kit's measurements): default glide ease `rc` (speed peak at 40 %, long settle),
      `render.py check` prints a camera-grammar line (takes, hard cuts, dissolves, avg take, % moving / drifting) against
      the reference numbers; SKILL.md plans TAKES instead of one shot per sentence
- [x] Versions: `render.py final` archives the previous final as `_vN` instead of overwriting

## Open (top = next)
- [ ] Acting 3/3: run cycle + anticipation/overshoot on actions
- [ ] Models: real CC0 / generated 3D models via Blender for hero props and buildings (parked: user does not want Blender for now)
- [ ] Talking: mouth flaps on the speaking character
- [ ] Sets: denser dressing (clutter, background extras), second light colour per set
- [ ] Sound: ElevenLabs sound effects for the 3-4 key impacts (credits, ask once)
- [ ] Camera 2/2: one motivated move per sentence inside a take (push-in on the word), whip-pan transitions on cues;
      target from the check line: avg take >= 3.4 s, moving >= 60 %
- [ ] Compare: side-by-side review against reference style notes every 3rd video (score 1-10 per area)

## Asset log
- Chicago: mudTown set, building (lift/jacks/steps), logs, pipe, car, slab; whistle/ratchet/rain cues
- Version Six kit port (2026-11-24): grocery + downtown sets, sedan / meter / shopCart / streetClock props, 19 town
  outfits, fedora / cloche / boater hats, glasses, tie, apron, polka dots; references/story-camera.md
- Michelin: garage + bistro sets, oldCar + tyres props; guide/tyre/rosette/dish cards; chef/waiter/mechanic/driver/critic outfits; `hold`
