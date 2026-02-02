#!/usr/bin/env node
//
// Build-time template assembler for static HTML pages.
//
// The site's navbar and footer are shared across 5 static pages (index,
// quiver, blank, engineering, community). Rather than duplicating that
// markup in every file, we keep one copy of each shared section in
// templates/partials/ and stitch them together here.
//
// How it works:
//   1. Read the page skeleton from  templates/base.html
//   2. For each JSON config in      templates/pages/*.json
//      - Inline the shared partials (navbar, footer, head, global-styles)
//      - Substitute per-page values  (title, meta tags, body content, etc.)
//      - Write the assembled HTML to static/<page>.html
//
// The JSON configs describe each page — title, Webflow page ID, which
// body-content file to slot in, any extra <head> links or <script> tags, etc.
//
// Flags:
//   --watch   After the initial build, watch templates/ for changes and
//             rebuild automatically. Used by the dev server (npm start).
//
// Zero npm dependencies — only Node built-ins (fs, path).
//
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(ROOT, 'templates');
const PAGES_DIR = path.join(TEMPLATES, 'pages');

function loadBaseTemplate() {
  return fs.readFileSync(path.join(TEMPLATES, 'base.html'), 'utf8')
    .replace(/^<!--[\s\S]*?-->\n/, '');
}

// Replace {{INCLUDE:partials/foo.html}} lines with the actual file contents.
function resolveIncludes(html) {
  return html.replace(/^{{INCLUDE:(.+?)}}$/gm, (_, filePath) => {
    return fs.readFileSync(path.join(TEMPLATES, filePath), 'utf8').trimEnd();
  });
}

// Replace a {{PLACEHOLDER}} line with a value. If the value is empty,
// collapse the blank line so we don't leave stray whitespace in the output.
function replacePlaceholder(html, placeholder, value) {
  const escaped = placeholder.replace(/[{}]/g, '\\$&');
  if (value) {
    return html.replace(new RegExp('^' + escaped + '$', 'm'), value);
  }
  return html.replace(new RegExp('\\n?' + escaped + '\\n?'), '\n');
}

function buildAll() {
  const baseTemplate = loadBaseTemplate();
  const configs = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));

  for (const configFile of configs) {
    const config = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, configFile), 'utf8'));
    let html = baseTemplate;

    html = resolveIncludes(html);
    html = html.replace(/{{WF_PAGE_ID}}/g, config.wfPageId || '');
    html = html.replace('{{TITLE}}', config.title || '');

    const metaTags = (config.metaTags || []).map(t => '  ' + t).join('\n');
    html = replacePlaceholder(html, '{{META_TAGS}}', metaTags);
    html = replacePlaceholder(html, '{{EXTRA_HEAD}}', config.extraHead || '');

    let bodyContent = '';
    if (config.bodyFile) {
      bodyContent = fs.readFileSync(path.join(PAGES_DIR, config.bodyFile), 'utf8').trimEnd();
    }
    html = replacePlaceholder(html, '{{CONTENT}}', bodyContent);

    let extraScripts = '';
    if (config.extraScriptsFile) {
      extraScripts = fs.readFileSync(path.join(PAGES_DIR, config.extraScriptsFile), 'utf8').trimEnd();
    }
    html = replacePlaceholder(html, '{{EXTRA_SCRIPTS}}', extraScripts);

    const outputPath = path.join(ROOT, config.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`Built: ${config.output}`);
  }
}

// --- Initial build ---
buildAll();

// --- Watch mode ---
if (process.argv.includes('--watch')) {
  let debounce = null;

  function onChange(dir, eventType, filename) {
    if (debounce) return;
    debounce = setTimeout(() => {
      debounce = null;
      console.log(`\n[watch] ${filename || 'file'} changed, rebuilding...`);
      try {
        buildAll();
        console.log('[watch] Done. Refresh your browser.');
      } catch (e) {
        console.error('[watch] Build error:', e.message);
      }
    }, 200);
  }

  // Watch all template directories (base, partials, pages)
  const dirs = [TEMPLATES, path.join(TEMPLATES, 'partials'), PAGES_DIR];
  for (const dir of dirs) {
    fs.watch(dir, { persistent: true }, (event, filename) => {
      onChange(dir, event, filename);
    });
  }

  console.log('\n[watch] Watching templates/ for changes...');
}
