/**
 * Clips the sticky sidebar so it never visually overlaps the footer.
 *
 * The aside is position:sticky with height:100vh + margin-bottom:-100vh
 * (so the footer follows main content, not sidebar height). We maintain
 * the invariant margin-bottom = -height so the aside's flex contribution
 * stays at 0, while dynamically reducing height when the footer enters
 * the viewport.
 *
 * height = min(100vh, footer.top) - headerHeight
 * margin-bottom = -height   (always)
 */

const DEFAULT_HEADER_HEIGHT = 115;

function getHeaderHeight() {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue('--arrow-docs-header-height')
    .trim();
  return parseInt(val, 10) || DEFAULT_HEADER_HEIGHT;
}

function clipSidebar() {
  const aside = document.querySelector('aside.theme-doc-sidebar-container');
  const footer = document.querySelector('footer');
  if (!aside || !footer) return;

  const headerH = getHeaderHeight();
  const footerTop = footer.getBoundingClientRect().top;
  const h = Math.max(0, Math.min(window.innerHeight, footerTop) - headerH);

  aside.style.height = `${h}px`;
  aside.style.marginBottom = `-${h}px`;
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', clipSidebar, { passive: true });
  window.addEventListener('resize', clipSidebar, { passive: true });
  // Run after hydration paint — 'load' may have already fired by now
  requestAnimationFrame(clipSidebar);
}

export function onRouteDidUpdate() {
  // Double rAF: first frame commits React changes, second frame has stable layout
  requestAnimationFrame(() => requestAnimationFrame(clipSidebar));
}
