import React from 'react';
import Link from '@docusaurus/Link';
import {useColorMode} from '@docusaurus/theme-common';
import styles from './Footer.module.css';

function ArrowLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 657.38 193.42">
      <path fill="currentColor" d="M162.9,120.1l-50.36-11.17-31.09,84.49-31.09-84.49L0,120.1,81.45,0l81.45,120.1Z"></path>
      <path fill="currentColor" d="M183.1,151.64l41.23-106.46,25.25-3.68,43.27,110.14h-28.72l-6.99-20.98-39.39,1.87-6.37,19.12h-28.28ZM225.07,110.59l24.96-1.57-12.27-36.4-12.69,37.97h0Z"></path>
      <path fill="currentColor" d="M359.06,68.72v28.28c-1.78-.65-3.68-1.1-5.69-1.3-.83-.09-1.69-.12-2.58-.12-6.08,0-11.29,2.05-15,5.57-3.79,3.59-7.23,8.68-7.23,14.73v35.8h-25.46v-81.36l25.04-3.97v12.03c7.29-6.19,16.51-9.9,26.56-9.9,1.48,0,2.93.09,4.36.24Z"></path>
      <path fill="currentColor" d="M426.37,68.72v28.28c-1.78-.65-3.68-1.1-5.69-1.3-.83-.09-1.69-.12-2.58-.12-6.08,0-11.29,2.05-15,5.57-3.79,3.59-7.23,8.68-7.23,14.73v35.8h-25.46v-81.36l25.04-3.97v12.03c7.29-6.19,16.51-9.9,26.56-9.9,1.48,0,2.93.09,4.36.24Z"></path>
      <path fill="currentColor" d="M578.54,81.37l19.21-2.52,12.51,35.6,14.46-47.16,32.66-4.53-32.31,89.15h-22.58l-14.23-37.11-10.97,36.78h-22.35l-28.31-79.85,29.05-3.82,11.91,45.97,11-32.54h-.06v.03h0Z"></path>
      <path fill="currentColor" d="M479.22,151.64c-25.05,0-45.34-19.09-45.34-42.65s20.29-42.65,45.34-42.65,45.34,19.09,45.34,42.65-19.99,42.65-45.34,42.65ZM479.22,129.28c11.64,0,19.69-8.35,19.69-20.29s-8.05-20.29-19.69-20.29-19.69,8.65-19.69,20.29,8.35,20.29,19.69,20.29h0Z"></path>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.1761 4H19.9362L13.9061 10.7774L21 20H15.4456L11.0951 14.4066L6.11723 20H3.35544L9.80517 12.7508L3 4H8.69545L12.6279 9.11262L17.1761 4ZM16.2073 18.3754H17.7368L7.86441 5.53928H6.2232L16.2073 18.3754Z" fill="currentColor"></path>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M20.5686 4.77345C21.5163 5.02692 22.2555 5.76903 22.5118 6.71673C23.1821 9.42042 23.1385 14.5321 22.5259 17.278C22.2724 18.2257 21.5303 18.965 20.5826 19.2213C17.9071 19.8831 5.92356 19.8015 3.40294 19.2213C2.45524 18.9678 1.71595 18.2257 1.45966 17.278C0.827391 14.7011 0.871044 9.25144 1.44558 6.73081C1.69905 5.78311 2.44116 5.04382 3.38886 4.78753C6.96561 4.0412 19.2956 4.282 20.5686 4.77345ZM9.86682 8.70227L15.6122 11.9974L9.86682 15.2925V8.70227Z" fill="currentColor"></path>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.5 3C3.67157 3 3 3.67157 3 4.5V19.5C3 20.3284 3.67157 21 4.5 21H19.5C20.3284 21 21 20.3284 21 19.5V4.5C21 3.67157 20.3284 3 19.5 3H4.5ZM8.52076 7.00272C8.52639 7.95897 7.81061 8.54819 6.96123 8.54397C6.16107 8.53975 5.46357 7.90272 5.46779 7.00413C5.47201 6.15897 6.13998 5.47975 7.00764 5.49944C7.88795 5.51913 8.52639 6.1646 8.52076 7.00272ZM12.2797 9.76176H9.75971H9.7583V18.3216H12.4217V18.1219C12.4217 17.742 12.4214 17.362 12.4211 16.9819V16.9818V16.9816V16.9815V16.9812C12.4203 15.9674 12.4194 14.9532 12.4246 13.9397C12.426 13.6936 12.4372 13.4377 12.5005 13.2028C12.7381 12.3253 13.5271 11.7586 14.4074 11.8979C14.9727 11.9864 15.3467 12.3141 15.5042 12.8471C15.6013 13.1803 15.6449 13.5389 15.6491 13.8863C15.6605 14.9339 15.6589 15.9815 15.6573 17.0292V17.0294C15.6567 17.3992 15.6561 17.769 15.6561 18.1388V18.3202H18.328V18.1149C18.328 17.6629 18.3278 17.211 18.3275 16.7591V16.759V16.7588C18.327 15.6293 18.3264 14.5001 18.3294 13.3702C18.3308 12.8597 18.276 12.3563 18.1508 11.8627C17.9638 11.1286 17.5771 10.5211 16.9485 10.0824C16.5027 9.77019 16.0133 9.5691 15.4663 9.5466C15.404 9.54401 15.3412 9.54062 15.2781 9.53721L15.2781 9.53721L15.2781 9.53721C14.9984 9.52209 14.7141 9.50673 14.4467 9.56066C13.6817 9.71394 13.0096 10.0641 12.5019 10.6814C12.4429 10.7522 12.3852 10.8241 12.2991 10.9314L12.2991 10.9315L12.2797 10.9557V9.76176ZM5.68164 18.3244H8.33242V9.76733H5.68164V18.3244Z" fill="currentColor"></path>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"></path>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"></path>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function FooterThemeToggle() {
  const {colorMode, setColorMode} = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <div className={styles.footerThemeToggle}>
      <button
        className={styles.themeButton}
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
      <span className={styles.themeTooltip}>Toggle theme</span>
    </div>
  );
}

export default function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Left - Logo & Newsletter */}
          <div className={styles.leftColumn}>
            <Link to="/" className={styles.logo}>
              <ArrowLogo />
            </Link>
            <p className={styles.tagline}>
              Building open source aircraft for humanity.
            </p>
          </div>

          {/* Right - Link Columns */}
          <div className={styles.linkColumns}>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Engineering</h4>
              <ul className={styles.linkList}>
                <li><Link to="/docs/project-quiver">Project Quiver</Link></li>
                <li><a href="https://github.com/Arrow-air" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><Link to="/docs">Documentation</Link></li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Community</h4>
              <ul className={styles.linkList}>
                <li><a href="https://discord.com/invite/arrow" target="_blank" rel="noopener noreferrer">Discord</a></li>
                <li><a href="https://dao.arrowair.com/" target="_blank" rel="noopener noreferrer">DAO Forum</a></li>
                <li><Link to="/docs/contributing">Contribute</Link></li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>DAO</h4>
              <ul className={styles.linkList}>
                <li><a href="https://snapshot.org/#/s:arrowair.eth" target="_blank" rel="noopener noreferrer">Snapshot</a></li>
                <li><a href="https://github.com/Arrow-air/dao-aips" target="_blank" rel="noopener noreferrer">AIPs</a></li>
                <li><Link to="/dao">Overview</Link></li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Connect</h4>
              <div className={styles.socialLinks}>
                <a href="https://github.com/Arrow-air" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <GitHubIcon /> GitHub
                </a>
                <a href="https://discord.com/invite/arrow" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <DiscordIcon /> Discord
                </a>
                {/* TODO: Add real X/Twitter and LinkedIn URLs when available */}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>© 2026 Arrow. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <FooterThemeToggle />
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
