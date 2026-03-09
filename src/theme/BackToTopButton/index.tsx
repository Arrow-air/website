import React from 'react';
import {useBackToTopButton} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

export default function BackToTopButton(): JSX.Element | null {
  const {shown, scrollToTop} = useBackToTopButton({threshold: 300});

  return (
    <button
      aria-label="Scroll back to top"
      className={`${styles.backToTop} ${shown ? styles.shown : ''}`}
      type="button"
      onClick={scrollToTop}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
