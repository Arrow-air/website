import React from 'react';

interface CardProps {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  titleIcon?: React.ReactNode;
  titleImage?: string;
  image?: string;
  imageDarkUnhover?: string;
  imageLightUnhover?: string;
  imageHover?: string;
  gradient?: string;
  children?: React.ReactNode;
}

interface CardsProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}

export function Card({ title, href, icon, titleIcon, titleImage, image, imageDarkUnhover, imageLightUnhover, imageHover, gradient, children }: CardProps) {
  const hasThemedImages = imageDarkUnhover || imageLightUnhover || imageHover;
  const hasMedia = image || hasThemedImages || icon || gradient;
  const hasImage = image || hasThemedImages;

  const mediaStyle = gradient ? { background: gradient } : undefined;

  const inner = (
    <div className="card__inner">
      <div className="card__content">
        <div className="card__title">
          {(titleIcon || (icon && hasImage)) && (
            <span className="card__title-icon">{titleIcon ?? icon}</span>
          )}
          {titleImage && (
            <img src={titleImage} alt="" className="card__title-image" />
          )}
          {title}
          {href && (
            <svg className="card__title-arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><path d="M3 12L21 12L20.5 12" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square" fill="none"></path><path d="M14 19L21 12L14 5" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square" fill="none"></path></g></svg>
          )}
        </div>
        {children && <div className="card__body">{children}</div>}
      </div>
      {hasMedia && (
        <div className="card__media-wrapper">
          <div className="card__media" style={mediaStyle}>
            {image && <img src={image} alt="" className="card__image" />}
            {imageDarkUnhover && <img src={imageDarkUnhover} alt="" className="card__image card__image--dark-unhover" />}
            {imageLightUnhover && <img src={imageLightUnhover} alt="" className="card__image card__image--light-unhover" />}
            {imageHover && <img src={imageHover} alt="" className="card__image card__image--hover" />}
            {icon && !hasImage && <div className="card__media-icon">{icon}</div>}
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="card card--link">
        {inner}
      </a>
    );
  }

  return <div className="card">{inner}</div>;
}

export function Cards({ children, cols = 2 }: CardsProps) {
  return (
    <div className={`cards cards--cols-${cols}`}>
      {children}
    </div>
  );
}
