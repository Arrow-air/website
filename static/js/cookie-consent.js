// Cookie consent + Google Analytics, shared by the Docusaurus pages and the
// static pages (templates/). Loaded only in builds that have a measurement id
// (scripts/ga-measurement-id.js), which it reads from its own data-ga-id.
//
// GA loads only after the visitor clicks Accept; until then, and after
// Decline, no analytics script runs and no analytics cookie is set.
// Any element with data-cookie-settings reopens the banner (the button on
// /cookie-settings); it stays hidden in builds without analytics.
(function () {
  var script = document.currentScript;
  var gaId = script && script.getAttribute('data-ga-id');
  if (!gaId) return;

  var STORAGE_KEY = 'arrow-cookie-consent';
  var banner = null;

  function readConsent() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === 'granted' || value === 'denied' ? value : null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // Storage blocked: the choice lasts for this page view only.
    }
  }

  function loadAnalytics() {
    window['ga-disable-' + gaId] = false;
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    // Later page views in the Docusaurus single-page app come from GA4's
    // enhanced measurement ("page changes based on browser history events").
    window.gtag('config', gaId);
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(tag);
  }

  function stopAnalytics() {
    window['ga-disable-' + gaId] = true;
    // Remove the _ga cookies GA set on this host and its parent domains.
    var parts = location.hostname.split('.');
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      document.cookie = name + '=; Max-Age=0; path=/';
      for (var i = 0; i < parts.length - 1; i++) {
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + parts.slice(i).join('.');
      }
    });
  }

  function isDarkPage() {
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme) return theme === 'dark';
    var scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme && scheme.content.trim() === 'dark') return true;
    var rgb = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    if (!rgb || (rgb.length > 3 && Number(rgb[3]) === 0)) return false;
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] < 128;
  }

  function addStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '[data-cookie-settings][hidden]{display:inline-flex!important}',
      '.arrow-cc{position:fixed;left:1rem;bottom:1rem;z-index:1000;max-width:340px;box-sizing:border-box;',
      'padding:.875rem 1rem;border:1px solid #e5e7eb;border-radius:10px;background:#fff;color:#1f2937;',
      "box-shadow:0 6px 24px rgba(0,0,0,.18);font:13px/1.45 'Neue Haas Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;",
      'animation:arrow-cc-rise .2s ease-out}',
      '.arrow-cc--dark,html[data-theme="dark"] .arrow-cc{border-color:#374151;background:#16171d;color:#e5e7eb;box-shadow:0 6px 24px rgba(0,0,0,.5)}',
      '.arrow-cc p{margin:0 0 .75rem}',
      '.arrow-cc a{color:inherit;text-decoration:underline}',
      '.arrow-cc__actions{display:flex;justify-content:flex-end;gap:.5rem}',
      '.arrow-cc button{padding:.35rem .85rem;border-radius:6px;font:inherit;cursor:pointer}',
      '.arrow-cc__no{border:1px solid #d1d5db;background:transparent;color:inherit}',
      '.arrow-cc--dark .arrow-cc__no,html[data-theme="dark"] .arrow-cc__no{border-color:#4b5563}',
      '.arrow-cc__yes{border:1px solid #0843bf;background:#0843bf;color:#fff}',
      '.arrow-cc__yes:hover{background:#0739a3}',
      '@media (max-width:600px){.arrow-cc{left:.75rem;right:.75rem;bottom:.75rem;max-width:none}}',
      '@keyframes arrow-cc-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '@media (prefers-reduced-motion:reduce){.arrow-cc{animation:none}}',
    ].join('');
    document.head.appendChild(style);
  }

  function choose(value) {
    writeConsent(value);
    if (value === 'granted') loadAnalytics();
    else stopAnalytics();
    closeBanner();
  }

  function closeBanner() {
    if (banner) banner.remove();
    banner = null;
  }

  function openBanner() {
    closeBanner();
    var current = readConsent();
    banner = document.createElement('div');
    banner.className = 'arrow-cc' + (isDarkPage() ? ' arrow-cc--dark' : '');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p>We use optional cookies to see which pages are helpful. ' +
      '<a href="/cookie-settings">Learn more</a>' +
      (current ? '<br>Currently: ' + (current === 'granted' ? 'accepted' : 'declined') + '.' : '') +
      '</p><div class="arrow-cc__actions">' +
      '<button type="button" class="arrow-cc__no">Decline</button>' +
      '<button type="button" class="arrow-cc__yes">Accept</button></div>';
    banner.querySelector('.arrow-cc__no').addEventListener('click', function () { choose('denied'); });
    banner.querySelector('.arrow-cc__yes').addEventListener('click', function () { choose('granted'); });
    document.body.appendChild(banner);
  }

  document.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('[data-cookie-settings]');
    if (!target) return;
    event.preventDefault();
    openBanner();
  });

  function start() {
    addStyles();
    var consent = readConsent();
    if (consent === 'granted') loadAnalytics();
    if (consent === null) openBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
