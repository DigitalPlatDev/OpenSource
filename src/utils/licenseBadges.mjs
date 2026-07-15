export const BADGE_STYLES = Object.freeze([
  {
    id: 'modern',
    name: 'Modern',
    description: 'A polished green gradient for product pages and READMEs.',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'A high-contrast dark badge for developer-focused projects.',
  },
  {
    id: 'flat',
    name: 'Flat',
    description: 'A compact two-tone badge inspired by classic repository badges.',
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'A clean light badge that works well in documentation.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'A quiet single-surface badge for understated layouts.',
  },
  {
    id: 'for-the-badge',
    name: 'For the badge',
    description: 'A bold uppercase treatment for prominent project headers.',
  },
]);

const STYLE_IDS = new Set(BADGE_STYLES.map((style) => style.id));

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function truncateLabel(value, maximumLength = 30) {
  const text = String(value);
  if (text.length <= maximumLength) {
    return text;
  }
  return `${text.slice(0, maximumLength - 1)}…`;
}

function estimateTextWidth(text, fontSize, weight = 600) {
  const wideCharacters = (text.match(/[MW@%&#]/g) || []).length;
  const narrowCharacters = (text.match(/[ilI1.,'`|]/g) || []).length;
  const base = text.length * fontSize * (weight >= 700 ? 0.61 : 0.57);
  return Math.ceil(base + wideCharacters * 1.8 - narrowCharacters * 1.7);
}

function createIcon(x, y, color) {
  return `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.5v11"/><path d="M2.5 4h9"/><path d="m2.5 4-2 4h4l-2-4Z"/><path d="m11.5 4-2 4h4l-2-4Z"/><path d="M4 13h6"/></g>`;
}

export function getBadgeFileName(spdxId, styleId) {
  const safeId = String(spdxId).replace(/[^A-Za-z0-9.+-]/g, '-');
  const safeStyle = STYLE_IDS.has(styleId) ? styleId : 'modern';
  return `${safeId}-${safeStyle}.svg`;
}

export function buildLicenseBadgeSvg({
  spdxId,
  licenseName,
  styleId = 'modern',
  labelText,
  accentColor = '#16a34a',
  scale = 1,
  rounded = true,
}) {
  const resolvedStyle = STYLE_IDS.has(styleId) ? styleId : 'modern';
  const displayId = truncateLabel(spdxId);
  const defaultLabel = resolvedStyle === 'for-the-badge' ? 'LICENSE' : 'license';
  const label = truncateLabel(labelText && labelText !== 'license' ? labelText : defaultLabel, 18);
  const resolvedAccent = /^#[0-9a-f]{6}$/iu.test(accentColor) ? accentColor : '#16a34a';
  const resolvedScale = Math.min(2, Math.max(0.75, Number(scale) || 1));
  const fontSize = resolvedStyle === 'for-the-badge' ? 11 : 12;
  const height = resolvedStyle === 'for-the-badge' ? 32 : 28;
  const iconWidth = resolvedStyle === 'minimal' ? 0 : 20;
  const labelWidth = estimateTextWidth(label, fontSize, 700) + iconWidth + 22;
  const valueWidth = estimateTextWidth(displayId, fontSize, 700) + 26;
  const width = labelWidth + valueWidth;
  const baseline = Math.round(height / 2 + fontSize * 0.36);
  const title = escapeXml(`${licenseName || spdxId} license badge`);
  const escapedLabel = escapeXml(label);
  const escapedId = escapeXml(
    resolvedStyle === 'for-the-badge' ? displayId.toUpperCase() : displayId,
  );
  const radius = rounded ? (resolvedStyle === 'flat' ? 3 : height / 2) : 3;
  const iconY = Math.round((height - 15) / 2);

  let definitions = '';
  let background = '';
  let labelColor = '#ffffff';
  let valueColor = '#ffffff';
  let iconColor = '#d1fae5';

  if (resolvedStyle === 'modern') {
    definitions = `<defs><linearGradient id="badge-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#064e3b"/><stop offset="1" stop-color="#0f172a"/></linearGradient><linearGradient id="badge-accent" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${resolvedAccent}" stop-opacity=".82"/><stop offset="1" stop-color="${resolvedAccent}"/></linearGradient><filter id="badge-shadow" x="-10%" y="-30%" width="120%" height="170%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity=".22"/></filter></defs>`;
    background = `<g filter="url(#badge-shadow)"><rect width="${width}" height="${height}" rx="${radius}" fill="url(#badge-bg)"/><path d="M${labelWidth} 0h${valueWidth - radius}a${radius} ${radius} 0 0 1 ${radius} ${radius}v0a${radius} ${radius} 0 0 1-${radius} ${radius}H${labelWidth}Z" fill="url(#badge-accent)"/></g>`;
  } else if (resolvedStyle === 'midnight') {
    definitions = `<defs><linearGradient id="badge-midnight" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#020617"/><stop offset="1" stop-color="#172554"/></linearGradient></defs>`;
    background = `<rect width="${width}" height="${height}" rx="${radius}" fill="url(#badge-midnight)"/><rect x="${labelWidth}" width="${valueWidth}" height="${height}" rx="${radius}" fill="${resolvedAccent}"/><rect x="${labelWidth}" width="${radius}" height="${height}" fill="${resolvedAccent}"/>`;
    iconColor = '#5eead4';
  } else if (resolvedStyle === 'flat') {
    background = `<rect width="${width}" height="${height}" rx="${radius}" fill="#334155"/><path d="M${labelWidth} 0h${valueWidth - radius}a${radius} ${radius} 0 0 1 ${radius} ${radius}v${height - radius}H${labelWidth}Z" fill="${resolvedAccent}"/>`;
  } else if (resolvedStyle === 'outline') {
    background = `<rect x=".75" y=".75" width="${width - 1.5}" height="${height - 1.5}" rx="${Math.max(1, radius - 0.75)}" fill="#ffffff" stroke="${resolvedAccent}" stroke-width="1.5"/><path d="M${labelWidth} .75h${valueWidth - radius}a${Math.max(1, radius - 0.75)} ${Math.max(1, radius - 0.75)} 0 0 1 ${Math.max(1, radius - 0.75)} ${Math.max(1, radius - 0.75)}v0a${Math.max(1, radius - 0.75)} ${Math.max(1, radius - 0.75)} 0 0 1-${Math.max(1, radius - 0.75)} ${Math.max(1, radius - 0.75)}H${labelWidth}Z" fill="${resolvedAccent}" fill-opacity=".14"/>`;
    labelColor = '#334155';
    valueColor = resolvedAccent;
    iconColor = resolvedAccent;
  } else if (resolvedStyle === 'minimal') {
    background = `<rect width="${width}" height="${height}" rx="${radius}" fill="#f1f5f9"/><rect x="${labelWidth}" width="1" height="${height}" fill="#cbd5e1"/>`;
    labelColor = '#475569';
    valueColor = resolvedAccent;
  } else {
    background = `<rect width="${width}" height="${height}" rx="${radius}" fill="#111827"/><path d="M${labelWidth} 0h${valueWidth - radius}a${radius} ${radius} 0 0 1 ${radius} ${radius}v${height - radius}H${labelWidth}Z" fill="${resolvedAccent}"/>`;
    iconColor = '#bbf7d0';
  }

  const icon = iconWidth > 0 ? createIcon(10, iconY, iconColor) : '';
  const labelX = iconWidth > 0 ? 34 : 14;
  const valueX = labelWidth + valueWidth / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(width * resolvedScale)}" height="${Math.round(height * resolvedScale)}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><title>${title}</title>${definitions}${background}${icon}<g font-family="Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="${fontSize}" font-weight="700"><text x="${labelX}" y="${baseline}" fill="${labelColor}">${escapedLabel}</text><text x="${valueX}" y="${baseline}" fill="${valueColor}" text-anchor="middle">${escapedId}</text></g></svg>`;
}
