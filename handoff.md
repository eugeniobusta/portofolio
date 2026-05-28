# Lab Game — Session Handoff

> Last updated: 2026-05-28  
> Branch: `feature/lab` (safe from production — `main` → eugeniobusta.com)

---

## Goal

Build **"The Lab"** — an interactive 3D driving experience that opens as a full-screen portal from the portfolio homepage. The user drives a green jeep around a white terrain and discovers 3D objects representing the portfolio: a poster with bio info, oversized WASD keys as props, and a 3D mouse with a draggable cable. Objects react to the car. The world also has 5 project buildings — drive in through the door to get a popup with project details and links. The aesthetic is bright, minimal, game-like but clean, with a little city layout.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.6 |
| 3D renderer | React Three Fiber | ^9.6.1 |
| 3D helpers | @react-three/drei | ^10.7.7 |
| 3D engine | Three.js | ^0.184.0 |
| Animation | Framer Motion | ^12.40.0 |

**No physics engine** — all collisions are simple distance-based impulse math written by hand.

---

## Current State (fully working, deployed to Vercel preview)

- Green jeep with WASD driving, friction, boundary clamping
- SPACE+W = boost with green Rocket League-style fire particles
- Black exhaust smoke (InstancedMesh)
- Headlights (SpotLight, manually tracked)
- **Heading-based lookahead camera**: orbit target lerps toward car + heading × speed; auto-zooms if car drifts >38 units
- White terrain with vertex colours (flat=white, slopes=warm sand, high=stone, peaks=dark rock)
- **Mountains on LEFT side only** (x < -4): `|sin|×|cos|` terrain formula, peaks up to ~3.4 units
- **Dodecahedron boulders + rubble** scattered in mountain zone only
- **Two yellow MOUNTAINS warning signs** on metal posts at (-7,0,4) and (-7,0,23)
- **City road network**: N-S spine x=0, E-W roads z=15 and z=35
- Flat on roads (CORE_HW=4, BLEND_HW=4.5 smoothstep), bumpy off-road
- **Gravity physics**: car has vertical velocity (GRAVITY=-22), becomes airborne over hills, lands with bump
- Car **roll/pitch** from terrain slope (lerp 0.08 alpha, 0.75 gain)
- **Flip detection**: slope > 0.45 + speed > 7 sustained 0.22s → car tips; "↩ Right the car" green button appears
- 3 pebble groups (grey, black, neon green) — `frustumCulled={false}`
- Camera floor clamp y=1.8
- **Poster**: 22×14 board on green poles at z=46, hero-page content, canvas pre-mirrored for BoxGeometry -Z face
- **WASD keys**: 4 individual stepped-box keycaps with per-key physics
- **Mouse**: RoundedBox, cable to left wall with catenary sag, cable-bump jolts the car
- **Project buildings**: 5 buildings (one per project), dark themed, accent neon roof + door frame, sign canvas, transparent door gap, popup on enter, teleport on close
- **Secret dog house** at (44,0,-44) — red structure, warm interior glow, proximity glow light (starts at dist 22, scales t²), warm orange flash animation (1.3s) on entry → `router.push('/about')`
- **Sign on stakes** at (37,0,-37): poles + board in same group (rotation.y=-π/4), canvas 640×380 with readable text about "You found the corner..."
- **Secret wobbly path**: straight faint ribbon (2 pts, opacity 0.35) from (2,-2) to (44,-44)
- **City life** on right side (positive X): 8 animated pedestrians (walking legs/arms via useFrame), 3 NPC cars on circular paths
- **Hidden about page** at `/app/about/page.tsx` — minimal dark stub, robots noindex, ready to build out

---

## Files in Flight

| File | Role |
|---|---|
| `components/lab/LabGame.tsx` | Main scene: car physics, camera, lighting, Roads, all object placement, CityLife, DogHouse, SecretPath |
| `components/lab/Props.tsx` | WASDKeys + Mouse3D — all physics bodies, geometries, materials |
| `components/lab/Poster.tsx` | Info poster on poles — canvas texture + board mesh |
| `components/lab/ProjectBuildings.tsx` | 5 project buildings — sign canvas, wall mesh, collision trigger, popup callback |
| `components/lab/terrain.ts` | `sampleH(x,z)` with road flatness + mountain leftBias + `WORLD`/`HALF` constants |
| `components/GamePortal.tsx` | Full-screen portal wrapper — fall-from-sky Framer Motion animation |
| `app/about/page.tsx` | Hidden about page — empty stub for user to build |

---

## Architecture Notes

### Terrain formula
`sampleH(x,z)` uses `Math.abs(sin)×Math.abs(cos)` products (always ≥0 = peaks never pits), amplitude 2.2+1.0 for large hills, plus steep-patch terms at freq 0.32 (amplitude 1.1) that can flip the car. Road zones use `flatPlat(d)` = fully flat inside CORE_HW=4, smoothstep falloff over BLEND_HW=4.5. Mountains only where `leftBias > 0` (x < -4). Right side (x > 0) is completely flat.

### Car physics (gravity-based)
`carVY` ref holds vertical velocity. Each frame: `carVY += GRAVITY * dt; carPos.y += carVY * dt`. If `carPos.y <= floorY`: snap to ground, reset carVY, add bump if landing hard. Car becomes airborne naturally over ridges at speed. Horizontal: ACCEL=38, BRAKE=22, FRIC=0.92, BOOST_ACCEL=85, MAX_SPD=48.

### Car flip mechanic
`flipTimer` ref: increments when |localRight slope| > 0.45 AND |spd| > 7. After 0.22s triggers: carRoll snaps to ±144°, `flippedRef=true`, speed=0, `onFlip()` called. "↩ Right the car" button appears in LabGame overlay. On click: `rightCarRef.current=true`, Scene's useFrame consumes it next frame (resets all, teleports to (0,0,3)).

### Sign canvas / UV analysis
- **Poster board**: BoxGeometry -Z face has uDir=-1 (mirrors UV). Pre-flip canvas: `ctx.translate(W,0); ctx.scale(-1,1)`. See `Poster.tsx`.
- **Project building signs**: PlaneGeometry with rotation.y=π inside group at ±π/2 or π. Combined rotation gives NON-mirrored UV for all 5 buildings. Do NOT pre-flip.
- **Dog house sign**: PlaneGeometry with no local rotation inside group at rotation.y=-π/4. UV analysis confirms non-mirrored from center approach direction.

### Building collision (AABB-circle)
Three solid rects per building in 2D building-local space. Car position transformed to local via Ry(-rotY). Push resolved per rect, rotated back.

### Camera (heading lookahead)
`OrbitControls` priority -1. Each frame: orbit target lerps toward `carPos + heading × clamp(|speed|×0.4, 2, 14)`. Camera floor clamped at y=1.8.

### Dog house trigger + flash
`DogHouse` has `glowRef` (pointLight) updated in useFrame: `intensity = t² × 18` where `t = max(0, 1 - dist/22)`. On enter: `onEnter()` → LabGame sets `dogEntering=true` → CSS `dogPortal` keyframe animation (orange radial burst → white, 1.3s) → `setTimeout(() => router.push('/about'), 1300)`.

### City life (positive X side)
`CityLife` component renders 8 `Person` instances + 3 `NPCCar` instances. Each has its own `useFrame` that updates position (circular walk/drive paths) and imperatively sets mesh refs for leg/arm swing animation. Persons at x=18–38, z=-3 to 26. NPC cars in loops around (28,0,10), (22,0,24), (33,0,18).

### Physics pattern (props)
Every pushable object uses a `Body` type (`pos`, `vel`, `rotY`, `rotVelY`) and three functions:
- `stepBody(b, dt, groundOffset)` — friction + integrate + snap to terrain
- `carPush(b, carPos, carSpeed, bodyR, dt)` — impulse when car overlaps body
- `bodyPush(a, b, minDist)` — mutual separation (keys use this)

---

## Object Positions (world space)

| Object | Position | Notes |
|---|---|---|
| Car start | (-2, ~0.3, 3) | rotated yaw=0.18π |
| Poster | (0, 0, 46) | near far boundary |
| WASD keys | groupCenter=(16, 0, 10) | world +X = screen left |
| Mouse | (-17, 0.8, 8) | world -X = screen right |
| Buildings | (-38,0,15) (-38,0,35) (38,0,15) (38,0,35) (0,0,-36) | rotY: -π/2, -π/2, π/2, π/2, π |
| Mountain signs | (-7,0,4) (-7,0,23) | yellow road signs on metal posts |
| Dog house | (44,0,-44) | rotY=3π/4, door faces center |
| Dog sign | group at (37,0,-37) rotY=-π/4 | poles+board in same group |
| Secret path | (2,-2) → (44,-44) | straight faint ribbon |
| E-W roads | z=15, z=35 | width 90 units |
| N-S road | x=0 | length 100 units |

---

## Known Issues / Failed Attempts

### Pre-flip on sign canvas
Adding `ctx.translate(W,0); ctx.scale(-1,1)` to building signs caused double-mirror. Do NOT add. Only use it on the Poster board (BoxGeometry -Z face).

### Sign covering door area
Canvas background must only fill y=0 to DC=462 (door threshold). Button above DC. Material: `transparent alphaTest={0.08}`.

### OrbitControls zoom fighting
Modify `ctrl.spherical.radius`, NOT `camera.position` directly.

### Mouse floating
`stepBody` groundOffset must be 0.02, not MOUSE_H/2+offset (mesh already offset inside group).

### Roads z-fighting
Use PlaneGeometry at y=0.005 with `polygonOffset polygonOffsetFactor={-2}`. NOT BoxGeometry.

---

## Next Steps

1. **Build out `/app/about`** — user wants to design this page themselves

2. **Replace poster photo placeholder** — `Poster.tsx` has generated silhouette avatar. Replace with `THREE.TextureLoader` once real photo available.

3. **Wire contact form to `?project=` param** — `ProjectPopup` sets `/?project=...#contact`. Contact form needs to read `project` query param.

4. **Merge to main** — when lab ready, merge `feature/lab` into `main`.

5. **EmailJS contact form** — needs `.env.local` with `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `_TEMPLATE_ID`, `_PUBLIC_KEY`.

6. **Possible: right side feature** — user mentioned reserving positive-X right side for a feature (currently has city life pedestrians/NPC cars).

---

## Environment / Run

```bash
cd /Users/eugenio/cool_programs/portfolio
git checkout feature/lab
npm run dev          # http://localhost:3000
```

The lab opens from the "Enter the Lab" button on the hero page. Press **Escape** to close.  
WASD = drive · SPACE+W = boost · drag = orbit camera · scroll = zoom  
Mountains on LEFT (negative X) · City life on RIGHT (positive X) · Dog house at bottom-right corner (44,0,-44)

---

## Git Commits (this feature branch)

```
feat(lab): poster with poles, pushable WASD keys, 3D mouse with cable bump
fix(lab): frustum keycaps with collision, rounded mouse, bigger poster
fix(lab): solid keys, correct orientations, poster facing camera
fix(lab): upright key letters, mouse on ground, hero-style poster
feat(lab): building collision, fixed signs, popup with GitHub/live/talk buttons, teleport on close
fix(lab): correct sign orientation, transparent door gap, city paths, heading camera
feat(lab): mountains on left side + car roll/pitch/flip mechanic
feat(lab): mountain terrain colors, rocks, warning signs, better car physics
feat(lab): secret dog house corner + wobbly path + hidden about page
feat(lab): gravity physics, city life, dog house glow+flash, sign fix
```
