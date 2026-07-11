import './Loader.css';

export default function Loader({ text, progress }) {
  if (!text) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-spinner" />
      <p>{text}</p>
      {progress !== undefined && (
        <div className="loader-bar">
          <div className="loader-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
