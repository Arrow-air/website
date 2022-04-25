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
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "Arrow", // Usually your GitHub org/user name.
  projectName: "arrow", // Usually your repo name.

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
          editUrl: 'https://github.com/Arrow-air/website/edit/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/Arrow-air/website/edit/main/',
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
        },
        items: [
          {
            type: "doc",
            docId: "about",
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
            href: "https://discord.com/invite/fab4bxaAW9",
            position: "right",
            label: "Discord",
            className: "text-white",
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
                label: "About",
                to: "/docs/about",
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
        additionalLanguages: ["solidity"],
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
