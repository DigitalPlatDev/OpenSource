export function licenseDataFileName(spdxId) {
  return `${String(spdxId).replace(/[^A-Za-z0-9.+-]/gu, '-')}.json`;
}

export function fillLicenseTemplate(licenseText, {year, holder, projectName} = {}) {
  const resolvedYear = String(year || new Date().getFullYear());
  const resolvedHolder = String(holder || 'Copyright Holder');
  const resolvedProject = String(projectName || 'Project');
  return String(licenseText || '')
    .replace(/<year>|\[year\]/giu, resolvedYear)
    .replace(/<copyright holders?>|\[fullname\]|<name of author>/giu, resolvedHolder)
    .replace(/<project>|\[project\]|<program>/giu, resolvedProject);
}

export function buildProjectOutputs({license, projectName, holder, year, ecosystem}) {
  const licenseText = fillLicenseTemplate(license?.licenseText, {
    year,
    holder,
    projectName,
  });
  const badgeUrl = `https://licenses.opensource.ngo/badges/${license?.spdxId}-modern.svg`;
  const referenceUrl = `https://licenses.opensource.ngo/docs/public-licenses/${license?.spdxId}`;
  const readme = `## License\n\n[![${license?.spdxId} license badge](${badgeUrl})](${referenceUrl})\n\n${projectName || 'This project'} is licensed under the [${license?.spdxId} License](LICENSE).\n\nCopyright © ${year || new Date().getFullYear()} ${holder || 'Copyright Holder'}.`;

  const packageMetadata = {
    npm: JSON.stringify({license: license?.spdxId}, null, 2),
    python: `[project]\nlicense = { text = "${license?.spdxId}" }`,
    rust: `[package]\nlicense = "${license?.spdxId}"`,
    go: `// SPDX-License-Identifier: ${license?.spdxId}`,
  };

  return {
    licenseText,
    readme,
    config: packageMetadata[ecosystem] || packageMetadata.npm,
  };
}

export function compareLicenseTexts(firstText, secondText) {
  const firstLines = String(firstText || '').split('\n');
  const secondLines = String(secondText || '').split('\n');
  const firstSet = new Set(firstLines.map((line) => line.trim()).filter(Boolean));
  const secondSet = new Set(secondLines.map((line) => line.trim()).filter(Boolean));
  const sharedLines = [...firstSet].filter((line) => secondSet.has(line)).length;
  return {
    firstLines: firstLines.length,
    secondLines: secondLines.length,
    sharedLines,
    onlyFirst: [...firstSet].filter((line) => !secondSet.has(line)).length,
    onlySecond: [...secondSet].filter((line) => !firstSet.has(line)).length,
  };
}

export function recommendLicenseIds(answers) {
  if (answers.workType === 'content') {
    if (answers.allowCommercial === false) {
      return ['CC-BY-NC-4.0', 'CC-BY-NC-SA-4.0', 'CC-BY-4.0'];
    }
    return answers.requireSharing
      ? ['CC-BY-SA-4.0', 'CC-BY-4.0', 'CC0-1.0']
      : ['CC-BY-4.0', 'CC0-1.0', 'CC-BY-SA-4.0'];
  }
  if (answers.networkCopyleft) {
    return ['AGPL-3.0-only', 'GPL-3.0-only', 'MPL-2.0'];
  }
  if (answers.requireSharing) {
    return answers.library
      ? ['MPL-2.0', 'LGPL-3.0-only', 'GPL-3.0-only']
      : ['GPL-3.0-only', 'MPL-2.0', 'LGPL-3.0-only'];
  }
  if (answers.patentGrant) {
    return ['Apache-2.0', 'MPL-2.0', 'MIT'];
  }
  return ['MIT', 'Apache-2.0', 'BSD-3-Clause'];
}
