"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";
import { projects, Project } from "../../data/projects";

/* building + door sizing (car is ≈1.23 wide × 1.94 long × ~1.1 tall) */
const BW = 12, BH = 14, BD = 10;
const DW = 4.2, DH = 4.4;
const WT = 0.5;
const TRIGGER = 6;   // world-units from building center

const CONFIGS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-38, 0,  15], rotY: -Math.PI / 2 }, // door faces +X (toward center)
  { pos: [ 38, 0,  15], rotY:  Math.PI / 2 }, // door faces -X (toward center)
  { pos: [-38, 0,  35], rotY: -Math.PI / 2 },
  { pos: [ 38, 0,  35], rotY:  Math.PI / 2 },
  { pos: [  0, 0, -36], rotY:  Math.PI     }, // door faces +Z (toward player start)
];

const ACCENTS = ["#3ecf6a", "#4488ff", "#ff6644", "#44ccff", "#ffaa44"];
const BASES   = ["#0a1a0f", "#080d1a", "#1a0a06", "#061218", "#141008"];

function rR(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

function makeTexture(project: Project, accent: string, base: string) {
  if (typeof window === "undefined") return null;
  const W = 512, H = 700;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d")!;

  x.fillStyle = base;
  x.fillRect(0, 0, W, H);

  /* accent bars */
  x.fillStyle = accent;
  x.fillRect(0, 0, W, 10);
  x.fillRect(0, H - 10, W, 10);

  /* subtle grid */
  x.strokeStyle = "rgba(255,255,255,0.04)";
  x.lineWidth = 1;
  for (let i = 0; i < W; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let j = 0; j < H; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }

  /* title */
  x.fillStyle = "#ffffff";
  x.textAlign = "center";
  x.font = "bold 58px Arial, sans-serif";
  x.fillText(project.title, W / 2, 100);

  /* accent rule under title */
  x.fillStyle = accent;
  x.fillRect(W / 2 - 40, 115, 80, 3);

  /* stack chips */
  x.font = "bold 14px Arial, sans-serif";
  let cx = 20;
  for (const s of project.stack.slice(0, 4)) {
    const cw = x.measureText(s.name).width + 22;
    rR(x, cx, 130, cw, 28, 5);
    x.fillStyle = "rgba(255,255,255,0.12)";
    x.fill();
    x.fillStyle = accent;
    x.textAlign = "center";
    x.fillText(s.name, cx + cw / 2, 149);
    cx += cw + 10;
  }

  /* description word-wrap */
  x.fillStyle = "rgba(255,255,255,0.68)";
  x.font = "19px Arial, sans-serif";
  x.textAlign = "left";
  const words = project.description.split(" ");
  let line = "", ly = 210;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (x.measureText(test).width > W - 50) {
      if (ly < 440) x.fillText(line, 25, ly);
      line = w; ly += 30;
    } else { line = test; }
  }
  if (ly < 440 && line) x.fillText(line, 25, ly);

  /* year chip */
  x.fillStyle = "rgba(255,255,255,0.07)";
  rR(x, 25, H - 90, 70, 28, 6);
  x.fill();
  x.fillStyle = "rgba(255,255,255,0.40)";
  x.font = "13px Arial, sans-serif";
  x.textAlign = "center";
  x.fillText(project.year, 60, H - 70);

  /* status chip */
  const statusColors: Record<string, string> = { live: "#3ecf6a", dev: "#f59e0b", complete: "#4488ff" };
  const sc = statusColors[project.status] ?? accent;
  x.fillStyle = sc + "33";
  rR(x, 110, H - 90, 100, 28, 6);
  x.fill();
  x.fillStyle = sc;
  x.font = "bold 13px Arial, sans-serif";
  x.textAlign = "center";
  x.fillText(project.status.toUpperCase(), 160, H - 70);

  /* drive-in prompt */
  x.fillStyle = accent;
  x.font = "bold 20px Arial, sans-serif";
  x.textAlign = "center";
  x.fillText("▶  DRIVE IN TO EXPLORE", W / 2, H - 28);

  return new THREE.CanvasTexture(cv);
}

function Building({
  project, pos, rotY, accent, base, carRef, onEnter,
}: {
  project: Project;
  pos: [number, number, number];
  rotY: number;
  accent: string;
  base: string;
  carRef: React.RefObject<THREE.Group>;
  onEnter: (p: Project) => void;
}) {
  const triggered = useRef(false);
  const texture   = useMemo(() => makeTexture(project, accent, base), []);

  useFrame(() => {
    if (!carRef.current) return;
    const c = carRef.current.position;
    const dx = c.x - pos[0], dz = c.z - pos[2];
    if (Math.sqrt(dx * dx + dz * dz) < TRIGGER) {
      if (!triggered.current) { triggered.current = true; onEnter(project); }
    } else {
      triggered.current = false;
    }
  });

  const SW = (BW - DW) / 2;  // side column width
  const HH = BH / 2;

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* left column — full depth */}
      <mesh position={[-(DW / 2 + SW / 2), HH, 0]} castShadow receiveShadow>
        <boxGeometry args={[SW, BH, BD]} />
        <meshStandardMaterial color={base} roughness={0.7} metalness={0.08} />
      </mesh>

      {/* right column — full depth */}
      <mesh position={[DW / 2 + SW / 2, HH, 0]} castShadow receiveShadow>
        <boxGeometry args={[SW, BH, BD]} />
        <meshStandardMaterial color={base} roughness={0.7} metalness={0.08} />
      </mesh>

      {/* lintel: front top piece above door */}
      <mesh position={[0, DH + (BH - DH) / 2, -(BD / 2 - WT / 2)]} castShadow>
        <boxGeometry args={[BW, BH - DH, WT]} />
        <meshStandardMaterial color={base} roughness={0.7} metalness={0.08} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, HH, BD / 2 - WT / 2]}>
        <boxGeometry args={[BW, BH, WT]} />
        <meshStandardMaterial color={base} roughness={0.7} />
      </mesh>

      {/* roof slab */}
      <mesh position={[0, BH + 0.3, 0]} castShadow>
        <boxGeometry args={[BW + 0.8, 0.55, BD + 0.8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} roughness={0.4} />
      </mesh>

      {/* neon roof edge */}
      <mesh position={[0, BH + 0.62, 0]}>
        <boxGeometry args={[BW + 0.8, 0.08, BD + 0.8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={5} />
      </mesh>

      {/* door-frame neon strips */}
      {([-DW / 2, DW / 2] as number[]).map((sx, i) => (
        <mesh key={i} position={[sx, DH / 2, -(BD / 2)]} castShadow>
          <boxGeometry args={[0.1, DH, 0.15]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={4} />
        </mesh>
      ))}
      <mesh position={[0, DH, -(BD / 2)]}>
        <boxGeometry args={[DW, 0.1, 0.15]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={4} />
      </mesh>

      {/* sign billboard — always faces camera regardless of building rotation */}
      {texture && (
        <Billboard position={[0, HH, -(BD / 2 + 0.3)]}>
          <mesh>
            <planeGeometry args={[BW * 0.88, BH * 0.9]} />
            <meshBasicMaterial map={texture} transparent side={THREE.FrontSide} />
          </mesh>
        </Billboard>
      )}

      {/* door glow */}
      <pointLight position={[0, DH * 0.55, -(BD / 2 + 1.2)]} color={accent} intensity={8} distance={14} decay={2} />
    </group>
  );
}

export function ProjectBuildings({
  carRef,
  onEnter,
}: {
  carRef: React.RefObject<THREE.Group>;
  onEnter: (p: Project) => void;
}) {
  return (
    <>
      {projects.map((p, i) => (
        <Building
          key={p.id}
          project={p}
          pos={CONFIGS[i].pos}
          rotY={CONFIGS[i].rotY}
          accent={ACCENTS[i]}
          base={BASES[i]}
          carRef={carRef}
          onEnter={onEnter}
        />
      ))}
    </>
  );
}
