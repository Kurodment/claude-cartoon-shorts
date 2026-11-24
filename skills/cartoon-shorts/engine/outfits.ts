// Outfit library (flat cartoon characters, toon.ts). Spec actors name one of these or pass their own Outfit.
import { Outfit, SKINS } from "./toon";

const S = SKINS;
export const OUTFITS: Record<string, Outfit> = {
  // professions, ~1850-1930
  chemist: { jacket: "#f2efe6", pants: "#3b3f52", boots: "#3a2a1e", skin: S[0], hat: "hair", hair: "#4a3020", moustache: "#4a3020" },
  professor: { jacket: "#353a50", pants: "#2e3140", boots: "#2a201a", skin: S[1], hat: "hair", hair: "#a6a6a6", moustache: "#9a9a9a", buttons: "#e8c45a", build: "stout" },
  pharmacist: { jacket: "#f2efe6", pants: "#4a4f5a", boots: "#3a2a1e", skin: S[2], hat: "hair", hair: "#c4c4c4", moustache: "#c4c4c4", build: "stout" },
  doctor: { jacket: "#2f3442", pants: "#2e3140", boots: "#2a201a", skin: S[3], hat: "hair", hair: "#5a3b2a", moustache: "#5a3b2a" },
  doctor2: { jacket: "#f2efe6", pants: "#3b3f52", boots: "#2a201a", skin: S[0], hat: "hair", hair: "#8a8a8a", moustache: "#8a8a8a", build: "stout" },
  nurse: { jacket: "#f4f1ea", pants: "#3b3f52", boots: "#4a3426", skin: S[1], hat: "bonnet", dress: "#7aa0c8" },
  official: { jacket: "#2f3442", pants: "#2e3140", boots: "#2a201a", skin: S[0], hat: "hair", hair: "#7a7a7a", moustache: "#7a7a7a", build: "stout" },
  guard: { jacket: "#357650", pants: "#3d4440", boots: "#241726", hat: "shako", belt: "#f1efe6", buttons: "#d9dde0" },
  soldier: { jacket: "#357650", pants: "#3d4440", boots: "#241726", hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true },
  thief: { jacket: "#2e2a36", pants: "#3b3f52", boots: "#2a201a", skin: S[1], hat: "cap", cap: "#2e2a36" },
  disguise: { jacket: "#7a2f3a", pants: "#3b3f52", boots: "#2a201a", skin: S[1], hat: "tophat", moustache: "#2a201a" },
  patient: { jacket: "#ebe6d8", pants: "#ebe6d8", boots: "#ebe6d8", skin: S[0], hat: "hair", hair: "#3a2a1e" },
  patient2: { jacket: "#ebe6d8", pants: "#ebe6d8", boots: "#ebe6d8", skin: S[1], hat: "hair", hair: "#8a6a3a" },
  patient3: { jacket: "#ebe6d8", pants: "#ebe6d8", boots: "#ebe6d8", skin: S[2], hat: "hair", hair: "#2a201a" },
  patient4: { jacket: "#ebe6d8", pants: "#ebe6d8", boots: "#ebe6d8", skin: S[3], hat: "hair", hair: "#a0a0a0" },
  // townsfolk
  gent: { jacket: "#5a4a6a", pants: "#3b3f52", boots: "#2a201a", skin: S[0], hat: "tophat", moustache: "#5a3b2a" },
  lady: { jacket: "#3f6fb5", pants: "#3b3f52", boots: "#4a3426", skin: S[3], hat: "bonnet", dress: "#c25a7a" },
  lady2: { jacket: "#b5653f", pants: "#3b3f52", boots: "#4a3426", skin: S[2], hat: "bonnet", dress: "#d9a441" },
  man: { jacket: "#6b7a3a", pants: "#4a4f5a", boots: "#4a3426", skin: S[1], hat: "cap", cap: "#7b6a52" },
  worker: { jacket: "#8a5a3c", pants: "#5a4a3a", boots: "#4a3426", skin: S[0], hat: "hair", hair: "#3a2a1e" },
  worker2: { jacket: "#6b7a3a", pants: "#4a4f5a", boots: "#4a3426", skin: S[1], hat: "cap", cap: "#b5543c" },
  worker3: { jacket: "#a0522d", pants: "#6a5a44", boots: "#4a3426", skin: S[2], hat: "hair", hair: "#2a201a" },
  worker4: { jacket: "#7b6a52", pants: "#5a4a3a", boots: "#4a3426", skin: S[3], hat: "cap", cap: "#c9b28a" },
  worker5: { jacket: "#5d6f8a", pants: "#4a4f5a", boots: "#4a3426", skin: S[0], hat: "hair", hair: "#5a3b2a", moustache: "#4a3426" },
  // today
  kid: { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" },
  tourist: { jacket: "#e2453c", pants: "#3b5b9a", boots: "#f4f1ea", skin: S[1], hat: "cap", cap: "#2e2a36" },
  tourist2: { jacket: "#3f9fd8", pants: "#2e2a36", boots: "#f4f1ea", skin: S[2], hat: "hair", hair: "#c98a2a" },
  engineer: { jacket: "#e8d24a", pants: "#3b4b6a", boots: "#3a2a1e", skin: S[0], hat: "helmet", cap: "#f7f1e1" },
};
