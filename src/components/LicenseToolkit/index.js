import React, {useEffect, useMemo, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Link from '@docusaurus/Link';
import {LICENSE_FIELD_LABELS} from '@site/src/utils/licenseKnowledge.mjs';
import {
  fillLicenseTemplate,
  licenseDataFileName,
} from '@site/src/utils/licenseTooling.mjs';
import styles from './styles.module.css';

const COPY = {
  eyebrow: 'Understand and use this license',
  title: 'License toolkit',
  intro: 'Review practical permissions, generate a ready-to-commit LICENSE file, and explore related versions.',
  permissions: 'Permissions',
  conditions: 'Conditions',
  limitations: 'Limitations',
  known: 'Allowed',
  notGranted: 'Not granted',
  unknown: 'Review text',
  required: 'Required',
  notRequired: 'Not required',
  limited: 'Limited',
  notLimited: 'Not limited',
  generator: 'Generate a LICENSE file',
  year: 'Year',
  holder: 'Copyright holder',
  project: 'Project name',
  copy: 'Copy LICENSE',
  copied: 'Copied!',
  download: 'Download LICENSE',
  related: 'Related versions',
  compare: 'Compare versions',
  noRelated: 'No related versions are present in the current catalog.',
  notice: 'This summary is informational and is not legal advice. Always review the full license text.',
};

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

function downloadText(fileName, text) {
  const url = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function FieldList({fields, labels, mode, copy}) {
  return (
    <div className={styles.fieldList}>
      {Object.entries(fields).map(([key, value]) => {
        const label = labels[key];
        const stateLabel = value === null
          ? copy.unknown
          : mode === 'rights'
          ? value === true ? copy.known : value === false ? copy.notGranted : copy.unknown
          : mode === 'conditions'
            ? value === true ? copy.required : copy.notRequired
            : value === true ? copy.limited : copy.notLimited;
        return (
          <div key={key} className={`${styles.field} ${value ? styles.fieldPositive : styles.fieldMuted}`}>
            <span className={styles.fieldIcon}>{value === true ? '✓' : value === false ? '−' : '?'}</span>
            <span>{label}</span>
            <small>{stateLabel}</small>
          </div>
        );
      })}
    </div>
  );
}

export default function LicenseToolkit({spdxId}) {
  const [license, setLicense] = useState(null);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [holder, setHolder] = useState('');
  const [projectName, setProjectName] = useState('');
  const [copied, setCopied] = useState(false);
  const detailUrl = useBaseUrl(`/api/licenses/${licenseDataFileName(spdxId)}`);
  const copy = COPY;

  useEffect(() => {
    let active = true;
    fetch(detailUrl)
      .then((response) => response.json())
      .then((data) => active && setLicense(data))
      .catch(() => active && setLicense(null));
    return () => {
      active = false;
    };
  }, [detailUrl]);

  const generatedLicense = useMemo(
    () => fillLicenseTemplate(license?.licenseText, {year, holder, projectName}),
    [holder, license, projectName, year],
  );

  if (!license) {
    return null;
  }

  async function handleCopy() {
    await copyText(generatedLicense);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className={styles.toolkit} aria-labelledby="license-toolkit-heading">
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>{copy.eyebrow}</span>
          <h2 id="license-toolkit-heading">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <h3>{copy.permissions}</h3>
          <FieldList fields={license.rights} labels={LICENSE_FIELD_LABELS.rights} mode="rights" copy={copy} />
        </div>
        <div className={styles.summaryCard}>
          <h3>{copy.conditions}</h3>
          <FieldList fields={license.conditions} labels={LICENSE_FIELD_LABELS.conditions} mode="conditions" copy={copy} />
        </div>
        <div className={styles.summaryCard}>
          <h3>{copy.limitations}</h3>
          <FieldList fields={license.limitations} labels={LICENSE_FIELD_LABELS.limitations} mode="limitations" copy={copy} />
        </div>
      </div>

      <div className={styles.generator}>
        <h3>{copy.generator}</h3>
        <div className={styles.formGrid}>
          <label>{copy.year}<input value={year} onChange={(event) => setYear(event.target.value)} /></label>
          <label>{copy.holder}<input value={holder} placeholder="OpenSource.ngo" onChange={(event) => setHolder(event.target.value)} /></label>
          <label>{copy.project}<input value={projectName} placeholder="My Project" onChange={(event) => setProjectName(event.target.value)} /></label>
        </div>
        <textarea className={styles.preview} value={generatedLicense} readOnly rows={9} aria-label="Generated LICENSE file" />
        <div className={styles.actions}>
          <button type="button" onClick={handleCopy}>{copied ? copy.copied : copy.copy}</button>
          <button type="button" className={styles.secondary} onClick={() => downloadText('LICENSE', generatedLicense)}>{copy.download}</button>
        </div>
      </div>

      <div className={styles.related}>
        <div><h3>{copy.related}</h3><span>{license.family} · {license.copyleft}</span></div>
        {license.relatedVersions.length > 0 ? (
          <div className={styles.relatedLinks}>
            {license.relatedVersions.slice(0, 12).map((relatedId) => (
              <Link key={relatedId} to={`/docs/public-licenses/${relatedId}`}>{relatedId}</Link>
            ))}
            <Link className={styles.compareLink} to={`/tools?tab=compare&left=${spdxId}&right=${license.relatedVersions[0]}`}>{copy.compare}</Link>
          </div>
        ) : <p>{copy.noRelated}</p>}
      </div>
      <p className={styles.notice}>{copy.notice}</p>
    </section>
  );
}
