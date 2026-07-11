/**
 * Color utilities — Delta E (CIE76) perceptual color matching
 * Works in CIE LAB color space for human-eye accurate matching
 */

// sRGB → Linear RGB
function srgbToLinear(c) {
  c = c / 255;
  return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}

// Linear RGB → XYZ (D65 illuminant)
function linearToXyz(rl, gl, bl) {
  return {
    x: (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047,
    y: (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) / 1.0,
    z: (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883,
  };
}

// XYZ → LAB
function xyzToLab(x, y, z) {
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  x = f(x);
  y = f(y);
  z = f(z);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/**
 * Convert RGB to CIE LAB
 */
export function rgbToLab(r, g, b) {
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  const { x, y, z } = linearToXyz(rl, gl, bl);
  return xyzToLab(x, y, z);
}

/**
 * Delta E (CIE76) — perceptual color distance
 * 0 = identical, <1 = imperceptible, <2 = barely noticeable,
 * <3.5 = noticeable on close inspection, <5 = noticeable at a glance
 */
export function deltaE(rgb1, rgb2) {
  const lab1 = rgbToLab(rgb1[0], rgb1[1], rgb1[2]);
  const lab2 = rgbToLab(rgb2[0], rgb2[1], rgb2[2]);
  return Math.sqrt(
    (lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2
  );
}

/**
 * Euclidean RGB distance (fast pre-check)
 */
export function rgbDistance(rgb1, rgb2) {
  return Math.sqrt(
    (rgb1[0] - rgb2[0]) ** 2 + (rgb1[1] - rgb2[1]) ** 2 + (rgb1[2] - rgb2[2]) ** 2
  );
}

/**
 * Check if pixel color matches target within tolerance
 * Uses Delta E for perceptual accuracy with RGB quick-reject
 */
export function colorMatch(pixelRgb, targetRgb, tolerance) {
  // Quick reject: if RGB distance is huge, skip expensive Delta E
  if (rgbDistance(pixelRgb, targetRgb) > tolerance * 3.5) return false;
  return deltaE(pixelRgb, targetRgb) <= tolerance;
}

/**
 * RGB to hex
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Hex to RGB array
 */
export function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ];
}
