import { useEffect, useState } from 'react';
import './Toast.css';

export default function Toast({ message }) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (message) {
      setText(message);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible) return null;

  return <div className="toast">{text}</div>;
}
