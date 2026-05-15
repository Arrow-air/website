---
draft: true
title: Arrow Docs Info
sidebar_position: 99
sidebar_custom_props:
  icon: doc
---

# Arrow Docs Info

This page explains how the Arrow documentation site works and how to contribute.

## Overview

The Arrow website is built with [Docusaurus](https://docusaurus.io/), a static site generator designed for documentation. The site is deployed to AWS S3 and served via CloudFront.

## Project Structure

```
website/
├── docs/                    # Documentation pages
│   ├── contributing/        # Contribution guides
│   ├── documentation/       # Technical documentation
│   └── project-quiver/      # Imported from external repo (auto-generated)
├── blog/                    # Blog posts
├── src/                     # React components and pages
├── static/                  # Static assets (images, files)
├── external-docs.json       # Config for external doc imports
├── scripts/
│   └── import-external-docs.sh  # Script to import external docs
└── docusaurus.config.js     # Main Docusaurus configuration
```

## External Documentation Import

Documentation can be automatically imported from other Arrow repositories at build time. This keeps docs close to their source code while still appearing on the main website.

### How It Works

1. External repos are configured in `external-docs.json`
2. At build time, the import script clones each repo and copies the docs
3. HTML files (like interactive BOMs) are moved to the static folder
4. Links are automatically updated to work with Docusaurus

### Adding a New External Repo

To import documentation from another repository:

1. **Edit `external-docs.json`** and add a new entry:

```json
{
  "project-quiver": {
    "repo": "Arrow-air/project-quiver",
    "branch": "main",
    "docsPath": "docs",
    "sidebarLabel": "Project Quiver",
    "sidebarPosition": 4
  },
  "new-project": {
    "repo": "Arrow-air/new-project",
    "branch": "main",
    "docsPath": "docs",
    "sidebarLabel": "New Project",
    "sidebarPosition": 5
  }
}
```

2. **Update `.gitignore`** to exclude the imported docs:

```
docs/new-project/
static/docs/new-project/
```

3. **Test locally**:

```bash
npm run import-docs
npm start
```

### Configuration Options

| Field | Description |
|-------|-------------|
| `repo` | GitHub repository in `org/repo` format |
| `branch` | Branch to import from |
| `docsPath` | Path to docs folder in the source repo |
| `sidebarLabel` | Display name in the sidebar |
| `sidebarPosition` | Order in the sidebar (lower = higher) |

### Source Repo Requirements

The source repository's docs folder should contain:

- Markdown files (`.md` or `.mdx`)
- A `_category_.json` file for sidebar organization (optional - one will be created if missing)
- Assets in an `assets/` subfolder

### Edit Links

"Edit this page" links automatically point to the correct source repository. This is configured in `docusaurus.config.js` using the same `external-docs.json` config.

## Local Development

### Prerequisites

- Node.js 18+
- Yarn
- jq (for the import script)

### Running Locally

```bash
# Install dependencies
yarn install

# Import external docs and start dev server
npm start
```

The site will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

The built site will be in the `build/` folder.

## Writing Documentation

### File Format

Documentation pages are written in Markdown or MDX (Markdown with JSX). Each page should have frontmatter:

```markdown
---
title: Page Title
sidebar_position: 1
description: Optional description for SEO
---

# Page Title

Content goes here...
```

### Sidebar Organization

Folders can have a `_category_.json` file to configure their sidebar appearance:

```json
{
  "label": "Category Name",
  "position": 1,
  "collapsed": true
}
```

### Images

Place images in an `assets/` folder next to your markdown files and reference them with relative paths:

```markdown
![Image description](./assets/image.png)
```

### HTML Files

If you need to include HTML files (like interactive BOMs), place them in `assets/` and link to them:

```markdown
[Open Interactive Tool](./assets/tool.html)
```

The import script will automatically move these to the static folder and update the links.

## CI/CD

The site is automatically built and deployed when changes are pushed to the `staging` or `main` branch. The GitHub Actions workflow:

1. Installs dependencies
2. Imports external documentation
3. Builds the site
4. Deploys to AWS S3
