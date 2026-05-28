"use client";

import { useMemo } from "react";
import * as THREE from "three";

/* Draws a rounded rect path (ctx.roundRect not guaranteed in all envs) */
function rRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function InfoPoster({ position }: { position: [number, number, number] }) {
  const texture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const W = 1024, H = 700;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d")!;

    /* ── palette ── */
    const INK      = "#111111";
    const MUTED    = "#64748b";
    const DIM      = "#94a3b8";
    const BORDER   = "#e2e8f0";
    const ACCENT_G = "#3ecf6a";
    const ACCENT_A = "#f59e0b";

    /* ── warm white background ── */
    x.fillStyle = "#fafaf8";
    x.fillRect(0, 0, W, H);

    /* ── left dark panel ── */
    const LP = 268;
    x.fillStyle = "#111111";
    x.fillRect(0, 0, LP, H);

    /* dot grid — top-right corner of panel */
    x.fillStyle = "rgba(255,255,255,0.10)";
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        x.beginPath();
        x.arc(LP - 72 + col * 17, 30 + row * 17, 2, 0, Math.PI * 2);
        x.fill();
      }
    }

    /* ── fake profile photo (circular) ── */
    const photoX = 134, photoY = 200, photoR = 80;

    /* radial glow behind photo */
    const glow = x.createRadialGradient(photoX, photoY, 0, photoX, photoY, photoR + 20);
    glow.addColorStop(0, "rgba(62,207,106,0.13)");
    glow.addColorStop(1, "rgba(62,207,106,0)");
    x.fillStyle = glow;
    x.fillRect(0, photoY - photoR - 20, LP, (photoR + 20) * 2);

    /* clip to circle */
    x.save();
    x.beginPath();
    x.arc(photoX, photoY, photoR, 0, Math.PI * 2);
    x.clip();

    /* photo background gradient */
    const photoBg = x.createLinearGradient(photoX - photoR, photoY - photoR, photoX + photoR, photoY + photoR);
    photoBg.addColorStop(0, "#2a3a2e");
    photoBg.addColorStop(1, "#1a2a1e");
    x.fillStyle = photoBg;
    x.fillRect(photoX - photoR, photoY - photoR, photoR * 2, photoR * 2);

    /* shoulders / body silhouette */
    x.fillStyle = "#3a4a3e";
    x.beginPath();
    x.ellipse(photoX, photoY + photoR * 0.9, photoR * 0.85, photoR * 0.65, 0, 0, Math.PI * 2);
    x.fill();

    /* neck */
    x.fillStyle = "#c4a882";
    x.fillRect(photoX - 14, photoY + 28, 28, 32);

    /* head */
    x.fillStyle = "#c8ac88";
    x.beginPath();
    x.arc(photoX, photoY + 8, 38, 0, Math.PI * 2);
    x.fill();

    /* hair (top of head) */
    x.fillStyle = "#1a1208";
    x.beginPath();
    x.arc(photoX, photoY - 10, 38, Math.PI, 0);
    x.fill();
    x.fillRect(photoX - 38, photoY - 10, 76, 16);

    x.restore();

    /* photo border ring */
    x.strokeStyle = ACCENT_G;
    x.lineWidth = 3;
    x.beginPath();
    x.arc(photoX, photoY, photoR + 1, 0, Math.PI * 2);
    x.stroke();

    /* "EB" monogram below photo */
    x.fillStyle = "#ffffff";
    x.textAlign = "center";
    x.font = "bold 38px Georgia, serif";
    x.fillText("EB", photoX, photoY + photoR + 38);

    /* monogram label */
    x.fillStyle = ACCENT_G;
    x.font = "bold 10px Arial, sans-serif";
    x.fillText("SOFTWARE ENGINEER", photoX, photoY + photoR + 58);

    /* green accent bar — panel bottom */
    x.fillStyle = ACCENT_G;
    x.fillRect(0, H - 8, LP, 8);

    /* hairline divider between panels */
    x.strokeStyle = BORDER;
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(LP + 10, 36);
    x.lineTo(LP + 10, H - 36);
    x.stroke();

    /* ── right panel ── */
    const RX = LP + 40;

    /* name */
    x.textAlign = "left";
    x.fillStyle = INK;
    x.font = "bold 88px Georgia, serif";
    x.fillText("Eugenio", RX, 105);
    x.font = "bold 74px Georgia, serif";
    x.fillText("Bustamante.", RX, 183);

    /* rule under name */
    x.strokeStyle = BORDER;
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(RX, 205);
    x.lineTo(W - 40, 205);
    x.stroke();

    /* role */
    x.fillStyle = MUTED;
    x.font = "italic 26px Georgia, serif";
    x.fillText("Software developer. Dublin, Ireland.", RX, 242);

    /* bio */
    x.fillStyle = "#4b5563";
    x.font = "21px Georgia, serif";
    x.fillText("CS student building software with AI.", RX, 278);
    x.fillText("I like things that actually work.", RX, 305);

    /* amber accent rule */
    x.fillStyle = ACCENT_A;
    x.fillRect(RX, 328, 46, 3);

    /* STACK section */
    x.fillStyle = DIM;
    x.font = "bold 13px Arial, sans-serif";
    x.fillText("STACK", RX, 360);

    const chips: { label: string; bg: string }[] = [
      { label: "TypeScript", bg: "#1d4ed8" },
      { label: "Python",     bg: "#b45309" },
      { label: "React",      bg: "#0891b2" },
      { label: "Next.js",    bg: "#171717" },
      { label: "AI / ML",    bg: "#7c3aed" },
    ];
    let cx = RX;
    for (const chip of chips) {
      x.font = "bold 15px Arial, sans-serif";
      const cw = x.measureText(chip.label).width + 24;
      const ch = 30, cr = 6, cy = 374;
      rRect(x, cx, cy, cw, ch, cr);
      x.fillStyle = chip.bg;
      x.fill();
      x.fillStyle = "#ffffff";
      x.textAlign = "center";
      x.fillText(chip.label, cx + cw / 2, cy + ch / 2 + 5);
      x.textAlign = "left";
      cx += cw + 10;
    }

    /* CONNECT section */
    x.fillStyle = DIM;
    x.font = "bold 13px Arial, sans-serif";
    x.fillText("CONNECT", RX, 432);

    x.fillStyle = MUTED;
    x.font = "19px Arial, sans-serif";
    x.fillText("↗  eugeniobusta.com", RX, 458);
    x.fillText("↗  github.com/eugeniobusta", RX, 484);
    x.fillText("↗  linkedin.com/in/eugenio", RX, 510);

    /* quote */
    x.fillStyle = "#9ca3af";
    x.font = "italic 18px Georgia, serif";
    x.fillText("\"Simplicity is key.\"", RX, 554);

    /* open-to-work badge */
    const bx = RX, by = 572, bw = 168, bh = 32;
    rRect(x, bx, by, bw, bh, 16);
    x.fillStyle = "rgba(62,207,106,0.10)";
    x.fill();
    x.strokeStyle = "rgba(62,207,106,0.45)";
    x.lineWidth = 1;
    rRect(x, bx, by, bw, bh, 16);
    x.stroke();
    x.fillStyle = ACCENT_G;
    x.beginPath();
    x.arc(bx + 19, by + bh / 2, 5, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#166534";
    x.font = "bold 14px Arial, sans-serif";
    x.textAlign = "left";
    x.fillText("Open to work", bx + 34, by + bh / 2 + 5);

    /* bottom amber rule */
    x.strokeStyle = ACCENT_A;
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(RX, 632);
    x.lineTo(W - 40, 632);
    x.stroke();

    /* URL bottom-right */
    x.fillStyle = ACCENT_A;
    x.font = "bold 16px Georgia, serif";
    x.textAlign = "right";
    x.fillText("eugeniobusta.com", W - 40, H - 18);

    return new THREE.CanvasTexture(c);
  }, []);

  const POLE_H  = 16;
  const BOARD_W = 22;
  const BOARD_H = 14;
  const POLE_X  = 10.0;
  const boardY  = POLE_H - BOARD_H / 2 + 0.6;

  return (
    <group position={position}>
      {/* uniform green poles */}
      {([-POLE_X, POLE_X] as number[]).map((px, i) => (
        <mesh key={i} position={[px, POLE_H / 2, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, POLE_H, 8]} />
          <meshStandardMaterial color="#3ecf6a" roughness={0.55} metalness={0.25} />
        </mesh>
      ))}

      {/* cross-beam */}
      <mesh position={[0, POLE_H - BOARD_H + 0.5, 0]} castShadow>
        <boxGeometry args={[POLE_X * 2 + 0.45, 0.28, 0.28]} />
        <meshStandardMaterial color="#2db85a" roughness={0.65} metalness={0.2} />
      </mesh>

      {/*
       * Board front — at local z=-0.12 so the -Z face is closest to the camera.
       * The canvas is pre-mirrored horizontally to compensate for Three.js
       * BoxGeometry -Z face UV mirroring (uDir=-1).
       */}
      {texture && (
        <mesh position={[0, boardY, -0.12]} castShadow receiveShadow>
          <boxGeometry args={[BOARD_W, BOARD_H, 0.18]} />
          <meshStandardMaterial map={texture} roughness={0.45} />
        </mesh>
      )}

      {/* board back */}
      <mesh position={[0, boardY, 0.12]}>
        <boxGeometry args={[BOARD_W, BOARD_H, 0.10]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.85} />
      </mesh>
    </group>
  );
}
