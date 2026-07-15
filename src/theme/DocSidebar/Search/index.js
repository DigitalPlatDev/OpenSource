import React, {useId, useMemo, useRef, useState} from 'react';
import licenseCatalog from '@site/static/api/licenses.json';
import {
  countSidebarResults,
  createLicensePathMap,
  filterSidebarItems,
} from '@site/src/utils/sidebarSearch.mjs';

import styles from './styles.module.css';

export default function DocSidebarSearch({sidebar, children}) {
  const inputId = useId();
  const rootRef = useRef(null);
  const [query, setQuery] = useState('');
  const licensePathMap = useMemo(
    () => createLicensePathMap(licenseCatalog.licenses),
    [],
  );
  const filteredSidebar = useMemo(
    () => filterSidebarItems(sidebar, query, licensePathMap),
    [licensePathMap, query, sidebar],
  );
  const hasQuery = query.trim().length > 0;
  const resultCount = useMemo(
    () => hasQuery ? countSidebarResults(filteredSidebar) : null,
    [filteredSidebar, hasQuery],
  );

  function handleKeyboardNavigation(event) {
    if (event.key === 'Escape') {
      setQuery('');
      rootRef.current?.querySelector('input')?.focus();
      return;
    }
    if (event.key === 'Enter' && document.activeElement?.matches('.menu__link[href]:not([href="#"])')) {
      document.activeElement.click();
      event.preventDefault();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const links = [...rootRef.current.querySelectorAll('.menu__link[href]')]
      .filter((link) => link.offsetParent !== null && link.getAttribute('href') !== '#');
    if (links.length === 0) return;
    const currentIndex = links.indexOf(document.activeElement);
    const nextIndex = event.key === 'ArrowDown'
      ? currentIndex < links.length - 1 ? currentIndex + 1 : 0
      : currentIndex > 0 ? currentIndex - 1 : links.length - 1;
    links[nextIndex].focus();
    event.preventDefault();
  }

  return (
    <div ref={rootRef} className={styles.searchRoot} onKeyDownCapture={handleKeyboardNavigation}>
      <div className={styles.searchArea}>
        <label className={styles.searchBox} htmlFor={inputId}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
          </svg>
          <input
            id={inputId}
            type="search"
            value={query}
            placeholder="Search by SPDX ID or name"
            aria-label="Search licenses in the sidebar"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              className={styles.clearButton}
              aria-label="Clear license search"
              onClick={() => setQuery('')}>
              <span aria-hidden="true">×</span>
            </button>
          )}
        </label>
        {resultCount !== null && resultCount > 0 && (
          <div className={styles.resultCount} aria-live="polite">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>
      {resultCount === 0
        ? <p className={styles.emptyState} aria-live="polite">No matching licenses</p>
        : children(filteredSidebar)}
    </div>
  );
}
