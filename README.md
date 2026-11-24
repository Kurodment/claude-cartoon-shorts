# claude-shorts-revoice

A [Claude Code](https://claude.com/claude-code) skill that re-voices a finished animated short (Remotion) with a new
narrator in one command, without touching the picture, the cameras or the sound effects.

Bitmiş bir animasyon kısa videonun (Remotion) anlatıcısını tek komutla değiştiren bir Claude Code skill'i. Görüntü,
kamera ve efektler olduğu gibi kalır; yeni sesin her cümlesi eski sesin o cümleyi söylediği ana yerleşir.

## Install

```
npx skills add Kurodment/claude-shorts-revoice
```

## What it does

1. **Take**: one narration take from the ElevenLabs MCP (voice picked from the library, cost estimated first, a single
   generation) or any TTS file / recording.
2. **Fit**: Whisper large-v3 finds every script sentence in the take; each one is placed on the reference voice's
   timing. Sentences longer than their slot are sped up slightly (ffmpeg `atempo`, max 1.15).
3. **Mix**: new voice at -15 LUFS with the short's cached SFX stem (SFX peaks 6 dB under the voice), limiter at -1.2 dBTP.
4. **Render**: the Remotion composition with word-by-word captions on the new timings, muxed with the mix.

The voice part takes about 15 seconds on a GPU; the rest is the video render.

```
python skills/shorts-revoice/scripts/revoice.py --take take.mp3 --script voice.txt --ref words.json \
  --sfx stem_sfx.wav --comp MyShort --out out/final_newvoice.mp4 --caption-map caption_map.json
```

See [`skills/shorts-revoice/SKILL.md`](skills/shorts-revoice/SKILL.md) for the inputs the project needs and the full workflow.

## Requirements

Python 3.10+ with `numpy scipy faster-whisper` (GPU: `nvidia-cublas-cu12 nvidia-cudnn-cu12`), ffmpeg, Node + Remotion.

## Roadmap

- Generate the take straight from the ElevenLabs REST API when `ELEVENLABS_API_KEY` is set
- Per-line re-takes for lines that need more than 10 % speed-up
- Side-by-side comparison page of several narrators

## License

MIT
