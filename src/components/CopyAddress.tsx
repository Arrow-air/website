import React, { useRef, useState } from 'react';

const ICON_PROPS = {
  width: 12,
  height: 12,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  style: { display: 'block' },
} as const;

const COPY_ICON = (
  <svg {...ICON_PROPS}>
    <g fill="none" stroke="currentColor" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="square">
      <path d="M17 7L21 7L21 21L7 21L7 17" />
      <path d="M3 3L3 17L17 17L17 3L3 3Z" />
    </g>
  </svg>
);

const CHECK_ICON = (
  <svg {...ICON_PROPS}>
    <path d="M4 12.5L9.5 18L20 6" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="square" />
  </svg>
);

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
        title={copied ? 'Copied' : 'Copy address'}
        style={{
          border: '1px solid var(--ifm-color-emphasis-300)',
          background: 'none',
          color: copied ? 'var(--ifm-color-success)' : 'var(--ifm-color-emphasis-600)',
          borderRadius: 2,
          cursor: 'pointer',
          font: 'inherit',
          fontSize: '0.7rem',
          padding: '0.2rem',
          verticalAlign: 'middle',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {copied ? CHECK_ICON : COPY_ICON}
      </button>
    </span>
  );
}
