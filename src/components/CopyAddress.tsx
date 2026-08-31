import React, { useRef, useState } from 'react';

/** An on-chain address with a one-click copy. Renders as code with a small
 *  copy control; falls back to plain code if the clipboard is unavailable. */
export default function CopyAddress({ children }: { children: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children.trim());
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the address is still selectable text */
    }
  };

  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <code>{children}</code>{' '}
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy address ${children}`}
        title="Copy address"
        style={{
          border: '1px solid var(--ifm-color-emphasis-300)',
          background: 'none',
          color: copied ? 'var(--ifm-color-success)' : 'var(--ifm-color-emphasis-600)',
          borderRadius: 2,
          cursor: 'pointer',
          font: 'inherit',
          fontSize: '0.7rem',
          padding: '0.1rem 0.35rem',
          verticalAlign: 'middle',
        }}
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </span>
  );
}
