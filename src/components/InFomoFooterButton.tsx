import { useCallback, useRef } from 'react';
import { confetti } from '@tsparticles/confetti';

export default function InFomoFooterButton() {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(async () => {
    // Конфетти
    await confetti({
      origin: { y: 0.7 },
      particleCount: 120,
      spread: 80,
      startVelocity: 35,
      colors: ['#fff', '#ff5a00', '#f36e21'],
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });
    setTimeout(() => {
      window.location.href = 'https://in-fomo.com';
    }, 3000);
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 12 }}>
      <button
        ref={btnRef}
        onClick={handleClick}
        style={{
          background: 'none',
          border: 'none',
          color: '#bbb',
          fontSize: 16,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          outline: 'none',
          padding: 0,
          transition: 'color 0.18s',
        }}
        aria-label="Made by IN-FOMO"
      >
        <span style={{ color: '#bbb' }}>Made by</span>
        <span style={{ color: '#fff', fontWeight: 700, marginLeft: 6 }}>IN-FOMO</span>
        <span style={{ color: '#ff5a00', fontWeight: 900, fontSize: 18, marginLeft: 0 }}>.</span>
      </button>
    </div>
  );
} 