"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/* ─── constants ──────────────────────────────────────────────── */
const MAX_SMOKE = 40;
const JEEP_GREEN  = "#2a5c1e";
const JEEP_DARK   = "#1a3a10";
const WHEEL_COLOR = "#111111";
const METAL_GREY  = "#3a3a3a";

/* ─── keyboard state ──────────────────────────────────────────── */
function useKeys() {
  const keys = useRef({ w: false, a: false, s: false, d: false });
  useEffect(() => {
    const TRACKED = new Set(["w", "a", "s", "d"]);
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (TRACKED.has(k)) { e.preventDefault(); (keys.current as Record<string,boolean>)[k] = true; }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (TRACKED.has(k)) (keys.current as Record<string,boolean>)[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  return keys;
}

/* ─── terrain geometry (generated once) ─────────────────────── */
function buildTerrain() {
  const g = new THREE.PlaneGeometry(300, 300, 120, 120);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y =
      Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.2 +
      Math.sin(x * 0.09 + 1.1) * Math.cos(z * 0.08 + 0.7) * 1.0 +
      Math.sin(x * 0.22) * Math.sin(z * 0.18 + 2.3) * 0.45 +
      Math.cos(x * 0.15 + z * 0.11) * 0.3;
    pos.setY(i, y);
  }
  g.computeVertexNormals();
  return g;
}

/* ─── terrain height sampler ─────────────────────────────────── */
function sampleHeight(x: number, z: number) {
  return (
    Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.2 +
    Math.sin(x * 0.09 + 1.1) * Math.cos(z * 0.08 + 0.7) * 1.0 +
    Math.sin(x * 0.22) * Math.sin(z * 0.18 + 2.3) * 0.45 +
    Math.cos(x * 0.15 + z * 0.11) * 0.3
  );
}

/* ─── Terrain ─────────────────────────────────────────────────── */
function Terrain() {
  const geo = useMemo(() => buildTerrain(), []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#d4d4cc" roughness={0.95} metalness={0} />
    </mesh>
  );
}

/* ─── Jeep mesh ───────────────────────────────────────────────── */
function JeepMesh({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) {
  const wheelPositions: [number, number, number][] = [
    [-0.92, 0, 1.15],
    [ 0.92, 0, 1.15],
    [-0.92, 0, -1.15],
    [ 0.92, 0, -1.15],
  ];
  return (
    <group ref={groupRef as React.RefObject<THREE.Group>}>
      {/* chassis */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.85, 0.55, 3.8]} />
        <meshStandardMaterial color={JEEP_GREEN} roughness={0.55} metalness={0.25} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, 1.12, -0.12]} castShadow>
        <boxGeometry args={[1.65, 0.58, 1.9]} />
        <meshStandardMaterial color={JEEP_DARK} roughness={0.65} />
      </mesh>
      {/* windshield */}
      <mesh position={[0, 1.04, 0.82]} rotation={[-0.28, 0, 0]}>
        <boxGeometry args={[1.55, 0.48, 0.04]} />
        <meshStandardMaterial color="#7aadcc" transparent opacity={0.38} roughness={0.1} />
      </mesh>
      {/* rear window */}
      <mesh position={[0, 1.04, -1.04]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.52, 0.44, 0.04]} />
        <meshStandardMaterial color="#7aadcc" transparent opacity={0.32} roughness={0.1} />
      </mesh>
      {/* front bumper */}
      <mesh position={[0, 0.34, 2.08]} castShadow>
        <boxGeometry args={[1.9, 0.28, 0.18]} />
        <meshStandardMaterial color={METAL_GREY} roughness={0.7} metalness={0.5} />
      </mesh>
      {/* rear bumper */}
      <mesh position={[0, 0.34, -2.08]} castShadow>
        <boxGeometry args={[1.9, 0.22, 0.14]} />
        <meshStandardMaterial color={METAL_GREY} roughness={0.7} metalness={0.5} />
      </mesh>
      {/* roof rack rails */}
      {([-0.72, 0.72] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.44, -0.12]} castShadow>
          <boxGeometry args={[0.05, 0.05, 1.75]} />
          <meshStandardMaterial color={METAL_GREY} metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* roll bar */}
      <mesh position={[0, 1.44, -0.95]} castShadow>
        <boxGeometry args={[1.6, 0.06, 0.06]} />
        <meshStandardMaterial color={METAL_GREY} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* exhaust pipe */}
      <mesh position={[-0.55, 0.28, -1.96]} rotation={[Math.PI / 2, 0, 0.08]}>
        <cylinderGeometry args={[0.055, 0.07, 0.38, 7]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* headlights */}
      {([-0.6, 0.6] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.7, 1.93]}>
          <boxGeometry args={[0.38, 0.2, 0.06]} />
          <meshStandardMaterial color="#ffffee" emissive="#ffffaa" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* taillights */}
      {([-0.6, 0.6] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.7, -1.93]}>
          <boxGeometry args={[0.32, 0.18, 0.05]} />
          <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* wheels */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* tyre */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.3, 14]} />
            <meshStandardMaterial color={WHEEL_COLOR} roughness={0.92} />
          </mesh>
          {/* rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.32, 8]} />
            <meshStandardMaterial color="#888" metalness={0.75} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Smoke particles ─────────────────────────────────────────── */
type Puff = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
};

function ExhaustSmoke({ carRef, speedRef }: {
  carRef: React.RefObject<THREE.Group>;
  speedRef: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const puffs = useRef<Puff[]>(
    Array.from({ length: MAX_SMOKE }, () => ({
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      life: 0, maxLife: 1, active: false,
    }))
  );
  const spawnTimer = useRef(0);
  const _mat = useMemo(() => new THREE.Matrix4(), []);
  const _quat = useMemo(() => new THREE.Quaternion(), []);
  const _scale = useMemo(() => new THREE.Vector3(), []);
  const _color = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const car = carRef.current;
    const speed = speedRef.current ?? 0;
    if (!car || !meshRef.current) return;

    /* spawn */
    spawnTimer.current -= dt;
    const shouldEmit = Math.abs(speed) > 0.4;
    if (shouldEmit && spawnTimer.current <= 0) {
      spawnTimer.current = 0.045;
      const puff = puffs.current.find(p => !p.active);
      if (puff) {
        /* exhaust tip in world space */
        const local = new THREE.Vector3(-0.55, 0.28, -2.15);
        local.applyMatrix4(car.matrixWorld);
        puff.pos.copy(local);
        puff.vel.set(
          (Math.random() - 0.5) * 0.4,
          0.5 + Math.random() * 0.5,
          (Math.random() - 0.5) * 0.4
        );
        puff.life = 0;
        puff.maxLife = 0.9 + Math.random() * 0.6;
        puff.active = true;
      }
    }

    /* update & render */
    let idx = 0;
    for (const puff of puffs.current) {
      if (puff.active) {
        puff.life += dt;
        if (puff.life >= puff.maxLife) { puff.active = false; continue; }
        puff.pos.addScaledVector(puff.vel, dt);
        puff.vel.y -= 0.04 * dt; // slight settle

        const t = puff.life / puff.maxLife;
        const s = 0.12 + t * 0.55;
        const alpha = (1 - t) * 0.55;

        _mat.compose(
          puff.pos,
          _quat.identity(),
          _scale.set(s, s, s)
        );
        meshRef.current.setMatrixAt(idx, _mat);
        _color.setRGB(0.72 + t * 0.18, 0.72 + t * 0.18, 0.72 + t * 0.18);
        (meshRef.current.material as THREE.MeshStandardMaterial).opacity = alpha;
        idx++;
      }
    }
    /* blank out unused slots */
    for (let i = idx; i < MAX_SMOKE; i++) {
      _mat.compose(new THREE.Vector3(0, -999, 0), _quat.identity(), _scale.set(0, 0, 0));
      meshRef.current.setMatrixAt(i, _mat);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_SMOKE]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshStandardMaterial
        color="#b8b8b8"
        transparent
        opacity={0.5}
        depthWrite={false}
        roughness={1}
      />
    </instancedMesh>
  );
}

/* ─── Planets ─────────────────────────────────────────────────── */
const PLANETS = [
  { pos: [55,  42, -90] as [number,number,number], r: 5.5, color: "#d4a853", emissive: "#8a6020", rings: true },
  { pos: [-70, 35, -110] as [number,number,number], r: 8.0, color: "#4a7fc4", emissive: "#1a3a7a", rings: false },
  { pos: [90,  60, -80] as [number,number,number], r: 3.2, color: "#c47a4a", emissive: "#7a3a1a", rings: false },
  { pos: [-30, 28, -95] as [number,number,number], r: 2.0, color: "#aaaacc", emissive: "#444466", rings: false },
];

function Planets() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = state.clock.elapsedTime;
      const pulse = Math.sin(t * 0.3 + i * 1.4) * 0.04 + 0.96;
      m.scale.setScalar(pulse);
    });
  });
  return (
    <>
      {PLANETS.map((p, i) => (
        <group key={i} position={p.pos}>
          <mesh ref={el => { refs.current[i] = el; }} castShadow>
            <sphereGeometry args={[p.r, 28, 28]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.emissive}
              emissiveIntensity={0.35}
              roughness={0.75}
            />
          </mesh>
          {p.rings && (
            <mesh rotation={[Math.PI * 0.42, 0.2, 0]}>
              <torusGeometry args={[p.r * 1.65, p.r * 0.14, 3, 48]} />
              <meshStandardMaterial color="#c8a050" transparent opacity={0.55} />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

/* ─── Camera controller ───────────────────────────────────────── */
function CameraController({ carRef }: { carRef: React.RefObject<THREE.Group> }) {
  const { camera } = useThree();
  const _target = useMemo(() => new THREE.Vector3(), []);
  const _lookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const car = carRef.current;
    if (!car) return;
    const yaw = car.rotation.y;
    /* position camera behind and above */
    _target.set(
      car.position.x - Math.sin(yaw) * 9,
      car.position.y + 5,
      car.position.z - Math.cos(yaw) * 9
    );
    camera.position.lerp(_target, 0.07);
    _lookAt.set(
      car.position.x + Math.sin(yaw) * 1.5,
      car.position.y + 0.8,
      car.position.z + Math.cos(yaw) * 1.5
    );
    camera.lookAt(_lookAt);
  });
  return null;
}

/* ─── Main scene (inside Canvas) ─────────────────────────────── */
function Scene() {
  const keys        = useKeys();
  const carGroupRef = useRef<THREE.Group>(null!);
  const speedRef    = useRef(0);

  /* car physics state kept in refs to avoid re-renders */
  const carPos = useRef(new THREE.Vector3(0, 2, 0));
  const carYaw = useRef(0);

  useFrame((_, delta) => {
    const dt    = Math.min(delta, 0.05);
    const { w, a, s, d } = keys.current;
    let speed = speedRef.current;

    if (w)  speed += 9.5 * dt;
    if (s)  speed -= 6.5 * dt;
    speed *= 0.90;                             // friction
    speed  = Math.max(-5, Math.min(14, speed));// clamp
    speedRef.current = speed;

    if (Math.abs(speed) > 0.08) {
      const steer = ((a ? 1 : 0) - (d ? 1 : 0)) * 1.9 * dt * Math.sign(speed);
      carYaw.current += steer;
    }

    carPos.current.x += Math.sin(carYaw.current) * speed * dt;
    carPos.current.z += Math.cos(carYaw.current) * speed * dt;

    /* settle car onto terrain */
    const groundY = sampleHeight(carPos.current.x, carPos.current.z);
    carPos.current.y = THREE.MathUtils.lerp(carPos.current.y, groundY + 0.36, 0.18);

    const car = carGroupRef.current;
    if (car) {
      car.position.copy(carPos.current);
      car.rotation.y = carYaw.current;
    }
  });

  return (
    <>
      {/* sky */}
      <color attach="background" args={["#060c14"]} />
      <fog attach="fog" args={["#060c14", 80, 200]} />

      {/* lighting */}
      <ambientLight intensity={0.18} color="#334466" />
      <directionalLight
        position={[30, 60, 20]}
        intensity={0.55}
        color="#99aacc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      {/* headlight glow */}
      <pointLight
        position={[0, 1, 2]}
        intensity={3}
        color="#fffae0"
        distance={14}
        decay={2}
      />

      {/* stars */}
      <Stars radius={140} depth={60} count={7000} factor={5} saturation={0.1} fade speed={0.6} />

      <Planets />
      <Terrain />
      <JeepMesh groupRef={carGroupRef} />
      <ExhaustSmoke carRef={carGroupRef} speedRef={speedRef} />
      <CameraController carRef={carGroupRef} />
    </>
  );
}

/* ─── HUD overlay ─────────────────────────────────────────────── */
function HUD() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none select-none">
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-full text-xs font-mono"
        style={{
          background: "oklch(12% 0.008 250 / 0.72)",
          border: "1px solid oklch(30% 0.01 250 / 0.5)",
          color: "oklch(62% 0.005 250)",
          backdropFilter: "blur(6px)",
        }}
      >
        <span className="flex gap-1">
          {["W","A","S","D"].map(k => (
            <kbd key={k}
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                background: "oklch(18% 0.008 250)",
                border: "1px solid oklch(32% 0.01 250)",
                color: "oklch(76% 0.006 250)",
              }}
            >{k}</kbd>
          ))}
        </span>
        <span>to drive</span>
      </div>
    </div>
  );
}

/* ─── Entry point (exported, dynamically imported) ───────────── */
export default function LabGame() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return null;

  return (
    <div className="relative w-full h-full" style={{ background: "#060c14" }}>
      <Canvas
        shadows
        camera={{ fov: 65, near: 0.1, far: 500, position: [0, 6, 12] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene />
      </Canvas>
      <HUD />
    </div>
  );
}
