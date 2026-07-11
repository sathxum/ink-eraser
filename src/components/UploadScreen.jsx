import { useRef, useCallback } from 'react';
import './UploadScreen.css';

export default function UploadScreen({ onFileSelect }) {
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleClick = () => fileInputRef.current?.click();

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current?.classList.add('over');
  };

  const handleDragLeave = () => {
    dropRef.current?.classList.remove('over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  return (
    <div className="upload-screen">
      <div className="upload-logo">🖊️</div>
      <h1 className="upload-title">InkEraser</h1>
      <p className="upload-sub">Remove pen mistakes from documents</p>

      <div
        className="upload-drop"
        ref={dropRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>Tap to upload document</p>
        <small>PDF, PNG, JPG, WebP</small>
        <div className="upload-tags">
          <span>PDF</span>
          <span>PNG</span>
          <span>JPG</span>
          <span>JPEG</span>
          <span>WebP</span>
          <span>BMP</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
        onChange={handleChange}
        hidden
      />

      <div className="upload-features">
        <div className="upload-feat">
          <em>🎯</em>
          <b>Exact Match</b>
          <small>Delta E color detection</small>
        </div>
        <div className="upload-feat">
          <em>✏️</em>
          <b>Pixel Erase</b>
          <small>Single pixel removal</small>
        </div>
        <div className="upload-feat">
          <em>👆</em>
          <b>Touch Erase</b>
          <small>Manual finger erase</small>
        </div>
      </div>
    </div>
  );
}
