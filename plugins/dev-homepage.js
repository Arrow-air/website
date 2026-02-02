// In dev mode, Docusaurus's HtmlWebpackPlugin emits index.html (the SPA
// shell) which conflicts with our static/index.html (the custom homepage).
//
// This plugin excludes index.html from webpack's CopyPlugin (avoiding
// the conflict) and adds Express middleware to serve our custom homepage
// at / and /index.html before the SPA fallback handles them.
//
// In production builds, this plugin does nothing — Docusaurus copies
// static files after page generation, so static/index.html wins naturally.

const fs = require('fs');
const path = require('path');

module.exports = function devHomepage() {
  return {
    name: 'dev-homepage',
    configureWebpack(config, isServer) {
      if (isServer || process.env.NODE_ENV === 'production') return {};

      // Exclude index.html from CopyPlugin so it doesn't conflict
      // with Docusaurus's HtmlWebpackPlugin SPA shell
      for (const plugin of (config.plugins || [])) {
        if (plugin.constructor?.name === 'CopyPlugin' && Array.isArray(plugin.patterns)) {
          for (const pattern of plugin.patterns) {
            if (!pattern.globOptions) pattern.globOptions = {};
            if (!pattern.globOptions.ignore) pattern.globOptions.ignore = [];
            pattern.globOptions.ignore.push('**/index.html');
          }
        }
      }

      // Wrap setupMiddlewares to serve our homepage at / before
      // Docusaurus's historyApiFallback rewrites it to the SPA shell
      const siteDir = config.context || process.cwd();
      const homepagePath = path.join(siteDir, 'static', 'index.html');
      const existingSetup = config.devServer?.setupMiddlewares;

      if (!config.devServer) config.devServer = {};
      config.devServer.setupMiddlewares = (middlewares, devServer) => {
        let result = existingSetup
          ? existingSetup(middlewares, devServer)
          : middlewares;

        result.unshift({
          name: 'custom-homepage',
          middleware: (req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              try {
                const html = fs.readFileSync(homepagePath, 'utf8');
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(html);
                return;
              } catch (e) {
                // File missing — fall through to Docusaurus
              }
            }
            next();
          },
        });

        return result;
      };

      return {};
    },
  };
};
