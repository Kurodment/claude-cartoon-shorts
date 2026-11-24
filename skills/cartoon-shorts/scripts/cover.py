# Vertical cover (1080x1920 PNG) for a short, from the Remotion project root:
#   python cover.py <CompId> <frame> <name> "LINE 1|LINE 2|LINE 3" [--hl 1,2]
# grabs a caption-free frame of <CompId> -> public/covers/<name>.jpg, then renders the Cover composition (title in the
# top 45 %, white with a thick ink outline, --hl lines in yellow) -> out/<name>/kapak.png. Registers Cover on first use.
# Keep lines short (<= 13 characters each, 2-3 lines): a phone shows the cover at thumbnail size.
import argparse, json, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.stdout.reconfigure(encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("comp"); ap.add_argument("frame", type=int); ap.add_argument("name"); ap.add_argument("lines"); ap.add_argument("--hl", default="1")
    a = ap.parse_args()
    root = open("src/Root.tsx", encoding="utf-8").read()
    if 'id="Cover"' not in root:  # register the cover composition once
        root = root.replace('import { Composition', 'import { Cover } from "./shorts/engine/Cover";\nimport { Composition', 1)
        i = root.rfind("</>")
        root = root[:i] + '      <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ image: "covers/x.jpg", lines: ["Başlık"], hl: [0] }} />\n    ' + root[i:]
        open("src/Root.tsx", "w", encoding="utf-8").write(root)
    env = dict(os.environ)
    if env.get("REMOTION_TMP"):
        env["TEMP"] = env["TMP"] = env["REMOTION_TMP"]
    os.makedirs("public/covers", exist_ok=True); os.makedirs(f"out/{a.name}", exist_ok=True); os.makedirs("scripts", exist_ok=True)
    shutil.copy(os.path.join(HERE, "stills.mjs"), "scripts/shorts-stills.mjs")
    subprocess.run(["node", "scripts/shorts-stills.mjs", f"public/covers/{a.name}_", str(a.frame), "1"], check=True, env={**env, "COMP": a.comp, "PROPS": '{"noCaptions":true}'})
    os.replace(f"public/covers/{a.name}_{a.frame}.jpg", f"public/covers/{a.name}.jpg")
    props = f"out/{a.name}/cover.json"
    json.dump({"image": f"covers/{a.name}.jpg", "lines": a.lines.split("|"), "hl": [int(x) for x in a.hl.split(",") if x]}, open(props, "w", encoding="utf-8"), ensure_ascii=False)
    npx = shutil.which("npx") or "npx"
    subprocess.run([npx, "remotion", "still", "src/index.ts", "Cover", f"out/{a.name}/kapak.png", f"--props={props}", "--log=error"], check=True, env=env)
    print(f"-> out/{a.name}/kapak.png")


if __name__ == "__main__":
    main()
