const SIDEBAR_KEY = 'arrow.sidebarScrollTop';

function getSidebarEl() {
  return document.querySelector('.theme-doc-sidebar-container .menu');
}

// Save sidebar scroll position at click time (before React re-renders)
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('nav.menu a');
    if (!link) return;
    const el = getSidebarEl();
    if (el) sessionStorage.setItem(SIDEBAR_KEY, String(el.scrollTop));
  }, true);
}

export function onRouteDidUpdate({ previousLocation }) {
  if (!previousLocation) return;

  const saved = sessionStorage.getItem(SIDEBAR_KEY);
  if (saved === null) return;

  const el = getSidebarEl();
  if (!el) return;

  const savedVal = parseInt(saved, 10);

  // Apply immediately, then lock scrollTop for 500ms to prevent Docusaurus's
  // scrollIntoView (~204ms after navigation) from overriding the restored position.
  el.scrollTop = savedVal;
  const lock = () => { el.scrollTop = savedVal; };
  el.addEventListener('scroll', lock);
  setTimeout(() => el.removeEventListener('scroll', lock), 500);
}
