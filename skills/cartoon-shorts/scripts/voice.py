# Narration -> voice.wav + words.json (with sentence indices) + a compact word/frame table to write the Spec from.
#   python voice.py edge <voice.txt> <out_dir> [--voice tr-TR-AhmetNeural] [--rate +10%]
#   python voice.py take <take.(mp3|wav)|url> <voice.txt> <out_dir> [--ref words.json]   (ElevenLabs / any TTS / a recording)
#   python voice.py table <words.json>                                                   (print the table again)
# take without --ref: the take is cut into sentences and joined with steady 0.28 s gaps (a new short);
# with --ref: every sentence is placed where the reference voice spoke it (re-voicing; see revoice.py for the full render).
# Spelled-out Turkish numbers are merged back to digits for the captions ("bin sekiz yüz doksan yedi" -> "1897",
# "bin dokuz yüz on üçte" -> "1913'te"), so Spec word references use the digits form: w("1897").
import argparse, glob, json, os, re, subprocess, sys, urllib.request
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.stdout.reconfigure(encoding="utf-8")
FPS, SR = 30, 48000

ONES = {"bir": 1, "iki": 2, "üç": 3, "dört": 4, "beş": 5, "altı": 6, "yedi": 7, "sekiz": 8, "dokuz": 9}
TENS = {"on": 10, "yirmi": 20, "otuz": 30, "kırk": 40, "elli": 50, "altmış": 60, "yetmiş": 70, "seksen": 80, "doksan": 90}
SUF = ["dan", "den", "tan", "ten", "da", "de", "ta", "te", "ın", "in", "un", "ün", "nın", "nin", "a", "e", "ı", "i", "u", "ü", "lık", "lik", "luk", "lük"]
low = lambda s: s.replace("I", "ı").replace("İ", "i").lower()


def num_word(w):
    """value of one number word, plus a case suffix if it has one ("üçte" -> (3, 'te'))"""
    s = re.sub(r"[^a-zçğıöşü]", "", low(w))
    for base in sorted([*ONES, *TENS, "yüz", "bin", "milyon"], key=len, reverse=True):
        if s.startswith(base):
            rest = s[len(base):]
            if rest == "" or rest in SUF or (rest[:1] in "y" and rest[1:] in SUF):
                return base, rest
    return None, None


def merge_numbers(words):
    out, i = [], 0
    while i < len(words):
        j, total, cur, suffix = i, 0, 0, ""
        while j < len(words):
            base, rest = num_word(words[j]["w"])
            if base is None or base == "bir" and (j + 1 >= len(words) or num_word(words[j + 1]["w"])[0] not in ("yüz", "bin", "milyon")):
                break
            if base in ONES: cur += ONES[base]
            elif base in TENS: cur += TENS[base]
            elif base == "yüz": cur = (cur or 1) * 100
            elif base == "bin": total += (cur or 1) * 1000; cur = 0
            else: total += (cur or 1) * 1_000_000; cur = 0
            j += 1
            if rest: suffix = rest; break
        if j - i >= 2:  # single words ("yüzden", "onu") stay words
            val = total + cur
            out.append({**words[i], "w": f"{val}'{suffix}" if suffix else str(val), "e": words[j - 1]["e"]}); i = j
        else:
            out.append(words[i]); i += 1
    return out


def table(words):
    line, rows = -1, []
    for w in words:
        if w.get("line", 0) != line:
            line = w.get("line", 0); rows.append(f"L{line + 1:02d}")
        rows[-1] += f" {w['w']}@{round(w['s'] * FPS)}"
    rows.append(f"end {round(max(w['e'] for w in words) * FPS)}")
    return "\n".join(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["edge", "take", "table"]); ap.add_argument("a"); ap.add_argument("b", nargs="?"); ap.add_argument("c", nargs="?")
    ap.add_argument("--voice", default="tr-TR-AhmetNeural"); ap.add_argument("--rate", default="+10%"); ap.add_argument("--ref")
    a = ap.parse_args()
    if a.mode == "table":
        print(table(json.load(open(a.a, encoding="utf-8")))); return
    if a.mode == "edge":
        script, out = a.a, a.b
        subprocess.run([sys.executable, os.path.join(HERE, "tts_edge.py"), script, out, "--voice", a.voice, "--rate", a.rate], check=True)
    else:
        take, script, out = a.a, a.b, a.c
        os.makedirs(out, exist_ok=True)
        if take.startswith("http"):
            p = os.path.join(out, "take.mp3"); urllib.request.urlretrieve(take, p); take = p
        args = [sys.executable, os.path.join(HERE, "revoice.py"), "--take", take, "--script", script, "--fit-only", out]
        if a.ref: args += ["--ref", a.ref]
        subprocess.run(args, check=True)
    wp = os.path.join(out, "words.json")
    words = merge_numbers(json.load(open(wp, encoding="utf-8")))
    json.dump(words, open(wp, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(table(words))


if __name__ == "__main__":
    main()
