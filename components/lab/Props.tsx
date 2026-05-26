"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sampleH } from "./terrain";

/* ─── shared physics ──────────────────────────────────────────── */
type Body = { pos: THREE.Vector3; vel: THREE.Vector3; rotY: number; rotVelY: number };

function stepBody(b: Body, dt: number, groundOffset: number) {
  b.vel.x *= 0.90;
  b.vel.z *= 0.90;
  b.rotVelY *= 0.85;
  b.pos.x += b.vel.x * dt;
  b.pos.z += b.vel.z * dt;
  b.rotY  += b.rotVelY * dt;
  b.pos.y  = sampleH(b.pos.x, b.pos.z) + groundOffset;
}

function carPush(b: Body, carPos: THREE.Vector3, carSpeed: number, bodyR: number, dt: number) {
  const dx = b.pos.x - carPos.x;
  const dz = b.pos.z - carPos.z;
  const d2 = dx * dx + dz * dz;
  const minD = bodyR + 1.05;
  if (d2 < minD * minD && d2 > 0.0001) {
    const d  = Math.sqrt(d2);
    const nx = dx / d, nz = dz / d;
    const imp = Math.min(6, (minD - d) * 1.1 + Math.abs(carSpeed) * 0.12);
    b.vel.x += nx * imp;
    b.vel.z += nz * imp;
    b.rotVelY += (Math.random() - 0.5) * imp * 2.5;
  }
}

/* prevents two bodies from overlapping */
function bodyPush(a: Body, b: Body, minDist: number) {
  const dx = b.pos.x - a.pos.x;
  const dz = b.pos.z - a.pos.z;
  const d2 = dx * dx + dz * dz;
  if (d2 < minDist * minDist && d2 > 0.0001) {
    const d       = Math.sqrt(d2);
    const nx      = dx / d, nz = dz / d;
    const overlap = minDist - d;
    const imp     = overlap * 0.5;
    a.vel.x -= nx * imp;  a.vel.z -= nz * imp;
    b.vel.x += nx * imp;  b.vel.z += nz * imp;
    const half = overlap * 0.5;
    a.pos.x -= nx * half; a.pos.z -= nz * half;
    b.pos.x += nx * half; b.pos.z += nz * half;
  }
}

/* ─── key letter texture ──────────────────────────────────────── */
function makeKeyTex(label: string): THREE.CanvasTexture | null {
  if (typeof window === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#9ba0a8";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#eef0f2";
  ctx.font = "bold 148px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 138);
  return new THREE.CanvasTexture(c);
}

/* ─── key sizes — stepped box (solid, no hollow look) ─────────── */
const KSZ     = 2.7;   // base footprint
const KSZ_CAP = 2.2;   // cap footprint (narrower than base → stepped ledge)
const KH_BASE = 0.50;  // lower base/stem height
const KH_CAP  = 1.30;  // upper keycap height
const KH      = KH_BASE + KH_CAP; // total height = 1.80

/* ─── KeyVisual: solid stepped-box keycap ────────────────────── */
function KeyVisual({
  label,
  groupRef,
}: {
  label: string;
  groupRef: (r: THREE.Group | null) => void;
}) {
  const letterTex = useMemo(() => makeKeyTex(label), [label]);

  /* y-positions relative to group centre (y=0 = mid-height of key) */
  const baseY = -KH / 2 + KH_BASE / 2;
  const capY  = -KH / 2 + KH_BASE + KH_CAP / 2;

  return (
    <group ref={groupRef}>
      {/* base plate — darker, full width */}
      <mesh position={[0, baseY, 0]} castShadow receiveShadow>
        <boxGeometry args={[KSZ, KH_BASE, KSZ]} />
        <meshStandardMaterial color="#767c86" roughness={0.60} />
      </mesh>
      {/* keycap body — lighter, slightly narrower → stepped ledge look */}
      <mesh position={[0, capY, 0]} castShadow receiveShadow>
        <boxGeometry args={[KSZ_CAP, KH_CAP, KSZ_CAP]} />
        <meshStandardMaterial color="#9ba0a8" roughness={0.42} metalness={0.06} />
      </mesh>
      {/* letter printed on top */}
      <mesh position={[0, KH / 2 + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KSZ_CAP * 0.78, KSZ_CAP * 0.78]} />
        {letterTex
          ? <meshStandardMaterial map={letterTex} roughness={0.3} />
          : <meshStandardMaterial color="#9ba0a8" roughness={0.3} />}
      </mesh>
    </group>
  );
}

/*
 * Key layout — oriented so the view makes visual sense from the initial
 * camera angle (camera at z≈-30 looking +Z, where +X appears on LEFT):
 *   W = back (higher z → appears at top in perspective)
 *   A = right in world (+X) → appears LEFT on screen
 *   S = centre
 *   D = left in world  (-X) → appears RIGHT on screen
 */
const KEY_STEP = KSZ + 0.42;
const KEY_DEFS = [
  { label: "W", ox: 0,          oz: +KEY_STEP },
  { label: "A", ox: +KEY_STEP,  oz: 0 },
  { label: "S", ox: 0,          oz: 0 },
  { label: "D", ox: -KEY_STEP,  oz: 0 },
];

/* ─── WASDKeys: centralised physics + key-to-key collision ───── */
export function WASDKeys({
  groupCenter, carRef, speedRef,
}: {
  groupCenter: [number, number, number];
  carRef: React.RefObject<THREE.Group>;
  speedRef: React.RefObject<number>;
}) {
  const bodies = useRef<Body[]>(
    KEY_DEFS.map(({ ox, oz }) => ({
      pos: new THREE.Vector3(groupCenter[0] + ox, groupCenter[1], groupCenter[2] + oz),
      vel: new THREE.Vector3(),
      rotY: 0, rotVelY: 0,
    }))
  );
  const groupRefs = useRef<(THREE.Group | null)[]>([null, null, null, null]);

  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
    const car = carRef.current;
    if (!car) return;
    const bs = bodies.current;

    for (const b of bs) carPush(b, car.position, speedRef.current ?? 0, KSZ * 0.55, dt);
    for (let i = 0; i < bs.length; i++)
      for (let j = i + 1; j < bs.length; j++)
        bodyPush(bs[i], bs[j], KSZ + 0.18);
    for (const b of bs) stepBody(b, dt, KH / 2 + 0.02);

    for (let i = 0; i < bs.length; i++) {
      const g = groupRefs.current[i];
      if (g) { g.position.copy(bs[i].pos); g.rotation.y = bs[i].rotY; }
    }
  });

  return (
    <>
      {KEY_DEFS.map(({ label }, i) => (
        <KeyVisual
          key={label}
          label={label}
          groupRef={r => { groupRefs.current[i] = r; }}
        />
      ))}
    </>
  );
}

/* ─── Mouse ───────────────────────────────────────────────────── */
const MOUSE_W = 2.6;
const MOUSE_D = 4.2;
const MOUSE_H = 1.5;

/* anchor on the LEFT wall (mouse lives at negative X) */
const CABLE_ANCHOR: [number, number, number] = [-44, 0, 8];
const CABLE_PTS = 32;

export function Mouse3D({
  initPos, carRef, speedRef, carBumpRef,
}: {
  initPos: [number, number, number];
  carRef: React.RefObject<THREE.Group>;
  speedRef: React.RefObject<number>;
  carBumpRef: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const body = useRef<Body>({
    pos: new THREE.Vector3(...initPos),
    vel: new THREE.Vector3(),
    rotY: 0, rotVelY: 0,
  });

  const cableGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(CABLE_PTS * 3), 3));
    return geo;
  }, []);

  const cableLine = useMemo(
    () => new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: "#666", linewidth: 2 })),
    [cableGeo]
  );

  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
    const car = carRef.current;
    if (!car) return;

    carPush(body.current, car.position, speedRef.current ?? 0, MOUSE_W * 0.55, dt);
    stepBody(body.current, dt, MOUSE_H / 2 + 0.05);

    const g = groupRef.current;
    if (g) { g.position.copy(body.current.pos); g.rotation.y = body.current.rotY; }

    /* cable path */
    const posArr = cableGeo.attributes.position as THREE.BufferAttribute;
    const start  = body.current.pos;
    const end    = new THREE.Vector3(...CABLE_ANCHOR);
    const dist   = start.distanceTo(end);
    for (let i = 0; i < CABLE_PTS; i++) {
      const t   = i / (CABLE_PTS - 1);
      const px  = start.x + (end.x - start.x) * t;
      const pz  = start.z + (end.z - start.z) * t;
      const sag = Math.sin(t * Math.PI) * Math.min(dist * 0.09, 2.5);
      posArr.setXYZ(i, px, sampleH(px, pz) + 0.1 - sag, pz);
    }
    posArr.needsUpdate = true;
    cableGeo.computeBoundingBox();

    /* cable bump */
    const carX = car.position.x, carZ = car.position.z;
    for (let i = 0; i < CABLE_PTS - 1; i++) {
      const t  = i / (CABLE_PTS - 1);
      const px = start.x + (end.x - start.x) * t;
      const pz = start.z + (end.z - start.z) * t;
      const dx = carX - px, dz = carZ - pz;
      if (dx * dx + dz * dz < 0.55) {
        carBumpRef.current = Math.max(carBumpRef.current, 0.38);
        break;
      }
    }
  });

  const C  = "#d0d0d4";
  const CT = "#d8d8dc";

  return (
    <>
      <primitive object={cableLine} />

      <group ref={groupRef}>
        <RoundedBox
          args={[MOUSE_W, MOUSE_H, MOUSE_D]}
          radius={0.46}
          smoothness={6}
          position={[0, MOUSE_H / 2, 0]}
          castShadow receiveShadow
        >
          <meshStandardMaterial color={C} roughness={0.28} metalness={0.04} />
        </RoundedBox>

        {/* button panel on top front half */}
        <RoundedBox
          args={[MOUSE_W - 0.08, 0.12, MOUSE_D * 0.50]}
          radius={0.05}
          smoothness={3}
          position={[0, MOUSE_H + 0.02, -MOUSE_D * 0.08]}
        >
          <meshStandardMaterial color={CT} roughness={0.22} />
        </RoundedBox>

        {/* centre seam */}
        <mesh position={[0, MOUSE_H + 0.03, -MOUSE_D * 0.08]}>
          <boxGeometry args={[0.055, 0.14, MOUSE_D * 0.48]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>

        {/* scroll wheel */}
        <mesh position={[0, MOUSE_H * 0.88, -0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.38, 16]} />
          <meshStandardMaterial color="#505050" roughness={0.72} />
        </mesh>

        {/* cable port at back */}
        <mesh position={[0, MOUSE_H * 0.28, MOUSE_D * 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.22, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
      </group>
    </>
  );
}
