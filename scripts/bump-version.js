#!/usr/bin/env node
/*
 * bump-version.js — cache-busting sem build step.
 *
 * O site é servido estático (pasta public/) e o host não manda header de
 * cache curto nos .js, então quem já visitou fica preso numa versão velha
 * e vê "página não encontrada" quando uma rota nova é adicionada.
 *
 * Este script carimba ?v=<versao> em:
 *   - <script src="/js/app.js"> e /js/tv.js no index.html / tv.html
 *   - todos os import ... from './x.js'  e  import('./x.js')  dentro de public/js
 *
 * Rode ANTES de cada deploy:
 *   node scripts/bump-version.js
 * (usa timestamp automático; ou passe uma versão: node scripts/bump-version.js 2026-09-10a)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const arg = process.argv[2];
const version = arg || new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12); // YYYYMMDDHHMM

let changed = 0;

// 1. HTML: carimba os <script src="/js/*.js">
for (const htmlFile of ['index.html', 'tv.html']) {
    const p = path.join(PUBLIC, htmlFile);
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, 'utf8');
    const before = s;
    s = s.replace(
        /(src=["'])(\/js\/[^"'?]+\.js)(\?v=[^"']*)?(["'])/g,
        (_m, a, file, _q, b) => `${a}${file}?v=${version}${b}`
    );
    if (s !== before) { fs.writeFileSync(p, s, 'utf8'); changed++; console.log('  html:', htmlFile); }
}

// 2. JS: carimba imports relativos (estáticos e dinâmicos)
function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full);
        else if (name.endsWith('.js')) stampJs(full);
    }
}

function stampJs(file) {
    let s = fs.readFileSync(file, 'utf8');
    const before = s;

    // import ... from './x.js'   /   export ... from '../x.js'
    s = s.replace(
        /(\bfrom\s+["'])(\.{1,2}\/[^"']+?\.js)(\?v=[^"']*)?(["'])/g,
        (_m, a, spec, _q, b) => `${a}${spec}?v=${version}${b}`
    );
    // import('./x.js')  (dinâmico)
    s = s.replace(
        /(\bimport\(\s*["'])(\.{1,2}\/[^"']+?\.js)(\?v=[^"']*)?(["']\s*\))/g,
        (_m, a, spec, _q, b) => `${a}${spec}?v=${version}${b}`
    );

    if (s !== before) {
        fs.writeFileSync(file, s, 'utf8');
        changed++;
        console.log('  js:  ', path.relative(ROOT, file));
    }
}

walk(path.join(PUBLIC, 'js'));

console.log(`\nversão: ${version}  |  arquivos alterados: ${changed}`);
if (changed === 0) console.log('(nada mudou — talvez já esteja nessa versão)');
