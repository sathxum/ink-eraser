# 🖊️ InkEraser — Document Mistake Editor

Pixel-perfect ink removal from handwritten documents. Built with React + Vite.

## Features

- 🎯 **Delta E (CIE76) Perceptual Color Matching** — 100% accurate ink detection
- ✏️ **Pixel-Level Erase** — Remove single pixels of ink
- 👆 **Manual Touch Erase** — Finger/mouse brush erasing
- 📄 **PDF + Image Support** — PDF.js renders at 2x quality
- 🔍 **Zoom & Pan** — Mouse wheel, pinch-to-zoom, pan
- ↩️ **Undo/Redo** — 25-step history
- 📥 **PNG Export** — Download cleaned result

## How to Use

1. Upload a PDF or image
2. Tap "Pick" → tap on the pen ink color in the document
3. Adjust tolerance (lower = more precise, higher = catches more shades)
4. Tap "Auto" to erase all matching pixels, or "Erase" for manual brush
5. Download the result

## Deploy to Cloudflare Pages

```
Build command: npm run build
Build output directory: dist
```

## Tech Stack

- React 19 + Vite
- pdfjs-dist for PDF rendering
- Canvas 2D API for pixel manipulation
- CIE LAB color space (Delta E) for perceptual matching

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
