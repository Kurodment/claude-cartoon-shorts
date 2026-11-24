# One-time setup and new-short scaffolding, from the Remotion project root (npx create-video@latest first).
#   python setup.py install            copy the engine + Kenney assets in, install the pinned npm and Python packages
#   python setup.py new <name> <Id>    src/shorts/<name>/spec.ts skeleton + register composition <Id> in src/Root.tsx
import os, re, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)
sys.stdout.reconfigure(encoding="utf-8")

NPM = ["three@0.187.0", "@react-three/fiber@9.8.2", "@react-three/postprocessing@3.0.4",  # 3.1+ renders blank frames in Remotion
       "postprocessing@6.39.6", "@types/three"]
PIP = ["numpy", "scipy", "pillow", "edge-tts", "faster-whisper"]


def install():
    shutil.copytree(os.path.join(SKILL, "engine"), "src/shorts/engine", dirs_exist_ok=True)
    shutil.copytree(os.path.join(SKILL, "assets", "kenney"), "public/bridge/kenney", dirs_exist_ok=True)
    ver = re.search(r'"remotion":\s*"\^?([\d.]+)"', open("package.json", encoding="utf-8").read()).group(1)
    npm = shutil.which("npm") or "npm"
    subprocess.run([npm, "install", "--save-exact", *NPM, f"@remotion/three@{ver}", f"@remotion/google-fonts@{ver}"], check=True)
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", *PIP], check=True)
    print("engine -> src/shorts/engine, assets -> public/bridge/kenney, packages installed.\n"
          "GPU whisper (optional, NVIDIA): pip install nvidia-cublas-cu12 \"nvidia-cudnn-cu12>=9,<10\"")


SKELETON = '''// {name}: a Spec (see engine/spec.ts for every field, example/eroin/spec.ts in the skill for a full short)
import {{ Spec, wordsAt, Word }} from "../engine/spec";
import words from "./words.json";

const W = words as Word[];
const w = wordsAt(W);

export const {var}: Spec = {{
  id: "{id}", total: {total}, words: W,
  sets: {{ lab: "lab" }},
  dof: [[0, 8]],
  shots: [
    {{ a: 0, set: "lab", sun: [150, 42], cam: [{{ f: 0, pos: [0.4, 2.1, 8.4], look: [0, 1.45, -1.6], fov: 42 }}] }},
  ],
}};
void w;
'''


def new(name, comp):
    d = f"src/shorts/{name}"
    os.makedirs(d, exist_ok=True)
    var = re.sub(r"\W", "", name) + "Spec"
    wp = os.path.join(d, "words.json")
    total = 900
    if os.path.exists(wp):
        import json
        total = round(max(w["e"] for w in json.load(open(wp, encoding="utf-8"))) * 30) + 12
    else:
        open(wp, "w").write("[]")
    sp = os.path.join(d, "spec.ts")
    if not os.path.exists(sp):
        open(sp, "w", encoding="utf-8").write(SKELETON.format(name=name, var=var, id=comp, total=total))
    root = open("src/Root.tsx", encoding="utf-8").read()
    if comp not in root:
        imp = f'import {{ makeShort }} from "./shorts/engine/Short";\n' if "makeShort" not in root else ""
        imp += f'import {{ {var} }} from "./shorts/{name}/spec";\n'
        last = max(m.end() for m in re.finditer(r"^import .*?;\s*$", root, re.M | re.S))
        root = root[:last] + "\n" + imp + f"const {comp}C = makeShort({var});\n" + root[last:]
        comp_tag = f'      <Composition id="{comp}" component={{{comp}C}} durationInFrames={{{var}.total}} fps={{30}} width={{1080}} height={{1920}} />\n'
        i = root.rfind("</>")
        root = root[:i] + comp_tag + "    " + root[i:]
        open("src/Root.tsx", "w", encoding="utf-8").write(root)
    print(f"{sp} (total {total} frames), composition {comp} registered in src/Root.tsx")


if __name__ == "__main__":
    if sys.argv[1] == "install":
        install()
    elif sys.argv[1] == "new":
        new(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__ or "usage: setup.py install | new <name> <CompositionId>")
