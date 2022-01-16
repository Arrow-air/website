/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import styles from './styles.module.css';
import ThemedImage from '@theme/ThemedImage';
import IconExternalLink from '@theme/IconExternalLink';

function FooterLink({to, href, label, prependBaseUrlToHref, ...props}) {
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, {
    forcePrependBaseUrl: true,
  });
  return (
    <Link
      className="footer__link-item"
      {...(href
        ? {
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            to: toUrl,
          })}
      {...props}>
      {href && !isInternalUrl(href) ? (
        <span>
          {label}
          <IconExternalLink />
        </span>
      ) : (
        label
      )}
    </Link>
  );
}

function FooterLogo({sources, alt, width, height}) {
  return (
    <ThemedImage
      className="footer__logo mx-auto mx-sm-0"
      alt={alt}
      sources={sources}
      width={width}
      height={height}
    />
  );
}

function Footer() {
  const {footer} = useThemeConfig();
  const {copyright, links = [], logo = {}} = footer || {};
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark || logo.src),
  };

  if (!footer) {
    return null;
  }

  return (
    <footer
      className={clsx({
        'footer--dark': footer.style === 'dark',
      })}>
      <div className="container-fluid bg-gray-light text-gray-dark">
        <div className="row justify-content-center p-4 footer__links">
          <div className="col-12 col-sm-10 col-xl-6 mt-5">
            <div className="d-flex flex-wrap flex-sm-nowrap justify-content-center">
            {logo && (logo.src || logo.srcDark) && (
              <div className="w-100 footer__col">
                <div className="row h-100">
                  <FooterLogo alt={logo.alt} sources={sources}/>
                </div>
              </div>
            )}
            {links && links.length > 0 ? (
			  links.map((linkItem, i) => (
              <div key={i} className="flex-shrink-1 text-nowrap px-3 footer__col">
                {linkItem.title != null &&
				<div className="footer__title">{linkItem.title}</div>
				}
                {linkItem.items != null && Array.isArray(linkItem.items) && linkItem.items.length > 0 && 
                  <ul className="footer__items">
                  {linkItem.items.map((item, key) => item.html ? (
                    <li
                      key={key}
                      className="footer__item" // Developer provided the HTML, so assume it's safe.
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{
                        __html: item.html,
                      }}
                    />
                  ) : (
                    <li key={item.href || item.to} className="footer__item">
                      <FooterLink {...item} />
                    </li>
                  ),)}
                  </ul>
				}
              </div>
              ))
			) : null}
            </div>
          </div>
        </div>
        {(logo || copyright) && (
		<div className="footer__bottom text--center">
			<div className="row justify-content-center p-4 bg-secondary">
            {copyright ? (
				<div className="col-12 text-center">
					<span className="fw-bold"
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{
						  __html: copyright,
						}}
					/>
				</div>
            ) : null}
			</div>
		</div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
