# Lab Game — Session Handoff

> Last updated: 2026-05-27  
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

**No physics engine** — all collisions are simple distance-based impulse math written by hand (`carPush`, `bodyPush`, `stepBody` in `Props.tsx`).

---

## Current State

The game is **functional and deployed to the Vercel preview URL** for `feature/lab`.

What's working:
- Green jeep with WASD driving, friction, boundary clamping
- SPACE+W = boost with green Rocket League-style fire particles (InstancedMesh, vertexColors)
- Black exhaust smoke (InstancedMesh, spawns on movement)
- Headlights (SpotLight, manually tracked to car position each frame)
- **Heading-based lookahead camera**: orbit target lerps toward car + heading direction × speed; auto-zooms if car drifts >38 units; shows destination building without manual drag
- White terrain with deformations (`sampleH`) — flat on roads, bumpy off-road
- **City road network**: N-S spine at x=0, E-W roads at z=15 and z=35; matched to terrain flat zones
- 3 pebble groups (grey, black, neon green) — `frustumCulled={false}` to prevent zoom-culling bug
- Camera floor clamp at y=1.8 (prevents ground clip)
- **Poster**: 22×14 board on green poles showing hero-page content at z=46
- **WASD keys**: 4 individual stepped-box keycaps with per-key physics, key-to-key collision, letter planes on top
- **Mouse**: RoundedBox Logitech-style, sits on ground, cable to left wall with catenary sag, cable-bump jolts the car
- **Project buildings**: 5 buildings (one per project), each with:
  - Dark themed exterior, accent-coloured neon roof + door frame
  - Sign plane on front face — correct orientation (no pre-flip needed), content above door only
  - Door gap is visually open (transparent canvas pixels below y≈462 / world y<4.6)
  - Interior lit through door with accent point light
  - AABB-circle wall collision per building (3 solid rects per building: left col, right col, back wall)
  - Popup triggered only when car drives THROUGH the door into the interior
  - Popup has: GitHub button (with icon), See Live / Not live yet, 💬 Talk about this → contact form prefilled
  - Teleport outside building when popup is closed

---

## Files in Flight

| File | Role |
|---|---|
| `components/lab/LabGame.tsx` | Main scene: car physics, camera, lighting, Roads, all object placement |
| `components/lab/Props.tsx` | WASDKeys + Mouse3D — all physics bodies, geometries, materials |
| `components/lab/Poster.tsx` | Info poster on poles — canvas texture + board mesh |
| `components/lab/ProjectBuildings.tsx` | 5 project buildings — sign canvas, wall mesh, collision trigger, popup callback |
| `components/lab/terrain.ts` | `sampleH(x,z)` with road flatness + `WORLD`/`HALF` constants |
| `components/GamePortal.tsx` | Full-screen portal wrapper — fall-from-sky Framer Motion animation |

---

## Architecture Notes

### Sign canvas / UV mirror (important!)
The sign plane uses `rotation={[0, Math.PI, 0]}` to face outward from the building. For ALL building rotations (±PI/2, PI), the combined group+plane rotation results in **non-mirrored UV from the viewer's perspective** — verified by tracing UV(0,0) and UV(1,0) vertex world positions and projecting onto camera-right. A pre-flip would double-mirror. **Do NOT add `ctx.translate(W,0); ctx.scale(-1,1)` to the sign canvas.**

### Transparent door gap
Canvas is drawn with `ctx.fillRect(0, 0, W, DC)` where `DC=462` (canvas Y corresponding to world y≈4.6 = DOOR_H). Below DC the canvas pixels are alpha=0. The sign material uses `transparent alphaTest={0.08}` so the door gap shows through the plane to whatever is behind (interior, sky). The "DRIVE IN TO EXPLORE" button is positioned in the canvas at y=405, safely above DC.

### Physics pattern
Every pushable object uses a `Body` type (`pos`, `vel`, `rotY`, `rotVelY`) and three functions:
- `stepBody(b, dt, groundOffset)` — friction + integrate + snap to terrain height
- `carPush(b, carPos, carSpeed, bodyR, dt)` — impulse when car overlaps body radius
- `bodyPush(a, b, minDist)` — mutual separation between two bodies (keys use this to prevent overlap)

### Camera (heading lookahead)
`OrbitControls` runs at priority -1 in useFrame. The scene runs at priority 0 (after). Each frame: orbit target lerps toward `carPos + heading * clamp(|speed|*0.4, 2, 14)`. This leans the camera forward so destination buildings enter view automatically. Manual drag/zoom still work. Camera floor clamped at y=1.8.

### Road network + terrain
`terrain.ts` defines flat zones around x=0 (N-S spine), z=15, z=35 using smoothstep falloff over `PATH_HW=4.0` units. `LabGame.tsx` has a `Roads` component drawing three `boxGeometry` meshes at these positions (color `#c8c0a8`). The pebble scatter uses `sampleH` so pebbles appear lower on paths.

### Building collision (AABB-circle)
Three solid rects per building in 2D building-local space. Car position is transformed to local via Ry(-rotY). Push resolved per rect, then rotated back to world space. Rect extents account for BLDG_WT=0.5 wall thickness.

### Poster UV mirror fix
Three.js `BoxGeometry` builds the `-Z` face with `uDir = -1`, which mirrors the texture horizontally. The poster board-front sits at local `z = -0.12` (closer to camera). To compensate, the Poster canvas is drawn with `ctx.translate(W, 0); ctx.scale(-1, 1)` before all content.

### Pebble frustum culling bug
`InstancedMesh` uses the base geometry's bounding sphere for frustum culling. Fix: `frustumCulled={false}` on every `instancedMesh`.

---

## Object Positions (world space)

| Object | Position | Notes |
|---|---|---|
| Car start | (-2, ~0.3, 3) | rotated slightly off-centre (yaw=0.18π) |
| Poster | (0, 0, 46) | near the far boundary wall (HALF=50) |
| WASD keys | groupCenter=(16, 0, 10) | world +X = screen left from initial camera |
| Mouse | (-17, 0.8, 8) | world -X = screen right from initial camera |
| Cable anchor | (-44, 0, 8) | left wall, near mouse side |
| Buildings | (-38,0,15) (-38,0,35) (38,0,15) (38,0,35) (0,0,-36) | rotY: -π/2, -π/2, π/2, π/2, π |
| E-W roads | z=15, z=35 | width 90 units |
| N-S road | x=0 | length 100 units |

---

## Failed Attempts

### Pre-flip on sign canvas
Added `ctx.translate(W,0); ctx.scale(-1,1)` thinking the PlaneGeometry rotation [0,PI,0] would mirror UVs. Full UV trace analysis showed it DOES NOT mirror for any of the building rotations — the pre-flip was the cause of the mirroring. Removed.

### Sign covering door area
Initially used full BLDG_W × BLDG_H plane, canvas filled entirely. Button at canvas y=556 mapped to world y≈2.5 (inside door). Fixed by: only filling canvas background for y<462 (door threshold), moving button to y=405, using `transparent alphaTest` on material.

### Custom frustum geometry for keycaps
Tried `BufferGeometry` truncated pyramid — face winding wrong. Switched to two stacked `BoxGeometry` meshes.

### Mouse floating with large groundOffset
`stepBody` called with `groundOffset = MOUSE_H/2 + 0.05 = 0.80` but the mesh was already offset inside the group. Fix: `groundOffset = 0.02`.

### Poster facing wrong way
Board-front was at local z=+0.12, board-back at z=-0.12. Fixed: swap offsets.

### Key letters upside down
Rotation `[-Math.PI/2, 0, 0]` → fix: `[-Math.PI/2, 0, Math.PI]`.

### OrbitControls zoom fighting
Modified `camera.position` directly → OrbitControls overrides. Fix: modify `ctrl.spherical.radius`.

---

## Next Steps (priority order)

1. **Verify in Vercel preview** — building signs should be readable/not-mirrored, door gap visible, roads visible, camera heads toward buildings.

2. **Replace poster photo placeholder** — `Poster.tsx` has a generated silhouette avatar at x=134, y=200, r=80. Replace with `THREE.TextureLoader` once a real photo is available.

3. **Add more world content** — the 100×100 world is still mostly empty outside the roads:
   - Skill chips as scattered collectibles
   - Miniature laptop/monitor near the start area
   - Decorative lamp posts along roads

4. **Wire contact form to `?project=` param** — `ProjectPopup` sets `/?project=...#contact` URL. The contact form needs to read the `project` query param on load and pre-fill the message field.

5. **Merge to main** — when lab is ready for production, merge `feature/lab` into `main`. Vercel will deploy to `eugeniobusta.com`.

6. **EmailJS contact form** — needs `.env.local` with `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `_TEMPLATE_ID`, `_PUBLIC_KEY`.

---

## Git Commits (chronological summary)

```
feat(lab): poster with poles, pushable WASD keys, 3D mouse with cable bump
fix(lab): frustum keycaps with collision, rounded mouse, bigger poster
fix(lab): solid keys, correct orientations, poster facing camera
fix(lab): upright key letters, mouse on ground, hero-style poster
feat(lab): building collision, fixed signs, popup with GitHub/live/talk buttons, teleport on close
fix(lab): correct sign orientation, transparent door gap, city paths, heading camera
```

---

## Environment / Run

```bash
cd /Users/eugenio/cool_programs/portfolio
git checkout feature/lab
npm run dev          # http://localhost:3000
```

The lab opens from the "Enter the Lab" button on the hero page. Press **Escape** to close.  
WASD = drive · SPACE+W = boost · drag = orbit camera · scroll = zoom
