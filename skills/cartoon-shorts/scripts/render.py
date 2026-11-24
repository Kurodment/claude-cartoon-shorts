# Look checks and the final render, from the Remotion project root.
#   python render.py sheet <CompId> <total_frames> [--frames 30,280,...] [--n 15] [--out out/<name>/sheet]
#       stills at half size (one per shot or --n evenly spaced) -> ONE contact sheet image <out>.jpg to review,
#       plus a framing report: every actor whose side or head leaves the frame at those frames
#   python render.py final <CompId> <mix.wav> <out.mp4> [--props props.json] [--scale 1.3333333333333333] [--qa]
#       2K vertical render (1080x1920 x 4/3 = 1440x2560), mux with the mix, optional frame/loudness QA
# REMOTION_TMP (a big drive) is used for Remotion's bundle copies of public/.
import argparse, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.stdout.reconfigure(encoding="utf-8")


def env():
    e = dict(os.environ)
    if e.get("REMOTION_TMP"):
        os.makedirs(e["REMOTION_TMP"], exist_ok=True); e["TEMP"] = e["TMP"] = e["REMOTION_TMP"]
    return e


def sheet(a):
    frames = [int(x) for x in a.frames.split(",")] if a.frames else [round((i + 0.5) * a.total / a.n) for i in range(a.n)]
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


def final(a):
    work = os.path.splitext(a.out)[0] + "_video.mp4"
    npx = shutil.which("npx") or "npx"
    cmd = [npx, "remotion", "render", "src/index.ts", a.comp, work, "--muted", "--codec", "h264", "--crf", "16", f"--scale={a.scale}", "--gl=angle", "--log=error"]
    if a.props:
        cmd.append(f"--props={a.props}")
    subprocess.run(cmd, check=True, env=env())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", work, "-i", a.mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", a.out], check=True)
    os.remove(work)
    print(f"-> {a.out}")
    if a.qa:
        subprocess.run([sys.executable, os.path.join(HERE, "qa.py"), a.out, os.path.splitext(a.out)[0] + "_qa"], check=False)


def main():
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest="cmd", required=True)
    s = sp.add_parser("sheet"); s.add_argument("comp"); s.add_argument("total", type=int); s.add_argument("--frames"); s.add_argument("--n", type=int, default=15); s.add_argument("--out", default="out/sheet")
    f = sp.add_parser("final"); f.add_argument("comp"); f.add_argument("mix"); f.add_argument("out"); f.add_argument("--props"); f.add_argument("--scale", default="1.3333333333333333"); f.add_argument("--qa", action="store_true")
    a = ap.parse_args()
    sheet(a) if a.cmd == "sheet" else final(a)


if __name__ == "__main__":
    main()
