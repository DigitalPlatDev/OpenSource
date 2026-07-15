import React, {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHistory, useLocation} from '@docusaurus/router';
import {searchEntries} from '@site/src/utils/search.mjs';

import styles from './styles.module.css';

export default function SearchBar() {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const indexUrl = useBaseUrl('/api/search-index.json');
  const history = useHistory();
  const location = useLocation();
  const results = useMemo(
    () => query.trim().length >= 2 ? searchEntries(entries, query, 8) : [],
    [entries, query],
  );

  async function loadIndex() {
    if (status !== 'idle') return;
    setStatus('loading');
    try {
      const response = await fetch(indexUrl);
      if (!response.ok) throw new Error(`Search index request failed with ${response.status}`);
      const data = await response.json();
      setEntries(data.entries || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    function handleShortcut(event) {
      const target = event.target;
      const isEditing = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target?.isContentEditable;
      if (event.key === '/' && !isEditing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        loadIndex();
      }
    }
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [status]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setQuery('');
  }, [location.pathname]);

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [query, results.length]);

  function openResult(result) {
    setIsOpen(false);
    setQuery('');
    history.push(result.path);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      setActiveIndex((current) => current >= results.length - 1 ? 0 : current + 1);
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      setActiveIndex((current) => current <= 0 ? results.length - 1 : current - 1);
      event.preventDefault();
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      openResult(results[activeIndex]);
      event.preventDefault();
    }
  }

  const showPanel = isOpen && (query.trim().length >= 2 || status === 'loading' || status === 'error');

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.inputShell}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Search the site"
          aria-label="Search the entire site"
          aria-expanded={showPanel}
          aria-controls="global-search-results"
          aria-activedescendant={activeIndex >= 0 ? `global-search-result-${activeIndex}` : undefined}
          autoComplete="off"
          onFocus={() => {
            setIsOpen(true);
            loadIndex();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            loadIndex();
          }}
          onKeyDown={handleKeyDown}
        />
        <kbd aria-label="Keyboard shortcut">/</kbd>
      </div>
      {showPanel && (
        <div id="global-search-results" className={styles.panel} role="listbox">
          {status === 'loading' && <div className={styles.message}>Loading search index…</div>}
          {status === 'error' && <div className={styles.message}>Search is temporarily unavailable.</div>}
          {status === 'ready' && results.length === 0 && (
            <div className={styles.message}>No results found.</div>
          )}
          {status === 'ready' && results.map((result, index) => (
            <Link
              id={`global-search-result-${index}`}
              key={`${result.path}-${result.title}`}
              to={result.path}
              role="option"
              aria-selected={index === activeIndex}
              className={`${styles.result} ${index === activeIndex ? styles.resultActive : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}>
              <span>
                <strong>{result.title}</strong>
                <small>{result.subtitle}</small>
              </span>
              <em>{result.section}</em>
            </Link>
          ))}
          {status === 'ready' && results.length > 0 && (
            <div className={styles.hint}>Use ↑ ↓ to navigate · Enter to open · Esc to close</div>
          )}
        </div>
      )}
    </div>
  );
}
