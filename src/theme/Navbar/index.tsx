import React, {useState, useRef, useEffect, useCallback} from 'react';
import NavbarOriginal from '@theme-original/Navbar';
import Link from '@docusaurus/Link';
import {useColorMode} from '@docusaurus/theme-common';
import {useLocation} from '@docusaurus/router';
import SearchBar from '@theme/SearchBar';
import styles from './DocsNavbar.module.css';

function ArrowLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="36" viewBox="0 0 657.38 193.42">
      <path fill="currentColor" d="M162.9,120.1l-50.36-11.17-31.09,84.49-31.09-84.49L0,120.1,81.45,0l81.45,120.1Z"></path>
      <path fill="currentColor" d="M183.1,151.64l41.23-106.46,25.25-3.68,43.27,110.14h-28.72l-6.99-20.98-39.39,1.87-6.37,19.12h-28.28ZM225.07,110.59l24.96-1.57-12.27-36.4-12.69,37.97h0Z"></path>
      <path fill="currentColor" d="M359.06,68.72v28.28c-1.78-.65-3.68-1.1-5.69-1.3-.83-.09-1.69-.12-2.58-.12-6.08,0-11.29,2.05-15,5.57-3.79,3.59-7.23,8.68-7.23,14.73v35.8h-25.46v-81.36l25.04-3.97v12.03c7.29-6.19,16.51-9.9,26.56-9.9,1.48,0,2.93.09,4.36.24Z"></path>
      <path fill="currentColor" d="M426.37,68.72v28.28c-1.78-.65-3.68-1.1-5.69-1.3-.83-.09-1.69-.12-2.58-.12-6.08,0-11.29,2.05-15,5.57-3.79,3.59-7.23,8.68-7.23,14.73v35.8h-25.46v-81.36l25.04-3.97v12.03c7.29-6.19,16.51-9.9,26.56-9.9,1.48,0,2.93.09,4.36.24Z"></path>
      <path fill="currentColor" d="M578.54,81.37l19.21-2.52,12.51,35.6,14.46-47.16,32.66-4.53-32.31,89.15h-22.58l-14.23-37.11-10.97,36.78h-22.35l-28.31-79.85,29.05-3.82,11.91,45.97,11-32.54h-.06v.03h0Z"></path>
      <path fill="currentColor" d="M479.22,151.64c-25.05,0-45.34-19.09-45.34-42.65s20.29-42.65,45.34-42.65,45.34,19.09,45.34,42.65-19.99,42.65-45.34,42.65ZM479.22,129.28c11.64,0,19.69-8.35,19.69-20.29s-8.05-20.29-19.69-20.29-19.69,8.65-19.69,20.29,8.35,20.29,19.69,20.29h0Z"></path>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"></path>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="currentColor" d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"></path>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden>
      <path d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z" fill="currentColor"/><path d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z" fill="currentColor"/><path d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z" fill="currentColor"/><path d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z" fill="currentColor"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M11.38 2.019a7.5 7.5 0 1 0 10.6 10.6C21.662 17.854 17.316 22 12.001 22C6.477 22 2 17.523 2 12c0-5.315 4.146-9.661 9.38-9.981"/>
    </svg>
  );
}

function ThemeToggle() {
  const {colorMode, setColorMode} = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <div className={styles.themeToggle}>
      <button
        className={styles.iconButton}
        type="button"
        onClick={() => setColorMode(isDark ? 'light' : 'dark')}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span className={styles.themeIconWrapper}>
          <span className={`${styles.themeIcon} ${styles.sunIcon}`}>
            <SunIcon />
          </span>
          <span className={`${styles.themeIcon} ${styles.moonIcon}`}>
            <MoonIcon />
          </span>
        </span>
      </button>
      <span className={styles.tooltip}>Toggle theme</span>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function EllipsisIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function LinksDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className={styles.linksDropdown} ref={ref}>
      <button
        className={styles.iconButton}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Community links"
      >
        <EllipsisIcon />
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          <a
            href="https://www.arrowair.com"
            className={styles.dropdownItem}
          >
            <DocsIcon size={20} filled /> Homepage
          </a>
          <a
            href="https://github.com/Arrow-air"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.dropdownItem}
          >
            <GitHubIcon /> GitHub
          </a>
          <a
            href="https://discord.com/invite/arrow"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.dropdownItem}
          >
            <DiscordIcon /> Discord
          </a>
        </div>
      )}
    </div>
  );
}

function DocsIcon({ size, filled }: { size?: number; filled?: boolean } = {}) {
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size ?? 18} height={size ?? 18} viewBox="0 0 24 24" aria-hidden>
        {/* House filled with door cut out via evenodd */}
        <path
          fillRule="evenodd"
          fill="currentColor"
          d="M21 21V8.75L12 2L3 8.75V21H21Z M9 21V16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16V21Z"
        />
        <path d="M21 21V8.75L12 2L3 8.75V21H21Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M9 21V16C9 14.3431 10.3431 13 12 13C13.6569 13 15 14.3431 15 16V21" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size ?? 12} height={size ?? 12} viewBox="0 0 24 24" aria-hidden className={size ? undefined : styles.smallIcon}>
      <path d="M9 21V16C9 14.3431 10.3431 13 12 13C13.6569 13 15 14.3431 15 16V21" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M21 21V8.75L12 2L3 8.75V21H21Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function DocsActiveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" aria-hidden className={styles.smallIcon}>
      {/* Fill layer: house with door cut out via evenodd */}
      <path fillRule="evenodd" fill="currentColor"
        d="M20 21V8.75L12 2L4 8.75V21H20Z M8 21V16C8 13.79 9.79 12 12 12C14.21 12 16 13.79 16 16V21Z"/>
      {/* Stroke layer */}
      <path d="M8 21V16C8 13.79 9.79 12 12 12C14.21 12 16 13.79 16 16V21" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M20 21V8.75L12 2L4 8.75V21H20Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 3h2v18H4zm14 0H7v18h11c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 6h-6V8h6zm0-2h-6V6h6z"/>
    </svg>
  );
}

function QuiverIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" aria-hidden className={styles.smallIcon}>
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 10h4v4h-4zm0 0L6.5 6.5M9.96 6A3.5 3.5 0 1 0 6 9.96m8 .04l3.5-3.5m.5 3.46A3.5 3.5 0 1 0 14.04 6M14 14l3.5 3.5m-3.46.5A3.5 3.5 0 1 0 18 14.04M10 14l-3.5 3.5M6 14.04A3.5 3.5 0 1 0 9.96 18"/>
    </svg>
  );
}

function QuiverActiveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" aria-hidden className={styles.smallIcon}>
      <path fill="white" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h8v8h-8zm0 0L6.5 6.5M16 8L17.5 6.5M16 16L17.5 17.5M8 16L6.5 17.5"/>
      <circle fill="currentColor" stroke="currentColor" strokeWidth="2" cx="6.5" cy="6.5" r="3"/>
      <circle fill="currentColor" stroke="currentColor" strokeWidth="2" cx="17.5" cy="6.5" r="3"/>
      <circle fill="currentColor" stroke="currentColor" strokeWidth="2" cx="17.5" cy="17.5" r="3"/>
      <circle fill="currentColor" stroke="currentColor" strokeWidth="2" cx="6.5" cy="17.5" r="3"/>
    </svg>
  );
}

function SpearheadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 17 16.75" aria-hidden className={styles.smallIcon}>
      <title>spearhead-icon-svg</title>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
        <path d="M6.75,9.36l-6,.89v-1.57c0-.41.25-.78.63-.93l5.37-2.15"/>
        <path d="M10.25,9.36l6,.89v-1.57c0-.41-.25-.78-.63-.93l-5.37-2.15"/>
        <path d="M6.75,2.5v3.71c0,.52.04,1.04.12,1.56l.47,2.64c.09.57.58.99,1.16.99h0c.58,0,1.07-.42,1.16-.99l.47-2.64c.08-.52.12-1.04.12-1.56v-3.71c0-.97-.78-1.75-1.75-1.75h0c-.97,0-1.75.78-1.75,1.75Z"/>
        <path d="M4.66 13.64H12.35V16H4.66z" fill="currentColor"/>
        <path d="M4.66 13.64L4.66 9.75"/>
        <path d="M12.34 13.64L12.34 9.75"/>
      </g>
    </svg>
  );
}

function SpearheadActiveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 17 16.75" aria-hidden className={styles.smallIcon}>
      <title>spearhead-icon-svg</title>
      <g fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
        <path d="M6.75,9.36l-6,.89v-1.57c0-.41.25-.78.63-.93l5.37-2.15"/>
        <path d="M10.25,9.36l6,.89v-1.57c0-.41-.25-.78-.63-.93l-5.37-2.15"/>
        <path d="M6.75,2.5v3.71c0,.52.04,1.04.12,1.56l.47,2.64c.09.57.58.99,1.16.99h0c.58,0,1.07-.42,1.16-.99l.47-2.64c.08-.52.12-1.04.12-1.56v-3.71c0-.97-.78-1.75-1.75-1.75h0c-.97,0-1.75.78-1.75,1.75Z"/>
        <path d="M4.66 13.64H12.35V16H4.66z"/>
        <path d="M4.66 13.64L4.66 9.75"/>
        <path d="M12.34 13.64L12.34 9.75"/>
      </g>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const QUICK_LINKS = [
  {
    label: 'Main Site',
    href: 'https://www.arrowair.com',
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    label: 'Community',
    href: '/docs/community/index',
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Engineering',
    href: '/docs/contributing/how-we-work',
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    label: 'Bounty Board',
    href: '/bounty',
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 16q-.825 0-1.412-.587T10 14t.588-1.412T12 12t1.413.588T14 14t-.587 1.413T12 16M7.375 7h9.25l2-4H5.375zM8.4 21h7.2q2.25 0 3.825-1.562T21 15.6q0-.95-.325-1.85t-.925-1.625L17.15 9H6.85l-2.6 3.125q-.6.725-.925 1.625T3 15.6q0 2.275 1.563 3.838T8.4 21"/>
      </svg>
    ),
  },
  {
    label: 'Changelog',
    href: '/docs/changelog',
    external: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
];

function QuickLinksDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={styles.linksDropdown}
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={styles.mainSiteLink}
        type="button"
        aria-label="Quick links"
        aria-expanded={open}
      >
        Quick Links
        <span className={`${styles.chevronIcon} ${open ? styles.chevronOpen : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div className={styles.dropdownMenu}>
          {QUICK_LINKS.map((link, i) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.dropdownItem}
                style={{ animationDelay: `${i * 0.045}s` }}
                onClick={() => setOpen(false)}
              >
                <span className={styles.dropdownItemIcon}>{link.icon}</span>
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={styles.dropdownItem}
                style={{ animationDelay: `${i * 0.045}s` }}
                onClick={() => setOpen(false)}
              >
                <span className={styles.dropdownItemIcon}>{link.icon}</span>
                {link.label}
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function FlightTrackingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" aria-hidden className={styles.smallIcon}>
      <title>itinerary-2</title>
      <g fill="currentColor">
        <path d="M5 21C6.65685 21 8 19.6569 8 18C8 16.3431 6.65685 15 5 15C3.34315 15 2 16.3431 2 18C2 19.6569 3.34315 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square" fill="none"></path>
        <path d="M19 9C20.6569 9 22 7.65685 22 6C22 4.34315 20.6569 3 19 3C17.3431 3 16 4.34315 16 6C16 7.65685 17.3431 9 19 9Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square" fill="none"></path>
        <path d="M5 11V3H11L13 21H19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"></path>
      </g>
    </svg>
  );
}

function FlightTrackingActiveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" aria-hidden className={styles.smallIcon}>
      <title>itinerary-2</title>
      <g fill="currentColor">
        <path d="M5 21C6.65685 21 8 19.6569 8 18C8 16.3431 6.65685 15 5 15C3.34315 15 2 16.3431 2 18C2 19.6569 3.34315 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square"></path>
        <path d="M19 9C20.6569 9 22 7.65685 22 6C22 4.34315 20.6569 3 19 3C17.3431 3 16 4.34315 16 6C16 7.65685 17.3431 9 19 9Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square"></path>
        <path d="M5 11V3H11L13 21H19V13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"></path>
      </g>
    </svg>
  );
}

function BountyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" aria-hidden className={styles.smallIcon}>
      <title>sack-coins</title>
      <g fill="currentColor">
        <path d="M13 18H21V22H13V18Z" stroke="currentColor" strokeWidth="2" fill="none"></path>
        <path d="M15 14H23V18H15V14Z" stroke="currentColor" strokeWidth="2" fill="none"></path>
        <path d="M13.8545 7.47656L15.6797 10.4814L15.9941 11H13.6543L12.4365 8.99512H11.5615L10.0186 11.5215L9.49707 12.375L7.79004 11.333L8.31152 10.4795L10.1465 7.47363L10.4385 6.99512H13.5625L13.8545 7.47656Z" fill="currentColor" stroke="none"></path>
        <path d="M17.4189 1.60449L17.8486 2.60449L18.0439 3.05762L17.8037 3.48828L16.4238 5.9541C18.6379 7.0012 20.4182 8.72994 21.333 11H19.125C18.2132 9.3457 16.6403 8.08809 14.6699 7.3916L13.5508 6.99707L14.1299 5.96094L15.7852 3H8.21582L9.875 5.95996L10.4561 6.99609L9.33594 7.3916C6.1681 8.51128 4 11.0767 4 14.5C4 16.5381 4.75813 18.0442 5.96777 19.0938C6.98483 19.9761 8.3706 20.5749 10 20.8418V22.8652C7.95467 22.5813 6.0852 21.8434 4.65723 20.6045C2.99215 19.1598 2 17.0942 2 14.5C2 10.5168 4.31801 7.49921 7.58008 5.95508L6.19727 3.48926L5.95605 3.05859L6.15137 2.60449L6.58105 1.60449L6.8418 1H17.1582L17.4189 1.60449Z" fill="currentColor" stroke="none"></path>
      </g>
    </svg>
  );
}

function BountyActiveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" aria-hidden className={styles.smallIcon}>
      <title>sack-coins</title>
      <g fill="currentColor">
        <circle cx="17" cy="18" r="4" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        <path d="M13.8545 7.47656L15.6797 10.4814L15.9941 11H13.6543L12.4365 8.99512H11.5615L10.0186 11.5215L9.49707 12.375L7.79004 11.333L8.31152 10.4795L10.1465 7.47363L10.4385 6.99512H13.5625L13.8545 7.47656Z" fill="currentColor" stroke="none"></path>
        <path d="M17.4189 1.60449L17.8486 2.60449L18.0439 3.05762L17.8037 3.48828L16.4238 5.9541C18.6379 7.0012 20.4182 8.72994 21.333 11H19.125C18.2132 9.3457 16.6403 8.08809 14.6699 7.3916L13.5508 6.99707L14.1299 5.96094L15.7852 3H8.21582L9.875 5.95996L10.4561 6.99609L9.33594 7.3916C6.1681 8.51128 4 11.0767 4 14.5C4 16.5381 4.75813 18.0442 5.96777 19.0938C6.98483 19.9761 8.3706 20.5749 10 20.8418V22.8652C7.95467 22.5813 6.0852 21.8434 4.65723 20.6045C2.99215 19.1598 2 17.0942 2 14.5C2 10.5168 4.31801 7.49921 7.58008 5.95508L6.19727 3.48926L5.95605 3.05859L6.15137 2.60449L6.58105 1.60449L6.8418 1H17.1582L17.4189 1.60449Z" fill="currentColor" stroke="none"></path>
      </g>
    </svg>
  );
}

const SUBNAV_TABS = [
  { label: 'HOME',                path: '/docs',             to: '/docs',       icon: <DocsIcon />, activeIcon: <DocsActiveIcon /> },
  { label: 'Quiver',              path: '/quiver',           to: '/quiver',           icon: <QuiverIcon />, activeIcon: <QuiverActiveIcon /> },
  { label: 'Spearhead',           path: '/spearhead',        to: '/spearhead',        icon: <SpearheadIcon />, activeIcon: <SpearheadActiveIcon /> },
  { label: 'Flight Tracking App', path: '/flight-tracking',  to: '/flight-tracking',  icon: <FlightTrackingIcon />, activeIcon: <FlightTrackingActiveIcon /> },
  { label: 'Bounty Board',        path: '/bounty',           to: '/bounty',           icon: <BountyIcon />, activeIcon: <BountyActiveIcon /> },
];

function SubNav() {
  const {pathname} = useLocation();
  const isDocPage = SUBNAV_TABS.some(t => pathname.startsWith(t.path));
  const innerRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const checkFade = () => {
      const isScrollable = inner.scrollWidth > inner.clientWidth;
      const isAtEnd = inner.scrollLeft + inner.clientWidth >= inner.scrollWidth - 8;
      setShowFade(isScrollable && !isAtEnd);
    };

    // Scroll active tab into view without scrolling the page
    const activeTab = inner.querySelector(`[class*="subNavTabActive"]`) as HTMLElement;
    if (activeTab) {
      const tabRight = activeTab.offsetLeft + activeTab.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      if (tabRight > inner.clientWidth) {
        inner.scrollLeft = tabRight - inner.clientWidth + 16;
      } else if (tabLeft < inner.scrollLeft) {
        inner.scrollLeft = tabLeft - 16;
      }
    }

    checkFade();
    inner.addEventListener('scroll', checkFade);
    window.addEventListener('resize', checkFade);
    return () => {
      inner.removeEventListener('scroll', checkFade);
      window.removeEventListener('resize', checkFade);
    };
  }, [pathname]);

  if (!isDocPage) return null;

  return (
    <nav className={`${styles.subNav} ${showFade ? styles.subNavFade : ''}`}>
      <div className={styles.subNavInner} ref={innerRef}>
        {SUBNAV_TABS.map(tab => {
          const isActive = pathname.startsWith(tab.path);
          return (
            <Link
              key={`${tab.path}-${isActive}`}
              to={tab.to}
              className={`${styles.subNavTab} ${isActive ? styles.subNavTabActive : ''}`}
            >
              {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {showFade && (
        <div className={styles.scrollArrow} aria-hidden>
          <ChevronRightIcon />
        </div>
      )}
    </nav>
  );
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const {pathname} = useLocation();
  const isDocPage = SUBNAV_TABS.some(t => pathname.startsWith(t.path));

  const update = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
  }, []);

  useEffect(() => {
    if (!isDocPage) return;
    window.addEventListener('scroll', update, {passive: true});
    update();
    return () => window.removeEventListener('scroll', update);
  }, [isDocPage, update]);

  if (!isDocPage) return null;

  return (
    <div className={styles.progressBar} aria-hidden>
      <div className={styles.progressFill} style={{width: `${progress}%`}} />
    </div>
  );
}

function DocsNavbar() {
  const openSidebar = () => {
    const toggle = document.querySelector<HTMLButtonElement>('.navbar__toggle');
    if (toggle) toggle.click();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarInner}>
        {/* Mobile menu toggle */}
        <button
          className={`${styles.iconButton} ${styles.menuToggle}`}
          type="button"
          onClick={openSidebar}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>

        {/* Logo */}
        <Link to="/docs" className={styles.logo}>
          <ArrowLogo />
          <span className={styles.logoLabel}>Docs</span>
        </Link>

        {/* Right Actions */}
        <div className={styles.navActions}>
          <a
            href="https://www.arrowair.com"
            className={`${styles.iconButton} ${styles.iconButtonLabeled} ${styles.desktopOnly}`}
            aria-label="Homepage"
          >
            <DocsIcon size={18} filled />
            <span className={styles.iconButtonLabel}>Homepage</span>
          </a>
          <Link
            to="/docs"
            className={`${styles.iconButton} ${styles.iconButtonLabeled} ${styles.desktopOnly}`}
            aria-label="Docs Home"
          >
            <BookIcon />
            <span className={styles.iconButtonLabel}>Docs Home</span>
          </Link>
          <QuickLinksDropdown />
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>
          {/* Desktop: individual icon buttons */}
          <div className={`${styles.tooltipWrapper} ${styles.desktopOnly}`}>
            <a
              href="https://github.com/Arrow-air"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconButton}
              aria-label="GitHub"
            >
              <GitHubIcon />
            </a>
            <span className={styles.tooltip}>GitHub</span>
          </div>
          <div className={`${styles.tooltipWrapper} ${styles.desktopOnly}`}>
            <a
              href="https://discord.com/invite/arrow"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconButton}
              aria-label="Discord"
            >
              <DiscordIcon />
            </a>
            <span className={styles.tooltip}>Discord</span>
          </div>
          {/* Mobile: combined dropdown */}
          <div className={styles.mobileOnly}>
            <LinksDropdown />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export default function Navbar(props): JSX.Element {
  return (
    <>
      <div className={styles.stickyHeader}>
        <DocsNavbar />
        <SubNav />
      </div>
      {/* Original navbar hidden visually but sidebar overlay remains functional */}
      <div className={styles.hiddenNavbar}>
        <NavbarOriginal {...props} />
      </div>
    </>
  );
}
