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
// Zero npm dependencies — only Node built-ins (fs, path).
//
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(ROOT, 'templates');
const PAGES_DIR = path.join(TEMPLATES, 'pages');

// Load the shared page skeleton (contains {{INCLUDE:…}} and {{…}} placeholders).
// Strip the leading HTML comment — it documents the placeholder syntax for
// developers reading the template source, but shouldn't appear in output.
const baseTemplate = fs.readFileSync(path.join(TEMPLATES, 'base.html'), 'utf8')
  .replace(/^<!--[\s\S]*?-->\n/, '');

// Replace {{INCLUDE:partials/foo.html}} lines with the actual file contents.
// These are the shared sections (navbar, footer, etc.) that every page uses.
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

// Auto-discover every *.json config in templates/pages/
const configs = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));

for (const configFile of configs) {
  const config = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, configFile), 'utf8'));

  let html = baseTemplate;

  // Step 1 — Inline shared partials (navbar, footer, head styles, global styles)
  html = resolveIncludes(html);

  // Step 2 — Webflow page ID (appears in <html> tag AND the footer newsletter form)
  html = html.replace(/{{WF_PAGE_ID}}/g, config.wfPageId || '');

  // Step 3 — Page title
  html = html.replace('{{TITLE}}', config.title || '');

  // Step 4 — OG / Twitter meta tags (indented to match surrounding markup)
  const metaTags = (config.metaTags || []).map(t => '  ' + t).join('\n');
  html = replacePlaceholder(html, '{{META_TAGS}}', metaTags);

  // Step 5 — Extra <head> content (e.g. page-specific CSS files)
  html = replacePlaceholder(html, '{{EXTRA_HEAD}}', config.extraHead || '');

  // Step 6 — Main body content (read from a separate .body.html file)
  let bodyContent = '';
  if (config.bodyFile) {
    bodyContent = fs.readFileSync(path.join(PAGES_DIR, config.bodyFile), 'utf8').trimEnd();
  }
  html = replacePlaceholder(html, '{{CONTENT}}', bodyContent);

  // Step 7 — Extra scripts (e.g. engineering page's dark-mode toggle)
  let extraScripts = '';
  if (config.extraScriptsFile) {
    extraScripts = fs.readFileSync(path.join(PAGES_DIR, config.extraScriptsFile), 'utf8').trimEnd();
  }
  html = replacePlaceholder(html, '{{EXTRA_SCRIPTS}}', extraScripts);

  // Write the finished page to static/
  const outputPath = path.join(ROOT, config.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`Built: ${config.output}`);
}
