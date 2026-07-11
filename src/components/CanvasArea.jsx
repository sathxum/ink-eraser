import { useEffect, useRef, useCallback } from 'react';
import { autoErase, eraseAt, eraseLine, getPixelColor } from '../utils/canvasUtils';
import { rgbToHex } from '../utils/colorUtils';
import './CanvasArea.css';

export default function CanvasArea({
  mainCanvasRef,
  overlayCanvasRef,
  containerRef,
  imageSize,
  zoom,
  pan,
  mode,
  targetColor,
  tolerance,
  brushSize,
  screenToCanvas,
  zoomAt,
  saveState,
  onStatusUpdate,
  onToast,
  setLoading,
}) {
  const isErasing = useRef(false);
  const lastPos = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const touchDist = useRef(0);
  const touchCenter = useRef(null);

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  // Update overlay canvas transform
  useEffect(() => {
    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.width = imageSize.width;
      overlayCanvasRef.current.height = imageSize.height;
    }
  }, [imageSize, overlayCanvasRef]);

  // --- Mouse Events ---
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      const pos = screenToCanvas(e.clientX, e.clientY);

      if (mode === 'pick') {
        const pixel = getPixelColor(mainCanvasRef.current, pos.x, pos.y);
        if (pixel) {
          onStatusUpdate({ color: pixel });
          onToast(`Color picked: ${rgbToHex(pixel.r, pixel.g, pixel.b)}`);
        }
      } else if (mode === 'erase') {
        isErasing.current = true;
        saveState();
        eraseAt(mainCanvasRef.current, pos.x, pos.y, targetColor, tolerance, brushSize);
        lastPos.current = pos;
      }
    },
    [mode, screenToCanvas, targetColor, tolerance, brushSize, saveState, mainCanvasRef, onStatusUpdate, onToast]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const pos = screenToCanvas(e.clientX, e.clientY);

      // Status update
      const pixel = getPixelColor(mainCanvasRef.current, pos.x, pos.y);
      onStatusUpdate({ coords: pos, pixel, mode });

      if (mode === 'pick') {
        // Draw magnifier on overlay
        drawMagnifier(pos);
      } else if (mode === 'erase') {
        if (isErasing.current && lastPos.current) {
          eraseLine(
            mainCanvasRef.current,
            lastPos.current.x,
            lastPos.current.y,
            pos.x,
            pos.y,
            targetColor,
            tolerance,
            brushSize
          );
          lastPos.current = pos;
        }
      }
    },
    [mode, screenToCanvas, targetColor, tolerance, brushSize, mainCanvasRef, onStatusUpdate]
  );

  const handleMouseUp = useCallback(() => {
    isErasing.current = false;
    lastPos.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearOverlay();
    isErasing.current = false;
    lastPos.current = null;
  }, []);

  // --- Touch Events ---
  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchDist.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchCenter.current = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };
        return;
      }
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const pos = screenToCanvas(touch.clientX, touch.clientY);

      if (mode === 'pick') {
        e.preventDefault();
        const pixel = getPixelColor(mainCanvasRef.current, pos.x, pos.y);
        if (pixel) {
          onStatusUpdate({ color: pixel });
          onToast(`Color: ${rgbToHex(pixel.r, pixel.g, pixel.b)}`);
        }
      } else if (mode === 'erase') {
        e.preventDefault();
        isErasing.current = true;
        saveState();
        eraseAt(mainCanvasRef.current, pos.x, pos.y, targetColor, tolerance, brushSize);
        lastPos.current = pos;
      }
    },
    [mode, screenToCanvas, targetColor, tolerance, brushSize, saveState, mainCanvasRef, onStatusUpdate, onToast]
  );

  const handleTouchMove = useCallback(
    (e) => {
      // Pinch zoom
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && touchDist.current > 0) {
          zoomAt(dist / touchDist.current, center.x - rect.left, center.y - rect.top);
        }
        touchDist.current = dist;
        touchCenter.current = center;
        return;
      }
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const pos = screenToCanvas(touch.clientX, touch.clientY);
      onStatusUpdate({ coords: pos, mode });

      if (mode === 'erase' && isErasing.current) {
        e.preventDefault();
        if (lastPos.current) {
          eraseLine(
            mainCanvasRef.current,
            lastPos.current.x,
            lastPos.current.y,
            pos.x,
            pos.y,
            targetColor,
            tolerance,
            brushSize
          );
        }
        lastPos.current = pos;
      }
    },
    [mode, screenToCanvas, targetColor, tolerance, brushSize, zoomAt, containerRef, mainCanvasRef, onStatusUpdate]
  );

  const handleTouchEnd = useCallback(() => {
    touchDist.current = 0;
    touchCenter.current = null;
    isErasing.current = false;
    lastPos.current = null;
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      zoomAt(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - rect.left, e.clientY - rect.top);
    },
    [zoomAt, containerRef]
  );

  // Middle mouse pan
  const handleContainerMouseDown = useCallback(
    (e) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      }
    },
    [pan]
  );

  // Magnifier preview
  const drawMagnifier = useCallback(
    (pos) => {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      const main = mainCanvasRef.current;
      if (!main) return;

      const sc = 4;
      const sz = 11;
      const half = 5;
      const sx = Math.max(0, Math.round(pos.x) - half);
      const sy = Math.max(0, Math.round(pos.y) - half);
      const sw = Math.min(sz, main.width - sx);
      const sh = Math.min(sz, main.height - sy);

      if (sw <= 0 || sh <= 0) return;

      const imgData = main.getContext('2d').getImageData(sx, sy, sw, sh);
      const ox = pos.x + 20;
      const oy = pos.y - (sz * sc) / 2;

      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const i = (y * sw + x) * 4;
          ctx.fillStyle = `rgb(${imgData.data[i]},${imgData.data[i + 1]},${imgData.data[i + 2]})`;
          ctx.fillRect(ox + x * sc, oy + y * sc, sc, sc);
        }
      }

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, sw * sc, sh * sc);
    },
    [overlayCanvasRef, mainCanvasRef]
  );

  const clearOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (overlay) {
      overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
    }
  }, [overlayCanvasRef]);

  // Global mouse move/up for panning
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isPanning.current) {
        // Pan handled via state in parent
      }
    };
    const handleGlobalMouseUp = () => {
      isPanning.current = false;
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="canvas-area">
      <div
        className="canvas-container"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleContainerMouseDown}
      >
        <canvas
          ref={mainCanvasRef}
          className="main-canvas"
          style={{ transform }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="overlay-canvas"
          style={{ transform }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <div className="zoom-controls">
          <button className="zb" onClick={() => zoomAt(1.3, containerRef.current?.clientWidth / 2, containerRef.current?.clientHeight / 2)}>+</button>
          <span className="zl">{zoomPercent}%</span>
          <button className="zb" onClick={() => zoomAt(1 / 1.3, containerRef.current?.clientWidth / 2, containerRef.current?.clientHeight / 2)}>−</button>
        </div>
      </div>
    </div>
  );
}
