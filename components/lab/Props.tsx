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

/* push two bodies apart — prevents keys from overlapping */
function bodyPush(a: Body, b: Body, minDist: number) {
  const dx = b.pos.x - a.pos.x;
  const dz = b.pos.z - a.pos.z;
  const d2 = dx * dx + dz * dz;
  if (d2 < minDist * minDist && d2 > 0.0001) {
    const d       = Math.sqrt(d2);
    const nx      = dx / d, nz = dz / d;
    const overlap = minDist - d;
    /* velocity impulse */
    const imp = overlap * 0.5;
    a.vel.x -= nx * imp;  a.vel.z -= nz * imp;
    b.vel.x += nx * imp;  b.vel.z += nz * imp;
    /* positional correction so overlap resolves immediately */
    const half = overlap * 0.5;
    a.pos.x -= nx * half; a.pos.z -= nz * half;
    b.pos.x += nx * half; b.pos.z += nz * half;
  }
}

/* ─── frustum (truncated-pyramid) keycap geometry ─────────────── */
function makeFrustumGeo(bw: number, bd: number, tw: number, td: number, h: number) {
  const hh = h / 2;
  const P: [number, number, number][] = [
    [-bw/2, -hh, -bd/2], // 0 bottom front-left
    [ bw/2, -hh, -bd/2], // 1 bottom front-right
    [ bw/2, -hh,  bd/2], // 2 bottom back-right
    [-bw/2, -hh,  bd/2], // 3 bottom back-left
    [-tw/2,  hh, -td/2], // 4 top front-left
    [ tw/2,  hh, -td/2], // 5 top front-right
    [ tw/2,  hh,  td/2], // 6 top back-right
    [-tw/2,  hh,  td/2], // 7 top back-left
  ];
  /* each face = 4 unique verts → sharp edges on render */
  const faces: [number,number,number,number][] = [
    [0,3,2,1], // bottom  (-Y outward)
    [4,5,6,7], // top     (+Y outward)
    [0,1,5,4], // front   (-Z outward)
    [2,3,7,6], // back    (+Z outward)
    [3,0,4,7], // left    (-X outward)
    [1,2,6,5], // right   (+X outward)
  ];
  const verts: number[] = [];
  const idxs:  number[] = [];
  let vi = 0;
  for (const [a,b,c,d] of faces) {
    verts.push(...P[a], ...P[b], ...P[c], ...P[d]);
    idxs.push(vi, vi+1, vi+2,  vi, vi+2, vi+3);
    vi += 4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
  geo.setIndex(idxs);
  geo.computeVertexNormals();
  return geo;
}

/* ─── key letter texture ──────────────────────────────────────── */
function makeKeyTex(label: string): THREE.CanvasTexture | null {
  if (typeof window === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const ctx = c.getContext("2d")!;
  /* match the keycap body colour exactly so no edge seam */
  ctx.fillStyle = "#9ba0a8";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#e8ecf0";
  ctx.font = "bold 152px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 138);
  return new THREE.CanvasTexture(c);
}

/* ─── key sizes ───────────────────────────────────────────────── */
const KSZ     = 3.5;   // base footprint
const KSZ_TOP = 2.9;   // top face (smaller → frustum taper)
const KH      = 3.2;   // total height — tall & chunky

/* ─── KeyVisual: pure mesh, no physics ───────────────────────── */
function KeyVisual({
  label,
  groupRef,
}: {
  label: string;
  groupRef: (r: THREE.Group | null) => void;
}) {
  const frustumGeo = useMemo(
    () => makeFrustumGeo(KSZ, KSZ, KSZ_TOP, KSZ_TOP, KH),
    []
  );
  const letterTex = useMemo(() => makeKeyTex(label), [label]);

  return (
    <group ref={groupRef}>
      {/* frustum keycap body */}
      <mesh geometry={frustumGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#9ba0a8" roughness={0.42} metalness={0.06} />
      </mesh>
      {/* letter printed on top face */}
      <mesh position={[0, KH / 2 + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[KSZ_TOP * 0.78, KSZ_TOP * 0.78]} />
        {letterTex
          ? <meshStandardMaterial map={letterTex} roughness={0.3} />
          : <meshStandardMaterial color="#9ba0a8" roughness={0.3} />}
      </mesh>
    </group>
  );
}

/* key layout */
const KEY_STEP = KSZ + 0.45;
const KEY_DEFS = [
  { label: "W", ox: 0,         oz: -KEY_STEP },
  { label: "A", ox: -KEY_STEP, oz: 0 },
  { label: "S", ox: 0,         oz: 0 },
  { label: "D", ox: KEY_STEP,  oz: 0 },
];

/* ─── WASDKeys: centralised physics so keys push each other ───── */
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

    /* car → each key */
    for (const b of bs) carPush(b, car.position, speedRef.current ?? 0, KSZ * 0.55, dt);

    /* key ↔ key separation (prevents overlapping) */
    for (let i = 0; i < bs.length; i++)
      for (let j = i + 1; j < bs.length; j++)
        bodyPush(bs[i], bs[j], KSZ + 0.18);

    /* integrate */
    for (const b of bs) stepBody(b, dt, KH / 2 + 0.02);

    /* sync meshes */
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
const CABLE_ANCHOR: [number, number, number] = [44, 0, 8];
const CABLE_PTS = 32;

export function Mouse3D({
  initPos, carRef, speedRef, carBumpRef,
}: {
  initPos: [number, number, number];
  carRef: React.RefObject<THREE.Group>;
  speedRef: React.RefObject<number>;
  carBumpRef: React.RefObject<number>;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
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

    /* cable bump detection */
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

  const C  = "#d0d0d4"; // body light grey
  const CT = "#d8d8dc"; // button top slightly lighter

  return (
    <>
      <primitive object={cableLine} />

      <group ref={groupRef}>
        {/* rounded main body — smooth organic shell */}
        <RoundedBox
          args={[MOUSE_W, MOUSE_H, MOUSE_D]}
          radius={0.46}
          smoothness={6}
          position={[0, MOUSE_H / 2, 0]}
          castShadow receiveShadow
        >
          <meshStandardMaterial color={C} roughness={0.28} metalness={0.04} />
        </RoundedBox>

        {/* left + right button panel (top, front half) */}
        <RoundedBox
          args={[MOUSE_W - 0.08, 0.12, MOUSE_D * 0.50]}
          radius={0.05}
          smoothness={3}
          position={[0, MOUSE_H + 0.02, -MOUSE_D * 0.08]}
        >
          <meshStandardMaterial color={CT} roughness={0.22} />
        </RoundedBox>

        {/* centre seam between L/R buttons */}
        <mesh position={[0, MOUSE_H + 0.03, -MOUSE_D * 0.08]}>
          <boxGeometry args={[0.055, 0.14, MOUSE_D * 0.48]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>

        {/* scroll wheel */}
        <mesh
          position={[0, MOUSE_H * 0.88, -0.12]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.24, 0.24, 0.38, 16]} />
          <meshStandardMaterial color="#505050" roughness={0.72} />
        </mesh>

        {/* cable port at back */}
        <mesh
          position={[0, MOUSE_H * 0.28, MOUSE_D * 0.48]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.13, 0.13, 0.22, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
        </mesh>
      </group>
    </>
  );
}
