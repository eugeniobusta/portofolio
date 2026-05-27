export const WORLD = 100;
export const HALF  = WORLD / 2;

const CORE_HW  = 4.0;  // half-width of perfectly-flat road core (= road mesh half-width)
const BLEND_HW = 4.5;  // transition zone beyond core before full bumps

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/* plateau flat function: 1 inside core, smooth transition, 0 beyond core+blend */
function flatPlat(d: number): number {
  if (d <= CORE_HW) return 1;
  if (d >= CORE_HW + BLEND_HW) return 0;
  return smoothstep(1 - (d - CORE_HW) / BLEND_HW);
}

export function sampleH(x: number, z: number): number {
  const raw =
    Math.sin(x * 0.022 + 0.8) * Math.cos(z * 0.020 + 0.3) * 0.90 +  // large hills
    Math.sin(x * 0.025)       * Math.cos(z * 0.025)        * 0.40 +  // medium
    Math.sin(x * 0.06  + 0.9) * Math.cos(z * 0.055 + 0.4) * 0.15 +  // small
    Math.cos(x * 0.12  + z * 0.08)                         * 0.06;   // detail

  /* flat zone: fully flat inside road core, smooth blend outside */
  const flatNS   = flatPlat(Math.abs(x));
  const flatEW15 = flatPlat(Math.abs(z - 15));
  const flatEW35 = flatPlat(Math.abs(z - 35));
  const flat = Math.min(1, flatNS + flatEW15 + flatEW35);

  return raw * (1 - flat);
}
