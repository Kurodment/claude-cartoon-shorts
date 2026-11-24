# Look checks and the final render, from the Remotion project root.
#   python render.py sheet <CompId> <total_frames> [--frames 30,280,...] [--n 15] [--out out/<name>/sheet]
#       stills at half size (one per shot or --n evenly spaced) -> ONE contact sheet image <out>.jpg to review,
#       plus a framing report: every actor whose side or head leaves the frame at those frames
#   python render.py check src/shorts/<name>/spec.ts   (every 2nd frame, no pixels, ~5 s: CUT / OVERLAP / HIDDEN / INSIDE / CARD)
#   python render.py sheet <CompId> <total> --spec src/shorts/<name>/spec.ts   (auto frames: each shot's middle + every issue)
#   python render.py preview <CompId> <mix.wav> out/<name>/preview.mp4 [--spec spec.ts]
#       fast 540x960 render + full-video review sheets (every 0.5 s, 40 frames per sheet) to watch the WHOLE video
#   python render.py final <CompId> <mix.wav> <out.mp4> --spec src/shorts/<name>/spec.ts [--waive "reason"] [--qa]
#       hard gates first (CUT OVERLAP INSIDE CAMIN CAMFACE CAPT JITTER must be 0, or --waive with the reason the user
#       accepted), then the 2K vertical render (1440x2560), mux, QA; the previous file is archived as _vN and
#       <out>.json records the engine version, date, gates and waiver
# REMOTION_TMP (a big drive) is used for Remotion's bundle copies of public/.
import argparse, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.stdout.reconfigure(encoding="utf-8")


def env():
    e = dict(os.environ)
    if e.get("REMOTION_TMP"):
        os.makedirs(e["REMOTION_TMP"], exist_ok=True); e["TEMP"] = e["TMP"] = e["REMOTION_TMP"]
    return e


def run_check(spec):
    """geometry check of every 2nd frame (no pixels): returns (report lines, shot starts, issue frames)"""
    import re
    shutil.copy(os.path.join(HERE, "check.ts"), "scripts/shorts-check.ts")
    npx = shutil.which("npx") or "npx"
    r = subprocess.run([npx, "-y", "tsx", "scripts/shorts-check.ts", spec], capture_output=True, text=True, encoding="utf-8", errors="replace")
    out = [l for l in r.stdout.splitlines() if l.strip()]
    if r.returncode: print(r.stdout[-2000:], r.stderr[-2000:]); sys.exit(r.returncode)
    shots = [int(x) for x in next((l for l in out if l.startswith("shots: ")), "shots: 0").split()[1].split(",")]
    issues = sorted({int(m.group(1)) for l in out for m in [re.search(r" f(\d+)-\d+ ", l)] if m})
    return [l for l in out if not l.startswith("shots: ")], shots, issues


def check(a):
    os.makedirs("scripts", exist_ok=True)
    print("\n".join(run_check(a.spec)[0]))


def sheet(a):
    frames = [int(x) for x in a.frames.split(",")] if a.frames else [round((i + 0.5) * a.total / a.n) for i in range(a.n)]
    if a.spec:  # auto frames: the middle of every shot + the first frame of every reported issue
        os.makedirs("scripts", exist_ok=True)
        rep, shots, issues = run_check(a.spec); print("\n".join(rep))
        if not a.frames:
            ends = shots[1:] + [a.total]
            frames = sorted(set([(s0 + s1) // 2 for s0, s1 in zip(shots, ends)] + issues))
    os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
    e = env(); e["COMP"] = a.comp
    # node resolves packages from the script's folder: run a copy inside the project
    os.makedirs("scripts", exist_ok=True); shutil.copy(os.path.join(HERE, "stills.mjs"), "scripts/shorts-stills.mjs")
    r = subprocess.run(["node", "scripts/shorts-stills.mjs", a.out + "_", ",".join(map(str, frames)), "0.5"], env=e, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        print(r.stdout[-3000:], r.stderr[-3000:]); sys.exit(r.returncode)
    cut = sorted({l.split("[frame] ", 1)[1].split(" (")[0] for l in r.stdout.splitlines() if "[frame]" in l})
    print("framing: OK, no actor cut at a frame edge" if not cut else "framing: CUT ACTORS (move them toward the look line or pull the camera back):\n  " + "\n  ".join(cut))
    from PIL import Image
    cols = 5 if len(frames) > 8 else 4
    rows = (len(frames) + cols - 1) // cols
    W, H = 240, 427
    S = Image.new("RGB", (cols * W, rows * H))
    for i, f in enumerate(frames):
        S.paste(Image.open(f"{a.out}_{f}.jpg").resize((W, H)), ((i % cols) * W, (i // cols) * H))
    S.save(a.out + ".jpg", quality=80)
    for f in frames:
        os.remove(f"{a.out}_{f}.jpg")
    print(f"sheet: {a.out}.jpg  frames {frames}")


def archive(out):
    """never overwrite a finished version: the existing file moves to <name>_v1.mp4, _v2 ... (one click back)"""
    if not os.path.exists(out):
        return
    base, ext = os.path.splitext(out)
    n = 1
    while os.path.exists(f"{base}_v{n}{ext}"):
        n += 1
    os.replace(out, f"{base}_v{n}{ext}")
    for side in ("_qa.txt", "_qa.jpg", ".json"):
        if os.path.exists(base + side):
            os.replace(base + side, f"{base}_v{n}{side}")
    print(f"archived previous version -> {base}_v{n}{ext}")


HARD = ("CUT", "OVERLAP", "INSIDE", "CAMIN", "CAMFACE", "CAPT", "JITTER")


def engine_version():
    import re
    for p in ("src/shorts/engine/version.ts", os.path.join(HERE, "..", "engine", "version.ts")):
        if os.path.exists(p):
            m = re.search(r'"([\d.]+)"', open(p, encoding="utf-8").read())
            if m:
                return m.group(1)
    return "unknown"


def gates(spec, waive):
    os.makedirs("scripts", exist_ok=True)
    rep, _, _ = run_check(spec)
    hard = [l for l in rep if l.strip().startswith("shot ") and l.split("  ", 2)[-1].split()[0] in HARD]
    print("\n".join(rep))
    if hard and not waive:
        print(f"GATES FAILED: {len(hard)} hard issue(s). Fix the Spec, or re-run with --waive \"<reason the user accepted>\".")
        sys.exit(2)
    return rep, hard


def review_sheets(video, base, every=0.5, per=40):
    """contact sheets of the WHOLE video: one thumbnail every `every` s, `per` per sheet (8 x 5), time stamped"""
    for old in [f for f in os.listdir(os.path.dirname(base) or ".") if os.path.basename(f).startswith(os.path.basename(base) + "_review")]:
        os.remove(os.path.join(os.path.dirname(base) or ".", old))
    # thumbnails left-to-right, top-to-bottom; sheet k, cell i = time (k * per + i) * every seconds
    vf = f"fps={1 / every},scale=135:240,tile=8x{per // 8}:padding=2:color=white"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", vf, "-q:v", "4", f"{base}_review_%02d.jpg"], check=True)
    out = sorted(f for f in os.listdir(os.path.dirname(base) or ".") if os.path.basename(f).startswith(os.path.basename(base) + "_review"))
    print("review sheets (look at EVERY one before calling it done): " + ", ".join(os.path.join(os.path.dirname(base), o) for o in out))


def preview(a):
    if a.spec:
        gates(a.spec, waive="preview")
    work = os.path.splitext(a.out)[0] + "_video.mp4"
    npx = shutil.which("npx") or "npx"
    subprocess.run([npx, "remotion", "render", "src/index.ts", a.comp, work, "--muted", "--codec", "h264", "--crf", "26", "--scale=0.5", "--gl=angle", "--log=error"], check=True, env=env())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", work, "-i", a.mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", a.out], check=True)
    os.remove(work)
    print(f"-> {a.out} (540x960 preview)")
    review_sheets(a.out, os.path.splitext(a.out)[0])


def final(a):
    rep, hard = gates(a.spec, a.waive) if a.spec else ([], [])
    if not a.spec:
        print("WARNING: no --spec given, the hard gates were not run")
    archive(a.out)
    work = os.path.splitext(a.out)[0] + "_video.mp4"
    npx = shutil.which("npx") or "npx"
    cmd = [npx, "remotion", "render", "src/index.ts", a.comp, work, "--muted", "--codec", "h264", "--crf", "16", f"--scale={a.scale}", "--gl=angle", "--log=error"]
    if a.props:
        cmd.append(f"--props={a.props}")
    subprocess.run(cmd, check=True, env=env())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", work, "-i", a.mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", a.out], check=True)
    os.remove(work)
    print(f"-> {a.out}")
    import json, datetime
    json.dump({"comp": a.comp, "engine": engine_version(), "date": datetime.datetime.now().isoformat(timespec="seconds"),
               "spec": a.spec, "gates": "pass" if not hard else f"{len(hard)} waived", "waive": a.waive, "hard": hard,
               "camera": next((l for l in rep if l.startswith("camera:")), None)},
              open(os.path.splitext(a.out)[0] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"engine {engine_version()} stamped -> {os.path.splitext(a.out)[0]}.json")
    if a.qa:
        subprocess.run([sys.executable, os.path.join(HERE, "qa.py"), a.out, os.path.splitext(a.out)[0] + "_qa"], check=False)


def main():
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest="cmd", required=True)
    s = sp.add_parser("sheet"); s.add_argument("comp"); s.add_argument("total", type=int); s.add_argument("--frames"); s.add_argument("--n", type=int, default=15); s.add_argument("--out", default="out/sheet"); s.add_argument("--spec")
    c = sp.add_parser("check"); c.add_argument("spec")
    f = sp.add_parser("final"); f.add_argument("comp"); f.add_argument("mix"); f.add_argument("out"); f.add_argument("--props"); f.add_argument("--scale", default="1.3333333333333333"); f.add_argument("--qa", action="store_true")
    f.add_argument("--spec"); f.add_argument("--waive")
    v = sp.add_parser("preview"); v.add_argument("comp"); v.add_argument("mix"); v.add_argument("out"); v.add_argument("--spec")
    a = ap.parse_args()
    {"sheet": sheet, "final": final, "check": check, "preview": preview}[a.cmd](a)


if __name__ == "__main__":
    main()
