#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function listCssFiles() {
  const root = process.cwd();
  const files = [];
  const topStyle = path.join(root, 'src', 'style.css');
  const backup = path.join(root, 'src', 'style.css.backup');
  if (fs.existsSync(topStyle)) files.push(topStyle);
  const stylesDir = path.join(root, 'src', 'styles');
  if (fs.existsSync(stylesDir)) {
    const names = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));
    names.forEach(n => files.push(path.join(stylesDir, n)));
  }
  return { files, backup };
}

function removeComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '');
}

function parseRules(s, atRulePrefix = '') {
  s = removeComments(s);
  const res = [];
  let i = 0, len = s.length;
  while (i < len) {
    while (i < len && /\s/.test(s[i])) i++;
    if (i >= len) break;
    const start = s.indexOf('{', i);
    if (start === -1) break;
    const selectorText = s.slice(i, start).trim();
    let j = start + 1, depth = 1;
    while (j < len && depth > 0) {
      if (s[j] === '{') depth++;
      else if (s[j] === '}') depth--;
      j++;
    }
    const block = s.slice(start + 1, j - 1).trim();
    if (!selectorText) { i = j; continue; }
    if (selectorText.startsWith('@')) {
      const prefix = atRulePrefix ? atRulePrefix + ' | ' + selectorText.replace(/\s+/g,' ').trim() : selectorText.replace(/\s+/g,' ').trim();
      const inner = parseRules(block, prefix);
      res.push(...inner);
    } else {
      const selectors = selectorText.split(',').map(x => x.trim()).filter(Boolean);
      const pairs = block.split(';').map(x => x.trim()).filter(Boolean);
      const propMap = {};
      pairs.forEach(p => {
        const idx = p.indexOf(':');
        if (idx === -1) return;
        const key = p.slice(0, idx).trim().toLowerCase();
        const val = p.slice(idx + 1).trim().replace(/\s+/g, ' ');
        propMap[key] = val;
      });
      const keys = Object.keys(propMap).sort();
      const canon = keys.map(k => k + ':' + propMap[k]).join(';');
      selectors.forEach(sel => {
        const fullSel = sel + (atRulePrefix ? ' | ' + atRulePrefix : '');
        res.push({ selector: sel, fullSelector: fullSel, declCanon: canon });
      });
    }
    i = j;
  }
  return res;
}

function buildMapFromRules(rules) {
  const map = new Map();
  for (const r of rules) {
    map.set(r.fullSelector, r.declCanon);
    const baseKey = '__base__' + r.selector;
    if (!map.has(baseKey)) map.set(baseKey, []);
    map.get(baseKey).push({ full: r.fullSelector, decl: r.declCanon });
  }
  return map;
}

function compare(backupMap, fileMap) {
  const results = { identical: [], different: [], missing: [] };
  for (const [k, v] of backupMap) {
    if (k.startsWith('__base__')) continue;
    const backupFull = k;
    const idx = backupFull.indexOf(' | ');
    const baseSel = idx === -1 ? backupFull : backupFull.slice(0, idx);
    const backupDecl = v;
    const baseKey = '__base__' + baseSel;
    if (fileMap.has(baseKey)) {
      const occ = fileMap.get(baseKey);
      let foundIdentical = false;
      let foundDifferent = false;
      for (const o of occ) {
        if (o.decl === backupDecl) {
          foundIdentical = true;
          results.identical.push({ selector: baseSel, fileOcc: o.full });
        } else {
          foundDifferent = true;
        }
      }
      if (!foundIdentical && foundDifferent) {
        results.different.push({ selector: baseSel, fileOccs: occ });
      }
    } else {
      results.missing.push(baseSel);
    }
  }
  results.identical = Array.from(results.identical.reduce((m, it) => { if (!m.has(it.selector)) m.set(it.selector, it); return m; }, new Map()).values());
  results.different = Array.from(results.different.reduce((m, it) => { if (!m.has(it.selector)) m.set(it.selector, it); return m; }, new Map()).values());
  results.missing = Array.from(new Set(results.missing));
  return results;
}

function main() {
  const { files, backup } = listCssFiles();
  if (!fs.existsSync(backup)) {
    console.error('Backup CSS not found at', backup);
    process.exit(1);
  }
  const backupContent = fs.readFileSync(backup, 'utf8');
  const backupRules = parseRules(backupContent);
  const backupMap = buildMapFromRules(backupRules);

  const report = { filesCompared: [], byFile: {} };

  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    if (path.resolve(f) === path.resolve(backup)) continue;
    const content = fs.readFileSync(f, 'utf8');
    const rules = parseRules(content);
    const fmap = buildMapFromRules(rules);
    const comp = compare(backupMap, fmap);
    report.filesCompared.push(f);
    report.byFile[f] = comp;
  }

  const overall = {
    totalBackupSelectors: Array.from(backupMap.keys()).filter(k => !k.startsWith('__base__')).length,
    identicalSelectors: [],
    differentSelectors: [],
    missingSelectors: []
  };

  const seenIdentical = new Set();
  const seenDifferent = new Set();
  const seenMissing = new Set();
  for (const f of Object.keys(report.byFile)) {
    const comp = report.byFile[f];
    comp.identical.forEach(it => seenIdentical.add(it.selector));
    comp.different.forEach(it => seenDifferent.add(it.selector));
    comp.missing.forEach(it => seenMissing.add(it));
  }
  overall.identicalSelectors = Array.from(seenIdentical);
  overall.differentSelectors = Array.from(seenDifferent);
  overall.missingSelectors = Array.from(seenMissing);

  console.log('CSS Comparison Report');
  console.log('Backup:', backup);
  console.log('Files compared:', report.filesCompared.join(', '));
  console.log('Total selectors in backup:', overall.totalBackupSelectors || 0);
  console.log('Selectors identical in at least one file:', overall.identicalSelectors.length);
  if (overall.identicalSelectors.length) {
    overall.identicalSelectors.slice(0, 200).forEach(s => console.log('  ✓', s));
  }
  console.log('Selectors present but differing:', overall.differentSelectors.length);
  if (overall.differentSelectors.length) {
    overall.differentSelectors.slice(0, 200).forEach(s => console.log('  ~', s));
  }
  console.log('Selectors missing in all compared files:', overall.missingSelectors.length);
  if (overall.missingSelectors.length) {
    overall.missingSelectors.slice(0, 200).forEach(s => console.log('  ✗', s));
  }

  const outPath = path.join(process.cwd(), 'compare-css-report.json');
  fs.writeFileSync(outPath, JSON.stringify({ overall, report }, null, 2), 'utf8');
  console.log('Full report saved to', outPath);
}

main();
