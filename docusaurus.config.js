// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Arrow",
  tagline: "Bringing Private Air Travel to Everyone",
  url: "https://arrowair.com",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "Arrow", // Usually your GitHub org/user name.
  projectName: "arrow", // Usually your repo name.

  themes: [
    // ... Your other themes.
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        indexDocs: true,
        indexBlog: true,
        blogDir: "blog/",
        docsDir: "docs/",
        language: "en",
        searchResultLimits: 8,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        // language: ["en", "zh"],
        // ```
      },
    ],
    "docusaurus-theme-openapi-docs"
  ],


  plugins: [
    [
        "docusaurus-plugin-openapi-docs",
        {
            id: "openapi",
            docsPluginId: "classic",
            config: {
                cargo: {
                    specPath: "docs/documentation/services/rest/svc-cargo/api.json",
                    outputDir: "docs/documentation/services/rest/svc-cargo/",
                    sidebarOptions: {
                        groupPathsBy: "tag", // generate a sidebar.js slice that groups operations by tag
                    },

                }
            }
        },
    ]
  ],

  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
      integrity:
        "sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3",
      crossorigin: "anonymous",
    },
    { href: "https://fonts.googleapis.com", rel: "preconnect" },
    { href: "https://fonts.gstatic.com", rel: "preconnect" },
    {
      href: "https://fonts.googleapis.com/css2?family=Karla:wght@400;700&family=Rubik:wght@400;700&display=swap",
    },
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/Arrow-air/website/edit/staging/",
          docLayoutComponent: "@theme/DocPage",
          docItemComponent: "@theme/ApiItem"
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
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        disableSwitch: true,
      },
      navbar: {
        logo: {
          alt: "Arrow Logo",
          src: "img/wordmark_gray.svg",
          href: "pathname:///",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "right",
            label: "Docs",
            className: "text-secondary",
          },
          {
            to: "/blog",
            position: "right",
            label: "Blog",
            className: "text-secondary",
            image: "img/arrow-icon_blog.svg",
          },
          {
            href: "https://discord.com/invite/arrow",
            position: "right",
            label: "Discord",
            className: "text-secondary",
            image: "img/arrow-icon_discord.svg",
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
        //{
        //  highlight: "ruby",
        //  language: "ruby",
        //  logoClass: "ruby",
        //},
        // {
        //     highlight: "csharp",
        //     language: "csharp",
        //     logoClass: "csharp",
        // },
        // {
        //   highlight: "php",
        //   language: "php",
        //   logoClass: "php",
        // },
        ],
    }),
};

module.exports = config;
