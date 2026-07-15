const DEFAULT_RIGHTS = {
  commercialUse: null,
  modification: null,
  distribution: null,
  privateUse: null,
  patentUse: null,
};

const DEFAULT_CONDITIONS = {
  includeCopyright: false,
  discloseSource: false,
  sameLicense: false,
  stateChanges: false,
  networkUseDisclosure: false,
};

const DEFAULT_LIMITATIONS = {
  liability: true,
  warranty: true,
  trademarkUse: false,
  patentClaims: false,
};

const PROFILES = {
  permissive: {
    category: 'Permissive',
    copyleft: 'None',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: null,
    },
    conditions: {includeCopyright: true},
  },
  permissivePatent: {
    category: 'Permissive',
    copyleft: 'None',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: true,
    },
    conditions: {includeCopyright: true, stateChanges: true},
    limitations: {patentClaims: true, trademarkUse: true},
  },
  weakCopyleft: {
    category: 'Weak copyleft',
    copyleft: 'File or library',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: true,
    },
    conditions: {
      includeCopyright: true,
      discloseSource: true,
      sameLicense: true,
      stateChanges: true,
    },
  },
  strongCopyleft: {
    category: 'Strong copyleft',
    copyleft: 'Derivative work',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: true,
    },
    conditions: {
      includeCopyright: true,
      discloseSource: true,
      sameLicense: true,
      stateChanges: true,
    },
    limitations: {patentClaims: true},
  },
  networkCopyleft: {
    category: 'Network copyleft',
    copyleft: 'Network use',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: true,
    },
    conditions: {
      includeCopyright: true,
      discloseSource: true,
      sameLicense: true,
      stateChanges: true,
      networkUseDisclosure: true,
    },
    limitations: {patentClaims: true},
  },
  publicDomain: {
    category: 'Public domain',
    copyleft: 'None',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: null,
    },
  },
  content: {
    category: 'Content',
    copyleft: 'Varies',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: false,
    },
    conditions: {includeCopyright: true},
  },
  contentShareAlike: {
    category: 'Content',
    copyleft: 'Adaptations',
    rights: {
      commercialUse: true,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: false,
    },
    conditions: {includeCopyright: true, sameLicense: true},
  },
  contentNoDerivatives: {
    category: 'Content',
    copyleft: 'No derivatives',
    rights: {
      commercialUse: true,
      modification: false,
      distribution: true,
      privateUse: true,
      patentUse: false,
    },
    conditions: {includeCopyright: true},
  },
  contentNonCommercial: {
    category: 'Non-commercial content',
    copyleft: 'Varies',
    rights: {
      commercialUse: false,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: false,
    },
    conditions: {includeCopyright: true},
  },
  contentNonCommercialShareAlike: {
    category: 'Non-commercial content',
    copyleft: 'Adaptations',
    rights: {
      commercialUse: false,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: false,
    },
    conditions: {includeCopyright: true, sameLicense: true},
  },
  contentNonCommercialNoDerivatives: {
    category: 'Non-commercial content',
    copyleft: 'No derivatives',
    rights: {
      commercialUse: false,
      modification: false,
      distribution: true,
      privateUse: true,
      patentUse: false,
    },
    conditions: {includeCopyright: true},
  },
  sourceAvailable: {
    category: 'Source available',
    copyleft: 'Custom',
    rights: {
      commercialUse: false,
      modification: true,
      distribution: true,
      privateUse: true,
      patentUse: null,
    },
    conditions: {includeCopyright: true},
  },
};

const EXACT_PROFILES = {
  MIT: 'permissive',
  'Apache-2.0': 'permissivePatent',
  'MPL-2.0': 'weakCopyleft',
  'EPL-2.0': 'weakCopyleft',
  'CDDL-1.0': 'weakCopyleft',
  'CDDL-1.1': 'weakCopyleft',
  'LGPL-2.1-only': 'weakCopyleft',
  'LGPL-2.1-or-later': 'weakCopyleft',
  'LGPL-3.0-only': 'weakCopyleft',
  'LGPL-3.0-or-later': 'weakCopyleft',
  'GPL-2.0-only': 'strongCopyleft',
  'GPL-2.0-or-later': 'strongCopyleft',
  'GPL-3.0-only': 'strongCopyleft',
  'GPL-3.0-or-later': 'strongCopyleft',
  'AGPL-3.0-only': 'networkCopyleft',
  'AGPL-3.0-or-later': 'networkCopyleft',
  'CC0-1.0': 'publicDomain',
  Unlicense: 'publicDomain',
  '0BSD': 'publicDomain',
  'BUSL-1.1': 'sourceAvailable',
  'BSL-1.0': 'sourceAvailable',
};

const RECOMMENDED_IDS = [
  'MIT',
  'Apache-2.0',
  'BSD-3-Clause',
  'GPL-3.0-only',
  'LGPL-3.0-only',
  'AGPL-3.0-only',
  'MPL-2.0',
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'Unlicense',
];

function mergeProfile(profileName) {
  const profile = PROFILES[profileName] || {};
  return {
    category: profile.category || 'Other',
    copyleft: profile.copyleft || 'Unknown',
    rights: {...DEFAULT_RIGHTS, ...(profile.rights || {})},
    conditions: {...DEFAULT_CONDITIONS, ...(profile.conditions || {})},
    limitations: {...DEFAULT_LIMITATIONS, ...(profile.limitations || {})},
  };
}

function inferProfile(spdxId, name) {
  if (EXACT_PROFILES[spdxId]) {
    return EXACT_PROFILES[spdxId];
  }
  if (/^(BSD-|ISC$|AFL-|APSL-|Artistic-|Zlib|libpng|Python-|PHP-|PostgreSQL)/i.test(spdxId)) {
    return 'permissive';
  }
  if (/^Apache-/i.test(spdxId)) {
    return 'permissive';
  }
  if (/^(GPL-|GFDL-)/i.test(spdxId)) {
    return 'strongCopyleft';
  }
  if (/^(LGPL-|MPL-|EPL-|EUPL-|CDDL-|CECILL-B|CECILL-C)/i.test(spdxId)) {
    return 'weakCopyleft';
  }
  if (/^AGPL-/i.test(spdxId)) {
    return 'networkCopyleft';
  }
  if (/^CC-/i.test(spdxId)) {
    if (/CC-BY-NC-ND-/i.test(spdxId)) return 'contentNonCommercialNoDerivatives';
    if (/CC-BY-NC-SA-/i.test(spdxId)) return 'contentNonCommercialShareAlike';
    if (/CC-BY-NC-/i.test(spdxId)) return 'contentNonCommercial';
    if (/CC-BY-ND-/i.test(spdxId)) return 'contentNoDerivatives';
    if (/CC-BY-SA-/i.test(spdxId)) return 'contentShareAlike';
    return 'content';
  }
  if (/public domain|dedication/i.test(name)) {
    return 'publicDomain';
  }
  return null;
}

function inferFamily(spdxId) {
  const normalized = spdxId
    .replace(/-(only|or-later)$/u, '')
    .replace(/-\d+(?:\.\d+)*(?:-[A-Z]+)?$/u, '')
    .replace(/-v?\d+(?:\.\d+)*$/iu, '');
  const prefixes = [
    'AGPL', 'GPL', 'LGPL', 'MPL', 'EPL', 'EUPL', 'APSL', 'AFL', 'CC-BY-NC-ND',
    'CC-BY-NC-SA', 'CC-BY-NC', 'CC-BY-ND', 'CC-BY-SA', 'CC-BY', 'CDDL', 'CECILL',
    'CERN-OHL', 'BSD', 'Artistic', 'BitTorrent', 'Apache',
  ];
  return prefixes.find((prefix) => spdxId.startsWith(prefix)) || normalized || spdxId;
}

export function classifyLicense(spdxId, name) {
  const profileName = inferProfile(spdxId, name);
  const classification = profileName
    ? mergeProfile(profileName)
    : {
        category: 'Other',
        copyleft: 'Unknown',
        rights: {...DEFAULT_RIGHTS},
        conditions: Object.fromEntries(Object.keys(DEFAULT_CONDITIONS).map((key) => [key, null])),
        limitations: Object.fromEntries(Object.keys(DEFAULT_LIMITATIONS).map((key) => [key, null])),
      };
  const isDeprecatedVariant = /(?:^|-)\d+(?:\.\d+)*$/u.test(spdxId) &&
    !RECOMMENDED_IDS.includes(spdxId);

  return {
    ...classification,
    family: inferFamily(spdxId),
    recommended: RECOMMENDED_IDS.includes(spdxId),
    confidence: profileName ? 'curated-or-inferred' : 'unknown',
    isDeprecatedVariant,
  };
}

export const LICENSE_FIELD_LABELS = {
  rights: {
    commercialUse: 'Commercial use',
    modification: 'Modification',
    distribution: 'Distribution',
    privateUse: 'Private use',
    patentUse: 'Patent use',
  },
  conditions: {
    includeCopyright: 'Include copyright and license',
    discloseSource: 'Disclose source',
    sameLicense: 'Use the same license',
    stateChanges: 'State changes',
    networkUseDisclosure: 'Disclose source over a network',
  },
  limitations: {
    liability: 'Liability',
    warranty: 'Warranty',
    trademarkUse: 'Trademark use',
    patentClaims: 'Patent retaliation',
  },
};
