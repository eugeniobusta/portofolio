export const WORLD = 100;
export const HALF  = WORLD / 2;

export function sampleH(x: number, z: number): number {
  return (
    Math.sin(x * 0.025) * Math.cos(z * 0.025) * 0.28 +
    Math.sin(x * 0.06  + 0.9) * Math.cos(z * 0.055 + 0.4) * 0.10 +
    Math.cos(x * 0.12  + z * 0.08) * 0.05
  );
}
