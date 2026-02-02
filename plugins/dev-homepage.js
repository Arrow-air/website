// Registers a landing page at / only in dev mode.
//
// In dev mode, static/index.html is skipped (it conflicts with
// Docusaurus's SPA shell). This plugin fills the gap with a simple
// page linking to all custom pages for quick navigation.
//
// In production builds, this plugin does nothing — static/index.html
// is generated normally and serves as the real homepage.

module.exports = function devHomepage() {
  return {
    name: 'dev-homepage',
    async contentLoaded({actions}) {
      if (process.env.NODE_ENV === 'production') return;
      actions.addRoute({
        path: '/',
        component: '@site/src/components/DevHomepage',
        exact: true,
      });
    },
  };
};
