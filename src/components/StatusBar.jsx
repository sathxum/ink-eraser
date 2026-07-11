import './StatusBar.css';

export default function StatusBar({ coords, pixel, mode, dimensions }) {
  const modeLabels = {
    idle: 'Idle',
    pick: 'Pick Color',
    erase: 'Erase',
  };

  return (
    <div className="statusbar">
      <span>X:{Math.round(coords?.x || 0)} Y:{Math.round(coords?.y || 0)}</span>
      <span>
        RGB:{pixel ? `${pixel.r},${pixel.g},${pixel.b}` : '—'}
      </span>
      <span>{modeLabels[mode] || 'Idle'}</span>
      <span>{dimensions ? `${dimensions.width}×${dimensions.height}` : '—'}</span>
    </div>
  );
}
