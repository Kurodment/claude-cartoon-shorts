# Sound for a short from sound.json: room tones per stretch of the film + synthesized SFX cues locked to words, an optional
# lo-fi bed always on ("music": "chill" default, 13 dB under the voice; "none" to drop it), voice unchanged, SFX peaks
# 6 dB under the voice's loudest moment, master -14.5 LUFS, look-ahead limiter, true peak <= -2 dBTP. Writes mix.wav, stem_voice.wav, stem_sfx.wav (+ stem_music.wav) next to --out.
#   python sound.py <sound.json> <words.json> <voice.wav> <out_dir> --total <frames>
# sound.json: {"ambience": [[at, kind], ...], "cues": [[at, kind, db, pan, {params}], ...], "music": null | "chill"}
#   at = frame number or word reference "word", "word#2" (2nd occurrence), "word+4" / "word#2-6" (frame offset)
#   ambience kinds: shop lab room street outdoor harbor crowd none     cue kinds: see CUES below
import json, os, re, sys
import numpy as np
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "audio"))
sys.stdout.reconfigure(encoding="utf-8")
from dsp import SR, ns, tt, rng, dbg, lp, hp, bp, colored, fades, pan, st, place, integrated, momentary_max, true_peak, read_wav, write_wav, phase, modal
import sfx_gen as G
import instruments as I

FPS = 30
norm = lambda s: re.sub(r"[^a-zçğıöşüâîû0-9']", "", s.replace("I", "ı").replace("İ", "i").lower())


def resolver(words):
    def at(x):
        if isinstance(x, (int, float)):
            return x / FPS
        m = re.fullmatch(r"(.+?)(?:#(\d+))?([+-]\d+)?", x)
        w, k, off = m.group(1), int(m.group(2) or 1), int(m.group(3) or 0)
        c = 0
        for e in words:
            if norm(e["w"]) == norm(w):
                c += 1
                if c == k:
                    return round(e["s"] * FPS + off) / FPS
        raise SystemExit(f'sound.json: word "{w}" #{k} not in words.json')
    return at


# ---------------- generators ----------------
def cough(r, scale=1.0):
    out = np.zeros(ns(0.7))
    for k, (t0, d, a) in enumerate([(0.0, 0.16, 1.0), (0.24, 0.12, 0.6)]):
        t = tt(d)
        env = (1 - np.exp(-t / 0.006)) * np.exp(-t / (d * 0.35))
        y = bp(r.standard_normal(len(t)), 350 * scale, 2600 * scale, 1) * env * a
        if k == 0:
            y += lp(np.sign(np.sin(phase(np.full(len(t), r.uniform(110, 160) * scale)))) * 0.25, 900) * env
        i0 = ns(t0); out[i0:i0 + len(y)] += y[: len(out) - i0]
    return fades(out, 0.002, 0.05)


def bell(r, f=880.0, d=2.0):
    return fades(modal(d, [(f * k, a, tau) for k, a, tau in [(1.0, 1.0, 1.2), (2.0, 0.45, 0.7), (2.76, 0.3, 0.45), (5.4, 0.15, 0.2)]], r), 0.0, 0.2)


def shimmer(r, dur=1.2, f0=1400, n=14):
    y = np.zeros(ns(dur))
    for i in range(n):
        x = bell(r, f0 * 2 ** (r.integers(0, 12) / 12), 0.6) * 0.35; i0 = ns(i / n * dur * 0.85)
        y[i0:i0 + len(x)] += x[: len(y) - i0]
    return y


def angel(r, dur=1.6):
    t = tt(dur)
    env = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - dur * 0.5) / 0.4)
    return sum(np.sin(phase(np.full(len(t), f))) * a for f, a in [(523.3, 0.5), (659.3, 0.4), (784, 0.35), (1046.5, 0.25)]) * env * 0.5


def pop(r):
    t = tt(0.18)
    return fades(np.sin(phase(700 * np.exp(-t / 0.03) + 180)) * np.exp(-t / 0.035), 0.0, 0.02)


def thump(r, f0=70, big=1.0):
    t = tt(0.9)
    body = np.exp(-t / 0.16) * np.sin(phase(f0 * (1 + 0.7 * np.exp(-t / 0.02))))
    return fades((body * 1.3 + bp(r.standard_normal(len(t)), 400, 3000, 1) * np.exp(-t / 0.012) * 0.8) * big, 0.0, 0.1)


def steps(r, n=6, rate=3.2, hard=0.5, run=False):
    y = np.zeros(ns(n / rate + 0.5))
    for k in range(n):
        x = G.boot(r, hard) if run else G.stroll_step(r, hard); i0 = ns(k / rate)
        y[i0:i0 + len(x)] += x[: len(y) - i0]
    return y


CUES = {
    "cough": lambda r, p: cough(r, p.get("scale", 1.0)),
    "clink": lambda r, p: G.clink(r, p.get("f0", 2400), p.get("dur", 0.25), p.get("bright", 1.0)),
    "bell": lambda r, p: bell(r, p.get("f", 1318.5), p.get("dur", 2.0)),          # ding on a reveal
    "shimmer": lambda r, p: shimmer(r, p.get("dur", 1.2), p.get("f0", 1400)),    # sparkle
    "angel": lambda r, p: angel(r, p.get("dur", 1.6)),                           # halo / holy chord
    "whoosh": lambda r, p: G.whoosh(p.get("dur", 0.5), r, p.get("peak", 0.3), p.get("lo", 350), p.get("hi", 2200)),
    "rattle": lambda r, p: G.rattle(p.get("dur", 0.8), r, p.get("density", 30), heavy=p.get("heavy", False)),  # chains, trembling
    "chainWhip": lambda r, p: G.chain_whip(r),
    "thump": lambda r, p: thump(r, p.get("f0", 70), p.get("big", 1.0)),          # stamp, impact, gate
    "pop": lambda r, p: pop(r),
    "hurrah": lambda r, p: G.hurrah(r, p.get("base", 140), p.get("scale", 1.0)),
    "oof": lambda r, p: G.oof(r, p.get("kind", "oof"), p.get("base", 120), 1.0),
    "whoa": lambda r, p: G.whoa(r, p.get("base", 130)),
    "steps": lambda r, p: steps(r, p.get("n", 6), p.get("rate", 3.2), p.get("hard", 0.5)),
    "run": lambda r, p: steps(r, p.get("n", 12), p.get("rate", 6.4), p.get("hard", 0.5), True),
    "creak": lambda r, p: G.creak(p.get("dur", 1.0), r),
    "flutter": lambda r, p: G.flag_flutter(p.get("dur", 1.6), r),
    "applause": lambda r, p: G.applause(p.get("dur", 2.5), r, p.get("people", 24)),
    "splash": lambda r, p: G.splash_big(r),
    "tick": lambda r, p: steps_tick(r, p.get("n", 8)),                          # clock ticking
    "coins": lambda r, p: coins(r, p.get("n", 9)),
    "whistle": lambda r, p: whistle(r, p.get("dur", 0.45), p.get("f", 2900)),   # foreman / referee whistle
    "ratchet": lambda r, p: ratchet(r, p.get("n", 6)),                          # jackscrew / wrench turning
    "rain": lambda r, p: rain(r, p.get("dur", 3.0)),                            # a shower (cloud fx)
}


def whistle(r, dur, f):
    t = tt(dur)
    fr = f * (1 + 0.035 * np.sign(np.sin(2 * np.pi * 28 * t)))  # pea-whistle trill
    y = np.sin(phase(fr)) * 0.8 + bp(r.standard_normal(len(t)), f * 0.8, f * 1.3, 1) * 0.25
    return fades(y * (1 - np.exp(-t / 0.01)), 0.005, 0.06)


def ratchet(r, n):
    y = np.zeros(ns(n * 0.07 + 0.2))
    for k in range(n):
        x = G.clink(r, r.uniform(1500, 1900), 0.05, 0.5); i0 = ns(k * 0.07); y[i0:i0 + len(x)] += x[: len(y) - i0]
    return y


def rain(r, dur):
    y = bp(r.standard_normal(ns(dur)), 900, 7000, 1) * 0.35
    for _ in range(int(dur * 40)):
        x = G.clink(r, r.uniform(2500, 6000), 0.02, 0.2); i0 = r.integers(0, len(y) - len(x)); y[i0:i0 + len(x)] += x * r.uniform(0.2, 0.6)
    return fades(y, 0.3, 0.6)


def steps_tick(r, n):
    y = np.zeros(ns(n * 0.5 + 0.2))
    for k in range(n):
        x = G.clink(r, 3400 if k % 2 else 2900, 0.06, 0.3); i0 = ns(k * 0.5); y[i0:i0 + len(x)] += x[: len(y) - i0]
    return y


def coins(r, n):
    y = np.zeros(ns(0.12 * n + 0.4))
    for k in range(n):
        x = G.clink(r, r.uniform(3000, 5200), 0.3, 1.2); i0 = ns(k * 0.08 + r.uniform(0, 0.04)); y[i0:i0 + len(x)] += x[: len(y) - i0] * r.uniform(0.5, 1)
    return y


def ambience(r, kind, d):
    room = lambda lo, hi, lv: st(bp(colored(ns(d), r, 1.0), lo, hi, 1) * 0.08 * lv)
    parts = []
    if kind in ("shop", "lab", "room"):
        parts.append((room(90, 700, 0.8), -26, 0))
    if kind == "shop":
        parts.append((G.babble(d, r, 160, 1.05, 4.0, 0.5, fmax=3200), -33, -0.3))
    if kind == "lab":
        parts.append((G.bubbles(d, r, 6.0), -31, 0.25))
    if kind in ("street", "outdoor"):
        parts.append((G.breeze(d, r, 0.7), -31, 0))
    if kind == "outdoor":
        parts.append((G.bird_chirps(d, r, 0.35), -30, 0))
    if kind == "harbor":
        parts += [(G.water_bed(d, r, 0.6, 0.5), -28, 0), (G.breeze(d, r, 0.6), -32, 0), (G.bird_chirps(d, r, 0.25), -32, 0.4)]
    if kind == "crowd":
        parts += [(room(90, 700, 0.8), -26, 0), (G.babble(d, r, 150, 1.05, 4.2, 0.7, fmax=3400), -30, -0.3), (G.babble(d, r, 230, 1.15, 4.6, 0.6, fmax=3600), -32, 0.3)]
    if kind == "street":
        parts.append((lp(colored(ns(d), r, 1.0), 140) * 0.3, -24, 0))
    return parts


def chill(dur):
    r = rng(2026); n = ns(dur); buf = np.zeros((2, n)); beat = 60 / 78; bar = 4 * beat; m2f = I.m2f
    prog = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
    for b in range(int(dur / bar) + 1):
        t0, ch = b * bar, prog[b % 4]
        place(buf, I.pad([m2f(m) for m in ch], bar, 0.22, r, att=0.8, rel=1.2), t0, 1.0)
        place(buf, pan(I.pluck(m2f(ch[0] - 12), 0.5, r, 1.6, 0.25), 0.0), t0, 0.9)
        for k, (bt, idx) in enumerate([(0.0, 3), (1.5, 1), (2.5, 2), (3.0, 0)]):
            if (b + k) % 5 != 4:
                place(buf, pan(I.vibes(m2f(ch[idx] + 12), 0.22, r, 1.6), 0.35 * (-1) ** k), t0 + bt * beat, 0.8)
    buf = np.stack([lp(c, 4200) for c in buf]); a, z = ns(2.0), ns(3.0)
    buf[:, :a] *= np.linspace(0, 1, a) ** 2; buf[:, -z:] *= np.linspace(1, 0, z) ** 1.5
    return buf


def limiter(x, ceil_db=-1.2, look=0.005, rel=0.08):
    need = np.minimum(1.0, dbg(ceil_db) / np.maximum(np.abs(st(x)).max(axis=0), 1e-9))
    B = 48; nb = int(np.ceil(len(need) / B))
    blk = ndimage.minimum_filter1d(np.pad(need, (0, nb * B - len(need)), constant_values=1).reshape(nb, B).min(1), size=2 * int(look * 1000) + 1, mode="nearest")
    k = np.exp(-1.0 / (rel * 1000)); sm = np.empty_like(blk); cur = 1.0
    for i, g in enumerate(blk):
        cur = g if g < cur else g + (cur - g) * k; sm[i] = cur
    return x * np.minimum(np.repeat(sm, B)[: len(need)], need)


def main():
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("sound"); ap.add_argument("words"); ap.add_argument("voice"); ap.add_argument("out"); ap.add_argument("--total", type=int, required=True)
    a = ap.parse_args()
    S = json.load(open(a.sound, encoding="utf-8")); at = resolver(json.load(open(a.words, encoding="utf-8")))
    dur = a.total / FPS; N = ns(dur); r = rng(1897)
    sfx = np.zeros((2, N))
    amb = sorted([(at(x), k) for x, k in S.get("ambience", [])])
    for i, (t0, k) in enumerate(amb):
        t1 = amb[i + 1][0] if i + 1 < len(amb) else dur
        for x, db, p in ambience(r, k, t1 - t0 + 0.3):
            place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t0, dbg(db))
    for c in S.get("cues", []):
        t0, kind = at(c[0]), c[1]
        db, p, prm = (c[2] if len(c) > 2 else -14), (c[3] if len(c) > 3 else 0.0), (c[4] if len(c) > 4 else {})
        if kind not in CUES:
            raise SystemExit(f"unknown cue kind {kind}; known: {', '.join(CUES)}")
        x = CUES[kind](r, prm)
        place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t0, dbg(db))
    v, sr = read_wav(a.voice); assert sr == SR, sr
    voice = np.zeros((2, N)); vv = st(v)[:, :N]; voice[:, : vv.shape[1]] = vv
    sfx *= dbg(momentary_max(voice) - momentary_max(sfx) - 6.0)
    music = np.zeros((2, N))
    # the bed NEVER stops (0 % silence): chill music by default, 10-15 dB under the voice ("musicDb", default 13);
    # "music": "none" only when the user asks for no music
    if S.get("music", "chill") == "chill":
        music = chill(dur)[:, :N]; music *= dbg(integrated(voice) - float(S.get("musicDb", 13.0)) - integrated(music))
    mix = voice + sfx + music
    g = dbg(-14.5 - integrated(mix));  # YouTube: -14..-15 LUFS, true peak <= -2 dBTP mix, voice, sfx, music = mix * g, voice * g, sfx * g, music * g
    out = limiter(mix, ceil_db=-2.4); tp = true_peak(out)
    if tp > -2.0:
        out *= dbg(-2.0 - tp)
    os.makedirs(a.out, exist_ok=True)
    for name, x in [("mix.wav", out), ("stem_voice.wav", voice), ("stem_sfx.wav", sfx)] + ([("stem_music.wav", music)] if S.get("music", "chill") == "chill" else []):
        write_wav(os.path.join(a.out, name), x)
    print(f"mix {integrated(out):.1f} LUFS, true peak {true_peak(out):.2f} dBTP, {N / SR:.2f} s | sfx {integrated(sfx):.1f} LUFS -> {a.out}")


if __name__ == "__main__":
    main()
