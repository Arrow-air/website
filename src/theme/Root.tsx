import React, { useEffect, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';

export default function Root({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('docs-fullwidth', pathname.startsWith('/bounty'));
  }, [pathname]);

  return <>{children}</>;
}
