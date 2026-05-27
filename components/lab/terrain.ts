export const WORLD = 100;
export const HALF  = WORLD / 2;

const CORE_HW  = 4.0;  // half-width of perfectly-flat road core
const BLEND_HW = 4.5;  // smooth transition zone beyond road core

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/* plateau flat: 1 inside core, smooth falloff, 0 beyond core+blend */
function flatPlat(d: number): number {
  if (d <= CORE_HW) return 1;
  if (d >= CORE_HW + BLEND_HW) return 0;
  return smoothstep(1 - (d - CORE_HW) / BLEND_HW);
}

export function sampleH(x: number, z: number): number {
  const raw =
    Math.sin(x * 0.022 + 0.8) * Math.cos(z * 0.020 + 0.3) * 1.20 + // big hills
    Math.sin(x * 0.025)       * Math.cos(z * 0.025)        * 0.50 + // medium
    Math.sin(x * 0.06  + 0.9) * Math.cos(z * 0.055 + 0.4) * 0.20 + // small bumps
    Math.cos(x * 0.12  + z * 0.08)                         * 0.08;  // fine detail

  /* roads are perfectly flat */
  const flatNS   = flatPlat(Math.abs(x));
  const flatEW15 = flatPlat(Math.abs(z - 15));
  const flatEW35 = flatPlat(Math.abs(z - 35));
  const flat = Math.min(1, flatNS + flatEW15 + flatEW35);

  /* mountains only on the LEFT side (x < -CORE_HW);
     right side (x > -CORE_HW) stays flat for a future feature */
  const leftBias = x <= -CORE_HW
    ? Math.min(1, (-x - CORE_HW) / 7)  // ramp up: 0 at road edge, 1 by x=-11
    : 0;

  return raw * (1 - flat) * leftBias;
}
