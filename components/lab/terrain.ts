export const WORLD = 100;
export const HALF  = WORLD / 2;

const CORE_HW  = 4.0;
const BLEND_HW = 4.5;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/* flat plateau inside road core, smooth falloff beyond */
function flatPlat(d: number): number {
  if (d <= CORE_HW) return 1;
  if (d >= CORE_HW + BLEND_HW) return 0;
  return smoothstep(1 - (d - CORE_HW) / BLEND_HW);
}

export function sampleH(x: number, z: number): number {
  /* Use |sin|×|cos| products so terrain is always ≥ 0 (mountain peaks, no pits).
     Add medium-frequency terms for steep slopes that can flip the car. */
  const raw =
    Math.abs(Math.sin(x * 0.030 + 0.9)) * Math.abs(Math.cos(z * 0.025 + 1.1)) * 2.2 +
    Math.abs(Math.sin(x * 0.070 + 2.0)) * Math.abs(Math.sin(z * 0.062 + 0.4)) * 1.0 +
    Math.sin(x * 0.32  + z * 0.26 + 1.3) * 1.1 +   // steep patches → car physics
    Math.cos(x * 0.265 + z * 0.31 + 2.5) * 0.85 +  // more steep patches
    Math.sin(x * 0.12  + z * 0.10) * 0.30;          // fine surface detail

  /* roads perfectly flat inside core, smooth blend beyond */
  const flatNS   = flatPlat(Math.abs(x));
  const flatEW15 = flatPlat(Math.abs(z - 15));
  const flatEW35 = flatPlat(Math.abs(z - 35));
  const flat = Math.min(1, flatNS + flatEW15 + flatEW35);

  /* mountains only on the LEFT side (x < -CORE_HW) — right side reserved */
  const leftBias = x <= -CORE_HW
    ? Math.min(1, (-x - CORE_HW) / 3)
    : 0;

  return Math.max(0, raw) * (1 - flat) * leftBias;
}
