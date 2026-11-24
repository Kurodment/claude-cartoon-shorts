# Re-voice a finished short in one command: a new narration take (file or URL, e.g. an ElevenLabs generation) is
# fitted line by line onto the timing the picture was cut to, mixed with the short's cached SFX stem, rendered with
# captions on the new word timings and muxed. Whisper loads once; the SFX are not re-synthesized.
#
#   python scripts/revoice.py --take <file|url> --script <voice.txt> --ref <reference words.json> \
#       --sfx <stem_sfx.wav> --comp <CompositionId> --out <final.mp4> [--caption-map map.json] [--scale 1.3333333333333333] [--qa]
#
# Fitting: whisper large-v3 (GPU when available) finds every script line in the take; each line is cut out and placed
# where the reference voice spoke it. A line longer than its slot is sped up (ffmpeg atempo, at most --max-speed) and
# may run into the next gap. Captions keep the script spelling; --caption-map merges spelled-out numbers back to digits
# ([["bin","sekiz","yüz","doksan","yedi"], "1897"], ...). The composition must read inputProps.words for captions.
# Mix: voice to -15 LUFS, SFX peaks 6 dB under the voice's loudest moment, look-ahead limiter at -1.2 dBTP.
import argparse, difflib, glob, json, os, re, shutil, subprocess, sys, tempfile, time, urllib.request
import numpy as np
from scipy import ndimage, signal

for _d in glob.glob(os.path.join(sys.prefix, "Lib", "site-packages", "nvidia", "*", "bin")):
    os.add_dll_directory(_d); os.environ["PATH"] = _d + os.pathsep + os.environ["PATH"]
sys.stdout.reconfigure(encoding="utf-8")
SR = 48000
T0 = time.time()
log = lambda m: print(f"[{time.time() - T0:6.1f}s] {m}", flush=True)
norm = lambda s: re.sub(r"[^a-zçğıöşüâîû0-9]", "", s.replace("I", "ı").replace("İ", "i").lower())


def dec(path, sr, ch=1):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    return x if ch == 1 else x.reshape(-1, ch).T


def atempo(x, k):
    if abs(k - 1) < 0.005:
        return x
    p = subprocess.run(["ffmpeg", "-v", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={k:.4f}", "-f", "f64le", "-"],
                       input=x.tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float64)


# ---------------- loudness (BS.1770 integrated, momentary max) ----------------
def kfilt(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=-1), axis=-1)


def blocks(x, win, hop):
    y = kfilt(np.atleast_2d(x)) ** 2
    n = 1 + max(0, (y.shape[1] - win) // hop)
    c = np.cumsum(np.pad(y, ((0, 0), (1, 0))), axis=1)
    idx = np.arange(n) * hop
    return ((c[:, idx + win] - c[:, idx]) / win).sum(0)


def integrated(x):
    z = blocks(x, int(0.4 * SR), int(0.1 * SR))
    l = -0.691 + 10 * np.log10(np.maximum(z, 1e-12))
    z = z[l > -70]
    rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z = z[-0.691 + 10 * np.log10(z) > rel]
    return -0.691 + 10 * np.log10(z.mean())


def momentary_max(x):
    return -0.691 + 10 * np.log10(max(blocks(x, int(0.4 * SR), int(0.01 * SR)).max(), 1e-12))


def limiter(x, ceil_db=-1.2, look=0.005, rel=0.08):
    """instant attack (look-ahead window), exponential release; gain computed on 1 ms blocks (fast), then upsampled"""
    ceil = 10 ** (ceil_db / 20)
    a = np.abs(x).max(axis=0)
    need = np.minimum(1.0, ceil / np.maximum(a, 1e-9))
    B = 48
    nb = int(np.ceil(len(need) / B))
    blk = np.pad(need, (0, nb * B - len(need)), constant_values=1).reshape(nb, B).min(1)
    blk = ndimage.minimum_filter1d(blk, size=2 * max(1, int(look * 1000)) + 1, mode="nearest")
    k = np.exp(-1.0 / (rel * 1000)); sm = np.empty_like(blk); cur = 1.0
    for i, g in enumerate(blk):  # ~70k iterations for a 70 s short
        cur = g if g < cur else g + (cur - g) * k
        sm[i] = cur
    g = np.repeat(sm, B)[: len(need)]
    return x * np.minimum(g, need)


def true_peak(x):
    up = signal.resample_poly(x, 4, 1, axis=-1)
    return 20 * np.log10(max(np.abs(up).max(), 1e-12))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--take", required=True); ap.add_argument("--script", required=True); ap.add_argument("--ref", required=True)
    ap.add_argument("--sfx", required=True); ap.add_argument("--comp", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--caption-map"); ap.add_argument("--scale", default="1.3333333333333333"); ap.add_argument("--max-speed", type=float, default=1.15)
    ap.add_argument("--fps", type=int, default=30); ap.add_argument("--qa", action="store_true"); ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()
    work = os.path.splitext(a.out)[0] + "_work"; os.makedirs(work, exist_ok=True)
    take = a.take
    if take.startswith("http"):
        take = os.path.join(work, "take.mp3"); urllib.request.urlretrieve(a.take, take); log(f"downloaded take -> {take}")
    lines = [l.strip() for l in open(a.script, encoding="utf-8") if l.strip()]
    ref = json.load(open(a.ref, encoding="utf-8"))
    starts = [min(w["s"] for w in ref if w.get("line") == i) for i in range(len(lines))]
    sfx = dec(a.sfx, SR, 2)
    total = sfx.shape[1] / SR
    # ---- whisper once: find the lines ----
    from faster_whisper import WhisperModel
    try:
        m = WhisperModel("large-v3", device="cuda", compute_type="float16"); list(m.transcribe(np.zeros(16000, np.float32), language="tr")[0])
    except Exception:
        m = WhisperModel("large-v3", device="cpu", compute_type="int8")
    log("whisper loaded")
    x = dec(take, SR)
    heard = [w for s in m.transcribe(dec(take, 16000).astype(np.float32), language="tr", word_timestamps=True)[0] for w in s.words]
    sw = [(norm(w), i) for i, l in enumerate(lines) for w in l.split()]
    sm = difflib.SequenceMatcher(None, [s for s, _ in sw], [norm(w.word) for w in heard], autojunk=False)
    span = {}
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op in ("equal", "replace"):
            for k in range(min(i2 - i1, j2 - j1)):
                li, j = sw[i1 + k][1], j1 + k
                lo, hi = span.get(li, (j, j)); span[li] = (min(lo, j), max(hi, j))
    missing = [i + 1 for i in range(len(lines)) if i not in span]
    if missing:
        sys.exit(f"lines not found in the take: {missing} (the take must read the script as written)")
    log(f"aligned: word match {sm.ratio():.3f}, {len(lines)} lines")
    # ---- place each line on its reference slot ----
    voice = np.zeros(int(total * SR)); words = []; t_end = 0.0; segs_out = []
    for i, line in enumerate(lines):
        lo, hi = span[i]
        a0, b0 = max(0.0, heard[lo].start - 0.04), heard[hi].end + 0.12
        seg = x[int(a0 * SR):int(b0 * SR)].copy()
        f = min(int(0.006 * SR), len(seg) // 4); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        st = max(starts[i], t_end + 0.06)
        nxt = starts[i + 1] if i + 1 < len(lines) else total - 0.15
        k = min(a.max_speed, max(1.0, (len(seg) / SR) / max(nxt - st - 0.06, 0.3)))
        seg = atempo(seg, k)
        i0 = int(st * SR); voice[i0:i0 + len(seg)] += seg[: max(0, len(voice) - i0)]
        toks, hws = line.split(), heard[lo:hi + 1]
        if len(hws) == len(toks):
            words += [{"w": t, "s": round(st + (w.start - a0) / k, 3), "e": round(st + (w.end - a0) / k, 3), "line": i} for t, w in zip(toks, hws)]
        else:
            L, c, n = len(seg) / SR - 0.16, 0, sum(len(t) for t in toks)
            for t in toks:
                s0 = st + 0.04 + L * c / n; c += len(t); words.append({"w": t, "s": round(s0, 3), "e": round(st + 0.04 + L * c / n, 3), "line": i})
        t_end = st + len(seg) / SR
        segs_out.append((i + 1, st, k))
    sped = [f"{n}:x{k:.2f}" for n, _, k in segs_out if k > 1.005]
    log(f"placed {len(lines)} lines, sped up: {', '.join(sped) or 'none'}; ends {t_end:.2f} s of {total:.2f}")
    # captions: script spelling, spelled-out numbers merged back to digits
    if a.caption_map:
        for seq, rep in json.load(open(a.caption_map, encoding="utf-8")):
            out, i = [], 0
            while i < len(words):
                if [w["w"].strip(".,").lower() for w in words[i:i + len(seq)]] == seq:
                    out.append({**words[i], "w": rep, "e": words[i + len(seq) - 1]["e"]}); i += len(seq)
                else:
                    out.append(words[i]); i += 1
            words = out
    json.dump({"words": words}, open(os.path.join(work, "props.json"), "w", encoding="utf-8"), ensure_ascii=False)
    # ---- mix with the cached SFX stem ----
    v2 = np.stack([voice, voice])
    v2 *= 10 ** ((-15.0 - integrated(v2)) / 20)
    s2 = sfx * 10 ** ((momentary_max(v2) - momentary_max(sfx) - 6.0) / 20)
    mix = v2 + s2
    mix *= 10 ** ((-15.0 - integrated(mix)) / 20)
    mix = limiter(mix, -1.2)
    tp = true_peak(mix)
    if tp > -1.0:
        mix *= 10 ** ((-1.0 - tp) / 20)
    mix_path = os.path.join(work, "mix.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", mix_path],
                   input=mix.T.astype(np.float64).tobytes(), check=True)
    log(f"mix: {integrated(mix):.1f} LUFS, true peak {true_peak(mix):.2f} dBTP")
    if a.no_render:
        return
    # ---- render + mux ----
    env = dict(os.environ)
    tmp = os.environ.get("REMOTION_TMP")
    if tmp:
        env["TEMP"] = env["TMP"] = tmp
    vid = os.path.join(work, "video.mp4")
    npx = shutil.which("npx") or "npx"
    subprocess.run([npx, "remotion", "render", "src/index.ts", a.comp, vid, f"--props={os.path.join(work, 'props.json')}", "--muted", "--codec", "h264",
                    "--crf", "16", f"--scale={a.scale}", "--gl=angle", "--log=error"], check=True, env=env)
    log("rendered")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-i", mix_path, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
                    "-shortest", a.out], check=True)
    log(f"-> {a.out}")
    if a.qa and os.path.exists("scripts/short_qa.py"):
        subprocess.run([sys.executable, "scripts/short_qa.py", a.out, os.path.join(work, "qa")], check=False)
        log("qa done")


if __name__ == "__main__":
    main()
