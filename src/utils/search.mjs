export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9.+-]+/gu, ' ')
    .trim();
}

function scoreEntry(entry, terms) {
  const title = normalizeSearchText(entry.title);
  const subtitle = normalizeSearchText(entry.subtitle);
  const keywords = normalizeSearchText(entry.keywords);
  const content = normalizeSearchText(entry.content);
  let score = 0;

  for (const term of terms) {
    if (!`${title} ${subtitle} ${keywords} ${content}`.includes(term)) {
      return 0;
    }
    if (subtitle === term) score += 120;
    if (title === term) score += 100;
    if (subtitle.startsWith(term)) score += 55;
    if (title.startsWith(term)) score += 45;
    if (subtitle.includes(term)) score += 30;
    if (title.includes(term)) score += 24;
    if (keywords.includes(term)) score += 12;
    if (content.includes(term)) score += 3;
  }

  return score;
}

export function searchEntries(entries, query, limit = 8) {
  const terms = normalizeSearchText(query).split(' ').filter(Boolean);
  if (terms.length === 0) return [];

  return entries
    .map((entry, index) => ({entry, index, score: scoreEntry(entry, terms)}))
    .filter(({score}) => score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .slice(0, limit)
    .map(({entry}) => entry);
}
