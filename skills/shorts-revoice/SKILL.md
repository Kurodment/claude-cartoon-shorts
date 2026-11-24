---
name: shorts-revoice
description: Re-voice a finished animated short (Remotion) with a new narrator in one command - generate the narration (ElevenLabs MCP, or any TTS file), fit every sentence onto the timing the picture was cut to, mix it with the cached SFX stem, re-render with word-by-word captions on the new timing. Use when the user wants another voice / a different narrator / an ElevenLabs version of an existing short, asks to "change the voice of the video", "sesini değiştir", "ElevenLabs ile seslendir", or wants to compare narrators on the same video.
---

# Re-voice a finished short

The picture, cameras and sound effects of a finished short are cut to the word timings of its reference voice
(`words.json`). This skill swaps the narrator without touching any of that: each sentence of the new take is placed
exactly where the reference voice said it. The voice part takes ~15 s; the rest is the video render.
Talk to the user in their language (Turkish for Turkish shorts).

## What the project needs
- `voice.txt`: the script, one sentence per line, exactly as the new narrator should read it.
- Reference `words.json`: `[{"w", "s", "e", "line"}]` of the voice the picture was cut to (`line` = sentence index).
- SFX stem (`stem_sfx.wav`, 48 kHz stereo, exactly as long as the video). Keep the stem when you make the first mix.
- A Remotion composition whose captions read `getInputProps().words` (fall back to its own words.json), e.g.
  `const WORDS = (getInputProps() as { words?: Word[] }).words ?? DEFAULT_WORDS;`
- Python with `numpy scipy faster-whisper` (+ `nvidia-cublas-cu12 nvidia-cudnn-cu12` for GPU), ffmpeg on PATH, Node.
- Optional `caption_map.json`: spelled-out numbers back to digits for the captions,
  `[[["bin","sekiz","yüz","doksan","yedi"],"1897"]]`.

## 1. Get the take
**ElevenLabs (MCP connected):**
1. `creative_list_voices` with `languages` (e.g. `["tr"]`), gender and `use_cases` that fit the short
   (`informative_educational`, `narrative_story`, `social_media`). Pick one yourself and say which; never invent a voice_id.
2. Join `voice.txt` into one prompt (one generation keeps the tone steady across sentences).
3. `creative_generate_speech` with `estimate_only: true` first and tell the user the credit cost.
4. Generate with `generations_count: 1` (the default 2 doubles the cost). Never call it again to retry - it charges again.
5. Poll `creative_get_flow_run_status` (wait `poll_after_seconds`) until `all_completed`; take the `content_url`.

**Any other TTS** (Edge, VoiceStudio, a recording): one audio file reading `voice.txt` as written.

## 2. Fit, mix, render (one command, from the Remotion project root)
```
python <skill>/scripts/revoice.py --take <file-or-url> --script voice.txt --ref words.json \
  --sfx stem_sfx.wav --comp <CompositionId> --out out/<name>/final_<voice>.mp4 \
  [--caption-map caption_map.json] [--scale 1.3333333333333333] [--max-speed 1.15] [--qa] [--no-render]
```
- `--scale 1.333...` renders 1080x1920 compositions at 1440x2560 (2K vertical). `--no-render` stops after the mix.
- Set `REMOTION_TMP` to a big drive: every Remotion bundle copies `public/` into the temp folder.
- The log prints every sped-up line (`3:x1.13`). Above ~1.10 a line sounds rushed: shorten it in `voice.txt` and
  generate again, or accept it. Missing lines stop the script (the take must read the script as written).

## 3. Check before you hand it over
- Whisper the fitted voice against the script; a word heard differently inside a sped-up line is worth a second look
  (cut that line out and transcribe it alone - long-context transcripts sometimes "hear" a different suffix).
- Say plainly that you cannot listen: the user judges tone and pace.
- Report: file path, voice name + model, credits spent, which lines were sped up.

## Rules
- **No commas inside a sentence** in `voice.txt`: TTS voices read a comma as a sentence end (pitch drops, pause),
  e.g. "ilk büyük yağmurda, toprak tavan..." sounds like two sentences. Split into two sentences if a pause is needed.
- Never clone a third party's voice (a famous narrator, another channel). Library / designed voices, or the user's own.
- ElevenLabs free plan has no commercial licence: tell the user before they upload to a monetised channel.
- Keep the reference voice's files: other voices are fitted to the same `words.json`.
