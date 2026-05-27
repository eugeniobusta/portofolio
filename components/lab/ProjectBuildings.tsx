"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects, Project } from "../../data/projects";

/* ── dimensions ──────────────────────────────────────────────────── */
export const BLDG_W  = 12;
export const BLDG_H  = 14;
export const BLDG_D  = 10;
export const DOOR_W  = 4.4;   // car is ~1.23 wide
export const DOOR_H  = 4.6;
export const BLDG_WT = 0.5;   // wall thickness

export interface BuildingConfig {
  pos: [number, number, number];
  rotY: number;
  cRY: number;
  sRY: number;
}

const RAW: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-38, 0,  15], rotY: -Math.PI / 2 },
  { pos: [ 38, 0,  15], rotY:  Math.PI / 2 },
  { pos: [-38, 0,  35], rotY: -Math.PI / 2 },
  { pos: [ 38, 0,  35], rotY:  Math.PI / 2 },
  { pos: [  0, 0, -36], rotY:  Math.PI     },
];

export const BLDG_CONFIGS: BuildingConfig[] = RAW.map(c => ({
  ...c,
  cRY: Math.cos(c.rotY),
  sRY: Math.sin(c.rotY),
}));

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

/* ── per-project visual art in the header strip ─────────────────── */
function drawVisual(
  ctx: CanvasRenderingContext2D,
  visual: Project["visual"],
  accent: string,
  W: number,
  stripH: number,
) {
  const cx = W / 2, cy = stripH / 2;

  switch (visual) {
    case "pitch": {
      /* two phones connected by a dotted arc */
      const drawPhone = (px: number, py: number) => {
        rR(ctx, px - 22, py - 38, 44, 76, 6);
        ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
        /* screen */
        ctx.fillStyle = accent + "33";
        ctx.fillRect(px - 15, py - 28, 30, 46);
      };
      drawPhone(cx - 100, cy);
      drawPhone(cx + 100, cy);
      /* arc */
      ctx.strokeStyle = accent + "88"; ctx.lineWidth = 2;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(cx - 78, cy);
      ctx.bezierCurveTo(cx - 30, cy - 40, cx + 30, cy - 40, cx + 78, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      [cx - 78, cx, cx + 78].forEach(px => {
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.arc(px, cy, 5, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }
    case "cosmosbusta": {
      /* orbits + planets */
      const radii = [30, 55, 82];
      const planets = [
        { r: 30, angle: 0.8, size: 6, col: "#c0d8ff" },
        { r: 55, angle: 2.2, size: 9, col: "#ffd090" },
        { r: 82, angle: 4.5, size: 7, col: "#90e8c0" },
      ];
      radii.forEach(r => {
        ctx.strokeStyle = accent + "44"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      });
      /* sun */
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      sg.addColorStop(0, "#fff8c0"); sg.addColorStop(1, "#ffaa00");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
      planets.forEach(p => {
        ctx.fillStyle = p.col;
        const px = cx + Math.cos(p.angle) * p.r;
        const py = cy + Math.sin(p.angle) * p.r;
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }
    case "voice": {
      /* microphone + sound waves */
      /* body */
      rR(ctx, cx - 16, cy - 38, 32, 48, 16);
      ctx.fillStyle = accent + "cc"; ctx.fill();
      /* stand */
      ctx.strokeStyle = accent; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy + 10, 26, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 36); ctx.lineTo(cx, cy + 48); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 14, cy + 48); ctx.lineTo(cx + 14, cy + 48); ctx.stroke();
      /* waves */
      [44, 60, 76].forEach((r, i) => {
        ctx.strokeStyle = accent + ["55", "33", "1a"][i];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy - 14, r, -Math.PI * 0.55, Math.PI * 0.55);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - 14, r, Math.PI - Math.PI * 0.55, Math.PI + Math.PI * 0.55);
        ctx.stroke();
      });
      break;
    }
    case "startup": {
      /* 2×2 video tiles */
      const tw = 90, th = 60, gap = 12;
      const ox = cx - tw - gap / 2, oy = cy - th - gap / 2;
      const tiles = [
        { x: ox, y: oy }, { x: ox + tw + gap, y: oy },
        { x: ox, y: oy + th + gap }, { x: ox + tw + gap, y: oy + th + gap },
      ];
      tiles.forEach((t, i) => {
        rR(ctx, t.x, t.y, tw, th, 6);
        ctx.fillStyle = i === 1 ? accent + "44" : "rgba(255,255,255,0.07)"; ctx.fill();
        ctx.strokeStyle = i === 1 ? accent : accent + "33"; ctx.lineWidth = 1.5; ctx.stroke();
        /* avatar circle */
        ctx.fillStyle = i === 1 ? accent : "#888";
        ctx.beginPath(); ctx.arc(t.x + tw / 2, t.y + th / 2 - 4, 14, 0, Math.PI * 2); ctx.fill();
      });
      /* connecting arrows */
      ctx.strokeStyle = accent; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox + tw + 2, oy + th / 2);
      ctx.lineTo(ox + tw + gap - 2, oy + th / 2);
      ctx.stroke();
      break;
    }
    case "tennis": {
      /* overhead court */
      const cw = 160, ch = 100;
      const bx = cx - cw / 2, by = cy - ch / 2;
      /* court */
      ctx.fillStyle = "#2a5a30";
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.fillRect(bx, by, cw, ch);
      ctx.strokeRect(bx, by, cw, ch);
      /* net */
      ctx.beginPath(); ctx.moveTo(cx, by); ctx.lineTo(cx, by + ch); ctx.stroke();
      /* service lines */
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(bx, by + ch * 0.2); ctx.lineTo(bx + cw, by + ch * 0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by + ch * 0.8); ctx.lineTo(bx + cw, by + ch * 0.8); ctx.stroke();
      /* ball */
      const ballX = cx - 30, ballY = cy - 10;
      ctx.fillStyle = "#ccff00";
      ctx.beginPath(); ctx.arc(ballX, ballY, 10, 0, Math.PI * 2); ctx.fill();
      /* ball seam */
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ballX, ballY, 10, 0.3, 1.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(ballX, ballY, 10, 3.5, 4.4); ctx.stroke();
      break;
    }
  }
}

/* ── canvas sign texture ─────────────────────────────────────────── */
function makeTexture(project: Project, accent: string, base: string) {
  if (typeof window === "undefined") return null;
  const W = 600, H = 700;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d")!;

  /* NO pre-flip: for all building rotations (±PI/2, PI) the combined
     group+plane rotation produces non-mirrored UVs from the viewer's
     perspective — a pre-flip would double-mirror and look backwards. */

  /* Door area in canvas coords (y=0 top, y=H bottom):
     Door occupies world y=0..DOOR_H=4.6, building height=14.
     Canvas y for door-top = H*(1 - 4.6/14) ≈ 470.
     Keep background only for y < DC so the door gap is transparent. */
  const DC = 462;

  /* background — above-door area only (door gap stays alpha=0) */
  x.fillStyle = base;
  x.fillRect(0, 0, W, DC);

  /* subtle dot-grid */
  x.fillStyle = "rgba(255,255,255,0.035)";
  for (let i = 20; i < W; i += 28) for (let j = 20; j < DC; j += 28) {
    x.beginPath(); x.arc(i, j, 1.2, 0, Math.PI * 2); x.fill();
  }

  /* ── visual art strip ── */
  const STRIP_H = 185;
  const artGrad = x.createLinearGradient(0, 0, 0, STRIP_H);
  artGrad.addColorStop(0, base);
  artGrad.addColorStop(1, accent + "18");
  x.fillStyle = artGrad;
  x.fillRect(0, 0, W, STRIP_H);

  /* strip border */
  x.strokeStyle = accent + "55"; x.lineWidth = 1;
  x.beginPath(); x.moveTo(0, STRIP_H); x.lineTo(W, STRIP_H); x.stroke();

  drawVisual(x, project.visual, accent, W, STRIP_H);

  /* accent top bar */
  x.fillStyle = accent;
  x.fillRect(0, 0, W, 6);

  /* ── title ── */
  x.fillStyle = "#ffffff";
  x.textAlign = "center";
  x.font = "bold 58px Arial, sans-serif";
  x.fillText(project.title, W / 2, STRIP_H + 60);

  /* rule */
  x.fillStyle = accent;
  x.fillRect(W / 2 - 40, STRIP_H + 74, 80, 3);

  /* ── stack chips ── */
  x.font = "bold 15px Arial, sans-serif";
  const chipH = 28, chipR = 7;
  const totalChipW = project.stack.slice(0, 4).reduce((sum, s) => {
    return sum + x.measureText(s.name).width + 24 + 10;
  }, -10);
  let chipX = (W - totalChipW) / 2;
  for (const s of project.stack.slice(0, 4)) {
    const cw = x.measureText(s.name).width + 24;
    rR(x, chipX, STRIP_H + 86, cw, chipH, chipR);
    x.fillStyle = "rgba(255,255,255,0.10)"; x.fill();
    x.strokeStyle = accent + "66"; x.lineWidth = 1; x.stroke();
    x.fillStyle = accent;
    x.textAlign = "center";
    x.fillText(s.name, chipX + cw / 2, STRIP_H + 86 + chipH / 2 + 5);
    chipX += cw + 10;
  }

  /* ── description ── */
  x.fillStyle = "rgba(255,255,255,0.70)";
  x.font = "18px Arial, sans-serif";
  x.textAlign = "left";
  const words = project.description.split(" ");
  let line = "", ly = STRIP_H + 152;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (x.measureText(test).width > W - 56) {
      if (ly < 370) x.fillText(line, 28, ly);
      line = w; ly += 29;
    } else { line = test; }
  }
  if (ly < 370 && line) x.fillText(line, 28, ly);

  /* ── meta row (year + status) ── */
  const statusColors: Record<string, string> = { live: "#3ecf6a", dev: "#f59e0b", complete: "#4488ff" };
  const sc = statusColors[project.status] ?? accent;
  x.fillStyle = "rgba(255,255,255,0.30)";
  x.font = "13px Arial, sans-serif";
  x.textAlign = "left";
  x.fillText(project.year, 28, 392);

  rR(x, 76, 376, 96, 26, 7);
  x.fillStyle = sc + "25"; x.fill();
  x.strokeStyle = sc + "77"; x.lineWidth = 1; x.stroke();
  x.fillStyle = sc;
  x.font = "bold 12px Arial, sans-serif";
  x.textAlign = "center";
  x.fillText(project.status.toUpperCase(), 124, 393);

  /* ── DRIVE IN button — sits above the door-threshold line ── */
  const btnX = 22, btnY = 405, btnW = W - 44, btnH = 46, btnR = 10;
  rR(x, btnX, btnY, btnW, btnH, btnR);
  x.fillStyle = accent + "28"; x.fill();
  x.strokeStyle = accent; x.lineWidth = 2.5; x.stroke();
  x.fillStyle = accent;
  x.font = "bold 24px Arial, sans-serif";
  x.textAlign = "center";
  x.fillText("▶  DRIVE IN TO EXPLORE", W / 2, btnY + btnH / 2 + 8);

  /* accent bar at the bottom of the visible area */
  x.fillStyle = accent;
  x.fillRect(0, DC - 3, W, 3);

  /* canvas below DC is alpha=0 → transparent door gap in the 3D plane */

  return new THREE.CanvasTexture(cv);
}

/* ── Building component ──────────────────────────────────────────── */
function Building({
  project, cfg, accent, base, carRef, onEnter,
}: {
  project: Project;
  cfg: BuildingConfig;
  accent: string;
  base: string;
  carRef: React.RefObject<THREE.Group>;
  onEnter: (p: Project, teleport: [number, number]) => void;
}) {
  const triggered = useRef(false);
  const texture   = useMemo(() => makeTexture(project, accent, base), []);

  /* teleport world pos = 3.5 units in front of door in local → world */
  const teleportX = cfg.pos[0] + (-(BLDG_D / 2 + 3.5)) * cfg.sRY;
  const teleportZ = cfg.pos[2] + (-(BLDG_D / 2 + 3.5)) * cfg.cRY;

  useFrame(() => {
    if (!carRef.current) return;
    const c = carRef.current.position;
    const dx = c.x - cfg.pos[0], dz = c.z - cfg.pos[2];
    /* transform to building-local 2D */
    const lx = dx * cfg.cRY - dz * cfg.sRY;
    const lz = dx * cfg.sRY + dz * cfg.cRY;

    /* trigger only when car has driven through the door into the interior */
    const inside =
      Math.abs(lx) < DOOR_W / 2 + 0.6 &&
      lz > -(BLDG_D / 2 - 1.2) &&
      lz < BLDG_D / 2;

    if (inside) {
      if (!triggered.current) {
        triggered.current = true;
        onEnter(project, [teleportX, teleportZ]);
      }
    } else {
      triggered.current = false;
    }
  });

  const SW = (BLDG_W - DOOR_W) / 2;
  const HH = BLDG_H / 2;
  const { pos, rotY } = cfg;

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* left column */}
      <mesh position={[-(DOOR_W / 2 + SW / 2), HH, 0]} castShadow receiveShadow>
        <boxGeometry args={[SW, BLDG_H, BLDG_D]} />
        <meshStandardMaterial color={base} roughness={0.7} metalness={0.08} />
      </mesh>

      {/* right column */}
      <mesh position={[DOOR_W / 2 + SW / 2, HH, 0]} castShadow receiveShadow>
        <boxGeometry args={[SW, BLDG_H, BLDG_D]} />
        <meshStandardMaterial color={base} roughness={0.7} metalness={0.08} />
      </mesh>

      {/* lintel above door */}
      <mesh position={[0, DOOR_H + (BLDG_H - DOOR_H) / 2, -(BLDG_D / 2 - BLDG_WT / 2)]} castShadow>
        <boxGeometry args={[BLDG_W, BLDG_H - DOOR_H, BLDG_WT]} />
        <meshStandardMaterial color={base} roughness={0.7} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, HH, BLDG_D / 2 - BLDG_WT / 2]}>
        <boxGeometry args={[BLDG_W, BLDG_H, BLDG_WT]} />
        <meshStandardMaterial color={base} roughness={0.7} />
      </mesh>

      {/* roof */}
      <mesh position={[0, BLDG_H + 0.3, 0]} castShadow>
        <boxGeometry args={[BLDG_W + 0.8, 0.55, BLDG_D + 0.8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, BLDG_H + 0.63, 0]}>
        <boxGeometry args={[BLDG_W + 0.8, 0.08, BLDG_D + 0.8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={5} />
      </mesh>

      {/* door-frame neon strips — placed in front of the sign plane */}
      {([-DOOR_W / 2, DOOR_W / 2] as number[]).map((sx, i) => (
        <mesh key={i} position={[sx, DOOR_H / 2, -(BLDG_D / 2 + 0.08)]} castShadow>
          <boxGeometry args={[0.12, DOOR_H, 0.18]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={4} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_H, -(BLDG_D / 2 + 0.08)]}>
        <boxGeometry args={[DOOR_W, 0.12, 0.18]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={4} />
      </mesh>

      {/* sign — fixed to front face, facing outward (rotation [0,PI,0]);
           canvas below y≈462 is alpha=0 so the door gap renders transparent */}
      {texture && (
        <mesh position={[0, HH, -(BLDG_D / 2 + 0.01)]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[BLDG_W, BLDG_H]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.08} />
        </mesh>
      )}

      {/* interior ambient so you can see inside through the door */}
      <pointLight position={[0, DOOR_H * 0.6, 1.5]} color={accent} intensity={3} distance={10} decay={2} />

      {/* door glow */}
      <pointLight position={[0, DOOR_H * 0.55, -(BLDG_D / 2 + 1.5)]} color={accent} intensity={9} distance={16} decay={2} />
    </group>
  );
}

export function ProjectBuildings({
  carRef,
  onEnter,
}: {
  carRef: React.RefObject<THREE.Group>;
  onEnter: (p: Project, tp: [number, number]) => void;
}) {
  return (
    <>
      {projects.map((p, i) => (
        <Building
          key={p.id}
          project={p}
          cfg={BLDG_CONFIGS[i]}
          accent={ACCENTS[i]}
          base={BASES[i]}
          carRef={carRef}
          onEnter={onEnter}
        />
      ))}
    </>
  );
}
