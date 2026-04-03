import React from 'react';
import type {Props} from '@theme/Icon/Copy';

export default function IconCopy({className}: Props): React.ReactNode {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} aria-hidden="true">
      <title>copy</title>
      <g fill="currentColor">
        <path d="M7 17L7 3L21 3L21 17L7 17Z" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square" fill="none"></path>
        <path d="M3 7L3 21L17 21" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square" fill="none"></path>
      </g>
    </svg>
  );
}
