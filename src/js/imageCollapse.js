function initImageCollapse() {
  const containers = document.querySelectorAll(
    '.theme-doc-markdown p:has(> img), .theme-doc-markdown figure'
  );

  containers.forEach((container) => {
    if (container.querySelector('.image-collapse-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'image-collapse-btn';
    btn.type = 'button';
    btn.title = 'Minimize image';
    btn.textContent = '\u2013';
    btn.addEventListener('click', () => {
      const collapsed = container.classList.toggle('image-collapsed');
      btn.textContent = collapsed ? '+' : '\u2013';
      btn.title = collapsed ? 'Expand image' : 'Minimize image';
    });

    container.appendChild(btn);
  });
}

// Only run in browser (not during SSR)
if (typeof document !== 'undefined') {
  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageCollapse);
  } else {
    initImageCollapse();
  }

  // Re-run on SPA navigation
  const observer = new MutationObserver(() => {
    initImageCollapse();
  });
  observer.observe(document.body, {childList: true, subtree: true});
}
