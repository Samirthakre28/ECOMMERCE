import { useState, useEffect } from 'react';

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => setVisible(false), 600);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="preloader" style={{ opacity: fading ? 0 : 1 }}>
      <h1 className="loader-logo">REDMONT</h1>
    </div>
  );
}
