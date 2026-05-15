if (typeof window !== 'undefined') {
  const html = document.documentElement;
  const CLASS = 'theme-switching';

  const observer = new MutationObserver(() => {
    html.classList.add(CLASS);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => html.classList.remove(CLASS));
    });
  });

  observer.observe(html, {attributes: true, attributeFilter: ['data-theme']});
}
