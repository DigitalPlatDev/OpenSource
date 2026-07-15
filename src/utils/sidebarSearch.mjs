import {normalizeSearchText} from './search.mjs';

function normalizePath(value) {
  return String(value ?? '').replace(/\/$/u, '');
}

export function createLicensePathMap(licenses) {
  return new Map(
    licenses.map((license) => [normalizePath(license.path), license]),
  );
}

function getSearchText(item, licensePathMap) {
  const license = licensePathMap.get(normalizePath(item.href));
  return normalizeSearchText([
    item.label,
    item.href,
    item.docId,
    item.description,
    license?.spdxId,
    license?.name,
  ].filter(Boolean).join(' '));
}

function filterItem(item, query, licensePathMap) {
  const matchesSelf = getSearchText(item, licensePathMap).includes(query);

  if (item.type !== 'category') {
    return matchesSelf ? item : null;
  }

  if (matchesSelf) {
    return {...item, collapsed: false};
  }

  const items = item.items
    .map((child) => filterItem(child, query, licensePathMap))
    .filter(Boolean);

  return items.length > 0
    ? {...item, collapsed: false, items}
    : null;
}

export function filterSidebarItems(sidebar, query, licensePathMap = new Map()) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return sidebar;
  return sidebar
    .map((item) => filterItem(item, normalizedQuery, licensePathMap))
    .filter(Boolean);
}

export function countSidebarResults(items) {
  return items.reduce((total, item) => {
    if (item.type === 'category') {
      return total + countSidebarResults(item.items);
    }
    return item.type === 'link' ? total + 1 : total;
  }, 0);
}
