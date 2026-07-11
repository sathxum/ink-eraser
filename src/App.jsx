import { useState, useCallback, useEffect } from 'react';
import UploadScreen from './components/UploadScreen';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';
import StatusBar from './components/StatusBar';
import Loader from './components/Loader';
import Toast from './components/Toast';
import { useEditor } from './hooks/useEditor';
import { autoErase, downloadCanvas } from './utils/canvasUtils';
import { rgbToHex } from './utils/colorUtils';
import { loadPDF, loadImage, isPDF } from './utils/pdfUtils';
import './App.css';

export default function App() {
  const editor = useEditor();
  const [screen, setScreen] = useState('upload'); // upload | editor
  const [statusData, setStatusData] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [loadingState, setLoadingState] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMsg('');
    setTimeout(() => setToastMsg(msg), 10);
  }, []);

  // Handle file upload
  const handleFileSelect = useCallback(
    async (file) => {
      setLoadingState({ text: 'Loading...', progress: 0 });

      try {
        let canvas;
        if (isPDF(file)) {
          canvas = await loadPDF(file, (progress, text) => {
            setLoadingState({ text, progress });
          });
        } else {
          setLoadingState({ text: 'Loading image...', progress: 30 });
          canvas = await loadImage(file);
        }

        setLoadingState({ text: 'Setting up...', progress: 90 });
        editor.initCanvas(canvas);
        setScreen('editor');

        setLoadingState({ text: 'Ready!', progress: 100 });
        setTimeout(() => setLoadingState(null), 200);
        showToast('Document loaded ✓');
      } catch (err) {
        console.error('Load error:', err);
        showToast('Error: ' + err.message);
        setLoadingState(null);
      }
    },
    [editor, showToast]
  );

  // Fit to screen when image loads
  useEffect(() => {
    if (screen === 'editor' && editor.imageSize.width > 0) {
      editor.fitToScreen();
    }
  }, [screen, editor.imageSize, editor.fitToScreen]);

  // Auto erase
  const handleAutoErase = useCallback(() => {
    if (!editor.mainCanvasRef.current) return;
    setLoadingState({ text: 'Erasing ink...', progress: 50 });

    setTimeout(() => {
      const count = autoErase(
        editor.mainCanvasRef.current,
        editor.targetColor,
        editor.tolerance
      );
      setLoadingState(null);
      showToast(`Erased ${count.toLocaleString()} pixels ✓`);
    }, 30);
  }, [editor, showToast]);

  // Save/download
  const handleSave = useCallback(() => {
    if (!editor.mainCanvasRef.current) return;
    downloadCanvas(editor.mainCanvasRef.current);
    showToast('Downloaded ✓');
  }, [editor, showToast]);

  // New document
  const handleNew = useCallback(() => {
    setScreen('upload');
    editor.setMode('idle');
  }, [editor]);

  // Status update from canvas
  const handleStatusUpdate = useCallback((data) => {
    setStatusData((prev) => ({ ...prev, ...data }));

    // If color was picked (eyedropper), update target color
    if (data.color) {
      editor.setTargetColor([data.color.r, data.color.g, data.color.b]);
      editor.setMode('idle');
    }
  }, [editor]);

  const targetColorHex = rgbToHex(
    editor.targetColor[0],
    editor.targetColor[1],
    editor.targetColor[2]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); editor.undo(); }
        if (e.key === 'y') { e.preventDefault(); editor.redo(); }
      }
      if (e.key === 'Escape') editor.setMode('idle');
      if (e.key === 'e' || e.key === 'E') editor.setMode('erase');
      if (e.key === 'i' || e.key === 'I') editor.setMode('pick');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editor]);

  return (
    <div className="app">
      {screen === 'upload' && <UploadScreen onFileSelect={handleFileSelect} />}

      {screen === 'editor' && (
        <div className="editor">
          <Toolbar
            mode={editor.mode}
            onSetMode={editor.setMode}
            onNew={handleNew}
            onAutoErase={handleAutoErase}
            onUndo={editor.undo}
            onRedo={editor.redo}
            onSave={handleSave}
            tolerance={editor.tolerance}
            onToleranceChange={editor.setTolerance}
            brushSize={editor.brushSize}
            onBrushSizeChange={editor.setBrushSize}
            targetColorHex={targetColorHex}
          />
          <CanvasArea
            mainCanvasRef={editor.mainCanvasRef}
            overlayCanvasRef={editor.overlayCanvasRef}
            containerRef={editor.containerRef}
            imageSize={editor.imageSize}
            zoom={editor.zoom}
            pan={editor.pan}
            mode={editor.mode}
            targetColor={editor.targetColor}
            tolerance={editor.tolerance}
            brushSize={editor.brushSize}
            screenToCanvas={editor.screenToCanvas}
            zoomAt={editor.zoomAt}
            saveState={editor.saveState}
            onStatusUpdate={handleStatusUpdate}
            onToast={showToast}
            setLoading={setLoadingState}
          />
          <StatusBar
            coords={statusData.coords}
            pixel={statusData.pixel}
            mode={editor.mode}
            dimensions={editor.imageSize}
          />
        </div>
      )}

      <Loader text={loadingState?.text} progress={loadingState?.progress} />
      <Toast message={toastMsg} />
    </div>
  );
}
