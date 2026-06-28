const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredIds = [
  'w',
  'btn-cases',
  'dev-toggle',
  'lang-switcher',
  'menu-overlay',
  'cases-grid',
  'case-stage',
  'case-stage-close',
  'case-stage-body',
  'cs-cat',
  'cs-brand',
  'cs-title',
  'ba-clock',
  'msk-clock',
  'ba-status',
  'msk-status'
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isExternal(url) {
  return /^(https?:)?\/\//i.test(url) || /^data:/i.test(url);
}

function checkMediaPath(file, value) {
  if (!value || isExternal(value)) return;
  const localPath = value.split(/[?#]/, 1)[0];
  assert(exists(localPath), `${file}: missing media file ${value}`);
}

const html = read('index.html');
requiredIds.forEach((id) => {
  assert(new RegExp(`id=["']${id}["']`).test(html), `index.html: missing #${id}`);
});

const favicon = html.match(/<link\b[^>]*\brel=["']icon["'][^>]*\bhref=["']([^"']+)["']/i);
assert(favicon, 'index.html: missing favicon');
checkMediaPath('index.html', favicon[1]);

const caseFiles = [];
function collectCases(dir) {
  fs.readdirSync(path.join(root, dir), { withFileTypes: true }).forEach((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'media') collectCases(rel);
      return;
    }
    if (entry.name.endsWith('.json')) caseFiles.push(rel);
  });
}

collectCases('assets/cases');

caseFiles.forEach((file) => {
  const data = readJson(file);
  assert(data.title, `${file}: missing title`);
  (data.media || []).forEach((media) => {
    checkMediaPath(file, media.src);
    checkMediaPath(file, media.poster);
    (media.sources || []).forEach((source) => checkMediaPath(file, source.src));
  });
});

console.log(`asset smoke ok (${caseFiles.length} case files)`);
