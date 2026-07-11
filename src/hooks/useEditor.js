import { useState, useRef, useCallback } from 'react';
import { saveCanvasState, restoreCanvasState } from '../utils/canvasUtils';

const MAX_UNDO = 25;

export function useEditor() {
  const mainCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [targetColor, setTargetColor] = useState([0, 0, 0]);
  const [tolerance, setTolerance] = useState(30);
  const [brushSize, setBrushSize] = useState(10);
  const [mode, setMode] = useState('idle'); // idle | pick | erase
  const [loading, setLoading] = useState(null); // null | { text, progress }

  const undoStack = useRef([]);
  const redoStack = useRef([]);

  // Initialize canvas with source
  const initCanvas = useCallback((source) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = source.width;
    canvas.height = source.height;
    ctx.drawImage(source, 0, 0);

    setImageSize({ width: source.width, height: source.height });
    undoStack.current = [];
    redoStack.current = [];
  }, []);

  // Fit to screen
  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container || !imageSize.width) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const sx = cw / imageSize.width;
    const sy = ch / imageSize.height;
    const newZoom = Math.min(sx, sy, 1);

    setZoom(newZoom);
    setPan({
      x: (cw - imageSize.width * newZoom) / 2,
      y: (ch - imageSize.height * newZoom) / 2,
    });
  }, [imageSize]);

  // Zoom at point
  const zoomAt = useCallback(
    (factor, cx, cy) => {
      setZoom((prev) => {
        const newZoom = Math.max(0.05, Math.min(20, prev * factor));
        const ratio = newZoom / prev;
        setPan((prevPan) => ({
          x: cx - (cx - prevPan.x) * ratio,
          y: cy - (cy - prevPan.y) * ratio,
        }));
        return newZoom;
      });
    },
    []
  );

  // Screen to canvas coordinates
  const screenToCanvas = useCallback(
    (clientX, clientY) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Save state for undo
  const saveState = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    undoStack.current.push(saveCanvasState(canvas));
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  // Undo
  const undo = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas || undoStack.current.length === 0) return;
    redoStack.current.push(saveCanvasState(canvas));
    restoreCanvasState(canvas, undoStack.current.pop());
  }, []);

  // Redo
  const redo = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas || redoStack.current.length === 0) return;
    undoStack.current.push(saveCanvasState(canvas));
    restoreCanvasState(canvas, redoStack.current.pop());
  }, []);

  return {
    mainCanvasRef,
    overlayCanvasRef,
    containerRef,
    imageSize,
    setImageSize,
    zoom,
    setZoom,
    pan,
    setPan,
    targetColor,
    setTargetColor,
    tolerance,
    setTolerance,
    brushSize,
    setBrushSize,
    mode,
    setMode,
    loading,
    setLoading,
    initCanvas,
    fitToScreen,
    zoomAt,
    screenToCanvas,
    saveState,
    undo,
    redo,
  };
}
