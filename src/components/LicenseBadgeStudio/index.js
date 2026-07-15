import React, {useEffect, useMemo, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  BADGE_STYLES,
  buildLicenseBadgeSvg,
  getBadgeFileName,
} from '@site/src/utils/licenseBadges.mjs';
import styles from './styles.module.css';

const FORMATS = [
  {id: 'markdown', label: 'Markdown'},
  {id: 'html', label: 'HTML'},
  {id: 'svg', label: 'SVG'},
  {id: 'url', label: 'Image URL'},
  {id: 'asciidoc', label: 'AsciiDoc'},
];

const EXPANDED_STATE_KEY = 'opensource-license-badge-studio-expanded';

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Use the selection-based fallback when clipboard permission is unavailable.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) {
    throw new Error('The browser did not allow clipboard access.');
  }
}

export default function LicenseBadgeStudio({spdxId, licenseName, permalink}) {
  const {siteConfig} = useDocusaurusContext();
  const [styleId, setStyleId] = useState('modern');
  const [formatId, setFormatId] = useState('markdown');
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [customLabel, setCustomLabel] = useState('license');
  const [accentColor, setAccentColor] = useState('#16a34a');
  const [badgeScale, setBadgeScale] = useState('1');
  const [rounded, setRounded] = useState(true);
  const badgesBasePath = useBaseUrl('/badges/');
  const badgePath = `${badgesBasePath}${getBadgeFileName(spdxId, styleId)}`;
  const badgeUrl = `${siteConfig.url}${badgePath}`;
  const pageUrl = `${siteConfig.url}${permalink}`;
  const altText = `${spdxId} license badge`;
  const isCustomized =
    customLabel !== 'license' ||
    accentColor.toLowerCase() !== '#16a34a' ||
    badgeScale !== '1' ||
    !rounded;
  const localBadgePath = `./assets/${spdxId}-license.svg`;

  const snippets = useMemo(() => {
    const svg = buildLicenseBadgeSvg({
      spdxId,
      licenseName,
      styleId,
      labelText: customLabel,
      accentColor,
      scale: badgeScale,
      rounded,
    });
    const embedImageUrl = isCustomized ? localBadgePath : badgeUrl;
    return {
      markdown: `[![${altText}](${embedImageUrl})](${pageUrl})`,
      html: `<a href="${escapeHtmlAttribute(pageUrl)}"><img src="${escapeHtmlAttribute(embedImageUrl)}" alt="${escapeHtmlAttribute(altText)}"></a>`,
      svg,
      url: embedImageUrl,
      asciidoc: `image:${embedImageUrl}[${altText},link=${pageUrl}]`,
    };
  }, [accentColor, altText, badgeScale, badgeUrl, customLabel, isCustomized, licenseName, localBadgePath, pageUrl, rounded, spdxId, styleId]);

  const selectedStyle = BADGE_STYLES.find((style) => style.id === styleId);
  const selectedSnippet = snippets[formatId];
  const customSvgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(snippets.svg)}`;
  const previewSource = isCustomized ? customSvgUrl : badgePath;

  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(EXPANDED_STATE_KEY);
      if (savedState !== null) {
        setIsExpanded(savedState === 'true');
      }
    } catch {
      // Keep the default state when browser storage is unavailable.
    }
  }, []);

  function toggleExpanded() {
    setIsExpanded((currentState) => {
      const nextState = !currentState;
      try {
        window.localStorage.setItem(EXPANDED_STATE_KEY, String(nextState));
      } catch {
        // The control still works for the current page without persistence.
      }
      return nextState;
    });
  }

  async function handleCopy() {
    await copyText(selectedSnippet);
    setCopiedFormat(formatId);
    window.setTimeout(() => setCopiedFormat(null), 1800);
  }

  return (
    <section
      className={`${styles.studio} ${!isExpanded ? styles.studioCollapsed : ''}`}
      aria-labelledby="license-badge-heading">
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Share this license</span>
          <h2 id="license-badge-heading" className={styles.heading}>
            License badge studio
          </h2>
          {isExpanded && (
            <p className={styles.intro}>
              Choose a style, then copy a ready-to-use badge for your README,
              website, or documentation.
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
          {isExpanded && (
            <span className={styles.formatPill}>SVG · Accessible · No tracking</span>
          )}
          <button
            type="button"
            className={styles.collapseButton}
            aria-expanded={isExpanded}
            aria-controls="license-badge-studio-content"
            aria-label={isExpanded ? 'Collapse badge studio' : 'Expand badge studio'}
            onClick={toggleExpanded}>
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            <svg
              className={styles.chevron}
              viewBox="0 0 20 20"
              width="18"
              height="18"
              aria-hidden="true">
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div id="license-badge-studio-content">
          <div className={styles.workspace}>
            <div className={styles.previewPanel}>
              <div className={styles.previewTopline}>
                <span>Live preview</span>
                <span>{selectedStyle.name}</span>
              </div>
              <div className={styles.previewCanvas}>
                <img src={previewSource} alt={altText} className={styles.mainPreview} />
              </div>
              <div className={styles.previewActions}>
                <a className={styles.secondaryButton} href={isCustomized ? customSvgUrl : badgePath} download={`${spdxId}-license.svg`}>
                  Download SVG
                </a>
                <a
                  className={styles.secondaryButton}
                  href={previewSource}
                  target="_blank"
                  rel="noreferrer">
                  Open image
                </a>
              </div>
            </div>

            <div className={styles.controlsPanel}>
              <div className={styles.sectionLabel}>1. Choose a style</div>
              <div className={styles.styleGrid}>
                {BADGE_STYLES.map((badgeStyle) => {
                  const stylePath = `${badgesBasePath}${getBadgeFileName(spdxId, badgeStyle.id)}`;
                  return (
                    <button
                      key={badgeStyle.id}
                      type="button"
                      className={`${styles.styleOption} ${
                        styleId === badgeStyle.id ? styles.styleOptionActive : ''
                      }`}
                      aria-pressed={styleId === badgeStyle.id}
                      onClick={() => setStyleId(badgeStyle.id)}>
                      <span className={styles.styleName}>{badgeStyle.name}</span>
                      <img src={stylePath} alt="" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <p className={styles.styleDescription}>{selectedStyle.description}</p>
              <div className={styles.customizer}>
                <div className={styles.customizerHeading}>
                  <span>Customize</span>
                  {isCustomized && <button type="button" onClick={() => { setCustomLabel('license'); setAccentColor('#16a34a'); setBadgeScale('1'); setRounded(true); }}>Reset</button>}
                </div>
                <div className={styles.customizerGrid}>
                  <label>Label<input value={customLabel} maxLength="18" onChange={(event) => setCustomLabel(event.target.value)} /></label>
                  <label>Accent<input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} /></label>
                  <label>Size<select value={badgeScale} onChange={(event) => setBadgeScale(event.target.value)}><option value="0.75">Small</option><option value="1">Regular</option><option value="1.25">Large</option><option value="1.5">Extra large</option></select></label>
                  <label className={styles.roundedControl}><input type="checkbox" checked={rounded} onChange={(event) => setRounded(event.target.checked)} />Rounded</label>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.embedPanel}>
            <div className={styles.sectionLabel}>2. Copy your embed</div>
            <div className={styles.formatTabs} role="tablist" aria-label="Embed format">
              {FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  role="tab"
                  aria-selected={formatId === format.id}
                  className={`${styles.formatTab} ${
                    formatId === format.id ? styles.formatTabActive : ''
                  }`}
                  onClick={() => setFormatId(format.id)}>
                  {format.label}
                </button>
              ))}
            </div>
            <div className={styles.codeWrap}>
              <textarea
                className={styles.code}
                value={selectedSnippet}
                readOnly
                rows={formatId === 'svg' ? 5 : 3}
                aria-label={`${FORMATS.find((format) => format.id === formatId).label} embed code`}
                onFocus={(event) => event.currentTarget.select()}
              />
              <button type="button" className={styles.copyButton} onClick={handleCopy}>
                {copiedFormat === formatId ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className={styles.hint}>{isCustomized ? 'Download the custom SVG and commit it at the generated local asset path before using this embed.' : 'The hosted image URL is stable and links back to this license reference.'}</p>
          </div>
        </div>
      )}
    </section>
  );
}
