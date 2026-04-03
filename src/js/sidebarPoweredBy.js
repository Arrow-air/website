const LABEL_ID = 'sidebar-bottom-label';

function inject() {
  if (typeof document === 'undefined') return;

  const sidebar = document.querySelector(
    '.theme-doc-sidebar-container [class*="sidebar_"]'
  );
  if (!sidebar) return;
  if (sidebar.querySelector('#' + LABEL_ID)) return;

  const container = document.createElement('div');
  container.id = LABEL_ID;
  container.className = 'sidebar-bottom-label';
  container.innerHTML = `
    <div class="sidebar-powered-by"></div>
    <div class="sidebar-bottom-label__text">
      <a href="https://docusaurus.io" target="_blank" rel="noopener noreferrer" class="sidebar-bottom-label__main">Docs Powered by Docusaurus</a>
    </div>
  `;

  sidebar.appendChild(container);
}

if (typeof document !== 'undefined') {
  inject();

  const observer = new MutationObserver(() => {
    inject();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
