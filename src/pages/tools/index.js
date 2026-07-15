import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {LICENSE_FIELD_LABELS} from '@site/src/utils/licenseKnowledge.mjs';
import {
  buildProjectOutputs,
  compareLicenseTexts,
  licenseDataFileName,
  recommendLicenseIds,
} from '@site/src/utils/licenseTooling.mjs';
import styles from './styles.module.css';

const TAB_IDS = ['explore', 'compare', 'wizard', 'generator', 'api'];

const TEXT = {
    title: 'Open source license tools',
    subtitle: 'Search, compare, choose, and generate everything your project needs to publish a license with confidence.',
    explore: 'Explore',
    compare: 'Compare',
    wizard: 'License wizard',
    generator: 'Project generator',
    api: 'JSON API',
    search: 'Search by name or SPDX ID',
    allCategories: 'All categories',
    anyPermission: 'Any permission',
    commercialOnly: 'Commercial use allowed',
    modificationOnly: 'Modification allowed',
    patentOnly: 'Patent use allowed',
    recommendedOnly: 'Recommended starting points',
    results: 'licenses found',
    permissions: 'Permissions',
    conditions: 'Conditions',
    limitations: 'Limitations',
    copyleft: 'Copyleft',
    family: 'Family',
    open: 'Open reference',
    compareTitle: 'Compare licenses side by side',
    compareIntro: 'Review practical obligations and inspect the complete texts before making a decision.',
    firstLicense: 'First license',
    secondLicense: 'Second license',
    textDifference: 'Text difference',
    lines: 'lines',
    shared: 'shared unique lines',
    unique: 'unique lines',
    wizardTitle: 'Find a practical starting point',
    wizardIntro: 'Answer a few product questions. The result is guidance, not legal advice.',
    workType: 'What are you licensing?',
    software: 'Software',
    content: 'Creative content or documentation',
    commercial: 'Should commercial use be allowed?',
    sharing: 'Must modifications remain open under a compatible license?',
    patent: 'Is an explicit patent grant important?',
    network: 'Should network services publish their source changes?',
    library: 'Is this primarily a reusable software library?',
    yes: 'Yes',
    no: 'No',
    suggestions: 'Suggested starting points',
    generatorTitle: 'Generate a complete project license package',
    generatorIntro: 'Create LICENSE, README, badge, SPDX, and package metadata in one place.',
    projectName: 'Project name',
    holder: 'Copyright holder',
    year: 'Year',
    ecosystem: 'Ecosystem',
    license: 'License',
    licenseFile: 'LICENSE file',
    readme: 'README section',
    config: 'Package metadata',
    copy: 'Copy',
    download: 'Download LICENSE',
    apiTitle: 'Static JSON API',
    apiIntro: 'Use the generated catalog and per-license documents in websites, CLIs, build scripts, or internal tools.',
    catalogEndpoint: 'Catalog endpoint',
    detailEndpoint: 'License detail endpoint',
    fields: 'Available fields',
    disclaimer: 'License summaries and recommendations are informational and are not legal advice.',
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

function BooleanMark({value}) {
  return <span className={`${styles.mark} ${value === true ? styles.markYes : value === false ? styles.markNo : styles.markUnknown}`}>{value === true ? '✓' : value === false ? '−' : '?'}</span>;
}

function LicenseSelect({label, value, onChange, catalog}) {
  return (
    <label className={styles.fieldLabel}>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {catalog.map((license) => <option key={license.spdxId} value={license.spdxId}>{license.spdxId} — {license.name}</option>)}
      </select>
    </label>
  );
}

function ExplorePanel({catalog, copy}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [requiredRight, setRequiredRight] = useState('any');
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const categories = useMemo(() => [...new Set(catalog.map((license) => license.category))].sort(), [catalog]);
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return catalog.filter((license) => {
      const matchesQuery = !normalizedQuery || `${license.spdxId} ${license.name}`.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === 'all' || license.category === category;
      const matchesRight = requiredRight === 'any' || license.rights[requiredRight] === true;
      return matchesQuery && matchesCategory && matchesRight && (!recommendedOnly || license.recommended);
    });
  }, [catalog, category, query, recommendedOnly, requiredRight]);

  return (
    <div>
      <div className={styles.filterBar}>
        <input type="search" value={query} placeholder={copy.search} aria-label={copy.search} onChange={(event) => setQuery(event.target.value)} />
        <select value={category} aria-label={copy.allCategories} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">{copy.allCategories}</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={requiredRight} aria-label={copy.anyPermission} onChange={(event) => setRequiredRight(event.target.value)}>
          <option value="any">{copy.anyPermission}</option>
          <option value="commercialUse">{copy.commercialOnly}</option>
          <option value="modification">{copy.modificationOnly}</option>
          <option value="patentUse">{copy.patentOnly}</option>
        </select>
        <label className={styles.checkLabel}><input type="checkbox" checked={recommendedOnly} onChange={(event) => setRecommendedOnly(event.target.checked)} />{copy.recommendedOnly}</label>
      </div>
      <div className={styles.resultCount}><strong>{results.length}</strong> {copy.results}</div>
      <div className={styles.cardGrid}>
        {results.map((license) => (
          <article key={license.spdxId} className={styles.licenseCard}>
            <div className={styles.cardTop}><code>{license.spdxId}</code>{license.recommended && <span>Recommended</span>}</div>
            <h3>{license.name}</h3>
            <div className={styles.tags}><span>{license.category}</span><span>{license.copyleft}</span></div>
            <div className={styles.quickRights}>
              {['commercialUse', 'modification', 'distribution'].map((key) => (
                <div key={key}><BooleanMark value={license.rights[key]} /><small>{LICENSE_FIELD_LABELS.rights[key]}</small></div>
              ))}
            </div>
            <Link to={license.path}>{copy.open} →</Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function ComparisonMatrix({first, second, copy}) {
  const groups = ['rights', 'conditions', 'limitations'];
  return (
    <div className={styles.matrixWrap}>
      <table className={styles.matrix}>
        <thead><tr><th></th><th>{first.spdxId}</th><th>{second.spdxId}</th></tr></thead>
        <tbody>
          <tr className={styles.groupRow}><th>{copy.copyleft}</th><td>{first.copyleft}</td><td>{second.copyleft}</td></tr>
          {groups.map((group) => (
            <React.Fragment key={group}>
              <tr className={styles.groupRow}><th colSpan="3">{copy[group]}</th></tr>
              {Object.keys(LICENSE_FIELD_LABELS[group]).map((key) => {
                const label = LICENSE_FIELD_LABELS[group][key];
                return <tr key={`${group}-${key}`}><th>{label}</th><td><BooleanMark value={first[group][key]} /></td><td><BooleanMark value={second[group][key]} /></td></tr>;
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparePanel({catalog, initialLeft, initialRight, copy, detailBaseUrl}) {
  const [leftId, setLeftId] = useState(initialLeft || 'MIT');
  const [rightId, setRightId] = useState(initialRight || 'Apache-2.0');
  const [details, setDetails] = useState({});

  useEffect(() => {
    for (const id of [leftId, rightId]) {
      if (!id || details[id]) continue;
      fetch(`${detailBaseUrl}${licenseDataFileName(id)}`).then((response) => response.json()).then((data) => setDetails((current) => ({...current, [id]: data}))).catch(() => {});
    }
  }, [detailBaseUrl, details, leftId, rightId]);

  const first = details[leftId];
  const second = details[rightId];
  const textStats = first && second ? compareLicenseTexts(first.licenseText, second.licenseText) : null;
  return (
    <div>
      <div className={styles.panelHeading}><h2>{copy.compareTitle}</h2><p>{copy.compareIntro}</p></div>
      <div className={styles.twoFields}>
        <LicenseSelect label={copy.firstLicense} value={leftId} onChange={setLeftId} catalog={catalog} />
        <LicenseSelect label={copy.secondLicense} value={rightId} onChange={setRightId} catalog={catalog} />
      </div>
      {first && second && <>
        <ComparisonMatrix first={first} second={second} copy={copy} />
        <div className={styles.diffHeader}><div><h3>{copy.textDifference}</h3><p>{first.spdxId}: {textStats.firstLines} {copy.lines} · {second.spdxId}: {textStats.secondLines} {copy.lines}</p></div><div className={styles.diffStats}><span>{textStats.sharedLines} {copy.shared}</span><span>{textStats.onlyFirst} / {textStats.onlySecond} {copy.unique}</span></div></div>
        <div className={styles.textCompare}><textarea value={first.licenseText} readOnly aria-label={`${first.spdxId} license text`} /><textarea value={second.licenseText} readOnly aria-label={`${second.spdxId} license text`} /></div>
      </>}
    </div>
  );
}

function ToggleQuestion({id, label, value, onChange, copy}) {
  return <div className={styles.question} data-question={id}><span>{label}</span><div><button type="button" className={value === true ? styles.answerActive : ''} onClick={() => onChange(true)}>{copy.yes}</button><button type="button" className={value === false ? styles.answerActive : ''} onClick={() => onChange(false)}>{copy.no}</button></div></div>;
}

function WizardPanel({catalog, copy}) {
  const [answers, setAnswers] = useState({workType: 'software', allowCommercial: true, requireSharing: false, patentGrant: true, networkCopyleft: false, library: false});
  const recommendationIds = recommendLicenseIds(answers);
  const recommendations = recommendationIds.map((id) => catalog.find((license) => license.spdxId === id)).filter(Boolean);
  const update = (key, value) => setAnswers((current) => ({...current, [key]: value}));
  return <div>
    <div className={styles.panelHeading}><h2>{copy.wizardTitle}</h2><p>{copy.wizardIntro}</p></div>
    <div className={styles.wizardLayout}>
      <div className={styles.questions}>
        <div className={styles.question}><span>{copy.workType}</span><select value={answers.workType} onChange={(event) => update('workType', event.target.value)}><option value="software">{copy.software}</option><option value="content">{copy.content}</option></select></div>
        <ToggleQuestion id="commercial" label={copy.commercial} value={answers.allowCommercial} onChange={(value) => update('allowCommercial', value)} copy={copy} />
        <ToggleQuestion id="sharing" label={copy.sharing} value={answers.requireSharing} onChange={(value) => update('requireSharing', value)} copy={copy} />
        {answers.workType === 'software' && <><ToggleQuestion id="patent" label={copy.patent} value={answers.patentGrant} onChange={(value) => update('patentGrant', value)} copy={copy} /><ToggleQuestion id="network" label={copy.network} value={answers.networkCopyleft} onChange={(value) => update('networkCopyleft', value)} copy={copy} /><ToggleQuestion id="library" label={copy.library} value={answers.library} onChange={(value) => update('library', value)} copy={copy} /></>}
      </div>
      <div className={styles.recommendations}><span>{copy.suggestions}</span>{recommendations.map((license, index) => <Link key={license.spdxId} to={license.path}><strong>#{index + 1} {license.spdxId}</strong><small>{license.name}</small><em>{license.category} · {license.copyleft}</em></Link>)}</div>
    </div>
  </div>;
}

function GeneratorPanel({catalog, copy, detailBaseUrl}) {
  const [licenseId, setLicenseId] = useState('MIT');
  const [projectName, setProjectName] = useState('My Project');
  const [holder, setHolder] = useState('Copyright Holder');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [ecosystem, setEcosystem] = useState('npm');
  const [license, setLicense] = useState(null);
  useEffect(() => { fetch(`${detailBaseUrl}${licenseDataFileName(licenseId)}`).then((response) => response.json()).then(setLicense).catch(() => setLicense(null)); }, [detailBaseUrl, licenseId]);
  const outputs = useMemo(() => buildProjectOutputs({license, projectName, holder, year, ecosystem}), [ecosystem, holder, license, projectName, year]);
  return <div>
    <div className={styles.panelHeading}><h2>{copy.generatorTitle}</h2><p>{copy.generatorIntro}</p></div>
    <div className={styles.generatorFields}>
      <label className={styles.fieldLabel}>{copy.projectName}<input value={projectName} onChange={(event) => setProjectName(event.target.value)} /></label>
      <label className={styles.fieldLabel}>{copy.holder}<input value={holder} onChange={(event) => setHolder(event.target.value)} /></label>
      <label className={styles.fieldLabel}>{copy.year}<input value={year} onChange={(event) => setYear(event.target.value)} /></label>
      <LicenseSelect label={copy.license} value={licenseId} onChange={setLicenseId} catalog={catalog} />
      <label className={styles.fieldLabel}>{copy.ecosystem}<select value={ecosystem} onChange={(event) => setEcosystem(event.target.value)}><option value="npm">npm / package.json</option><option value="python">Python / pyproject.toml</option><option value="rust">Rust / Cargo.toml</option><option value="go">Go / source header</option></select></label>
    </div>
    {license && <div className={styles.outputGrid}>
      {[['licenseText', copy.licenseFile], ['readme', copy.readme], ['config', copy.config]].map(([key, label]) => <div key={key} className={styles.outputCard}><div><h3>{label}</h3><button type="button" onClick={() => copyText(outputs[key])}>{copy.copy}</button>{key === 'licenseText' && <button type="button" onClick={() => downloadText('LICENSE', outputs.licenseText)}>{copy.download}</button>}</div><textarea value={outputs[key]} readOnly rows={key === 'licenseText' ? 12 : 7} aria-label={label} /></div>)}
    </div>}
  </div>;
}

function ApiPanel({copy, catalogUrl, detailBaseUrl}) {
  const exampleUrl = `${detailBaseUrl}MIT.json`;
  return <div>
    <div className={styles.panelHeading}><h2>{copy.apiTitle}</h2><p>{copy.apiIntro}</p></div>
    <div className={styles.apiGrid}>
      <div><span>{copy.catalogEndpoint}</span><code>{catalogUrl}</code><button type="button" onClick={() => copyText(catalogUrl)}>{copy.copy}</button></div>
      <div><span>{copy.detailEndpoint}</span><code>{exampleUrl}</code><button type="button" onClick={() => copyText(exampleUrl)}>{copy.copy}</button></div>
    </div>
    <div className={styles.apiFields}><h3>{copy.fields}</h3><code>spdxId, name, sourceUrl, lastSyncedAt, path, category, family, copyleft, rights, conditions, limitations, relatedVersions, licenseText</code><pre>{`fetch('${catalogUrl}')\n  .then(response => response.json())\n  .then(({ licenses }) => console.log(licenses));`}</pre></div>
  </div>;
}

export default function ToolsPage() {
  const [catalog, setCatalog] = useState([]);
  const [activeTab, setActiveTab] = useState('explore');
  const [initialCompare, setInitialCompare] = useState({left: 'MIT', right: 'Apache-2.0'});
  const catalogPath = useBaseUrl('/api/licenses.json');
  const detailBasePath = useBaseUrl('/api/licenses/');
  const copy = TEXT;

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const requestedTab = parameters.get('tab');
    if (TAB_IDS.includes(requestedTab)) setActiveTab(requestedTab);
    setInitialCompare({left: parameters.get('left') || 'MIT', right: parameters.get('right') || 'Apache-2.0'});
    fetch(catalogPath).then((response) => response.json()).then((data) => setCatalog(data.licenses || [])).catch(() => setCatalog([]));
  }, [catalogPath]);

  function selectTab(tabId) {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url);
  }

  const absoluteCatalogUrl = `https://licenses.opensource.ngo${catalogPath}`;
  const absoluteDetailBaseUrl = `https://licenses.opensource.ngo${detailBasePath}`;
  return <Layout title={copy.title} description={copy.subtitle}>
    <main className={styles.page}>
      <header className={styles.pageHero}><div><span>OpenSource.ngo Workbench</span><h1>{copy.title}</h1><p>{copy.subtitle}</p></div></header>
      <nav className={styles.tabs} aria-label="License tools">{TAB_IDS.map((tabId) => <button key={tabId} type="button" className={activeTab === tabId ? styles.tabActive : ''} aria-pressed={activeTab === tabId} onClick={() => selectTab(tabId)}>{copy[tabId]}</button>)}</nav>
      <section className={styles.panel}>
        {catalog.length === 0 ? <div className={styles.loading}>Loading license catalog…</div> : <>
          {activeTab === 'explore' && <ExplorePanel catalog={catalog} copy={copy} />}
          {activeTab === 'compare' && <ComparePanel catalog={catalog} initialLeft={initialCompare.left} initialRight={initialCompare.right} copy={copy} detailBaseUrl={detailBasePath} />}
          {activeTab === 'wizard' && <WizardPanel catalog={catalog} copy={copy} />}
          {activeTab === 'generator' && <GeneratorPanel catalog={catalog} copy={copy} detailBaseUrl={detailBasePath} />}
          {activeTab === 'api' && <ApiPanel copy={copy} catalogUrl={absoluteCatalogUrl} detailBaseUrl={absoluteDetailBaseUrl} />}
        </>}
      </section>
      <p className={styles.disclaimer}>{copy.disclaimer}</p>
    </main>
  </Layout>;
}
