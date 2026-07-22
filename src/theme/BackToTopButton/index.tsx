import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

function getScrollY(): number {
  return (
    window.scrollY ??
    window.pageYOffset ??
    document.documentElement.scrollTop ??
    document.body.scrollTop ??
    0
  );
}

export default function BackToTopButton(): React.JSX.Element | null {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(getScrollY() > 300);
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

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
