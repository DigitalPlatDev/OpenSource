import assert from 'node:assert/strict';
import test from 'node:test';
import {searchEntries} from '../src/utils/search.mjs';
import {
  countSidebarResults,
  createLicensePathMap,
  filterSidebarItems,
} from '../src/utils/sidebarSearch.mjs';

const licenses = [
  {
    spdxId: 'MPL-2.0',
    name: 'Mozilla Public License 2.0',
    path: '/docs/public-licenses/MPL-2.0',
  },
  {
    spdxId: 'MIT',
    name: 'MIT License',
    path: '/docs/public-licenses/MIT',
  },
];

const sidebar = [
  {
    type: 'category',
    label: 'Public Licenses',
    collapsed: true,
    items: licenses.map((license) => ({
      type: 'link',
      label: license.spdxId,
      href: license.path,
    })),
  },
];

test('sidebar search matches a full license name', () => {
  const results = filterSidebarItems(
    sidebar,
    'Mozilla Public',
    createLicensePathMap(licenses),
  );
  assert.equal(countSidebarResults(results), 1);
  assert.equal(results[0].items[0].label, 'MPL-2.0');
  assert.equal(results[0].collapsed, false);
});

test('sidebar search returns the original items for an empty query', () => {
  assert.equal(filterSidebarItems(sidebar, '', createLicensePathMap(licenses)), sidebar);
});

test('global search prioritizes exact SPDX matches', () => {
  const entries = [
    {title: 'MIT License', subtitle: 'MIT', keywords: '', content: 'permission'},
    {title: 'Other page', subtitle: 'Documentation', keywords: '', content: 'mentions MIT'},
  ];
  assert.equal(searchEntries(entries, 'MIT')[0].subtitle, 'MIT');
});

test('global search requires every query term', () => {
  const entries = [
    {title: 'Mozilla Public License 2.0', subtitle: 'MPL-2.0', keywords: '', content: 'file-level copyleft'},
    {title: 'MIT License', subtitle: 'MIT', keywords: '', content: 'permissive'},
  ];
  assert.deepEqual(searchEntries(entries, 'mozilla copyleft').map((entry) => entry.subtitle), ['MPL-2.0']);
});
