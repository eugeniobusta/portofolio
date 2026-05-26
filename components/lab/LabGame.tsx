"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* ─── palette ─────────────────────────────────────────────────── */
const C_BODY  = "#3ecf6a";   // neon green — matches the "Enter the Lab" button
const C_DARK  = "#0f2211";   // near-black for cabin / trim
const C_WHEEL = "#181818";
const C_RIM   = "#888888";
const C_GLASS = "#cce8ff";

/* ─── physics ──────────────────────────────────────────────────── */
const ACCEL   = 20;
const BRAKE   = 13;
const FRIC    = 0.87;
const MAX_SPD = 26;
const STEER   = 2.5;
const SMOKE_N = 30;

/* ─── very gentle terrain ─────────────────────────────────────── */
function sampleH(x: number, z: number) {
  return (
    Math.sin(x * 0.025) * Math.cos(z * 0.025) * 0.30 +
    Math.sin(x * 0.06  + 0.9) * Math.cos(z * 0.055 + 0.4) * 0.12 +
    Math.cos(x * 0.12  + z * 0.08) * 0.06
  );
}

function buildGround() {
  const g = new THREE.PlaneGeometry(500, 500, 100, 100);
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
    const WATCH = new Set(["w", "a", "s", "d"]);
    const dn = (e: KeyboardEvent) => {
      const c = e.key.toLowerCase();
      if (WATCH.has(c)) { e.preventDefault(); (k.current as Record<string, boolean>)[c] = true; }
    };
    const up = (e: KeyboardEvent) => {
      const c = e.key.toLowerCase();
      if (WATCH.has(c)) (k.current as Record<string, boolean>)[c] = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
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

/* ─── Boxy Jeep (Smashy-Road style) ──────────────────────────── */
const WHEEL_POS: [number, number, number][] = [
  [-0.62, 0, 0.72], [0.62, 0, 0.72],
  [-0.62, 0, -0.72], [0.62, 0, -0.72],
];

function Jeep({ outer }: { outer: React.RefObject<THREE.Group> }) {
  return (
    <group ref={outer as React.RefObject<THREE.Group>}>
      {/* inner group scales the whole car */}
      <group scale={0.6}>
        {/* main body */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[1.4, 0.42, 2.2]} />
          <meshStandardMaterial color={C_BODY} roughness={0.48} metalness={0.18} />
        </mesh>

        {/* cabin (slightly trapezoidal look via two boxes) */}
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

        {/* front head lights */}
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

/* ─── Exhaust smoke ────────────────────────────────────────────── */
type Puff = { pos: THREE.Vector3; vel: THREE.Vector3; life: number; max: number; on: boolean };

function Smoke({
  carRef, speedRef,
}: { carRef: React.RefObject<THREE.Group>; speedRef: React.RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
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

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05);
    const car = carRef.current;
    const spd = speedRef.current ?? 0;
    if (!car || !mesh.current) return;

    timer.current -= dt;
    if (Math.abs(spd) > 0.5 && timer.current <= 0) {
      timer.current = 0.055;
      const p = puffs.current.find(p => !p.on);
      if (p) {
        const local = new THREE.Vector3(-0.38 * 0.6, 0.18 * 0.6, -1.16 * 0.6);
        local.applyMatrix4(car.matrixWorld);
        p.pos.copy(local);
        p.vel.set((Math.random() - 0.5) * 0.28, 0.45 + Math.random() * 0.35, (Math.random() - 0.5) * 0.28);
        p.life = 0;
        p.max  = 0.8 + Math.random() * 0.5;
        p.on   = true;
      }
    }

    let idx = 0;
    for (const p of puffs.current) {
      if (!p.on) continue;
      p.life += dt;
      if (p.life >= p.max) { p.on = false; continue; }
      p.pos.addScaledVector(p.vel, dt);
      const t = p.life / p.max;
      const s = 0.07 + t * 0.25;
      M.compose(p.pos, Q.identity(), S.set(s, s, s));
      mesh.current.setMatrixAt(idx++, M);
    }
    for (let i = idx; i < SMOKE_N; i++) {
      M.compose(new THREE.Vector3(0, -9999, 0), Q.identity(), S.set(0.001, 0.001, 0.001));
      mesh.current.setMatrixAt(i, M);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SMOKE_N]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshStandardMaterial color="#cccccc" transparent opacity={0.38} depthWrite={false} roughness={1} />
    </instancedMesh>
  );
}

/* ─── Headlights (SpotLights that track the car) ──────────────── */
function Headlights({ carRef }: { carRef: React.RefObject<THREE.Group> }) {
  const lRef = useRef<THREE.SpotLight>(null!);
  const rRef = useRef<THREE.SpotLight>(null!);
  const { scene } = useThree();

  useEffect(() => {
    const l = lRef.current, r = rRef.current;
    if (!l || !r) return;
    scene.add(l.target);
    scene.add(r.target);
    return () => { scene.remove(l.target); scene.remove(r.target); };
  }, [scene]);

  useFrame(() => {
    const car = carRef.current;
    if (!car || !lRef.current || !rRef.current) return;
    const p   = car.position;
    const yaw = car.rotation.y;
    const sY  = Math.sin(yaw), cY = Math.cos(yaw);
    const sc  = 0.6;             // matches the inner group scale
    const fwd = 1.12 * sc, side = 0.42 * sc, ht = 0.45 * sc;

    lRef.current.position.set(p.x + sY * fwd - cY * side, p.y + ht, p.z + cY * fwd + sY * side);
    rRef.current.position.set(p.x + sY * fwd + cY * side, p.y + ht, p.z + cY * fwd - sY * side);

    const tx = p.x + sY * 11, tz = p.z + cY * 11, ty = p.y - 0.15;
    lRef.current.target.position.set(tx, ty, tz);
    lRef.current.target.updateMatrixWorld();
    rRef.current.target.position.set(tx, ty, tz);
    rRef.current.target.updateMatrixWorld();
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

  useFrame((_, delta) => {
    const dt  = Math.min(delta, 0.05);
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
    const ground = sampleH(carPos.current.x, carPos.current.z);
    carPos.current.y = THREE.MathUtils.lerp(carPos.current.y, ground + 0.18, 0.22);

    const car = carRef.current;
    if (car) { car.position.copy(carPos.current); car.rotation.y = carYaw.current; }
  });

  return (
    <>
      {/* sky + fog */}
      <color attach="background" args={["#a8d0ef"]} />
      <fog attach="fog" args={["#b8d8f4", 110, 320]} />
      <Sky sunPosition={[80, 35, 60]} turbidity={0.4} rayleigh={1.2} mieCoefficient={0.003} mieDirectionalG={0.8} />

      {/* lighting — bright, even, outdoor feel */}
      <ambientLight intensity={1.6} color="#f0f8ff" />
      <directionalLight
        position={[40, 70, 30]}
        intensity={2.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={240}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      {/* fill from opposite side so the car is never fully dark */}
      <directionalLight position={[-30, 20, -40]} intensity={0.55} color="#c8d8ff" />

      <Ground />
      <Jeep outer={carRef} />
      <Smoke carRef={carRef} speedRef={speedRef} />
      <Headlights carRef={carRef} />

      {/* free-orbit camera — drag to rotate, scroll to zoom, no auto-follow */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minPolarAngle={Math.PI * 0.10}
        maxPolarAngle={Math.PI * 0.44}
        minDistance={10}
        maxDistance={80}
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
          border: "1px solid rgba(255,255,255,0.4)",
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
        /* isometric-ish start position: high, slightly angled */
        camera={{ fov: 52, near: 0.1, far: 600, position: [0, 30, 26] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene />
      </Canvas>
      <HUD />
    </div>
  );
}
