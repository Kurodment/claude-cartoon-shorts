# Turkish voice-over with word timings in one step (free Microsoft Edge neural voices via edge-tts).
# usage: .venv/Scripts/python.exe scripts/tts_tr.py <voice.txt> <out_dir> [--voice tr-TR-AhmetNeural] [--rate +0%] [--pitch +0Hz]
# writes <out_dir>/voice.wav (48 kHz mono, what audio/mix.py reads) and <out_dir>/words.json ([{"w","s","e"}] in seconds).
# voice.txt: the narration, one sentence per line. Blank lines and lines starting with # are skipped.
# Each line is synthesized separately and joined with a fixed pause, so sentence gaps are steady and predictable.
import argparse, asyncio, json, os, subprocess, sys, tempfile, wave
import sys as _sys; _sys.stdout.reconfigure(encoding="utf-8")

import edge_tts

SR = 48000


def run(*a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f"command failed: {' '.join(a)}\n{r.stderr[-800:]}")


async def synth(text, voice, rate, pitch, mp3):
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7
                words.append({"w": ch["text"], "s": round(s, 3), "e": round(s + ch["duration"] / 1e7, 3)})
    return words


def read_pcm(path):
    with wave.open(path, "rb") as w:
        return w.readframes(w.getnframes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("text")
    ap.add_argument("out")
    ap.add_argument("--voice", default="tr-TR-AhmetNeural", help="tr-TR-AhmetNeural (male) or tr-TR-EmelNeural (female)")
    ap.add_argument("--rate", default="+0%", help="speaking speed, e.g. +8%% or -5%%")
    ap.add_argument("--pitch", default="+0Hz")
    ap.add_argument("--gap", type=float, default=0.28, help="pause between lines in seconds")
    ap.add_argument("--lead", type=float, default=0.15, help="silence before the first word")
    a = ap.parse_args()

    lines = [l.strip() for l in open(a.text, encoding="utf-8") if l.strip() and not l.lstrip().startswith("#")]
    os.makedirs(a.out, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="tts_")
    pcm, words, t = bytearray(), [], 0.0
    silence = lambda sec: b"\x00\x00" * int(round(sec * SR))
    pcm += silence(a.lead)
    t += a.lead
    for i, line in enumerate(lines):
        mp3, wav = os.path.join(tmp, f"{i}.mp3"), os.path.join(tmp, f"{i}.wav")
        ws = asyncio.run(synth(line, a.voice, a.rate, a.pitch, mp3))
        run("ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", wav)
        seg = read_pcm(wav)
        # trim edge-tts' own lead/tail silence (~0.1 s / ~0.6 s) so --gap alone sets the pause between lines
        if ws:
            cut0 = max(0.0, ws[0]["s"] - 0.04)
            cut1 = min(len(seg) / 2 / SR, ws[-1]["e"] + 0.14)
            seg = seg[int(cut0 * SR) * 2: int(cut1 * SR) * 2]
            ws = [{**w, "s": w["s"] - cut0, "e": w["e"] - cut0} for w in ws]
        for w in ws:
            words.append({"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3), "line": i})
        pcm += seg
        t += len(seg) / 2 / SR
        if i < len(lines) - 1:
            pcm += silence(a.gap)
            t += a.gap
        print(f"{i + 1:2d}/{len(lines)}  {len(ws):2d} words  {line[:70]}")
    pcm += silence(0.4)
    out_wav = os.path.join(a.out, "voice.wav")
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(pcm))
    json.dump(words, open(os.path.join(a.out, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    dur = len(pcm) / 2 / SR
    print(f"voice.wav {dur:.2f} s ({round(dur * 30)} frames at 30 fps), {len(words)} words, "
          f"{len(words) / max(dur, 1e-6):.2f} words/s -> {a.out}")


if __name__ == "__main__":
    main()
