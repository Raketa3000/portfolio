const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const locales = {
  ru: {
    promptA: ['ОТПРАВЬТЕ', 'НАМ СВОЙ', 'БРИФ'],
    promptB: ['МЫ ПРИШЛЕМ', 'ВАМ\u00a0ПАРОЛЬ']
  },
  en: {
    promptA: ['SEND US', 'YOUR', 'BRIEF'],
    promptB: ['WE WILL', 'SEND\u00a0YOU', 'THE\u00a0PASSWORD']
  },
  'es-la': {
    promptA: ['ENVÍANOS', 'TU\u00a0BRIEF'],
    promptB: ['TE MANDAREMOS', 'LA\u00a0CONTRASEÑA']
  }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function normalize(part) {
  return part.replace(/&nbsp;/g, '\u00a0');
}

function assertLines(locale, key, actual, expected) {
  const lines = String(actual || '').split(/<br\s*\/?>/i).map(normalize);
  if (lines.length !== expected.length || lines.some((line, index) => line !== expected[index])) {
    throw new Error(`${locale}.${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(lines)}`);
  }
}

Object.keys(locales).forEach((locale) => {
  const data = readJson(`assets/i18n/${locale}.json`);
  assertLines(locale, 'promptA', data.caseStage.promptA, locales[locale].promptA);
  assertLines(locale, 'promptB', data.caseStage.promptB, locales[locale].promptB);
});

const script = fs.readFileSync(path.join(root, 'assets/js/script.js'), 'utf8');
if (/S\.locale\s*===\s*['"]en['"][\s\S]{0,120}WE WILL/.test(script)) {
  throw new Error('assets/js/script.js contains locale-specific promptB fallback');
}

console.log('i18n smoke ok');
