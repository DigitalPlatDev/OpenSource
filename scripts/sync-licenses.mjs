#!/usr/bin/env node

import {execFile} from 'node:child_process';
import dns from 'node:dns';
import {mkdir, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';

dns.setDefaultResultOrder('ipv4first');

const execFileAsync = promisify(execFile);

const LICENSE_LIST_URL =
  'https://raw.githubusercontent.com/spdx/license-list-data/master/json/licenses.json';

const REQUIRED_LICENSE_IDS = [
  'Apache-2.0',
  'MIT',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSD-4-Clause',
  '0BSD',
  'GPL-2.0-only',
  'GPL-2.0-or-later',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'LGPL-2.1-only',
  'LGPL-2.1-or-later',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'AGPL-3.0-only',
  'AGPL-3.0-or-later',
  'MPL-2.0',
  'EUPL-1.1',
  'EUPL-1.2',
  'Unlicense',
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-3.0',
  'CC-BY-SA-3.0',
  'ISC',
];

function getArgValue(args, key) {
  const index = args.indexOf(key);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  const match = args.find((arg) => arg.startsWith(`${key}=`));
  if (match) {
    return match.split('=')[1];
  }
  return null;
}

function toFencedBlock(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const safe = normalized.replace(/```/g, '``\\`');
  return `\`\`\`text\n${safe}\n\`\`\``;
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    const {stdout} = await execFileAsync('curl', ['-fsSL', url], {
      maxBuffer: 1024 * 1024 * 20,
    });
    return JSON.parse(stdout);
  }
}

function selectLicenses(allLicenses, limit) {
  const sorted = [...allLicenses].sort((a, b) =>
    a.licenseId.localeCompare(b.licenseId),
  );
  const initial = Number.isFinite(limit) ? sorted.slice(0, limit) : sorted;
  const required = REQUIRED_LICENSE_IDS.map((id) =>
    sorted.find((license) => license.licenseId === id),
  ).filter(Boolean);

  const merged = new Map();
  for (const license of [...initial, ...required]) {
    merged.set(license.licenseId, license);
  }

  return [...merged.values()].sort((a, b) =>
    a.licenseId.localeCompare(b.licenseId),
  );
}

async function writePublicLicensesIndex({
  outputDir,
  total,
  lastSyncedAt,
}) {
  const content = `---
` +
    `title: Public Licenses\n` +
    `sidebar_label: Overview\n` +
    `sidebar_position: 1\n` +
    `---\n\n` +
    `<!-- AUTO-GENERATED FILE. DO NOT EDIT. -->\n\n` +
    `# Public Licenses\n\n` +
    `OpenSource.ngo maintains a synced catalog of public licenses sourced from SPDX.\n\n` +
    `**Total licenses synced:** ${total}\n\n` +
    `**Last synced:** ${lastSyncedAt}\n\n` +
    `## How to search\n\n` +
    `- Use the sidebar or search bar to find a license by SPDX ID or name.\n` +
    `- License pages include full text when provided by SPDX.\n\n` +
    `## Provenance\n\n` +
    `This catalog is generated from the SPDX License List data and license detail endpoints.\n\n` +
    `> **Not legal advice.** The content on this site is provided for informational purposes only.\n`;

  await writeFile(path.join(outputDir, 'index.md'), content, 'utf8');
}

async function writeLicensePage({
  outputDir,
  license,
  position,
  lastSyncedAt,
}) {
  let licenseText = null;
  const sourceUrl = license.detailsUrl;

  try {
    const details = await fetchJson(license.detailsUrl);
    licenseText = details.licenseText?.trim() || null;
  } catch (error) {
    console.warn(`Warning: unable to fetch ${license.detailsUrl}.`, error);
  }

  let body;
  if (licenseText) {
    body = `## License Text\n\n${toFencedBlock(licenseText)}\n`;
  } else {
    body = `## License Text\n\nFull text was not available from SPDX at sync time.\n`;
  }

  const content = `---\n` +
    `title: ${yamlString(license.name)}\n` +
    `sidebar_label: ${yamlString(license.licenseId)}\n` +
    `sidebar_position: ${position}\n` +
    `spdxId: ${yamlString(license.licenseId)}\n` +
    `sourceUrl: ${yamlString(sourceUrl)}\n` +
    `lastSyncedAt: ${yamlString(lastSyncedAt)}\n` +
    `---\n\n` +
    `<!-- AUTO-GENERATED FILE. DO NOT EDIT. -->\n\n` +
    `> **Not legal advice.** This license text is provided for informational purposes only.\n\n` +
    `${body}\n\n` +
    `## Provenance\n\n` +
    `- SPDX ID: ${license.licenseId}\n` +
    `- Source: ${sourceUrl}\n` +
    `- Last synced: ${lastSyncedAt}\n`;

  const filePath = path.join(outputDir, `${license.licenseId}.md`);
  await writeFile(filePath, content, 'utf8');
}

async function removeStaleFiles(outputDir, keepFiles) {
  const entries = await readdir(outputDir, {withFileTypes: true});
  const keepSet = new Set(keepFiles);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .filter((entry) => !keepSet.has(entry.name))
      .map((entry) => rm(path.join(outputDir, entry.name))),
  );
}

async function main() {
  const args = process.argv.slice(2);
  const limitRaw = getArgValue(args, '--limit');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 200;

  const data = await fetchJson(LICENSE_LIST_URL);
  if (!data.licenses || !Array.isArray(data.licenses)) {
    throw new Error('Unexpected SPDX license list format.');
  }

  const selected = selectLicenses(data.licenses, limit);
  const outputDir = path.join(process.cwd(), 'docs', 'public-licenses');
  const lastSyncedAt = new Date().toISOString();

  await mkdir(outputDir, {recursive: true});

  const expectedFiles = ['index.md'];
  for (const [index, license] of selected.entries()) {
    await writeLicensePage({
      outputDir,
      license,
      position: index + 2,
      lastSyncedAt,
    });
    expectedFiles.push(`${license.licenseId}.md`);
  }

  await writePublicLicensesIndex({
    outputDir,
    total: selected.length,
    lastSyncedAt,
  });

  await removeStaleFiles(outputDir, expectedFiles);

  console.log(
    `Synced ${selected.length} SPDX licenses into ${outputDir} at ${lastSyncedAt}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
