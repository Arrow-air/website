import React, { useState } from 'react';
import styles from './LogoCard.module.css';

interface LogoCardProps {
  src: string;
  pngSrc: string;
  alt: string;
  bg: string;
  height?: number;
}

type CopyStatus = 'idle' | 'copied' | 'error';

export function LogoCard({ src, pngSrc, alt, bg, height = 56 }: LogoCardProps) {
  const [svgStatus, setSvgStatus] = useState<CopyStatus>('idle');
  const [pngStatus, setPngStatus] = useState<CopyStatus>('idle');

  const copySvg = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(src);
      const svg = await res.text();
      await navigator.clipboard.writeText(svg);
      setSvgStatus('copied');
      setTimeout(() => setSvgStatus('idle'), 1500);
    } catch {
      setSvgStatus('error');
      setTimeout(() => setSvgStatus('idle'), 1500);
    }
  };

  const copyPng = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(pngSrc);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setPngStatus('copied');
      setTimeout(() => setPngStatus('idle'), 1500);
    } catch {
      setPngStatus('error');
      setTimeout(() => setPngStatus('idle'), 1500);
    }
  };

  return (
    <div className={styles.card} style={{ background: bg }}>
      <img src={src} alt={alt} style={{ height }} />
      <div className={styles.overlay}>
        <button className={styles.copyBtn} onClick={copySvg}>
          {svgStatus === 'copied' ? 'Copied!' : svgStatus === 'error' ? 'Failed' : 'SVG'}
        </button>
        <button className={styles.copyBtn} onClick={copyPng}>
          {pngStatus === 'copied' ? 'Copied!' : pngStatus === 'error' ? 'Failed' : 'PNG'}
        </button>
      </div>
    </div>
  );
}
