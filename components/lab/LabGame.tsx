"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { sampleH, WORLD, HALF } from "./terrain";
import { InfoPoster } from "./Poster";
import { WASDKeys, Mouse3D } from "./Props";
import { ProjectBuildings, BLDG_CONFIGS, BLDG_W, BLDG_D, DOOR_W, BLDG_WT } from "./ProjectBuildings";
import { Project } from "../../data/projects";

/* ─── palette ─────────────────────────────────────────────────── */
const C_BODY  = "#3ecf6a";
const C_DARK  = "#0f2211";
const C_WHEEL = "#181818";
const C_RIM   = "#888888";
const C_GLASS = "#cce8ff";

/* ─── physics ──────────────────────────────────────────────────── */
const ACCEL       = 38;
const BRAKE       = 22;
const FRIC        = 0.92;
const BOOST_ACCEL = 60;
const BOOST_FRIC  = 0.96;
const MAX_SPD     = 48;
const BOOST_MAX   = 55;
const STEER       = 2.6;
const GRAVITY     = -22;
const SMOKE_N     = 60;
const FIRE_N      = 100;
const DARK_N      = 40;

function buildGround() {
  const g = new THREE.PlaneGeometry(WORLD, WORLD, 60, 60);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, sampleH(p.getX(i), p.getZ(i)));

  /* vertex colours: flat white → warm sand → stone grey → dark rock */
  const flatC  = new THREE.Color("#eceae0");
  const sandC  = new THREE.Color("#c8b680");
  const stoneC = new THREE.Color("#998870");
  const rockC  = new THREE.Color("#6a5c50");
  const cols   = new Float32Array(p.count * 3);
  const tmp    = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const h = p.getY(i);
    if      (h < 0.12) { tmp.copy(flatC); }
    else if (h < 0.8)  { tmp.lerpColors(flatC,  sandC,  (h - 0.12) / 0.68); }
    else if (h < 2.2)  { tmp.lerpColors(sandC,  stoneC, (h - 0.8)  / 1.4);  }
    else               { tmp.lerpColors(stoneC, rockC,  Math.min(1, (h - 2.2) / 1.2)); }
    cols[i * 3]     = tmp.r;
    cols[i * 3 + 1] = tmp.g;
    cols[i * 3 + 2] = tmp.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return g;
}

/* ─── keyboard ────────────────────────────────────────────────── */
function useKeys() {
  const k = useRef<Record<string, boolean>>({ w: false, a: false, s: false, d: false });
  useEffect(() => {
    const W = new Set(["w", "a", "s", "d", " "]);
    const dn = (e: KeyboardEvent) => {
      const c = e.key.toLowerCase();
      if (W.has(c)) { e.preventDefault(); (k.current as Record<string, boolean>)[c] = true; }
    };
    const up = (e: KeyboardEvent) => {
      const c = e.key.toLowerCase();
      if (W.has(c)) (k.current as Record<string, boolean>)[c] = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);
  return k;
}

/* ─── City roads / paths ──────────────────────────────────────── */
function Roads() {
  return (
    <>
      {/* N-S spine — flat plane with polygonOffset to sit cleanly above terrain */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, WORLD]} />
        <meshStandardMaterial color="#ccc4ae" roughness={0.93} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
      {/* E-W connector at z=15 */}
      <mesh position={[0, 0.005, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD - 10, 8]} />
        <meshStandardMaterial color="#ccc4ae" roughness={0.93} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
      {/* E-W connector at z=35 */}
      <mesh position={[0, 0.005, 35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD - 10, 8]} />
        <meshStandardMaterial color="#ccc4ae" roughness={0.93} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
    </>
  );
}

/* ─── Ground ──────────────────────────────────────────────────── */
function Ground() {
  const geo = useMemo(buildGround, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} />
    </mesh>
  );
}

/* ─── Boundary walls (thin curbs mark the play area) ─────────── */
function Boundary() {
  const H = HALF + 0.25;
  const walls: { pos: [number, number, number]; sz: [number, number, number] }[] = [
    { pos: [0, 0.4, -H],  sz: [WORLD + 0.5, 0.8, 0.5] },
    { pos: [0, 0.4,  H],  sz: [WORLD + 0.5, 0.8, 0.5] },
    { pos: [-H, 0.4, 0],  sz: [0.5, 0.8, WORLD + 0.5] },
    { pos: [ H, 0.4, 0],  sz: [0.5, 0.8, WORLD + 0.5] },
  ];
  return (
    <>
      {walls.map((w, i) => (
        <mesh key={i} position={w.pos} receiveShadow castShadow>
          <boxGeometry args={w.sz} />
          <meshStandardMaterial color="#c4c4bc" roughness={0.88} />
        </mesh>
      ))}
    </>
  );
}

/* ─── Ground pebbles — three colour groups ────────────────────── */
const PEBBLE_DEFS = [
  { count: 110, seed: 1337, color: "#aaaaaa", emissive: "#000000", emissiveIntensity: 0 },
  { count:  55, seed: 5531, color: "#1e1e1e", emissive: "#000000", emissiveIntensity: 0 },
  { count:  40, seed: 9173, color: "#3ecf6a", emissive: "#3ecf6a", emissiveIntensity: 0.55 },
] as const;

function PebbleGroup({ count, seed, color, emissive, emissiveIntensity }: typeof PEBBLE_DEFS[number]) {
  const ref = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const M = new THREE.Matrix4();
    const Q = new THREE.Quaternion();
    const S = new THREE.Vector3();
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

    for (let i = 0; i < count; i++) {
      const x  = (rand() - 0.5) * (WORLD - 6);
      const z  = (rand() - 0.5) * (WORLD - 6);
      const y  = sampleH(x, z) + 0.05;
      const sx = 0.10 + rand() * 0.18;
      const sz = 0.08 + rand() * 0.16;
      const sy = 0.07 + rand() * 0.09;   // tall enough to survive near-clip
      Q.setFromEuler(new THREE.Euler(0, rand() * Math.PI * 2, 0));
      S.set(sx, sy, sz);
      M.compose(new THREE.Vector3(x, y, z), Q, S);
      mesh.setMatrixAt(i, M);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, seed]);

  return (
    /* frustumCulled={false}: Three.js uses the base-geo bounding sphere for InstancedMesh
       frustum culling — it incorrectly hides instances when the camera zooms in close.
       Disabling it keeps all pebbles visible at any zoom level. */
    <instancedMesh ref={ref} args={[undefined, undefined, count]} receiveShadow frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.9} />
    </instancedMesh>
  );
}

function Pebbles() {
  return <>{PEBBLE_DEFS.map((d, i) => <PebbleGroup key={i} {...d} />)}</>;
}

/* ─── Jeep ────────────────────────────────────────────────────── */
const WHEEL_POS: [number, number, number][] = [
  [-0.62, 0, 0.72], [0.62, 0, 0.72],
  [-0.62, 0, -0.72], [0.62, 0, -0.72],
];

function Jeep({ outer }: { outer: React.RefObject<THREE.Group> }) {
  return (
    <group ref={outer as React.RefObject<THREE.Group>}>
      <group scale={0.88}>
        {/* body */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[1.4, 0.42, 2.2]} />
          <meshStandardMaterial color={C_BODY} roughness={0.48} metalness={0.18} />
        </mesh>
        {/* cabin */}
        <mesh position={[0, 0.80, -0.06]} castShadow>
          <boxGeometry args={[1.22, 0.50, 1.28]} />
          <meshStandardMaterial color={C_DARK} roughness={0.72} />
        </mesh>
        {/* windshield */}
        <mesh position={[0, 0.78, 0.65]} rotation={[-0.22, 0, 0]}>
          <boxGeometry args={[1.16, 0.40, 0.04]} />
          <meshStandardMaterial color={C_GLASS} transparent opacity={0.55} roughness={0.05} />
        </mesh>
        {/* rear window */}
        <mesh position={[0, 0.77, -0.70]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[1.14, 0.36, 0.04]} />
          <meshStandardMaterial color={C_GLASS} transparent opacity={0.45} roughness={0.05} />
        </mesh>
        {/* headlights */}
        {([-0.42, 0.42] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0.40, 1.12]}>
            <boxGeometry args={[0.26, 0.15, 0.04]} />
            <meshStandardMaterial color="#fffff8" emissive="#fffde0" emissiveIntensity={2.0} />
          </mesh>
        ))}
        {/* tail lights */}
        {([-0.42, 0.42] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0.40, -1.12]}>
            <boxGeometry args={[0.22, 0.13, 0.04]} />
            <meshStandardMaterial color="#ff1800" emissive="#ff1800" emissiveIntensity={1.2} />
          </mesh>
        ))}
        {/* exhaust */}
        <mesh position={[-0.38, 0.18, -1.16]} rotation={[Math.PI / 2, 0, 0.06]}>
          <cylinderGeometry args={[0.045, 0.055, 0.26, 6]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* wheels */}
        {WHEEL_POS.map((pos, i) => (
          <group key={i} position={pos}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.28, 0.28, 0.24, 12]} />
              <meshStandardMaterial color={C_WHEEL} roughness={0.95} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 0.26, 8]} />
              <meshStandardMaterial color={C_RIM} metalness={0.65} roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ─── Black exhaust smoke ─────────────────────────────────────── */
type Puff = { pos: THREE.Vector3; vel: THREE.Vector3; life: number; max: number; on: boolean };

function Smoke({
  carRef, speedRef,
}: { carRef: React.RefObject<THREE.Group>; speedRef: React.RefObject<number> }) {
  const mesh  = useRef<THREE.InstancedMesh>(null!);
  const puffs = useRef<Puff[]>(
    Array.from({ length: SMOKE_N }, () => ({
      pos: new THREE.Vector3(), vel: new THREE.Vector3(),
      life: 0, max: 1, on: false,
    }))
  );
  const timer      = useRef(0);
  const M          = useMemo(() => new THREE.Matrix4(), []);
  const Q          = useMemo(() => new THREE.Quaternion(), []);
  const S          = useMemo(() => new THREE.Vector3(), []);
  const _HIDE      = useMemo(() => new THREE.Vector3(0, -9999, 0), []);
  const _spawnLoc  = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
    const car = carRef.current;
    const spd = speedRef.current ?? 0;
    if (!car || !mesh.current) return;

    /* spawn a puff whenever moving */
    timer.current -= dt;
    if (Math.abs(spd) > 0.4 && timer.current <= 0) {
      timer.current = 0.045;
      const p = puffs.current.find(p => !p.on);
      if (p) {
        _spawnLoc.set(
          (Math.random() - 0.5) * 0.9,
          0.08 + Math.random() * 0.10,
          -1.0 * 0.88,
        );
        _spawnLoc.applyMatrix4(car.matrixWorld);
        p.pos.copy(_spawnLoc);
        /* push backward along car heading so it trails behind */
        const sY = Math.sin(car.rotation.y), cY = Math.cos(car.rotation.y);
        p.vel.set(
          -sY * (Math.abs(spd) * 0.20) + (Math.random() - 0.5) * 0.5,
          0.25 + Math.random() * 0.35,
          -cY * (Math.abs(spd) * 0.20) + (Math.random() - 0.5) * 0.5,
        );
        p.life = 0;
        p.max  = 2.5 + Math.random() * 1.5;
        p.on   = true;
      }
    }

    /* update every live puff */
    let idx = 0;
    for (const p of puffs.current) {
      if (!p.on) continue;
      p.life += dt;
      if (p.life >= p.max) { p.on = false; continue; }
      p.pos.addScaledVector(p.vel, dt);
      p.vel.y  = Math.max(0, p.vel.y - 0.06 * dt); // settle
      const t  = p.life / p.max;
      const s  = 0.08 + t * 0.75;                  // grow as it ages
      M.compose(p.pos, Q.identity(), S.set(s, s, s));
      mesh.current.setMatrixAt(idx++, M);
    }
    /* hide unused slots underground */
    for (let i = idx; i < SMOKE_N; i++) {
      M.compose(_HIDE, Q.identity(), S.set(0.001, 0.001, 0.001));
      mesh.current.setMatrixAt(i, M);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SMOKE_N]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#111111"
        transparent
        opacity={0.38}
        depthWrite={false}
        roughness={1}
      />
    </instancedMesh>
  );
}

/* ─── Boost fire trail — green flame particles with color fade ── */
type FirePuff = {
  pos: THREE.Vector3; vel: THREE.Vector3;
  life: number; max: number; on: boolean;
  startColor: THREE.Color;
};

function BoostTrail({
  carRef, speedRef, boostRef,
}: { carRef: React.RefObject<THREE.Group>; speedRef: React.RefObject<number>; boostRef: React.RefObject<boolean> }) {
  const fireMesh  = useRef<THREE.InstancedMesh>(null!);
  const darkMesh  = useRef<THREE.InstancedMesh>(null!);

  const firePuffs = useRef<FirePuff[]>(
    Array.from({ length: FIRE_N }, () => ({
      pos: new THREE.Vector3(), vel: new THREE.Vector3(),
      life: 0, max: 1, on: false, startColor: new THREE.Color(),
    }))
  );
  const darkPuffs = useRef<FirePuff[]>(
    Array.from({ length: DARK_N }, () => ({
      pos: new THREE.Vector3(), vel: new THREE.Vector3(),
      life: 0, max: 1, on: false, startColor: new THREE.Color(),
    }))
  );

  const timer      = useRef(0);
  const M          = useMemo(() => new THREE.Matrix4(), []);
  const Q          = useMemo(() => new THREE.Quaternion(), []);
  const S          = useMemo(() => new THREE.Vector3(), []);
  const C          = useMemo(() => new THREE.Color(), []);
  const BLACK      = useMemo(() => new THREE.Color("#020602"), []);
  const DARKGREEN  = useMemo(() => new THREE.Color("#062010"), []);
  const _HIDE      = useMemo(() => new THREE.Vector3(0, -9999, 0), []);
  const _spawnLoc  = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
    const car = carRef.current;
    if (!car || !fireMesh.current || !darkMesh.current) return;

    const on  = boostRef.current;
    const yaw = car.rotation.y;
    const sY  = Math.sin(yaw), cY = Math.cos(yaw);

    if (on) {
      timer.current -= dt;
      if (timer.current <= 0) {
        timer.current = 0.022; // burst every 22 ms

        /* bright fire sparks (8 per burst) */
        for (let k = 0; k < 8; k++) {
          const p = firePuffs.current.find(p => !p.on);
          if (!p) break;
          const ox = (Math.random() - 0.5) * 1.4;
          const oy = 0.04 + Math.random() * 0.22;
          _spawnLoc.set(ox * 0.88, oy * 0.88, -1.08 * 0.88);
          _spawnLoc.applyMatrix4(car.matrixWorld);
          p.pos.copy(_spawnLoc);
          const spd = Math.abs(speedRef.current ?? 0);
          const back = spd * 0.55 + 14;
          p.vel.set(
            -sY * back + (Math.random() - 0.5) * 6,
             (Math.random() - 0.5) * 0.9 + 0.25,
            -cY * back + (Math.random() - 0.5) * 6,
          );
          p.life = 0;
          p.max  = 0.09 + Math.random() * 0.14; // very short — hot sparks die fast
          p.on   = true;
          /* core: white-green or bright lime */
          p.startColor.setHex(Math.random() > 0.4 ? 0x90ffb0 : 0x3ecf6a);
        }

        /* dark smoke plumes (3 per burst) */
        for (let k = 0; k < 3; k++) {
          const p = darkPuffs.current.find(p => !p.on);
          if (!p) break;
          const ox = (Math.random() - 0.5) * 1.6;
          _spawnLoc.set(ox * 0.88, 0.10 * 0.88, -1.18 * 0.88);
          _spawnLoc.applyMatrix4(car.matrixWorld);
          p.pos.copy(_spawnLoc);
          const spd = Math.abs(speedRef.current ?? 0);
          p.vel.set(
            -sY * (spd * 0.35 + 7) + (Math.random() - 0.5) * 3.5,
             (Math.random() - 0.5) * 0.5 + 0.08,
            -cY * (spd * 0.35 + 7) + (Math.random() - 0.5) * 3.5,
          );
          p.life = 0;
          p.max  = 0.28 + Math.random() * 0.22;
          p.on   = true;
          p.startColor.setHex(0x0a2a14); // very dark green
        }
      }
    } else {
      timer.current = 0;
    }

    /* ── update fire sparks ── */
    let idx = 0;
    for (const p of firePuffs.current) {
      if (!p.on) continue;
      p.life += dt;
      if (p.life >= p.max) { p.on = false; continue; }
      p.pos.addScaledVector(p.vel, dt);
      p.vel.multiplyScalar(0.74); // rapid deceleration — sparks snap off
      const t  = p.life / p.max;
      const sz = 0.08 + t * 0.10; // stay small; grows only slightly
      M.compose(p.pos, Q.identity(), S.set(sz, sz, sz));
      fireMesh.current.setMatrixAt(idx, M);
      /* color: start (bright green) → black, accelerated by t² */
      C.lerpColors(p.startColor, BLACK, t * t);
      fireMesh.current.setColorAt(idx, C);
      idx++;
    }
    for (let i = idx; i < FIRE_N; i++) {
      M.compose(_HIDE, Q.identity(), S.set(0.001, 0.001, 0.001));
      fireMesh.current.setMatrixAt(i, M);
    }
    fireMesh.current.instanceMatrix.needsUpdate = true;
    if (fireMesh.current.instanceColor) fireMesh.current.instanceColor.needsUpdate = true;

    /* ── update dark smoke ── */
    idx = 0;
    for (const p of darkPuffs.current) {
      if (!p.on) continue;
      p.life += dt;
      if (p.life >= p.max) { p.on = false; continue; }
      p.pos.addScaledVector(p.vel, dt);
      p.vel.multiplyScalar(0.86);
      const t  = p.life / p.max;
      const sz = 0.12 + t * 0.55;
      M.compose(p.pos, Q.identity(), S.set(sz, sz, sz));
      darkMesh.current.setMatrixAt(idx, M);
      C.lerpColors(DARKGREEN, BLACK, t);
      darkMesh.current.setColorAt(idx, C);
      idx++;
    }
    for (let i = idx; i < DARK_N; i++) {
      M.compose(_HIDE, Q.identity(), S.set(0.001, 0.001, 0.001));
      darkMesh.current.setMatrixAt(i, M);
    }
    darkMesh.current.instanceMatrix.needsUpdate = true;
    if (darkMesh.current.instanceColor) darkMesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      {/* bright fire sparks */}
      <instancedMesh ref={fireMesh} args={[undefined, undefined, FIRE_N]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial vertexColors transparent opacity={0.92} depthWrite={false} />
      </instancedMesh>

      {/* dark smoke body */}
      <instancedMesh ref={darkMesh} args={[undefined, undefined, DARK_N]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial vertexColors transparent opacity={0.78} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

/* ─── Green flicker light behind car during boost ────────────── */
function BoostLight({ carRef, boostRef }: { carRef: React.RefObject<THREE.Group>; boostRef: React.RefObject<boolean> }) {
  const lightRef   = useRef<THREE.PointLight>(null!);
  const _boostLoc  = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!lightRef.current || !carRef.current) return;
    if (!boostRef.current) { lightRef.current.intensity = 0; return; }
    _boostLoc.current.set(0, 0.3, -2.4);
    _boostLoc.current.applyMatrix4(carRef.current.matrixWorld);
    lightRef.current.position.copy(_boostLoc.current);
    lightRef.current.intensity = 10 + Math.random() * 6;
  });

  return <pointLight ref={lightRef} color="#3ecf6a" distance={14} decay={1.8} />;
}

/* ─── Headlights ─────────────────────────────────────────────── */
function Headlights({ carRef }: { carRef: React.RefObject<THREE.Group> }) {
  const lRef = useRef<THREE.SpotLight>(null!);
  const rRef = useRef<THREE.SpotLight>(null!);
  const { scene } = useThree();

  useEffect(() => {
    const l = lRef.current, r = rRef.current;
    if (!l || !r) return;
    scene.add(l.target); scene.add(r.target);
    return () => { scene.remove(l.target); scene.remove(r.target); };
  }, [scene]);

  useFrame(() => {
    const car = carRef.current;
    if (!car || !lRef.current || !rRef.current) return;
    const p = car.position, y = car.rotation.y;
    const sY = Math.sin(y), cY = Math.cos(y);
    const sc = 0.88;
    const fwd = 1.12 * sc, side = 0.42 * sc, ht = 0.45 * sc;

    lRef.current.position.set(p.x + sY * fwd - cY * side, p.y + ht, p.z + cY * fwd + sY * side);
    rRef.current.position.set(p.x + sY * fwd + cY * side, p.y + ht, p.z + cY * fwd - sY * side);

    const tx = p.x + sY * 12, tz = p.z + cY * 12, ty = p.y - 0.1;
    lRef.current.target.position.set(tx, ty, tz); lRef.current.target.updateMatrixWorld();
    rRef.current.target.position.set(tx, ty, tz); rRef.current.target.updateMatrixWorld();
  });

  return (
    <>
      <spotLight ref={lRef} intensity={40} angle={0.40} penumbra={0.55} color="#fffcea" distance={24} decay={1.4} />
      <spotLight ref={rRef} intensity={40} angle={0.40} penumbra={0.55} color="#fffcea" distance={24} decay={1.4} />
    </>
  );
}

/* ─── Mountain warning sign ──────────────────────────────────── */
function MountainWarning({ position }: { position: [number, number, number] }) {
  const texture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const W = 256, H = 256;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;

    ctx.fillStyle = "#f5c518";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, W - 14, H - 14);

    /* left mountain */
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(18, 196); ctx.lineTo(95, 54); ctx.lineTo(172, 196);
    ctx.closePath(); ctx.fill();
    /* right mountain (lighter, overlaps) */
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(88, 196); ctx.lineTo(158, 90); ctx.lineTo(238, 196);
    ctx.closePath(); ctx.fill();
    /* snow caps */
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.moveTo(83, 76); ctx.lineTo(95, 54);  ctx.lineTo(107, 76);  ctx.fill();
    ctx.beginPath(); ctx.moveTo(148, 108); ctx.lineTo(158, 90); ctx.lineTo(168, 108); ctx.fill();

    ctx.fillStyle = "#111";
    ctx.font = "bold 23px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MOUNTAINS", W / 2, 237);

    return new THREE.CanvasTexture(c);
  }, []);

  useEffect(() => () => { texture?.dispose(); }, [texture]);

  return (
    <group position={position}>
      {/* galvanized post */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 5.2, 8]} />
        <meshStandardMaterial color="#8a9898" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* sign face — rotation.y=π/2 → normal faces +X toward road, UVs non-mirrored */}
      {texture && (
        <mesh position={[0, 4.8, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[1.9, 1.9]} />
          <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.55} />
        </mesh>
      )}
    </group>
  );
}

/* ─── Rocks in mountain zone ──────────────────────────────────── */
function MountainRocks() {
  const bigRef   = useRef<THREE.InstancedMesh>(null!);
  const smallRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    const M = new THREE.Matrix4();
    const Q = new THREE.Quaternion();
    const S = new THREE.Vector3();

    /* big boulders */
    let s = 8421;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    let idx = 0;
    for (let tries = 0; tries < 600 && idx < 55; tries++) {
      const x = -(8 + rand() * 34);
      const z = (rand() - 0.5) * 88;
      const h = sampleH(x, z);
      if (h < 0.30) continue;
      const sx = 0.40 + rand() * 0.90;
      const sy = 0.28 + rand() * 0.65;
      const sz = 0.35 + rand() * 0.80;
      Q.setFromEuler(new THREE.Euler(rand() * 0.7, rand() * Math.PI * 2, rand() * 0.6));
      S.set(sx, sy, sz);
      M.compose(new THREE.Vector3(x, h + sy * 0.38, z), Q, S);
      bigRef.current.setMatrixAt(idx++, M);
    }
    bigRef.current.count = idx;
    bigRef.current.instanceMatrix.needsUpdate = true;

    /* small rubble, wider spread */
    s = 3377;
    idx = 0;
    for (let tries = 0; tries < 800 && idx < 120; tries++) {
      const x = -(6 + rand() * 38);
      const z = (rand() - 0.5) * 88;
      const h = sampleH(x, z);
      if (h < 0.08) continue;
      const sc = 0.06 + rand() * 0.22;
      const sy = sc * (0.45 + rand() * 0.7);
      S.set(sc, sy, sc * (0.6 + rand() * 0.55));
      Q.setFromEuler(new THREE.Euler(rand() * 1.4, rand() * Math.PI * 2, rand() * 1.4));
      M.compose(new THREE.Vector3(x, h + sy * 0.45, z), Q, S);
      smallRef.current.setMatrixAt(idx++, M);
    }
    smallRef.current.count = idx;
    smallRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={bigRef} args={[undefined, undefined, 55]} frustumCulled={false} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#78706a" roughness={0.94} metalness={0.04} />
      </instancedMesh>
      <instancedMesh ref={smallRef} args={[undefined, undefined, 120]} frustumCulled={false} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8c8480" roughness={0.92} />
      </instancedMesh>
    </>
  );
}

/* ─── Secret wobbly path to the corner ───────────────────────── */
const SPATH_PTS: [number, number][] = [
  [ 2,  -2],
  [44, -44],
];

function SecretPath() {
  const geo = useMemo(() => {
    const W = 2.4;
    const verts: number[] = [];
    const idx: number[] = [];

    for (let i = 0; i < SPATH_PTS.length; i++) {
      const [x, z] = SPATH_PTS[i];
      let tx: number, tz: number;
      if (i < SPATH_PTS.length - 1) {
        tx = SPATH_PTS[i + 1][0] - x; tz = SPATH_PTS[i + 1][1] - z;
      } else {
        tx = x - SPATH_PTS[i - 1][0]; tz = z - SPATH_PTS[i - 1][1];
      }
      const len = Math.sqrt(tx * tx + tz * tz);
      const nx = -tz / len, nz = tx / len;
      verts.push(x + nx * W / 2, 0.007, z + nz * W / 2);
      verts.push(x - nx * W / 2, 0.007, z - nz * W / 2);
    }
    for (let i = 0; i < SPATH_PTS.length - 1; i++) {
      const b = i * 2;
      idx.push(b, b + 2, b + 1,  b + 1, b + 2, b + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial
        color="#c8c4bc"
        roughness={0.97}
        transparent
        opacity={0.35}
        polygonOffset
        polygonOffsetFactor={-3}
        polygonOffsetUnits={-3}
      />
    </mesh>
  );
}

/* ─── Dog house (secret corner) ──────────────────────────────── */
const DOG_POS: [number, number, number] = [44, 0, -44];
const DOG_TRIGGER_R = 3.5;

function DogHouse({
  carPosRef,
  onEnter,
}: {
  carPosRef: React.MutableRefObject<THREE.Vector3>;
  onEnter: () => void;
}) {
  const enteredRef = useRef(false);

  const signTex = useMemo(() => {
    if (typeof window === "undefined") return null;
    const W = 640, H = 380;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;

    ctx.fillStyle = "#faf4e8";
    ctx.fillRect(0, 0, W, H);

    /* wood grain */
    ctx.strokeStyle = "rgba(145,105,50,0.18)";
    ctx.lineWidth = 1.5;
    for (let y = 14; y < H; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(y * 0.35) * 2.5);
      ctx.lineTo(W, y + Math.cos(y * 0.22) * 3.5);
      ctx.stroke();
    }
    ctx.strokeStyle = "#7a5a18";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, W - 8, H - 8);

    ctx.textAlign = "center";
    ctx.fillStyle = "#1e0e02";
    ctx.font = "italic bold 30px Georgia, serif";
    ctx.fillText("You found the corner.", W / 2, 54);

    ctx.fillStyle = "#3a2408";
    ctx.font = "22px Georgia, serif";
    ctx.fillText("That means you're curious about", W / 2, 102);
    ctx.fillText("who I am. Maybe you want to work", W / 2, 132);
    ctx.fillText("together, or just say hi.", W / 2, 162);

    ctx.strokeStyle = "#c89030";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, 186); ctx.lineTo(W - 60, 186); ctx.stroke();

    ctx.fillStyle = "#c0392b";
    ctx.font = "bold 24px Georgia, serif";
    ctx.fillText("Come in. Let's find out.", W / 2, 224);

    ctx.fillStyle = "#bbb";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText("→ hidden page →", W / 2, 268);

    return new THREE.CanvasTexture(c);
  }, []);

  useEffect(() => () => { signTex?.dispose(); }, [signTex]);

  useFrame(() => {
    if (enteredRef.current) return;
    const dx = carPosRef.current.x - DOG_POS[0];
    const dz = carPosRef.current.z - DOG_POS[2];
    if (dx * dx + dz * dz < DOG_TRIGGER_R * DOG_TRIGGER_R) {
      enteredRef.current = true;
      onEnter();
    }
  });

  const BW = 4.5, BH = 3.5, BD = 4.5;

  return (
    <>
      {/* house — rotY = 3π/4 so door (-Z local) faces toward world center */}
      <group position={DOG_POS} rotation={[0, Math.PI * 0.75, 0]}>
        {/* body */}
        <mesh position={[0, BH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[BW, BH, BD]} />
          <meshStandardMaterial color="#c0392b" roughness={0.72} />
        </mesh>
        {/* roof — two angled slabs */}
        <mesh position={[0, BH + 0.52, BD * 0.22]} rotation={[-0.50, 0, 0]} castShadow>
          <boxGeometry args={[BW + 0.5, 0.16, BD * 0.60]} />
          <meshStandardMaterial color="#922b21" roughness={0.65} />
        </mesh>
        <mesh position={[0, BH + 0.52, -BD * 0.22]} rotation={[0.50, 0, 0]} castShadow>
          <boxGeometry args={[BW + 0.5, 0.16, BD * 0.60]} />
          <meshStandardMaterial color="#922b21" roughness={0.65} />
        </mesh>
        {/* ridge beam */}
        <mesh position={[0, BH + 1.02, 0]} castShadow>
          <boxGeometry args={[BW + 0.55, 0.22, 0.22]} />
          <meshStandardMaterial color="#7b241c" roughness={0.60} />
        </mesh>
        {/* door frame — yellow trim */}
        <mesh position={[0, 1.05, -(BD / 2 + 0.04)]}>
          <boxGeometry args={[1.90, 2.10, 0.06]} />
          <meshStandardMaterial color="#e8cf70" roughness={0.80} />
        </mesh>
        {/* door void */}
        <mesh position={[0, 0.90, -(BD / 2 + 0.06)]}>
          <boxGeometry args={[1.36, 1.80, 0.05]} />
          <meshStandardMaterial color="#060304" roughness={1} />
        </mesh>
        {/* warm interior glow through doorway */}
        <pointLight position={[0, 1.0, 0.5]} color="#ff9933" intensity={4} distance={8} decay={2} />
      </group>

      {/* sign — group rotated so poles + board face toward center; rotation.y=-π/4 keeps UV correct */}
      {signTex && (
        <group position={[37, 0, -37]} rotation={[0, -Math.PI / 4, 0]}>
          {/* left pole at x=-2.0, same local space as sign */}
          <mesh position={[-2.0, 2.0, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.072, 4.0, 7]} />
            <meshStandardMaterial color="#8b6820" roughness={0.88} />
          </mesh>
          {/* right pole */}
          <mesh position={[2.0, 2.0, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.072, 4.0, 7]} />
            <meshStandardMaterial color="#8b6820" roughness={0.88} />
          </mesh>
          {/* horizontal top bar */}
          <mesh position={[0, 3.85, 0]} castShadow>
            <boxGeometry args={[4.1, 0.10, 0.10]} />
            <meshStandardMaterial color="#7a5818" roughness={0.85} />
          </mesh>
          {/* sign board centred on poles */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <planeGeometry args={[4.0, 2.6]} />
            <meshStandardMaterial map={signTex} side={THREE.DoubleSide} roughness={0.55} />
          </mesh>
        </group>
      )}
    </>
  );
}

/* ─── City life (right side) ─────────────────────────────────── */
type PersonDef  = { from: [number,number,number]; to: [number,number,number]; spd: number; phase: number; shirt: string };
type NPCCarDef  = { from: [number,number,number]; to: [number,number,number]; spd: number; phase: number; color: string };

const PERSON_DEFS: PersonDef[] = [
  { from: [14, 0, 13], to: [36, 0, 13], spd: 1.4, phase: 0.0, shirt: "#4488cc" },
  { from: [36, 0, 17], to: [14, 0, 17], spd: 1.6, phase: 0.5, shirt: "#cc4444" },
  { from: [3,  0,  8], to: [3,  0, 30], spd: 1.3, phase: 0.3, shirt: "#44aa66" },
  { from: [22, 0,  5], to: [22, 0, 25], spd: 1.5, phase: 0.2, shirt: "#228888" },
  { from: [28, 0, 25], to: [28, 0,  5], spd: 1.4, phase: 0.6, shirt: "#994422" },
];

const NPC_CAR_DEFS: NPCCarDef[] = [
  { from: [-2, 0, -38], to: [-2, 0, 44],  spd: 6, phase: 0.2, color: "#5566cc" },
  { from: [ 2, 0,  44], to: [ 2, 0, -38], spd: 7, phase: 0.6, color: "#cc5544" },
];

function Person({ from, to, spd, phase, shirt }: PersonDef) {
  const grp     = useRef<THREE.Group>(null!);
  const lLegGrp = useRef<THREE.Group>(null!);
  const rLegGrp = useRef<THREE.Group>(null!);
  const lArmGrp = useRef<THREE.Group>(null!);
  const rArmGrp = useRef<THREE.Group>(null!);
  const walkT   = useRef(0);

  /* initial position along the path */
  const posX = useRef(from[0] + (to[0] - from[0]) * phase);
  const posZ = useRef(from[2] + (to[2] - from[2]) * phase);
  /* 1 = heading toward `to`, -1 = heading toward `from` */
  const dir  = useRef(phase < 0.5 ? 1 : -1);

  useFrame((_, dt) => {
    const tx = dir.current === 1 ? to[0] : from[0];
    const tz = dir.current === 1 ? to[2] : from[2];
    const dx = tx - posX.current;
    const dz = tz - posZ.current;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.4) {
      dir.current *= -1;
    } else {
      const nx = dx / dist;
      const nz = dz / dist;
      posX.current += nx * spd * dt;
      posZ.current += nz * spd * dt;
      if (grp.current) grp.current.rotation.y = Math.atan2(nx, nz);
    }

    if (grp.current) {
      grp.current.position.set(posX.current, 0, posZ.current);
    }

    walkT.current += dt * spd * 1.8;
    const swing = Math.sin(walkT.current * 3.5) * 0.55;
    if (lLegGrp.current) lLegGrp.current.rotation.x =  swing;
    if (rLegGrp.current) rLegGrp.current.rotation.x = -swing;
    if (lArmGrp.current) lArmGrp.current.rotation.x = -swing * 0.6;
    if (rArmGrp.current) rArmGrp.current.rotation.x =  swing * 0.6;
  });

  return (
    <group ref={grp}>
      {/* torso */}
      <mesh position={[0, 1.12, 0]}>
        <boxGeometry args={[0.50, 0.85, 0.32]} />
        <meshStandardMaterial color={shirt} roughness={0.75} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.80, 0]}>
        <boxGeometry args={[0.38, 0.40, 0.34]} />
        <meshStandardMaterial color="#f0c080" roughness={0.65} />
      </mesh>
      {/* left leg — pivot at hip */}
      <group ref={lLegGrp} position={[-0.14, 0.75, 0]}>
        <mesh position={[0, -0.37, 0]}>
          <boxGeometry args={[0.20, 0.75, 0.22]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
        </mesh>
      </group>
      {/* right leg */}
      <group ref={rLegGrp} position={[0.14, 0.75, 0]}>
        <mesh position={[0, -0.37, 0]}>
          <boxGeometry args={[0.20, 0.75, 0.22]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
        </mesh>
      </group>
      {/* left arm — pivot at shoulder */}
      <group ref={lArmGrp} position={[-0.35, 1.54, 0]}>
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[0.17, 0.65, 0.18]} />
          <meshStandardMaterial color={shirt} roughness={0.75} />
        </mesh>
      </group>
      {/* right arm */}
      <group ref={rArmGrp} position={[0.35, 1.54, 0]}>
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[0.17, 0.65, 0.18]} />
          <meshStandardMaterial color={shirt} roughness={0.75} />
        </mesh>
      </group>
    </group>
  );
}

function NPCCar({ from, to, spd, phase, color }: NPCCarDef) {
  const ref  = useRef<THREE.Group>(null!);
  const posX = useRef(from[0] + (to[0] - from[0]) * phase);
  const posZ = useRef(from[2] + (to[2] - from[2]) * phase);
  const dir  = useRef(phase < 0.5 ? 1 : -1);

  useFrame((_, dt) => {
    const tx = dir.current === 1 ? to[0] : from[0];
    const tz = dir.current === 1 ? to[2] : from[2];
    const dx = tx - posX.current;
    const dz = tz - posZ.current;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 1.0) {
      dir.current *= -1;
    } else {
      const nx = dx / dist;
      const nz = dz / dist;
      posX.current += nx * spd * dt;
      posZ.current += nz * spd * dt;
      if (ref.current) {
        ref.current.rotation.y = Math.atan2(nx, nz);
      }
    }

    if (ref.current) {
      ref.current.position.set(posX.current, 0.26, posZ.current);
    }
  });

  return (
    <group ref={ref}>
      <group scale={0.88}>
        {/* body */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[1.4, 0.42, 2.2]} />
          <meshStandardMaterial color={color} roughness={0.52} metalness={0.18} />
        </mesh>
        {/* cabin */}
        <mesh position={[0, 0.80, -0.06]}>
          <boxGeometry args={[1.22, 0.50, 1.28]} />
          <meshStandardMaterial color="#1a1a28" roughness={0.72} />
        </mesh>
        {/* headlights */}
        {([-0.42, 0.42] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0.40, 1.12]}>
            <boxGeometry args={[0.26, 0.15, 0.04]} />
            <meshStandardMaterial color="#fffff0" emissive="#fffde0" emissiveIntensity={2.2} />
          </mesh>
        ))}
        {/* tail lights */}
        {([-0.42, 0.42] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0.40, -1.12]}>
            <boxGeometry args={[0.22, 0.13, 0.04]} />
            <meshStandardMaterial color="#ff1800" emissive="#ff1800" emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CityLife() {
  return (
    <>
      {PERSON_DEFS.map((p, i) => <Person key={i} {...p} />)}
      {NPC_CAR_DEFS.map((c, i) => <NPCCar key={i} {...c} />)}
    </>
  );
}

/* ─── Scene ────────────────────────────────────────────────────── */
const CAR_R = 1.35; // collision radius
const HW = BLDG_W / 2, HD = BLDG_D / 2, HDW = DOOR_W / 2;

function Scene({
  onProjectEnter,
  teleportRef,
  onFlip,
  rightCarRef,
  onAboutEnter,
}: {
  onProjectEnter: (p: Project, tp: [number, number]) => void;
  teleportRef: React.RefObject<[number, number] | null>;
  onFlip: () => void;
  rightCarRef: React.MutableRefObject<boolean>;
  onAboutEnter: () => void;
}) {
  const keys            = useKeys();
  const carRef          = useRef<THREE.Group>(null!);
  const speedRef        = useRef(0);
  const carPos          = useRef(new THREE.Vector3(-2, 1, 3));
  const carYaw          = useRef(Math.PI * 0.18);
  const orbitRef        = useRef<any>(null);
  const carBump         = useRef(0);
  const boostRef        = useRef(false);
  const lookaheadTarget = useRef(new THREE.Vector3());
  const _dogTarget      = useRef(new THREE.Vector3());
  const carRoll         = useRef(0);
  const carPitch        = useRef(0);
  const flippedRef      = useRef(false);
  const flipTimer       = useRef(0);
  const carVY           = useRef(0);

  useFrame(({ camera }, delta) => {
    /* ── teleport: applied the frame after popup closes ── */
    if (teleportRef.current) {
      const [tx, tz] = teleportRef.current;
      carPos.current.x = tx;
      carPos.current.z = tz;
      speedRef.current = 0;
      (teleportRef as React.MutableRefObject<[number, number] | null>).current = null;
    }

    const dt    = Math.min(delta, 0.05);
    const k     = keys.current;
    const w = k.w, a = k.a, s = k.s, d = k.d, space = k[" "] ?? false;
    let spd = speedRef.current;
    if (flippedRef.current) spd = speedRef.current = 0;
    const boost = space && !!w;
    boostRef.current = boost && Math.abs(spd) > 3;

    if (w) spd += (boost ? BOOST_ACCEL : ACCEL) * dt;
    if (s) spd -= BRAKE * dt;
    /* dt-normalised friction: same deceleration regardless of frame rate */
    spd *= Math.pow(boost ? BOOST_FRIC : FRIC, dt * 60);
    spd  = Math.max(-(boost ? BOOST_MAX : MAX_SPD) * 0.4, Math.min(boost ? BOOST_MAX : MAX_SPD, spd));
    speedRef.current = spd;

    if (Math.abs(spd) > 0.12)
      carYaw.current += ((a ? 1 : 0) - (d ? 1 : 0)) * STEER * dt * Math.sign(spd);

    carPos.current.x += Math.sin(carYaw.current) * spd * dt;
    carPos.current.z += Math.cos(carYaw.current) * spd * dt;

    /* boundary clamp */
    carPos.current.x = THREE.MathUtils.clamp(carPos.current.x, -HALF + 1, HALF - 1);
    carPos.current.z = THREE.MathUtils.clamp(carPos.current.z, -HALF + 1, HALF - 1);

    /* ── building collision ── */
    for (const b of BLDG_CONFIGS) {
      const bdx = carPos.current.x - b.pos[0];
      const bdz = carPos.current.z - b.pos[2];
      /* fast-reject: skip if car is clearly outside building bounding box */
      if (Math.abs(bdx) > HW + CAR_R + 2 || Math.abs(bdz) > HD + CAR_R + 2) continue;
      /* transform car position to building-local 2D space */
      const lx = bdx * b.cRY - bdz * b.sRY;
      const lz = bdx * b.sRY + bdz * b.cRY;
      if (lx < -(HW + CAR_R) || lx > HW + CAR_R ||
          lz < -(HD + CAR_R) || lz > HD + CAR_R) continue;

      /* solid rects in local 2D: left column, right column, back wall */
      const rects = [
        { x1: -HW, x2: -HDW, z1: -HD, z2: HD },
        { x1:  HDW, x2: HW,  z1: -HD, z2: HD },
        { x1: -HW, x2: HW,   z1: HD - BLDG_WT, z2: HD },
      ];

      for (const r of rects) {
        const clampX = Math.max(r.x1, Math.min(r.x2, lx));
        const clampZ = Math.max(r.z1, Math.min(r.z2, lz));
        const ddx = lx - clampX, ddz = lz - clampZ;
        const dist2 = ddx * ddx + ddz * ddz;
        if (dist2 >= CAR_R * CAR_R) continue;

        let pushLX = 0, pushLZ = 0;
        if (dist2 < 0.0001) {
          /* car center inside rect — push toward nearest edge */
          const nX = Math.min(lx - r.x1, r.x2 - lx);
          const nZ = Math.min(lz - r.z1, r.z2 - lz);
          if (nX <= nZ) pushLX = lx < (r.x1 + r.x2) / 2 ? -(nX + CAR_R) : (nX + CAR_R);
          else          pushLZ = lz < (r.z1 + r.z2) / 2 ? -(nZ + CAR_R) : (nZ + CAR_R);
        } else {
          const dist = Math.sqrt(dist2);
          pushLX = (ddx / dist) * (CAR_R - dist);
          pushLZ = (ddz / dist) * (CAR_R - dist);
        }
        /* transform push back to world space: world = Ry(rotY) * local */
        carPos.current.x += pushLX * b.cRY + pushLZ * b.sRY;
        carPos.current.z += -pushLX * b.sRY + pushLZ * b.cRY;
        speedRef.current *= 0.35;
      }
    }

    carBump.current *= 0.80;
    const ground  = sampleH(carPos.current.x, carPos.current.z);
    const floorY  = ground + 0.26 + carBump.current;

    /* gravity — car can leave ground and fly over hills */
    carVY.current += GRAVITY * dt;
    carPos.current.y += carVY.current * dt;

    if (carPos.current.y <= floorY) {
      carPos.current.y = floorY;
      if (carVY.current < -3) carBump.current = Math.min(0.30, -carVY.current * 0.016);
      carVY.current = 0;
    }

    /* ── right-car request ── */
    if (rightCarRef.current) {
      flippedRef.current  = false;
      carRoll.current     = 0;
      carPitch.current    = 0;
      flipTimer.current   = 0;
      carVY.current       = 0;
      carPos.current.set(0, sampleH(0, 3) + 0.26, 3);
      speedRef.current    = 0;
      rightCarRef.current = false;
    }

    /* ── terrain slope → roll / pitch ── */
    if (!flippedRef.current) {
      const SR = 0.75;
      const gL = sampleH(carPos.current.x - SR, carPos.current.z);
      const gR = sampleH(carPos.current.x + SR, carPos.current.z);
      const gF = sampleH(carPos.current.x, carPos.current.z + SR);
      const gB = sampleH(carPos.current.x, carPos.current.z - SR);
      const wSX = (gR - gL) / (2 * SR);
      const wSZ = (gF - gB) / (2 * SR);
      const cY  = Math.cos(carYaw.current), sY2 = Math.sin(carYaw.current);
      const localRight   =  wSX * cY  - wSZ * sY2;
      const localForward =  wSX * sY2 + wSZ * cY;
      carRoll.current  = THREE.MathUtils.lerp(carRoll.current,  Math.atan(localRight)    * 0.75, 0.08);
      carPitch.current = THREE.MathUtils.lerp(carPitch.current, Math.atan(-localForward) * 0.75, 0.08);
      if (Math.abs(localRight) > 0.45 && Math.abs(spd) > 7) {
        flipTimer.current += dt;
        if (flipTimer.current > 0.22) {
          carRoll.current    = Math.sign(localRight) * Math.PI * 0.80;
          flippedRef.current = true;
          speedRef.current   = 0;
          flipTimer.current  = 0;
          onFlip();
        }
      } else {
        flipTimer.current = 0;
      }
    } else {
      /* settle into fully flipped position */
      const targetRoll = Math.sign(carRoll.current || 1) * Math.PI * 0.80;
      carRoll.current  = THREE.MathUtils.lerp(carRoll.current, targetRoll, 0.15);
    }

    const car = carRef.current;
    if (car) {
      car.position.copy(carPos.current);
      car.rotation.order = "YXZ";
      car.rotation.y = carYaw.current;
      car.rotation.x = carPitch.current;
      car.rotation.z = carRoll.current;
    }

    /* ── heading-based lookahead camera ── */
    if (orbitRef.current && car) {
      const ctrl = orbitRef.current as any;

      const ddx = carPos.current.x - DOG_POS[0];
      const ddz = carPos.current.z - DOG_POS[2];
      const dogDist = Math.sqrt(ddx * ddx + ddz * ddz);
      const dogT = Math.max(0, 1 - dogDist / 30); // 0 far, 1 at dog house

      if (dogT > 0) {
        /* ── dog house mode: track car position, let user control zoom ── */
        ctrl.minDistance = 2;
        _dogTarget.current.set(carPos.current.x, carPos.current.y + 0.6, carPos.current.z);
        (ctrl.target as THREE.Vector3).lerp(_dogTarget.current, 0.18);
      } else {
        /* ── normal mode ── */
        ctrl.minDistance = 5;

        const lookaheadDist = THREE.MathUtils.clamp(Math.abs(spd) * 0.4, 2, 14);
        lookaheadTarget.current.set(
          carPos.current.x + Math.sin(carYaw.current) * lookaheadDist,
          carPos.current.y,
          carPos.current.z + Math.cos(carYaw.current) * lookaheadDist,
        );
        (ctrl.target as THREE.Vector3).lerp(lookaheadTarget.current, 0.055);

        const camDist = camera.position.distanceTo(car.position);
        if (camDist > 38 && ctrl.spherical) {
          ctrl.spherical.radius = THREE.MathUtils.lerp(ctrl.spherical.radius, 28, 0.04);
        }
      }
    }

    /* prevent camera from clipping through the ground */
    if (camera.position.y < 1.8) camera.position.y = 1.8;
  });

  return (
    <>
      <color attach="background" args={["#a8d0ef"]} />
      <fog attach="fog" args={["#b8d8f4", 80, 140]} />
      <Sky sunPosition={[80, 35, 60]} turbidity={0.4} rayleigh={1.2} mieCoefficient={0.003} mieDirectionalG={0.8} />

      <ambientLight intensity={1.6} color="#f0f8ff" />
      <directionalLight
        position={[40, 70, 30]}
        intensity={2.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-far={160}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
      />
      <directionalLight position={[-30, 20, -40]} intensity={0.55} color="#c8d8ff" />

      <Ground />
      <Roads />
      <Boundary />
      <Pebbles />
      <MountainRocks />
      <MountainWarning position={[-7, 0,  4]} />
      <MountainWarning position={[-7, 0, 23]} />
      <SecretPath />
      <DogHouse carPosRef={carPos} onEnter={onAboutEnter} />
      <CityLife />

      {/* scene objects */}
      <InfoPoster position={[0, 0, 46]} />
      {/* keys appear on LEFT from initial camera angle (world +X = screen left) */}
      <WASDKeys groupCenter={[16, 0, 10]} carRef={carRef} speedRef={speedRef} />
      {/* mouse appears on RIGHT from initial camera angle (world -X = screen right) */}
      <Mouse3D initPos={[-17, 0.8, 8]} carRef={carRef} speedRef={speedRef} carBumpRef={carBump} />

      <ProjectBuildings carRef={carRef} onEnter={(p, tp) => onProjectEnter(p, tp)} />
      <Jeep outer={carRef} />
      <Smoke carRef={carRef} speedRef={speedRef} />
      <Headlights carRef={carRef} />
      <BoostTrail carRef={carRef} speedRef={speedRef} boostRef={boostRef} />
      <BoostLight carRef={carRef} boostRef={boostRef} />

      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minPolarAngle={Math.PI * 0.10}
        maxPolarAngle={Math.PI * 0.44}
        minDistance={1}
        maxDistance={70}
        target={[0, 0, 14]}
      />
    </>
  );
}

/* ─── HUD ──────────────────────────────────────────────────────── */
/* ─── Lab tutorial (shown once per browser) ────────────────────── */
function LabTutorial({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const handler = () => onDismiss();
    window.addEventListener("keydown", handler, { once: true });
    window.addEventListener("pointerdown", handler, { once: true });
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("pointerdown", handler);
    };
  }, [onDismiss]);

  const KEY_STYLE: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 28, height: 26, padding: "0 6px",
    borderRadius: 6, fontSize: 12, fontFamily: "monospace", fontWeight: 700,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#ffffff",
  };

  return (
    <>
      <style>{`
        @keyframes tutFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
      <div style={{
        position: "absolute", inset: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.42)",
        backdropFilter: "blur(4px)",
      }}>
        <div style={{
          width: "min(480px, 92vw)",
          background: "rgba(15,18,20,0.88)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "36px 36px 28px",
          color: "#ffffff",
          animation: "tutFadeIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
          pointerEvents: "none",
        }}>
          {/* header */}
          <div style={{ marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontFamily: "monospace", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#3ecf6a", fontWeight: 700,
            }}>The Lab</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.2 }}>
            Welcome. Drive around.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "0 0 28px", lineHeight: 1.6 }}>
            This is an interactive 3D world. Each building is one of my projects.
            Drive up to a door and go inside to see it.
          </p>

          {/* controls grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 28 }}>
            {[
              { keys: ["W","A","S","D"],       label: "Drive"        },
              { keys: ["SPACE", "+", "W"],      label: "Boost"        },
              { keys: ["Drag"],                 label: "Orbit camera" },
              { keys: ["Scroll"],               label: "Zoom"         },
              { keys: ["ESC"],                  label: "Exit the lab" },
            ].map(({ keys, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {keys.map((k, i) => (
                    k === "+" ? (
                      <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", alignSelf: "center" }}>+</span>
                    ) : (
                      <span key={i} style={KEY_STYLE}>{k}</span>
                    )
                  ))}
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* secret hint */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 16, marginBottom: 20,
            fontSize: 12, color: "rgba(255,255,255,0.35)",
            fontFamily: "monospace",
          }}>
            hint: there's something hidden in the corner of the map.
          </div>

          {/* dismiss */}
          <div style={{
            textAlign: "center", fontSize: 12,
            color: "rgba(255,255,255,0.35)", fontFamily: "monospace",
            letterSpacing: "0.04em",
          }}>
            press any key or click to start
          </div>
        </div>
      </div>
    </>
  );
}

function HUD() {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none select-none">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
        style={{
          background: "rgba(255,255,255,0.22)",
          border: "1px solid rgba(255,255,255,0.40)",
          color: "rgba(20,20,20,0.7)",
          backdropFilter: "blur(8px)",
        }}
      >
        {["W", "A", "S", "D"].map(k => (
          <kbd key={k} className="px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,0,0,0.10)", border: "1px solid rgba(0,0,0,0.18)", fontFamily: "inherit" }}
          >{k}</kbd>
        ))}
        <span>drive</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <kbd className="px-1.5 py-0.5 rounded" style={{ background: "rgba(62,207,106,0.15)", border: "1px solid rgba(62,207,106,0.4)", fontFamily: "inherit", color: "#1a9148" }}>SPACE</kbd>
        <span>boost</span>
        <span style={{ opacity: 0.4 }}>· drag · scroll zoom</span>
      </div>
    </div>
  );
}

/* ─── Project popup ────────────────────────────────────────────── */
const GH_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18, flexShrink: 0 }}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

function ProjectPopup({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const githubUrl = project.github ?? "https://github.com/eugeniobusta";
  const talkUrl   = `/?project=${encodeURIComponent(project.title)}#contact`;

  const statusBg  = project.status === "live" ? "#dcfce7" : project.status === "dev" ? "#fef3c7" : "#dbeafe";
  const statusFg  = project.status === "live" ? "#15803d" : project.status === "dev" ? "#92400e" : "#1e40af";

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.68)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "36px 40px 28px",
          maxWidth: "480px",
          width: "92%",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── header row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#0a0a0a", margin: 0, flex: 1 }}>
            {project.title}
          </h2>
          <span style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
            padding: "4px 11px", borderRadius: "999px",
            background: statusBg, color: statusFg,
            whiteSpace: "nowrap",
          }}>
            {project.status.toUpperCase()}
          </span>
          <a
            href={talkUrl}
            target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: "12px", fontWeight: 600,
              padding: "5px 12px", borderRadius: "999px",
              background: "#f0fdf4", color: "#15803d",
              border: "1px solid #86efac",
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            💬 Talk about this
          </a>
        </div>

        <p style={{ fontSize: "15px", lineHeight: 1.68, color: "#4b5563", margin: "14px 0 20px" }}>
          {project.description}
        </p>

        {/* stack chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "28px" }}>
          {project.stack.map(s => (
            <span key={s.name} style={{
              padding: "5px 12px", borderRadius: "999px",
              background: "#f3f4f6", fontSize: "12px",
              fontFamily: "monospace", color: "#374151", fontWeight: 600,
            }}>{s.name}</span>
          ))}
        </div>

        {/* action buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href={githubUrl}
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", padding: "14px 0",
              background: "#0f172a", color: "#ffffff",
              borderRadius: "13px", textDecoration: "none",
              fontWeight: 700, fontSize: "15px",
            }}
          >
            {GH_ICON} GitHub
          </a>
          {project.live ? (
            <a
              href={project.live}
              target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: "6px", padding: "14px 0",
                background: "#3ecf6a", color: "#ffffff",
                borderRadius: "13px", textDecoration: "none",
                fontWeight: 700, fontSize: "15px",
              }}
            >
              ↗ See Live
            </a>
          ) : (
            <span style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "14px 0",
              background: "#f9fafb", color: "#9ca3af",
              borderRadius: "13px", fontSize: "14px",
              border: "1px solid #e5e7eb",
            }}>
              Not live yet
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "16px", width: "100%", padding: "10px 0",
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", fontSize: "13px",
          }}
        >
          ESC or click outside to close
        </button>
      </div>
    </div>
  );
}

/* ─── Entry ────────────────────────────────────────────────────── */
const TUTORIAL_KEY = "lab-tutorial-seen";

export default function LabGame() {
  const router = useRouter();
  const [ready, setReady]                 = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isFlipped, setIsFlipped]         = useState(false);
  const [showTutorial, setShowTutorial]   = useState(false);
  /* teleportRef is written by LabGame (on close) and read by Scene's useFrame */
  const teleportRef    = useRef<[number, number] | null>(null);
  const activeTeleport = useRef<[number, number] | null>(null);
  const rightCarRef    = useRef<boolean>(false);

  const handleProjectEnter = useCallback((p: Project, tp: [number, number]) => {
    activeTeleport.current = tp;
    setActiveProject(p);
  }, []);

  const handleClose = useCallback(() => {
    teleportRef.current = activeTeleport.current;
    setActiveProject(null);
  }, []);

  const [dogEntering, setDogEntering] = useState(false);

  const handleFlip       = useCallback(() => setIsFlipped(true), []);
  const handleRightCar   = useCallback(() => {
    rightCarRef.current = true;
    setIsFlipped(false);
  }, []);
  const handleAboutEnter  = useCallback(() => setDogEntering(true), []);
  const handleTutorialDismiss = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_KEY, "1");
  }, []);

  useEffect(() => {
    if (dogEntering) {
      const t = setTimeout(() => router.push("/about"), 1800);
      return () => clearTimeout(t);
    }
  }, [dogEntering, router]);

  useEffect(() => {
    setReady(true);
    if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true);
  }, []);
  if (!ready) return null;

  return (
    <div className="relative w-full h-full" style={{ background: "#a8d0ef" }}>
      <Canvas
        shadows
        camera={{ fov: 52, near: 0.5, far: 160, position: [-2, 16, -20] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        performance={{ min: 0.75 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene
          onProjectEnter={handleProjectEnter}
          teleportRef={teleportRef}
          onFlip={handleFlip}
          rightCarRef={rightCarRef}
          onAboutEnter={handleAboutEnter}
        />
      </Canvas>
      <HUD />
      {showTutorial && <LabTutorial onDismiss={handleTutorialDismiss} />}

      {dogEntering && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          pointerEvents: "none",
          background: "#ffffff",
          animationName: "dog-portal",
          animationDuration: "1.8s",
          animationTimingFunction: "ease-in",
          animationFillMode: "forwards",
        }} />
      )}
      {isFlipped && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: "80px",
          pointerEvents: "none",
        }}>
          <button
            onClick={handleRightCar}
            style={{
              pointerEvents: "auto",
              padding: "14px 32px",
              background: "#3ecf6a",
              color: "#ffffff",
              border: "none",
              borderRadius: "999px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
              letterSpacing: "0.02em",
            }}
          >
            ↩ Right the car
          </button>
        </div>
      )}
      {activeProject && (
        <ProjectPopup project={activeProject} onClose={handleClose} />
      )}
    </div>
  );
}
