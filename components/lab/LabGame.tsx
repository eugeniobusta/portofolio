"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ─── palette ─────────────────────────────────────────────────── */
const C_BODY  = "#3ecf6a";
const C_DARK  = "#0f2211";
const C_WHEEL = "#181818";
const C_RIM   = "#888888";
const C_GLASS = "#cce8ff";

/* ─── world ───────────────────────────────────────────────────── */
const WORLD   = 100;          // terrain square side (expand later)
const HALF    = WORLD / 2;

/* ─── physics ──────────────────────────────────────────────────── */
const ACCEL   = 38;
const BRAKE   = 22;
const FRIC    = 0.92;
const MAX_SPD = 48;
const STEER   = 2.6;
const SMOKE_N = 55;

/* ─── gentle terrain ──────────────────────────────────────────── */
function sampleH(x: number, z: number) {
  return (
    Math.sin(x * 0.025) * Math.cos(z * 0.025) * 0.28 +
    Math.sin(x * 0.06 + 0.9) * Math.cos(z * 0.055 + 0.4) * 0.10 +
    Math.cos(x * 0.12 + z * 0.08) * 0.05
  );
}

function buildGround() {
  const g = new THREE.PlaneGeometry(WORLD, WORLD, 60, 60);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, sampleH(p.getX(i), p.getZ(i)));
  g.computeVertexNormals();
  return g;
}

/* ─── keyboard ────────────────────────────────────────────────── */
function useKeys() {
  const k = useRef({ w: false, a: false, s: false, d: false });
  useEffect(() => {
    const W = new Set(["w", "a", "s", "d"]);
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

/* ─── Ground ──────────────────────────────────────────────────── */
function Ground() {
  const geo = useMemo(buildGround, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#e8e8e0" roughness={0.95} />
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
  const timer = useRef(0);
  const M = useMemo(() => new THREE.Matrix4(), []);
  const Q = useMemo(() => new THREE.Quaternion(), []);
  const S = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
    const car = carRef.current;
    const spd = speedRef.current ?? 0;
    if (!car || !mesh.current) return;

    /* spawn a puff whenever moving */
    timer.current -= dt;
    if (Math.abs(spd) > 0.4 && timer.current <= 0) {
      timer.current = 0.06;
      const p = puffs.current.find(p => !p.on);
      if (p) {
        /* exhaust tip in world space — accounts for 0.88 inner scale */
        const local = new THREE.Vector3(-0.38 * 0.88, 0.18 * 0.88, -1.16 * 0.88);
        local.applyMatrix4(car.matrixWorld);
        p.pos.copy(local);
        /* drift up and slightly sideways */
        p.vel.set(
          (Math.random() - 0.5) * 0.25,
          0.55 + Math.random() * 0.45,
          (Math.random() - 0.5) * 0.25
        );
        p.life = 0;
        p.max  = 1.2 + Math.random() * 0.8;   // 1.2 – 2.0 s lifetime
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
      const s  = 0.10 + t * 0.52;                  // grow as it ages
      M.compose(p.pos, Q.identity(), S.set(s, s, s));
      mesh.current.setMatrixAt(idx++, M);
    }
    /* hide unused slots underground */
    for (let i = idx; i < SMOKE_N; i++) {
      M.compose(new THREE.Vector3(0, -9999, 0), Q.identity(), S.set(0.001, 0.001, 0.001));
      mesh.current.setMatrixAt(i, M);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SMOKE_N]}>
      <sphereGeometry args={[1, 6, 6]} />
      {/* black-grey, semi-opaque — heavy exhaust look */}
      <meshStandardMaterial
        color="#111111"
        transparent
        opacity={0.62}
        depthWrite={false}
        roughness={1}
      />
    </instancedMesh>
  );
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
      <spotLight ref={lRef} intensity={40} angle={0.40} penumbra={0.55} color="#fffcea" distance={24} decay={1.4} castShadow shadow-mapSize={[512, 512]} />
      <spotLight ref={rRef} intensity={40} angle={0.40} penumbra={0.55} color="#fffcea" distance={24} decay={1.4} />
    </>
  );
}

/* ─── Scene ────────────────────────────────────────────────────── */
function Scene() {
  const keys     = useKeys();
  const carRef   = useRef<THREE.Group>(null!);
  const speedRef = useRef(0);
  const carPos   = useRef(new THREE.Vector3(0, 1, 0));
  const carYaw   = useRef(0);
  const orbitRef = useRef<any>(null);

  useFrame(({ camera }, delta) => {
    /* prevent camera from clipping through the ground */
    if (camera.position.y < 1.8) camera.position.y = 1.8;

    /* loosely follow the car — lerp orbit target toward car position */
    if (orbitRef.current && carRef.current) {
      const ctrl = orbitRef.current as any;
      (ctrl.target as THREE.Vector3).lerp(carRef.current.position, 0.055);

      /* also close the zoom gap: if the camera drifts more than 38 units
         from the car, gently shrink the orbit radius toward 28.
         OrbitControls (drei) runs at priority -1 so this executes after it
         and the updated radius is picked up on the very next frame. */
      const camDist = camera.position.distanceTo(carRef.current.position);
      if (camDist > 38 && ctrl.spherical) {
        ctrl.spherical.radius = THREE.MathUtils.lerp(ctrl.spherical.radius, 28, 0.04);
      }
    }

    const dt = Math.min(delta, 0.05);
    const { w, a, s, d } = keys.current;
    let spd = speedRef.current;

    if (w) spd += ACCEL * dt;
    if (s) spd -= BRAKE * dt;
    spd *= FRIC;
    spd  = Math.max(-MAX_SPD * 0.4, Math.min(MAX_SPD, spd));
    speedRef.current = spd;

    if (Math.abs(spd) > 0.12)
      carYaw.current += ((a ? 1 : 0) - (d ? 1 : 0)) * STEER * dt * Math.sign(spd);

    carPos.current.x += Math.sin(carYaw.current) * spd * dt;
    carPos.current.z += Math.cos(carYaw.current) * spd * dt;

    /* soft clamp inside boundary */
    carPos.current.x = THREE.MathUtils.clamp(carPos.current.x, -HALF + 1, HALF - 1);
    carPos.current.z = THREE.MathUtils.clamp(carPos.current.z, -HALF + 1, HALF - 1);

    const ground = sampleH(carPos.current.x, carPos.current.z);
    carPos.current.y = THREE.MathUtils.lerp(carPos.current.y, ground + 0.26, 0.22);

    const car = carRef.current;
    if (car) { car.position.copy(carPos.current); car.rotation.y = carYaw.current; }
  });

  return (
    <>
      <color attach="background" args={["#a8d0ef"]} />
      <fog attach="fog" args={["#b8d8f4", 80, 200]} />
      <Sky sunPosition={[80, 35, 60]} turbidity={0.4} rayleigh={1.2} mieCoefficient={0.003} mieDirectionalG={0.8} />

      <ambientLight intensity={1.6} color="#f0f8ff" />
      <directionalLight
        position={[40, 70, 30]}
        intensity={2.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={200}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />
      <directionalLight position={[-30, 20, -40]} intensity={0.55} color="#c8d8ff" />

      <Ground />
      <Boundary />
      <Pebbles />
      <Jeep outer={carRef} />
      <Smoke carRef={carRef} speedRef={speedRef} />
      <Headlights carRef={carRef} />

      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minPolarAngle={Math.PI * 0.10}
        maxPolarAngle={Math.PI * 0.44}
        minDistance={5}
        maxDistance={70}
      />
    </>
  );
}

/* ─── HUD ──────────────────────────────────────────────────────── */
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
        <span>drive · drag to orbit · scroll to zoom</span>
      </div>
    </div>
  );
}

/* ─── Entry ────────────────────────────────────────────────────── */
export default function LabGame() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;

  return (
    <div className="relative w-full h-full" style={{ background: "#a8d0ef" }}>
      <Canvas
        shadows
        camera={{ fov: 52, near: 0.1, far: 400, position: [0, 28, 24] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene />
      </Canvas>
      <HUD />
    </div>
  );
}
