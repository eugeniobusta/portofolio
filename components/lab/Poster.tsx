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

    /* subtle radial glow behind monogram */
    const glow = x.createRadialGradient(134, 278, 0, 134, 278, 96);
    glow.addColorStop(0, "rgba(62,207,106,0.09)");
    glow.addColorStop(1, "rgba(62,207,106,0)");
    x.fillStyle = glow;
    x.fillRect(0, 180, LP, 200);

    /* diamond frame */
    x.save();
    x.translate(134, 278);
    x.rotate(Math.PI / 4);
    x.strokeStyle = "rgba(62,207,106,0.30)";
    x.lineWidth = 1.5;
    x.strokeRect(-68, -68, 136, 136);
    x.restore();

    /* "EB" monogram */
    x.fillStyle = "#ffffff";
    x.textAlign = "center";
    x.font = "bold 104px Georgia, serif";
    x.fillText("EB", 134, 302);

    /* monogram label */
    x.fillStyle = ACCENT_G;
    x.font = "bold 10px Arial, sans-serif";
    x.fillText("SOFTWARE ENGINEER", 134, 354);

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
    x.font = "bold 90px Georgia, serif";
    x.fillText("Eugenio", RX, 105);
    x.font = "bold 76px Georgia, serif";
    x.fillText("Bustamante.", RX, 185);

    /* rule under name */
    x.strokeStyle = BORDER;
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(RX, 210);
    x.lineTo(W - 40, 210);
    x.stroke();

    /* role */
    x.fillStyle = MUTED;
    x.font = "italic 21px Georgia, serif";
    x.fillText("Full-stack engineer & AI builder", RX, 246);

    /* bio */
    x.fillStyle = "#4b5563";
    x.font = "17px Georgia, serif";
    x.fillText("Building at the edge of software and", RX, 284);
    x.fillText("intelligence. Making AI feel inevitable.", RX, 308);

    /* amber accent rule */
    x.fillStyle = ACCENT_A;
    x.fillRect(RX, 334, 46, 3);

    /* STACK section */
    x.fillStyle = DIM;
    x.font = "bold 10px Arial, sans-serif";
    x.fillText("STACK", RX, 366);

    const chips: { label: string; bg: string }[] = [
      { label: "TypeScript", bg: "#1d4ed8" },
      { label: "Python",     bg: "#b45309" },
      { label: "React",      bg: "#0891b2" },
      { label: "Next.js",    bg: "#171717" },
      { label: "AI / ML",    bg: "#7c3aed" },
    ];
    let cx = RX;
    for (const chip of chips) {
      x.font = "bold 12px Arial, sans-serif";
      const cw = x.measureText(chip.label).width + 22;
      const ch = 27, cr = 5, cy = 380;
      rRect(x, cx, cy, cw, ch, cr);
      x.fillStyle = chip.bg;
      x.fill();
      x.fillStyle = "#ffffff";
      x.textAlign = "center";
      x.fillText(chip.label, cx + cw / 2, cy + ch / 2 + 4);
      x.textAlign = "left";
      cx += cw + 9;
    }

    /* CONNECT section */
    x.fillStyle = DIM;
    x.font = "bold 10px Arial, sans-serif";
    x.fillText("CONNECT", RX, 440);

    x.fillStyle = MUTED;
    x.font = "15px Arial, sans-serif";
    x.fillText("↗  eugeniobusta.com", RX, 463);
    x.fillText("↗  github.com/eugeniobusta", RX, 487);
    x.fillText("↗  linkedin.com/in/eugenio", RX, 511);

    /* quote */
    x.fillStyle = "#9ca3af";
    x.font = "italic 15px Georgia, serif";
    x.fillText("\"Simplicity is key.\"", RX, 566);

    /* open-to-work badge */
    const bx = RX, by = 586, bw = 154, bh = 30;
    rRect(x, bx, by, bw, bh, 15);
    x.fillStyle = "rgba(62,207,106,0.10)";
    x.fill();
    x.strokeStyle = "rgba(62,207,106,0.45)";
    x.lineWidth = 1;
    rRect(x, bx, by, bw, bh, 15);
    x.stroke();
    x.fillStyle = ACCENT_G;
    x.beginPath();
    x.arc(bx + 18, by + bh / 2, 4, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = "#166534";
    x.font = "bold 12px Arial, sans-serif";
    x.textAlign = "left";
    x.fillText("Open to work", bx + 30, by + bh / 2 + 4);

    /* bottom amber rule */
    x.strokeStyle = ACCENT_A;
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(RX, 648);
    x.lineTo(W - 40, 648);
    x.stroke();

    /* URL bottom-right */
    x.fillStyle = ACCENT_A;
    x.font = "bold 15px Georgia, serif";
    x.textAlign = "right";
    x.fillText("eugeniobusta.com", W - 40, H - 20);

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
