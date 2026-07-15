// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenSource.ngo',
  tagline: 'We define what is open source.',
  favicon: 'img/opensource-ngo-favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://licenses.opensource.ngo',
  baseUrl: '/',

  organizationName: 'opensource-ngo',
  projectName: 'licenses',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'OpenSource.ngo',
        logo: {
          alt: 'OpenSource.ngo',
          src: 'img/opensource-ngo-mark.svg',
        },
        items: [
          {to: '/docs', label: 'Docs', position: 'left'},
          {to: '/docs/public-licenses', label: 'Public Licenses', position: 'left'},
          {to: '/tools', label: 'Tools', position: 'left'},
          {
            to: '/docs/opensource-ngo-licenses',
            label: 'OpenSource.ngo Licenses',
            position: 'left',
          },
          {to: '/docs/policies', label: 'Policies', position: 'left'},
          {
            href: 'https://github.com/DigitalPlatDev/OpenSource',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Public Licenses', to: '/docs/public-licenses'},
              {label: 'OpenSource.ngo Licenses', to: '/docs/opensource-ngo-licenses'},
              {label: 'License Tools', to: '/tools'},
            ],
          },
          {
            title: 'Policies',
            items: [
              {label: 'Policies Overview', to: '/docs/policies'},
              {label: 'Disclaimer', to: '/docs/policies/disclaimer'},
            ],
          },
          {
            title: 'OpenSource.ngo',
            items: [
              {label: 'Main Site', href: 'https://opensource.ngo'},
              {label: 'GitHub', href: 'https://github.com/DigitalPlatDev/OpenSource'},
            ],
          },
        ],
        copyright: `<p class="foundation-statement">DigitalPlat Foundation is an independent U.S. 501(c)(3) public charity supporting Internet Freedom, open infrastructure, digital rights, and access to technology. EIN: 38-4397252.</p><p class="footer-copyright">Copyright © ${new Date().getFullYear()} OpenSource.ngo. We define what is open source.</p>`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
