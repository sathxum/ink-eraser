import { colorMatch } from './colorUtils';

/**
 * Auto-erase all pixels matching target color across the entire canvas
 * Returns count of erased pixels
 */
export function autoErase(canvas, targetColor, tolerance) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  let erased = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // Already transparent
    const pixel = [data[i], data[i + 1], data[i + 2]];
    if (colorMatch(pixel, targetColor, tolerance)) {
      data[i + 3] = 0; // Make transparent
      erased++;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return erased;
}

/**
 * Manual erase at a specific position with brush radius
 * Only erases pixels matching target color within the brush circle
 */
export function eraseAt(canvas, x, y, targetColor, tolerance, brushSize) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const radius = Math.floor(brushSize / 2);

  const x1 = Math.max(0, Math.floor(x) - radius);
  const y1 = Math.max(0, Math.floor(y) - radius);
  const x2 = Math.min(w, Math.ceil(x) + radius + 1);
  const y2 = Math.min(h, Math.ceil(y) + radius + 1);
  const sw = x2 - x1;
  const sh = y2 - y1;

  if (sw <= 0 || sh <= 0) return 0;

  const imgData = ctx.getImageData(x1, y1, sw, sh);
  const data = imgData.data;
  let erased = 0;

  for (let py = 0; py < sh; py++) {
    for (let px = 0; px < sw; px++) {
      const dx = x1 + px - x;
      const dy = y1 + py - y;
      if (dx * dx + dy * dy > radius * radius) continue;

      const i = (py * sw + px) * 4;
      if (data[i + 3] === 0) continue;

      const pixel = [data[i], data[i + 1], data[i + 2]];
      if (colorMatch(pixel, targetColor, tolerance)) {
        data[i + 3] = 0;
        erased++;
      }
    }
  }

  ctx.putImageData(imgData, x1, y1);
  return erased;
}

/**
 * Interpolate and erase between two points for smooth brush strokes
 */
export function eraseLine(canvas, x1, y1, x2, y2, targetColor, tolerance, brushSize) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.floor(dist / (brushSize * 0.3)));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    eraseAt(canvas, x1 + dx * t, y1 + dy * t, targetColor, tolerance, brushSize);
  }
}

/**
 * Get pixel color at canvas coordinates
 */
export function getPixelColor(canvas, x, y) {
  const ctx = canvas.getContext('2d');
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
  const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
  return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
}

/**
 * Save canvas state (ImageData) for undo
 */
export function saveCanvasState(canvas) {
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Restore canvas state
 */
export function restoreCanvasState(canvas, imageData) {
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Download canvas as PNG
 */
export function downloadCanvas(canvas, filename = 'ink-eraser-result.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
