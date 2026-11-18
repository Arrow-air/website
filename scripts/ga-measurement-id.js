// Google Analytics 4 measurement id for this build: production only, so
// staging and local builds send nothing. GA_MEASUREMENT_ID overrides it
// (empty turns analytics off). The deploy workflow sets DEPLOY_ENV.
// Used by docusaurus.config.js and scripts/build-html.js; the consent banner
// is static/js/cookie-consent.js.
module.exports =
  process.env.GA_MEASUREMENT_ID ??
  (process.env.DEPLOY_ENV === 'production' ? 'G-JWJ4J1HPHJ' : '');
