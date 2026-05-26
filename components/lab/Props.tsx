"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
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

function carPush(
  b: Body,
  carPos: THREE.Vector3,
  carSpeed: number,
  bodyR: number,
  dt: number,
) {
  const dx = b.pos.x - carPos.x;
  const dz = b.pos.z - carPos.z;
  const d2 = dx * dx + dz * dz;
  const minD = bodyR + 1.05;                       // 1.05 ≈ car half-size
  if (d2 < minD * minD && d2 > 0.0001) {
    const d = Math.sqrt(d2);
    const nx = dx / d, nz = dz / d;
    const imp = Math.min(6, (minD - d) * 1.1 + Math.abs(carSpeed) * 0.12);
    b.vel.x += nx * imp;
    b.vel.z += nz * imp;
    b.rotVelY += (Math.random() - 0.5) * imp * 2.5;
  }
}

/* ─── key canvas textures ─────────────────────────────────────── */
function makeKeyTex(label: string): THREE.CanvasTexture | null {
  if (typeof window === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const ctx = c.getContext("2d")!;
  /* base */
  ctx.fillStyle = "#5a5a5a";
  ctx.fillRect(0, 0, 128, 128);
  /* top bevel highlight */
  ctx.fillStyle = "#767676";
  ctx.fillRect(0, 0, 128, 6);
  ctx.fillRect(0, 0, 6, 128);
  /* bottom bevel shadow */
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(122, 0, 6, 128);
  ctx.fillRect(0, 122, 128, 6);
  /* keycap surface */
  ctx.fillStyle = "#b8b8b8";
  ctx.fillRect(8, 8, 112, 112);
  /* letter */
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 68px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 64, 66);
  return new THREE.CanvasTexture(c);
}

/* ─── Single key ──────────────────────────────────────────────── */
const KSZ = 2.4;   // key footprint
const KH  = 0.70;  // key height

function Key({
  label, initPos, carRef, speedRef,
}: {
  label: string;
  initPos: [number, number, number];
  carRef: React.RefObject<THREE.Group>;
  speedRef: React.RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const body = useRef<Body>({
    pos: new THREE.Vector3(...initPos),
    vel: new THREE.Vector3(),
    rotY: 0, rotVelY: 0,
  });
  const sideTex = useMemo(() => makeKeyTex(label), [label]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const car = carRef.current;
    if (!car) return;
    carPush(body.current, car.position, speedRef.current ?? 0, KSZ * 0.6, dt);
    stepBody(body.current, dt, KH / 2 + 0.02);
    const g = groupRef.current;
    if (g) { g.position.copy(body.current.pos); g.rotation.y = body.current.rotY; }
  });

  return (
    <group ref={groupRef}>
      {/* main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[KSZ, KH * 0.55, KSZ]} />
        <meshStandardMaterial color="#444" roughness={0.7} metalness={0.25} />
      </mesh>
      {/* keycap (slightly smaller, on top) */}
      <mesh position={[0, KH * 0.25, 0]} castShadow>
        <boxGeometry args={[KSZ - 0.2, KH * 0.5, KSZ - 0.2]} />
        {sideTex
          ? <meshStandardMaterial map={sideTex} roughness={0.55} />
          : <meshStandardMaterial color="#b0b0b0" roughness={0.55} />}
      </mesh>
    </group>
  );
}

/* Key layout (W on top, A S D below) */
const KEY_STEP = KSZ + 0.32;
const KEY_DEFS: { label: string; ox: number; oz: number }[] = [
  { label: "W", ox: 0,         oz: -KEY_STEP },
  { label: "A", ox: -KEY_STEP, oz: 0 },
  { label: "S", ox: 0,         oz: 0 },
  { label: "D", ox: KEY_STEP,  oz: 0 },
];

export function WASDKeys({
  groupCenter, carRef, speedRef,
}: {
  groupCenter: [number, number, number];
  carRef: React.RefObject<THREE.Group>;
  speedRef: React.RefObject<number>;
}) {
  return (
    <>
      {KEY_DEFS.map(({ label, ox, oz }) => (
        <Key
          key={label}
          label={label}
          initPos={[groupCenter[0] + ox, groupCenter[1], groupCenter[2] + oz]}
          carRef={carRef}
          speedRef={speedRef}
        />
      ))}
    </>
  );
}

/* ─── Mouse ───────────────────────────────────────────────────── */
const MOUSE_W = 2.2, MOUSE_D = 3.2, MOUSE_H = 1.1;
const CABLE_ANCHOR: [number, number, number] = [44, 0, 8]; // fixed wall anchor
const CABLE_PTS = 28;

export function Mouse3D({
  initPos, carRef, speedRef, carBumpRef,
}: {
  initPos: [number, number, number];
  carRef: React.RefObject<THREE.Group>;
  speedRef: React.RefObject<number>;
  carBumpRef: React.RefObject<number>;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const cableRef  = useRef<THREE.Line>(null!);
  const body = useRef<Body>({
    pos: new THREE.Vector3(...initPos),
    vel: new THREE.Vector3(),
    rotY: 0, rotVelY: 0,
  });

  /* cable geometry */
  const cableGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pts = new Float32Array(CABLE_PTS * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    return geo;
  }, []);

  /* cable bump: sample 20 pts along the cable each frame */
  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
    const car = carRef.current;
    if (!car) return;

    carPush(body.current, car.position, speedRef.current ?? 0, MOUSE_W * 0.55, dt);
    stepBody(body.current, dt, MOUSE_H / 2 + 0.02);

    const g = groupRef.current;
    if (g) { g.position.copy(body.current.pos); g.rotation.y = body.current.rotY; }

    /* update cable geometry */
    const posArr = cableGeo.attributes.position as THREE.BufferAttribute;
    const start = body.current.pos;
    const end = new THREE.Vector3(...CABLE_ANCHOR);
    for (let i = 0; i < CABLE_PTS; i++) {
      const t   = i / (CABLE_PTS - 1);
      const px  = start.x + (end.x - start.x) * t;
      const pz  = start.z + (end.z - start.z) * t;
      /* catenary-like sag */
      const sag = Math.sin(t * Math.PI) * -0.5;
      const py  = sampleH(px, pz) + 0.08 + sag;
      posArr.setXYZ(i, px, py, pz);
    }
    posArr.needsUpdate = true;
    cableGeo.computeBoundingBox();

    /* cable bump: check car proximity to any cable segment */
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

  const C = "#9a9a9a"; // mouse body grey

  return (
    <>
      {/* cable line */}
      <primitive
        object={new THREE.Line(
          cableGeo,
          new THREE.LineBasicMaterial({ color: "#555", linewidth: 2 })
        )}
        ref={cableRef}
      />

      <group ref={groupRef}>
        {/* main body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[MOUSE_W, MOUSE_H * 0.6, MOUSE_D]} />
          <meshStandardMaterial color={C} roughness={0.55} metalness={0.15} />
        </mesh>
        {/* top dome (slightly raised at front) */}
        <mesh position={[0, MOUSE_H * 0.22, -0.1]} castShadow>
          <boxGeometry args={[MOUSE_W - 0.3, MOUSE_H * 0.52, MOUSE_D - 0.5]} />
          <meshStandardMaterial color="#a8a8a8" roughness={0.45} />
        </mesh>
        {/* left button */}
        <mesh position={[-0.52, MOUSE_H * 0.44, -0.2]}>
          <boxGeometry args={[0.85, 0.10, MOUSE_D * 0.55]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.4} />
        </mesh>
        {/* right button */}
        <mesh position={[0.52, MOUSE_H * 0.44, -0.2]}>
          <boxGeometry args={[0.85, 0.10, MOUSE_D * 0.55]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.4} />
        </mesh>
        {/* scroll wheel */}
        <mesh position={[0, MOUSE_H * 0.5, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.28, 10]} />
          <meshStandardMaterial color="#404040" roughness={0.8} />
        </mesh>
        {/* button divider seam */}
        <mesh position={[0, MOUSE_H * 0.44, -0.2]}>
          <boxGeometry args={[0.05, 0.12, MOUSE_D * 0.55]} />
          <meshStandardMaterial color="#666" roughness={0.6} />
        </mesh>
        {/* cable port at back */}
        <mesh position={[0, MOUSE_H * 0.08, MOUSE_D * 0.5 + 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 7]} />
          <meshStandardMaterial color="#333" roughness={0.7} />
        </mesh>
      </group>
    </>
  );
}
