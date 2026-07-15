#!/usr/bin/env node

import {mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {
  BADGE_STYLES,
  buildLicenseBadgeSvg,
  getBadgeFileName,
} from '../src/utils/licenseBadges.mjs';

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

async function main() {
  const docsDir = path.join(process.cwd(), 'docs', 'public-licenses');
  const outputDir = path.join(process.cwd(), 'static', 'badges');
  const entries = await readdir(docsDir, {withFileTypes: true});
  const licenses = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'index.md') {
      continue;
    }
    const content = await readFile(path.join(docsDir, entry.name), 'utf8');
    const spdxId = readFrontMatterValue(content, 'spdxId');
    const licenseName = readFrontMatterValue(content, 'title');
    if (spdxId && licenseName) {
      licenses.push({spdxId, licenseName});
    }
  }

  licenses.sort((first, second) => first.spdxId.localeCompare(second.spdxId));
  await rm(outputDir, {recursive: true, force: true});
  await mkdir(outputDir, {recursive: true});

  const generatedFiles = [];
  for (const license of licenses) {
    for (const style of BADGE_STYLES) {
      const fileName = getBadgeFileName(license.spdxId, style.id);
      const svg = buildLicenseBadgeSvg({...license, styleId: style.id});
      await writeFile(path.join(outputDir, fileName), svg, 'utf8');
      generatedFiles.push(fileName);
    }
  }

  await writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify({licenses: licenses.length, styles: BADGE_STYLES, files: generatedFiles}, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `Generated ${generatedFiles.length} SVG badges for ${licenses.length} licenses in ${outputDir}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
