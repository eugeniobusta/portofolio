export const WORLD = 100;
export const HALF  = WORLD / 2;

const PATH_HW = 4.0; // half-width of flat road zones

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function sampleH(x: number, z: number): number {
  const raw =
    Math.sin(x * 0.025) * Math.cos(z * 0.025) * 0.38 +
    Math.sin(x * 0.06  + 0.9) * Math.cos(z * 0.055 + 0.4) * 0.12 +
    Math.cos(x * 0.12  + z * 0.08) * 0.06;

  /* flatten terrain on roads so paths are smooth to drive on */
  const dNS   = Math.abs(x)      / PATH_HW;
  const dEW15 = Math.abs(z - 15) / PATH_HW;
  const dEW35 = Math.abs(z - 35) / PATH_HW;

  const flatNS   = dNS   < 1 ? smoothstep(1 - dNS)   : 0;
  const flatEW15 = dEW15 < 1 ? smoothstep(1 - dEW15) : 0;
  const flatEW35 = dEW35 < 1 ? smoothstep(1 - dEW35) : 0;
  const flat = Math.min(1, flatNS + flatEW15 + flatEW35);

  return raw * (1 - flat);
}
