// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Arrow',
	tagline: 'Bringing Private Air Travel to Everyone',
	url: 'https://arrowair.com',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'Arrow', // Usually your GitHub org/user name.
	projectName: 'arrow', // Usually your repo name.

	stylesheets: [
		{
			href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
			integrity: 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3', 
			crossorigin: 'anonymous'
		},
		{ href: 'https://fonts.googleapis.com', rel: 'preconnect' },
		{ href: 'https://fonts.gstatic.com', rel: 'preconnect' },
		{ href: 'https://fonts.googleapis.com/css2?family=Karla:wght@400;700&family=Rubik:wght@400;700&display=swap' }
	],

	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					// Please change this to your repo.
					editUrl: 'https://github.com/Arrow-air/wiki/edit/main/website/',
				},
				blog: {
					showReadingTime: true,
					// Please change this to your repo.
					editUrl:
					'https://github.com/Arrow-air/wiki/edit/main/website/blog/',
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			}),
		],
	],

	themeConfig:
	/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
	({
		colorMode: {
			disableSwitch: true
		},
		navbar: {
			logo: {
				alt: 'Arrow Logo',
				src: 'img/wordmark_gray.svg',
			},
			items: [
				{
					type: 'doc',
					docId: 'intro',
					position: 'right',
					label: 'Pages',
				},
				{to: '/blog', label: 'Blog', position: 'right'},
				{
					href: 'https://discord.com/invite/fab4bxaAW9',
					label: 'Discord',
					position: 'right',
					className: 'px-3 bg-navy text-white',
				},
			],
		},
		footer: {
			style: 'light',
			logo: {
				alt: 'Arrow Logo',
				src: 'img/wordmark_gray-on-gray.svg',
			},
			copyright: 'Built with love by the Arrow community',
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Intro',
							to: '/docs/intro',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Discord',
							href: 'https://discord.com/invite/fab4bxaAW9',
						},
						{
							label: 'Twitter',
							href: 'https://twitter.com/docusaurus',
						},
					],
				},
				{
					title: 'More',
					items: [
						{
							label: 'Blog',
							to: '/blog',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/Arrow-air',
						},
					],
				},
			],
		},
		prism: {
			theme: lightCodeTheme,
			darkTheme: darkCodeTheme,
		},
	}),
};

module.exports = config;
