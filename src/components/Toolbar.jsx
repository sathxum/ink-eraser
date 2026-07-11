import './Toolbar.css';

export default function Toolbar({
  mode,
  onSetMode,
  onNew,
  onAutoErase,
  onUndo,
  onRedo,
  onSave,
  tolerance,
  onToleranceChange,
  brushSize,
  onBrushSizeChange,
  targetColorHex,
}) {
  return (
    <>
      <div className="toolbar">
        <button className="tb" onClick={onNew} title="New Document">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span>New</span>
        </button>

        <div className="sep" />

        <button
          className={`tb ${mode === 'pick' ? 'on' : ''}`}
          onClick={() => onSetMode(mode === 'pick' ? 'idle' : 'pick')}
          title="Pick Color"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 22l1-1h3l9-9M22 2l-7 7M15 2l7 7" />
          </svg>
          <span>Pick</span>
        </button>

        <div className="sep" />

        <button className="tb" onClick={onAutoErase} title="Auto Erase All">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" />
          </svg>
          <span>Auto</span>
        </button>

        <button
          className={`tb ${mode === 'erase' ? 'on' : ''}`}
          onClick={() => onSetMode(mode === 'erase' ? 'idle' : 'erase')}
          title="Manual Erase"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
          <span>Erase</span>
        </button>

        <div className="sep" />

        <button className="tb" onClick={onUndo} title="Undo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a5 5 0 0 1 0 10H9M3 10l4-4M3 10l4 4" />
          </svg>
        </button>

        <button className="tb" onClick={onRedo} title="Redo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10H11a5 5 0 0 0 0 10h4M21 10l-4-4M21 10l-4 4" />
          </svg>
        </button>

        <div className="sep" />

        <button className="tb save-btn" onClick={onSave} title="Download Result">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span>Save</span>
        </button>
      </div>

      <div className="colorbar">
        <div className="color-preview" style={{ background: targetColorHex }} />
        <span className="color-hex">{targetColorHex}</span>

        <label>Tol:</label>
        <input
          type="range"
          className="slider"
          min="1"
          max="100"
          value={tolerance}
          onChange={(e) => onToleranceChange(Number(e.target.value))}
        />
        <span className="slider-val">{tolerance}</span>

        <label>Size:</label>
        <input
          type="range"
          className="slider"
          min="1"
          max="100"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
        />
        <span className="slider-val">{brushSize}</span>
      </div>
    </>
  );
}
