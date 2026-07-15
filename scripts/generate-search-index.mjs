#!/usr/bin/env node

import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {normalizeSearchText} from '../src/utils/search.mjs';

function readFrontMatterValue(content, key) {
  const frontMatter = content.match(/^---\n([\s\S]*?)\n---/u)?.[1] || '';
  const value = frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'mu'))?.[1];
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value.trim();
  }
}

function stripFrontMatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n?/u, '');
}

function routeForDocument(relativePath) {
  const withoutExtension = relativePath.replace(/\.md$/u, '');
  return `/docs/${withoutExtension.replace(/\/index$/u, '')}`.replace(/\/$/u, '') || '/docs';
}

async function walkMarkdownFiles(directory, prefix = '') {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkMarkdownFiles(path.join(directory, entry.name), relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(relativePath);
    }
  }
  return files;
}

async function main() {
  const docsDirectory = path.join(process.cwd(), 'docs');
  const outputDirectory = path.join(process.cwd(), 'static', 'api');
  const files = await walkMarkdownFiles(docsDirectory);
  const entries = [];

  for (const relativePath of files) {
    const content = await readFile(path.join(docsDirectory, relativePath), 'utf8');
    const title = readFrontMatterValue(content, 'title') || path.basename(relativePath, '.md');
    const spdxId = readFrontMatterValue(content, 'spdxId');
    const section = relativePath.startsWith('public-licenses/')
      ? 'Public license'
      : relativePath.startsWith('policies/')
        ? 'Policy'
        : relativePath.startsWith('opensource-ngo-licenses/')
          ? 'OpenSource.ngo license'
          : 'Documentation';

    entries.push({
      title,
      subtitle: spdxId || section,
      keywords: spdxId || '',
      path: routeForDocument(relativePath),
      section,
      content: normalizeSearchText(stripFrontMatter(content)),
    });
  }

  entries.push(
    {
      title: 'Open source license tools',
      subtitle: 'Tools',
      keywords: 'search compare wizard generator api badges svg markdown html',
      path: '/tools',
      section: 'Tool',
      content: 'Search compare choose generate license files badges SPDX metadata and project documentation.',
    },
    {
      title: 'OpenSource.ngo',
      subtitle: 'Home',
      keywords: 'open source nonprofit reference library',
      path: '/',
      section: 'Page',
      content: 'A nonprofit reference library for open source licenses with clear provenance.',
    },
  );

  await mkdir(outputDirectory, {recursive: true});
  await writeFile(
    path.join(outputDirectory, 'search-index.json'),
    `${JSON.stringify({count: entries.length, entries})}\n`,
    'utf8',
  );
  console.log(`Generated search index for ${entries.length} pages in ${outputDirectory}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
