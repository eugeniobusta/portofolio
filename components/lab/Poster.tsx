"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function InfoPoster({ position }: { position: [number, number, number] }) {
  const texture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const W = 1024, H = 700;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d")!;

    /* white background */
    x.fillStyle = "#ffffff";
    x.fillRect(0, 0, W, H);

    /* clean black border — no green decorations */
    x.strokeStyle = "#111111";
    x.lineWidth = 20;
    x.strokeRect(10, 10, W - 20, H - 20);

    /* name */
    x.fillStyle = "#111";
    x.font = "bold 78px Georgia, serif";
    x.textAlign = "center";
    x.fillText("Eugenio Bustamante", W / 2, 108);

    /* role — green accent is content, not border decoration */
    x.fillStyle = "#3ecf6a";
    x.font = "bold 36px Georgia, serif";
    x.fillText("CS Student  ·  AI Builder", W / 2, 154);

    /* thin divider */
    x.strokeStyle = "#dddddd";
    x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(36, 172); x.lineTo(W - 36, 172); x.stroke();

    /* photo placeholder */
    x.fillStyle = "#eeeeee";
    x.strokeStyle = "#cccccc";
    x.lineWidth = 1;
    x.fillRect(36, 186, 310, 438);
    x.strokeRect(36, 186, 310, 438);
    x.fillStyle = "#aaaaaa";
    x.font = "20px sans-serif";
    x.textAlign = "center";
    x.fillText("[ photo ]", 36 + 155, 186 + 226);

    /* bio */
    x.fillStyle = "#333";
    x.font = "27px Georgia, serif";
    x.textAlign = "left";
    const bio = [
      "Building at the intersection",
      "of software and intelligence.",
      "",
      "Open to collaborations,",
      "research, and big ideas.",
      "",
    ];
    bio.forEach((l, i) => x.fillText(l, 370, 216 + i * 44));

    x.fillStyle = "#3ecf6a";
    x.font = "bold 25px Georgia, serif";
    x.fillText("eugeniobusta.com", 370, 216 + bio.length * 44);

    return new THREE.CanvasTexture(c);
  }, []);

  const POLE_H  = 16;
  const BOARD_W = 22;
  const BOARD_H = 14;
  const POLE_X  = 10.0;

  /*
   * The poster faces the camera (which is at negative Z).
   * Board-front is placed at z = -0.12 (closer to camera, showing the
   * -Z face of the BoxGeometry which maps UVs correctly for that face).
   * Board-back is at z = +0.12 (further from camera, hidden behind front).
   */
  const boardY = POLE_H - BOARD_H / 2 + 0.6;

  return (
    <group position={position}>
      {/* uniform-width green poles */}
      {([-POLE_X, POLE_X] as number[]).map((px, i) => (
        <mesh key={i} position={[px, POLE_H / 2, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, POLE_H, 8]} />
          <meshStandardMaterial color="#3ecf6a" roughness={0.55} metalness={0.25} />
        </mesh>
      ))}

      {/* horizontal cross-beam */}
      <mesh position={[0, POLE_H - BOARD_H + 0.5, 0]} castShadow>
        <boxGeometry args={[POLE_X * 2 + 0.45, 0.28, 0.28]} />
        <meshStandardMaterial color="#2db85a" roughness={0.65} metalness={0.2} />
      </mesh>

      {/* board front — texture — faces the camera (-Z side) */}
      {texture && (
        <mesh position={[0, boardY, -0.12]} castShadow receiveShadow>
          <boxGeometry args={[BOARD_W, BOARD_H, 0.18]} />
          <meshStandardMaterial map={texture} roughness={0.45} />
        </mesh>
      )}

      {/* board back — plain — hidden behind front */}
      <mesh position={[0, boardY, 0.12]}>
        <boxGeometry args={[BOARD_W, BOARD_H, 0.10]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.85} />
      </mesh>
    </group>
  );
}
