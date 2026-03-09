// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const path = require('path');
const { themes } = require("prism-react-renderer");
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

// External docs config - shared with import script (external-docs.json)
const externalDocs = require('./external-docs.json');

// Custom plugin: prevent docs/project-quiver/ files from being processed by the
// main docs preset's MDX webpack loader (they are handled by the quiver plugin instance).
function excludeProjectQuiverFromMainDocsLoader() {
  const projectQuiverPath = path.resolve(__dirname, 'docs', 'project-quiver');
  const docsPath = path.resolve(__dirname, 'docs') + path.sep;
  return {
    name: 'exclude-project-quiver-from-main-mdx-loader',
    configureWebpack(config) {
      for (const rule of (config.module?.rules ?? [])) {
        if (!rule || typeof rule !== 'object' || !Array.isArray(rule.include)) continue;
        // Identify the main docs MDX rule: includes 'docs/' but not 'project-quiver'
        if (rule.include.some(d => d === docsPath) &&
            !rule.include.some(d => typeof d === 'string' && d.includes('project-quiver'))) {
          rule.exclude = (Array.isArray(rule.exclude)
            ? rule.exclude
            : rule.exclude ? [rule.exclude] : []
          ).concat(projectQuiverPath);
          break;
        }
      }
      return {};
    },
  };
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Arrow",
  tagline: "Bringing Private Air Travel to Everyone",
  url: "https://arrowair.com",
  baseUrl: "/",
  onBrokenLinks: "warn",
  favicon: "images/favicon.png",
  organizationName: "Arrow", // Usually your GitHub org/user name.
  projectName: "arrow", // Usually your repo name.

  markdown: {
    format: 'detect',
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
  },

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        indexDocs: true,
        indexBlog: true,
        blogDir: "blog/",
        docsDir: ["docs", "docs-quiver", "docs-spearhead", "docs-flight-tracking", "docs-bounty"],
        language: "en",
        searchResultLimits: 8,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        hashed: true,
      },
    ],
  ],

  clientModules: [
    require.resolve('./src/js/imageCollapse.js'),
  ],

  plugins: [
    excludeProjectQuiverFromMainDocsLoader,
    require.resolve('./plugins/dev-homepage'),
    ['@docusaurus/plugin-content-docs', {
      id: 'quiver',
      path: 'docs/project-quiver',
      routeBasePath: 'quiver',
      sidebarPath: require.resolve('./sidebars-quiver.js'),
      editUrl: 'https://github.com/Arrow-air/project-quiver/edit/main/docs/',
      showLastUpdateTime: true,
    }],
    ['@docusaurus/plugin-content-docs', {
      id: 'spearhead',
      path: 'docs-spearhead',
      routeBasePath: 'spearhead',
      sidebarPath: require.resolve('./sidebars-spearhead.js'),
      editUrl: 'https://github.com/Arrow-air/website/edit/staging/docs-spearhead/',
      showLastUpdateTime: true,
    }],
    ['@docusaurus/plugin-content-docs', {
      id: 'flight-tracking',
      path: 'docs-flight-tracking',
      routeBasePath: 'flight-tracking',
      sidebarPath: require.resolve('./sidebars-flight-tracking.js'),
      editUrl: 'https://github.com/Arrow-air/website/edit/staging/docs-flight-tracking/',
      showLastUpdateTime: true,
    }],
    ['@docusaurus/plugin-content-docs', {
      id: 'bounty',
      path: 'docs-bounty',
      routeBasePath: 'bounty',
      sidebarPath: require.resolve('./sidebars-bounty.js'),
      editUrl: 'https://github.com/Arrow-air/website/edit/staging/docs-bounty/',
      showLastUpdateTime: true,
    }],
  ],

  stylesheets: [
    { href: "https://fonts.googleapis.com", rel: "preconnect" },
    { href: "https://fonts.gstatic.com", rel: "preconnect" },
    {
      href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Karla:wght@400;700&family=Rubik:wght@400;700&display=swap",
    },
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          exclude: ['**/project-quiver/**'], // served by the separate quiver plugin instance
          showLastUpdateTime: true,
          editUrl: ({ docPath }) => {
            // Check if this doc is from an external repo
            for (const [folder, config] of Object.entries(externalDocs)) {
              if (docPath.startsWith(`${folder}/`)) {
                const relativePath = docPath.replace(`${folder}/`, '');
                return `https://github.com/${config.repo}/edit/${config.branch}/${config.docsPath}/${relativePath}`;
              }
            }
            // Default to website repo
            return `https://github.com/Arrow-air/website/edit/staging/docs/${docPath}`;
          },
        },
        blog: {
          showReadingTime: true,
          editUrl: "https://github.com/Arrow-air/website/edit/staging/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
    // Redocusaurus config (commented out - rest-develop.json is empty)
    // [
    //   'redocusaurus',
    //   {
    //     // Plugin Options for loading OpenAPI files
    //     specs: [
    //       {
    //         id: "rest-develop",
    //         spec: "rest-develop.json",
    //         route: "api/rest/develop"
    //       },
    //     ],
    //     // Theme Options for modifying how redoc renders them
    //     theme: {
    //       // Change with your site colors
    //       primaryColor: '#1890ff',
    //     },
    //   },
    // ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      docs: {
        sidebar: {
          hideable: true
        }
      },
      navbar: {
        logo: {
          alt: "Arrow Logo",
          src: "img/wordmark_gray.svg",
          href: "pathname:///",
        },
        items: [
          {
            type: "search",
            position: "right",
          },
          {
            href: "https://github.com/Arrow-air",
            position: "right",
            className: "navbar-icon navbar-icon--github",
            "aria-label": "GitHub",
          },
          {
            href: "https://discord.com/invite/arrow",
            position: "right",
            className: "navbar-icon navbar-icon--discord",
            "aria-label": "Discord",
          },
        ],
      },
      footer: {
        style: "light",
        logo: {
          alt: "Arrow Logo",
          src: "img/wordmark_gray.svg",
        },
        copyright:
          'Built with <img src="/img/arrow-icon_love.svg" style="height:1rem" alt="love"/> by the Arrow Community',
        links: [
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.com/invite/fab4bxaAW9",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/ArrowAir_",
              },
            ],
          },
          {
            title: "Links",
            items: [
              {
                label: "Intro",
                to: "/docs/intro",
              },
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/Arrow-air",
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['rust', 'toml']
      },
      languageTabs: [
        {
            highlight: "bash",
            language: "curl",
            logoClass: "bash",
        },
        {
            highlight: "python",
            language: "python",
            logoClass: "python",
        },
        {
            highlight: "go",
            language: "go",
            logoClass: "go",
        },
        {
            highlight: "javascript",
            language: "nodejs",
            logoClass: "nodejs",
        },
      ]
    }),
};

module.exports = config;
