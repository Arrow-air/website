import React, {type ReactNode, useState, useLayoutEffect, useEffect, useCallback, useRef} from 'react';
import {createPortal} from 'react-dom';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './MarkdownToggle.module.css';

function editUrlToRawUrl(editUrl: string): string {
  try {
    const url = new URL(editUrl);
    const parts = url.pathname.split('/');
    const editIndex = parts.indexOf('edit');
    if (editIndex === -1) return editUrl;
    const org = parts[1];
    const repo = parts[2];
    const branch = parts[editIndex + 1];
    const path = parts.slice(editIndex + 2).join('/');
    return `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${path}`;
  } catch {
    return editUrl;
  }
}

function MarkdownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 128" width="22" height="14" fill="currentColor" aria-hidden="true">
      <rect width="198" height="118" x="5" y="5" rx="10" ry="10" stroke="currentColor" strokeWidth="10" fill="none"/>
      <path d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0l-30-33h20V30h20v35h20z"/>
    </svg>
  );
}

const BAR_WIDTH = 24;
const BAR_FILL = 6;
const BAR_STEP_MS = 30;
const BAR_TOTAL_MS = (BAR_WIDTH + BAR_FILL) * BAR_STEP_MS; // ~900ms

function AsciiProgressBar({label}: {label: string}) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % (BAR_WIDTH + BAR_FILL));
    }, BAR_STEP_MS);
    return () => clearInterval(id);
  }, []);

  const bar = Array.from({length: BAR_WIDTH}, (_, i) =>
    i >= offset - BAR_FILL && i < offset ? '\u2588' : '\u2591'
  ).join('');

  return (
    <div className={styles.loading}>
      {label + '  [' + bar + ']'}
    </div>
  );
}

type ViewState = 'rendered' | 'raw' | 'transition-to-raw' | 'transition-to-rendered';

interface Props {
  children: ReactNode;
}

export default function MarkdownToggle({children}: Props): ReactNode {
  const {metadata} = useDoc();
  const editUrl = metadata.editUrl;

  const [viewState, setViewState] = useState<ViewState>('rendered');
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [rawPortalTarget, setRawPortalTarget] = useState<HTMLElement | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isRawVisible = viewState === 'raw' || viewState === 'transition-to-rendered';
  const isTransitioning = viewState === 'transition-to-raw' || viewState === 'transition-to-rendered';

  // Reset when navigating between docs
  useEffect(() => {
    setViewState('rendered');
    setRawContent(null);
    setFetchError(null);
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  }, [editUrl]);

  // Single combined effect: h1 button, content visibility, raw portal
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const mdContainer = containerRef.current.querySelector('.theme-doc-markdown') as HTMLElement | null;
    if (!mdContainer) return;

    // --- 1. Always set up the h1 toggle button portal ---
    const h1 = mdContainer.querySelector('h1') as HTMLElement | null;
    if (h1) {
      h1.style.display = 'flex';
      h1.style.alignItems = 'center';
      h1.style.gap = '0.75rem';

      let btnTarget = h1.querySelector('.md-toggle-portal') as HTMLElement;
      if (!btnTarget) {
        btnTarget = document.createElement('span');
        btnTarget.className = 'md-toggle-portal';
        btnTarget.style.marginLeft = 'auto';
        btnTarget.style.flexShrink = '0';
        h1.appendChild(btnTarget);
      }
      setPortalTarget(btnTarget);
    }

    // Show raw mode for 'raw' and both transitions (so bar is visible in the raw layout)
    const showRawLayout = viewState !== 'rendered';

    if (showRawLayout) {
      mdContainer.setAttribute('data-md-show-raw', '');

      let rawPortal = mdContainer.querySelector('.md-raw-content-portal') as HTMLElement;
      if (!rawPortal) {
        rawPortal = document.createElement('div');
        rawPortal.className = 'md-raw-content-portal';
        mdContainer.appendChild(rawPortal);
      }
      setRawPortalTarget(rawPortal);
    } else {
      mdContainer.removeAttribute('data-md-show-raw');
      const rawPortal = mdContainer.querySelector('.md-raw-content-portal');
      rawPortal?.remove();
      setRawPortalTarget(null);
    }

    return () => {
      mdContainer.removeAttribute('data-md-show-raw');
      const rawPortal = mdContainer.querySelector('.md-raw-content-portal');
      rawPortal?.remove();

      if (h1) {
        h1.style.display = '';
        h1.style.alignItems = '';
        h1.style.gap = '';
        const btnTarget = h1.querySelector('.md-toggle-portal');
        btnTarget?.remove();
      }
    };
  }, [viewState, editUrl]);

  // Apply/remove grey background on the doc main container
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[class*="docMainContainer"]');
    if (!el) return;
    const showGrey = viewState !== 'rendered';
    if (showGrey) {
      el.style.backgroundColor = '#CCCCCC';
    } else {
      el.style.backgroundColor = '';
    }
    return () => {
      el.style.backgroundColor = '';
    };
  }, [viewState]);

  const handleToggle = useCallback(async () => {
    if (isTransitioning) return;

    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }

    if (viewState === 'raw') {
      // --- Transition back to rendered ---
      setViewState('transition-to-rendered');
      transitionTimer.current = setTimeout(() => {
        setViewState('rendered');
        transitionTimer.current = null;
      }, BAR_TOTAL_MS);
      return;
    }

    // --- Transition to raw ---
    setViewState('transition-to-raw');

    // Fetch if needed (runs in parallel with transition)
    let fetchPromise: Promise<void> | null = null;
    if (!rawContent && editUrl) {
      setFetchError(null);
      fetchPromise = (async () => {
        try {
          const rawUrl = editUrlToRawUrl(editUrl);
          const resp = await fetch(rawUrl);
          if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
          const text = await resp.text();
          setRawContent(text);
        } catch (e) {
          setFetchError(`Failed to fetch source: ${e instanceof Error ? e.message : String(e)}`);
        }
      })();
    }

    // Wait for both the transition bar and the fetch
    const delay = new Promise<void>((r) => {
      transitionTimer.current = setTimeout(r, BAR_TOTAL_MS);
    });
    await Promise.all([delay, fetchPromise].filter(Boolean));
    transitionTimer.current = null;
    setViewState('raw');
  }, [viewState, isTransitioning, rawContent, editUrl]);

  if (!editUrl) {
    return <>{children}</>;
  }

  const toggleButton = (
    <button
      type="button"
      className={`${styles.toggleButton} ${viewState !== 'rendered' ? styles.toggleButtonActive : ''}`}
      onClick={handleToggle}
      title={isRawVisible ? 'View rendered page' : 'View markdown source'}
      disabled={isTransitioning}
    >
      <MarkdownIcon />
    </button>
  );

  const transitionLabel = viewState === 'transition-to-raw' ? 'LOADING SOURCE' : 'RENDERING';

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {portalTarget && createPortal(toggleButton, portalTarget)}

      {children}

      {viewState !== 'rendered' && rawPortalTarget && createPortal(
        <>
          {isTransitioning ? (
            <AsciiProgressBar label={transitionLabel} />
          ) : (
            <>
              <div className={styles.rawHeader}>
                <span className={styles.rawHeaderLinks}>
                  <a href={editUrl} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                  <span className={styles.rawHeaderSep}>{'\u00b7'}</span>
                  <a href={editUrl} target="_blank" rel="noopener noreferrer">
                    Edit this page
                  </a>
                </span>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={handleToggle}
                  disabled={isTransitioning}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M10 2L4 8L10 14" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                  View Rendered
                </button>
              </div>
              {fetchError && <div className={styles.error}>{fetchError}</div>}
              {rawContent && <pre className={styles.rawContent}>{rawContent}</pre>}
            </>
          )}
        </>,
        rawPortalTarget
      )}
    </div>
  );
}
