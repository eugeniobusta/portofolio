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

    /* ── colour tokens (matches portfolio globals.css light mode) ── */
    const INK     = "#191921";   // oklch(17% 0.008 250) ≈
    const PAPER   = "#faf8f4";   // oklch(97.5% 0.006 85) ≈
    const MUTED   = "#757880";   // oklch(52% 0.006 250) ≈
    const ACCENT  = "#c99040";   // amber accent (portfolio --accent)
    const FRAME   = "#e4e1dc";   // oklch(89.5% 0.006 85) ≈

    /* ── background ── */
    x.fillStyle = PAPER;
    x.fillRect(0, 0, W, H);

    /* ── thin black border ── */
    x.strokeStyle = INK;
    x.lineWidth = 14;
    x.strokeRect(7, 7, W - 14, H - 14);

    const ML = 56;   // left margin

    /* ── name ── */
    x.fillStyle = INK;
    x.textAlign = "left";

    x.font = "bold 86px Georgia, serif";
    x.fillText("Eugenio", ML, 108);

    x.font = "bold 74px Georgia, serif";
    x.fillText("Bustamante.", ML, 188);

    /* ── tagline ── */
    x.fillStyle = MUTED;
    x.font = "21px Georgia, serif";
    x.fillText("I build things at the intersection of software", ML, 236);
    x.fillText("and intelligence. Currently obsessed with", ML, 262);
    x.fillText("what happens when AI meets real products.", ML, 288);

    /* ── quote ── */
    x.fillStyle = MUTED;
    x.globalAlpha = 0.65;
    x.font = "italic 18px Georgia, serif";
    x.fillText("Simplicity is key. I love simplicity.", ML, 330);
    x.globalAlpha = 1;

    /* ── thin divider ── */
    x.strokeStyle = FRAME;
    x.lineWidth = 1.5;
    x.beginPath();
    x.moveTo(ML, 354);
    x.lineTo(W - ML, 354);
    x.stroke();

    /* ── CTA: "View work" — dark filled button ── */
    const B1X = ML, B1Y = 374, B1W = 138, B1H = 40;
    x.fillStyle = INK;
    rRect(x, B1X, B1Y, B1W, B1H, 8);
    x.fill();
    x.fillStyle = PAPER;
    x.font = "bold 15px Arial, sans-serif";
    x.textAlign = "center";
    x.fillText("View work  ↓", B1X + B1W / 2, B1Y + B1H / 2 + 5);

    /* ── CTA: "Enter the Lab" — outlined button ── */
    const B2X = ML + B1W + 14, B2Y = B1Y, B2W = 168, B2H = B1H;
    x.strokeStyle = FRAME;
    x.lineWidth = 1.5;
    rRect(x, B2X, B2Y, B2W, B2H, 8);
    x.stroke();
    x.fillStyle = INK;
    x.font = "bold 15px Arial, sans-serif";
    x.textAlign = "center";
    x.fillText("Enter the Lab", B2X + B2W / 2 - 12, B2Y + B2H / 2 + 5);
    /* green circle arrow */
    x.fillStyle = INK;
    x.beginPath();
    x.arc(B2X + B2W - 20, B2Y + B2H / 2, 11, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = PAPER;
    x.font = "bold 13px Arial, sans-serif";
    x.textAlign = "center";
    x.fillText("→", B2X + B2W - 20, B2Y + B2H / 2 + 4);

    /* ── social links ── */
    x.textAlign = "left";
    x.font = "14px Arial, sans-serif";
    x.fillStyle = MUTED;
    x.globalAlpha = 0.75;
    x.fillText("GitHub", ML, 450);
    x.fillStyle = FRAME;
    x.fillText("  ·  ", ML + 52, 450);
    x.fillStyle = MUTED;
    x.fillText("LinkedIn", ML + 82, 450);
    x.globalAlpha = 1;

    /* ── amber accent rule ── */
    x.fillStyle = ACCENT;
    x.fillRect(ML, 480, 36, 3);

    /* ── website URL bottom-right ── */
    x.fillStyle = ACCENT;
    x.font = "bold 17px Georgia, serif";
    x.textAlign = "right";
    x.fillText("eugeniobusta.com", W - ML, H - 22);

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
