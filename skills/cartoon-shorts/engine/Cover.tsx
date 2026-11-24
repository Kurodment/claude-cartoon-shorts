// Vertical cover / thumbnail (1080x1920) for a short: a caption-free frame of the video, a dark gradient at the top and a
// big 2-3 line title (white, thick ink outline, one line in yellow), tilted a little. Text sits in the top 45 % so the
// Shorts / TikTok UI never covers it. Props: { image: "covers/<name>.jpg" (under public/), lines: string[], hl?: number[] }
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Baloo2";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] });
export type CoverProps = { image: string; lines: string[]; hl?: number[] };

export const Cover: React.FC<CoverProps> = ({ image, lines, hl = [1] }) => {
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(200, Math.round(1750 / Math.max(8, longest)));
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Img src={staticFile(image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,8,14,0.78) 0%, rgba(10,8,14,0.45) 32%, rgba(10,8,14,0) 52%)" }} />
      <div style={{ position: "absolute", top: 150, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", transform: "rotate(-3deg)" }}>
        {lines.map((t, i) => {
          const txt = t.toLocaleUpperCase("tr-TR");
          return (
            <div key={i} style={{ position: "relative", fontFamily, fontWeight: 800, fontSize: size, lineHeight: 1.02, textAlign: "center", letterSpacing: 1 }}>
              <span style={{ position: "absolute", inset: 0, color: "#0b0a0c", WebkitTextStroke: `${size * 0.16}px #0b0a0c`, textShadow: `0 ${size * 0.08}px 0 #0b0a0c` }}>{txt}</span>
              <span style={{ position: "relative", color: hl.includes(i) ? "#ffd23f" : "#ffffff" }}>{txt}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
