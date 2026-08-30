import React, { useCallback, useEffect, useState } from 'react';
import styles from './styles.module.css';

export type GalleryImage = {
  src: string;
  alt: string;
  /** One line shown under the featured image. */
  caption: string;
  /** id of the changelog line this image belongs to (a span in the MDX). */
  target?: string;
};

/** Full-width banner image for the top of the changelog page. */
export function ChangelogBanner({ src, alt }: { src: string; alt: string }): JSX.Element {
  return (
    <div className={styles.banner}>
      <img src={src} alt={alt} loading="eager" />
    </div>
  );
}

/**
 * Mosaic viewer for a changelog entry: one featured image with a caption and
 * a jump link to the changelog line it illustrates, plus a thumbnail strip.
 * Clicking the featured image opens it full-size in a lightbox.
 */
export default function ChangelogGallery({ images }: { images: GalleryImage[] }): JSX.Element | null {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const close = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox, close]);

  if (images.length === 0) return null;
  const current = images[Math.min(selected, images.length - 1)];

  const jumpToLine = (target: string) => {
    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove(styles.flash);
    // restart the animation if the reader clicks twice
    void el.offsetWidth;
    el.classList.add(styles.flash);
  };

  return (
    <figure className={styles.gallery}>
      <button
        type="button"
        className={styles.featured}
        onClick={() => setLightbox(true)}
        aria-label={`View full size: ${current.alt}`}
      >
        <img src={current.src} alt={current.alt} loading="lazy" />
      </button>
      <figcaption className={styles.captionRow}>
        <span>{current.caption}</span>
        {current.target && (
          <button type="button" className={styles.jump} onClick={() => jumpToLine(current.target)}>
            → read more in this entry
          </button>
        )}
      </figcaption>
      {images.length > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label="Entry images">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={i === selected}
              className={i === selected ? `${styles.thumb} ${styles.thumbActive}` : styles.thumb}
              onClick={() => setSelected(i)}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div className={styles.lightbox} onClick={close} role="dialog" aria-modal="true">
          <img src={current.src} alt={current.alt} />
          <span className={styles.lightboxHint}>click anywhere or press Esc to close</span>
        </div>
      )}
    </figure>
  );
}
