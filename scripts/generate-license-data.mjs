#!/usr/bin/env node

import {mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {classifyLicense} from '../src/utils/licenseKnowledge.mjs';

function readFrontMatterValue(content, key) {
  const frontMatter = content.match(/^---\n([\s\S]*?)\n---/u)?.[1] || '';
  const value = frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'mu'))?.[1];
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value.trim();
  }
}

function readLicenseText(content) {
  return content.match(/```text\n([\s\S]*?)\n```/u)?.[1]?.replace(/``\\`/gu, '```') || '';
}

function fileNameForId(spdxId) {
  return `${String(spdxId).replace(/[^A-Za-z0-9.+-]/gu, '-')}.json`;
}

async function main() {
  const docsDir = path.join(process.cwd(), 'docs', 'public-licenses');
  const apiDir = path.join(process.cwd(), 'static', 'api');
  const detailsDir = path.join(apiDir, 'licenses');
  const entries = await readdir(docsDir, {withFileTypes: true});
  const licenses = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'index.md') {
      continue;
    }
    const content = await readFile(path.join(docsDir, entry.name), 'utf8');
    const spdxId = readFrontMatterValue(content, 'spdxId');
    const name = readFrontMatterValue(content, 'title');
    if (!spdxId || !name) {
      continue;
    }

    const licenseText = readLicenseText(content);
    licenses.push({
      spdxId,
      name,
      sourceUrl: readFrontMatterValue(content, 'sourceUrl'),
      lastSyncedAt: readFrontMatterValue(content, 'lastSyncedAt'),
      path: `/docs/public-licenses/${spdxId}`,
      textLength: licenseText.length,
      hasTemplateFields: /<year>|<copyright holders>|\[year\]|\[fullname\]/iu.test(licenseText),
      ...classifyLicense(spdxId, name),
      licenseText,
    });
  }

  licenses.sort((first, second) => first.spdxId.localeCompare(second.spdxId));
  const familyMembers = new Map();
  for (const license of licenses) {
    const members = familyMembers.get(license.family) || [];
    members.push(license.spdxId);
    familyMembers.set(license.family, members);
  }

  await rm(detailsDir, {recursive: true, force: true});
  await mkdir(detailsDir, {recursive: true});

  for (const license of licenses) {
    const detail = {
      ...license,
      relatedVersions: (familyMembers.get(license.family) || []).filter(
        (spdxId) => spdxId !== license.spdxId,
      ),
    };
    await writeFile(
      path.join(detailsDir, fileNameForId(license.spdxId)),
      `${JSON.stringify(detail, null, 2)}\n`,
      'utf8',
    );
  }

  const catalog = licenses.map(({licenseText, ...license}) => ({
    ...license,
    relatedVersions: (familyMembers.get(license.family) || []).filter(
      (spdxId) => spdxId !== license.spdxId,
    ),
  }));
  await mkdir(apiDir, {recursive: true});
  await writeFile(
    path.join(apiDir, 'licenses.json'),
    `${JSON.stringify({generatedAt: catalog[0]?.lastSyncedAt || null, count: catalog.length, licenses: catalog}, null, 2)}\n`,
    'utf8',
  );

  console.log(`Generated license API data for ${licenses.length} licenses in ${apiDir}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
