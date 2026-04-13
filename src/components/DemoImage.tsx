import React from 'react';

type DemoImageColor = 'blue' | 'grey' | 'teal';

interface DemoImageProps {
  /** Image src — use for single-image shorthand */
  src?: string;
  alt?: string;
  /** Color theme: 'blue' | 'grey' | 'teal'. Defaults to 'blue'. */
  color?: DemoImageColor;
  /** Caption rendered below the image(s), inside the frame */
  caption?: string;
  /** 1 or 2 columns. Defaults to 1. */
  cols?: 1 | 2;
  /** Pass <img> elements here for multi-image layouts */
  children?: React.ReactNode;
}

export function DemoImage({
  src,
  alt,
  color = 'blue',
  caption,
  cols = 1,
  children,
}: DemoImageProps) {
  return (
    <figure
      className={`demo-image demo-image--${color}`}
      data-cols={cols}
    >
      <div className={`demo-image__inner${cols === 2 ? ' demo-image__inner--2col' : ''}`}>
        {src ? (
          <img src={src} alt={alt ?? ''} />
        ) : (
          children
        )}
      </div>
      {caption && (
        <figcaption className="demo-image__caption">{caption}</figcaption>
      )}
    </figure>
  );
}
