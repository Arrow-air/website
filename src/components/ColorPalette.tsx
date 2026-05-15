import React, { useState } from 'react';
import styles from './ColorPalette.module.css';

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

interface Swatch {
  hex: string;
  rgb: string;
}

interface ColorPaletteProps {
  name: string;
  swatches: Swatch[];
}

function Swatch({ hex, rgb, index }: Swatch & { index: number }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const label = String(index + 1).padStart(2, '0');

  const labelColor = isLight(hex) ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)';

  return (
    <button className={styles.swatch} onClick={handleClick} title={`${hex} — ${rgb}`}>
      <span className={styles.swatchColor} style={{ backgroundColor: hex }}>
        <span className={styles.swatchIndex} style={{ color: labelColor }}>{label}</span>
      </span>
      <span className={styles.swatchHex}>{copied ? 'Copied!' : hex}</span>
    </button>
  );
}

export function ColorPalette({ name, swatches }: ColorPaletteProps) {
  return (
    <div className={styles.palette}>
      <p className={styles.paletteName}>{name}</p>
      <div className={styles.swatches}>
        {swatches.map((s, i) => (
          <Swatch key={i} hex={s.hex} rgb={s.rgb} index={i} />
        ))}
      </div>
    </div>
  );
}
