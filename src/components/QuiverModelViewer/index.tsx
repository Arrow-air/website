import React, { Suspense } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export interface QuiverModelViewerProps {
  /** Base URL of the directory holding manifest.json and the GLB files. */
  modelsBase: string;
  /** Viewer height in pixels. */
  height?: number;
}

// The viewer renders a WebGL canvas via react-three-fiber, which cannot run
// during Docusaurus SSR — load it lazily, in the browser only.
const LazyViewer = React.lazy(() => import('./Viewer'));

export function QuiverModelViewer(props: QuiverModelViewerProps): React.JSX.Element {
  const height = props.height ?? 560;
  const placeholder = (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 8,
      }}
    >
      Loading 3D viewer…
    </div>
  );
  return (
    <BrowserOnly fallback={placeholder}>
      {() => (
        <Suspense fallback={placeholder}>
          <LazyViewer {...props} height={height} />
        </Suspense>
      )}
    </BrowserOnly>
  );
}

export default QuiverModelViewer;
