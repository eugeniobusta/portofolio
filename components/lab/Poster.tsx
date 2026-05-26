"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function InfoPoster({ position }: { position: [number, number, number] }) {
  const texture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512; c.height = 360;
    const x = c.getContext("2d")!;

    /* cream background */
    x.fillStyle = "#f5f0e8";
    x.fillRect(0, 0, 512, 360);

    /* green top bar */
    x.fillStyle = "#3ecf6a";
    x.fillRect(0, 0, 512, 8);

    /* name */
    x.fillStyle = "#111";
    x.font = "bold 46px Georgia, serif";
    x.textAlign = "center";
    x.fillText("Eugenio Bustamante", 256, 66);

    /* role */
    x.fillStyle = "#3ecf6a";
    x.font = "bold 24px Georgia, serif";
    x.fillText("CS Student  ·  AI Builder", 256, 98);

    /* divider */
    x.strokeStyle = "#d0c8b8";
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(24, 112); x.lineTo(488, 112); x.stroke();

    /* photo placeholder */
    x.fillStyle = "#d8d0c8";
    x.fillRect(22, 124, 192, 174);
    x.fillStyle = "#b0a898";
    x.font = "16px sans-serif";
    x.fillText("[ your photo ]", 118, 218);

    /* bio lines */
    x.fillStyle = "#333";
    x.font = "19px Georgia, serif";
    x.textAlign = "left";
    [
      "Building at the intersection",
      "of software and intelligence.",
      "",
      "Open to collaborations,",
      "research, and big ideas.",
    ].forEach((l, i) => x.fillText(l, 230, 142 + i * 28));

    /* footer */
    x.fillStyle = "#999";
    x.font = "15px sans-serif";
    x.textAlign = "center";
    x.fillText("eugeniobusta.com", 256, 346);

    return new THREE.CanvasTexture(c);
  }, []);

  const POLE_H = 7.5;
  const BOARD_W = 8;
  const BOARD_H = 5.0;
  const POLE_X  = 3.6;

  return (
    <group position={position}>
      {/* poles */}
      {([-POLE_X, POLE_X] as number[]).map((px, i) => (
        <mesh key={i} position={[px, POLE_H / 2, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.16, POLE_H, 9]} />
          <meshStandardMaterial color="#8b7045" roughness={0.82} />
        </mesh>
      ))}

      {/* horizontal cross-beam */}
      <mesh position={[0, POLE_H - BOARD_H + 0.25, 0]} castShadow>
        <boxGeometry args={[POLE_X * 2 + 0.26, 0.18, 0.18]} />
        <meshStandardMaterial color="#7a6035" roughness={0.85} />
      </mesh>

      {/* board (front — texture) */}
      {texture && (
        <mesh position={[0, POLE_H - BOARD_H / 2 + 0.3, 0.07]} castShadow>
          <boxGeometry args={[BOARD_W, BOARD_H, 0.14]} />
          <meshStandardMaterial map={texture} roughness={0.55} />
        </mesh>
      )}

      {/* board back */}
      <mesh position={[0, POLE_H - BOARD_H / 2 + 0.3, -0.08]}>
        <boxGeometry args={[BOARD_W, BOARD_H, 0.09]} />
        <meshStandardMaterial color="#c8c0b0" roughness={0.85} />
      </mesh>
    </group>
  );
}
