import React from 'react';
import NavbarOriginal from '@theme-original/Navbar';
import Link from '@docusaurus/Link';
import {useColorMode} from '@docusaurus/theme-common';
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
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
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

function DocsNavbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarInner}>
        {/* Logo */}
        <Link to="/docs/intro" className={styles.logo}>
          <ArrowLogo />
        </Link>

        {/* Right Actions */}
        <div className={styles.navActions}>
          <a
            href="https://www.arrowair.com"
            className={styles.mainSiteLink}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 244.04 271.73" fill="currentColor" aria-hidden>
              <polygon points="203.47 159.39 153.11 148.22 122.02 232.71 90.93 148.22 40.57 159.39 122.02 39.29 203.47 159.39"/>
            </svg>
            MAIN SITE
          </a>
          <div className={styles.searchWrapper}>
            <SearchBar />
          </div>
          <div className={styles.tooltipWrapper}>
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
          <div className={styles.tooltipWrapper}>
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
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export default function Navbar(props): JSX.Element {
  return (
    <>
      <DocsNavbar />
      {/* Hidden original navbar to preserve Docusaurus internals */}
      <div style={{ display: 'none' }}>
        <NavbarOriginal {...props} />
      </div>
    </>
  );
}
