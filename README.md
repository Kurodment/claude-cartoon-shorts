# claude-cartoon-shorts

A [Claude Code](https://claude.com/claude-code) skill that turns an idea into a ~70 s vertical cartoon short (flat
bean-head characters in an inked, colourful 3D world, rendered with three.js inside Remotion) with narration,
word-by-word captions and synthesized sound effects, at a low token cost: the engine is ready, and a new video is ONE
short Spec file plus a sound cue list.

Bir fikirden ~70 saniyelik dikey çizgi film kısa videosu üreten Claude Code skill'i. Motor hazır; her yeni video için
model sadece kısa bir senaryo dosyası (Spec) ve bir ses listesi yazar. Bu yüzden az token harcar.

## Install

```
npx skills add Kurodment/claude-cartoon-shorts
```

Then, in a Remotion project (`npx create-video@latest`):

```
python <skill>/scripts/setup.py install
```

## Pipeline

| Step | Tool | Output |
|---|---|---|
| Idea → facts → script | Claude (2 searches max) | `SCRIPT.md`, `voice.txt` |
| Voice | `voice.py edge` (free) or ElevenLabs MCP + `voice.py take` | `voice.wav`, `words.json`, word/frame table |
| Picture | one `spec.ts` (sets, shots, cameras, cast, effects, props) | composition registered by `setup.py new` |
| Sound | `sound.json` → `sound.py` | `mix.wav`, stems |
| Look check | `render.py sheet` | one contact sheet image |
| Final | `render.py final --qa` | 1440×2560 mp4, QA summary |
| Another narrator | `revoice.py` | same picture, new voice (~15 s + render) |
| Long-form 16:9 (3-15 min) | `longform/` (ReachMora engine) | 1080p MP4 with graphics shots |

Libraries: 15 sets (lab, shop, ward, street + factory, brain castle, capitol, bathroom, office, kitchen, harbour +
steamship, palace, meadow, 1850s mud town, 1930s grocery, 1930s downtown), liftable buildings on jacks, 57 outfits, 14 expressions, 24 effect kinds, 7 prop kinds, 24 sound cues, 8 room tones. `example/eroin/` is a complete 21-shot short.

## Rules

`skills/cartoon-shorts/references/production-bible-tr.md` is the channel's production bible (Turkish): story
formula, sound and caption standards, camera grammar, light, per-frame hard gates and review rules, each mapped to the
engine feature that enforces it. Engine version: `engine/version.ts`, history in `engine/CHANGELOG.md`.

## Requirements

Node + Remotion 4, Python 3.10+ (numpy, scipy, pillow, edge-tts, faster-whisper; GPU optional), ffmpeg.

## Credits

Built on [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (MIT): the look
(ink pass, lens blur, grade, two-tone shading, Pen character drawing, sound DSP) comes from there; this repo turns it
into a reusable Spec-driven engine with set / outfit / effect / sound libraries, Turkish voice tools and re-voicing.
3D models: Kenney (CC0).

The 1930s town kit (grocery + downtown sets, sedan / parking meter / shopping cart / street clock, the 19 town
characters, fedora / cloche / boater hats) and the measured story + camera rules (`references/story-camera.md`, the
`rc` camera ease, the camera-grammar check) are ported from the free **Version Six – animated-shorts-kit (Ep1)**.

Arm poses, extra faces, idle life and camera easing/spline ideas come from the publicly shared **cartoon-short-kit**
(itself built on mromidev/claude-animated-shorts). The long-form 16:9 mode in `skills/cartoon-shorts/longform/` is
**ReachMora 2D Long-Form, made by ReachMora** (see its `CREDITS.md`; puppet/lighting code adapted from aivxer's
"Claude 2D Animation Long Form"), adapted here for Turkish (faster-whisper alignment, Bangers font, OFL).

## License

MIT
