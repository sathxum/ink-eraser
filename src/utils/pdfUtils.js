import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Load PDF file and render all pages into a single canvas
 * @param {File} file - PDF file
 * @param {Function} onProgress - Progress callback (percent, message)
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function loadPDF(file, onProgress = () => {}) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  onProgress(10, `Loading PDF (${pdf.numPages} pages)...`);

  const scale = 2.0; // High quality
  const pageCanvases = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress(10 + (i / pdf.numPages) * 80, `Rendering page ${i}/${pdf.numPages}...`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;
    pageCanvases.push(canvas);
  }

  onProgress(90, 'Combining pages...');

  // Single page — return directly
  if (pageCanvases.length === 1) return pageCanvases[0];

  // Combine multiple pages vertically
  const totalWidth = Math.max(...pageCanvases.map((c) => c.width));
  const totalHeight =
    pageCanvases.reduce((sum, c) => sum + c.height, 0) + (pageCanvases.length - 1) * 20;

  const combined = document.createElement('canvas');
  combined.width = totalWidth;
  combined.height = totalHeight;
  const ctx = combined.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  let yOffset = 0;
  for (const pageCanvas of pageCanvases) {
    const x = Math.floor((totalWidth - pageCanvas.width) / 2);
    ctx.drawImage(pageCanvas, x, yOffset);
    yOffset += pageCanvas.height + 20;
  }

  return combined;
}

/**
 * Load image file onto a canvas
 * @param {File} file - Image file
 * @returns {Promise<HTMLCanvasElement>}
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if file is a PDF
 */
export function isPDF(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
