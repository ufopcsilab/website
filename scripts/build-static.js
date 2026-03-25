'use strict';
/**
 * Pre-renders every Express route to static HTML in dist/.
 * Run after starting server.js (server must be up on PORT before calling this).
 *
 * Output layout mirrors the URL scheme:
 *   dist/index.html            ← meta-refresh redirect to /pt
 *   dist/pt/index.html
 *   dist/pt/equipe/index.html
 *   dist/pt/publicacoes/index.html
 *   dist/pt/contato/index.html
 *   dist/{en,es,it}/...        ← same pattern
 *   dist/css/, dist/js/, ...   ← copied from public/
 */

const http  = require('http');
const fs    = require('fs');
const fsp   = fs.promises;
const path  = require('path');

const PORT   = process.env.PORT || 3001;
const DIST   = path.join(__dirname, '..', 'dist');
const PUBLIC = path.join(__dirname, '..', 'public');

const LANGS  = ['pt', 'en', 'es', 'it'];
const PAGES  = ['', 'equipe', 'publicacoes', 'contato'];  // '' = home

// Build full list of [route, output-file] pairs
const ROUTES = [];
for (const lang of LANGS) {
  for (const page of PAGES) {
    const route   = page ? `/${lang}/${page}` : `/${lang}`;
    const outFile = page
      ? path.join(lang, page, 'index.html')
      : path.join(lang, 'index.html');
    ROUTES.push([route, outFile]);
  }
}

// Root: meta-refresh to /pt so GitHub Pages root URL works
const ROOT_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=/pt" />
  <title>CSI Lab</title>
</head>
<body><a href="/pt">CSI Lab</a></body>
</html>`;

function fetchPage(route) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: PORT, path: route };
    http.get(opts, (res) => {
      // Follow one level of redirect (e.g. /  → /pt)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`${route} returned HTTP ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  for (const entry of await fsp.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else {
      await fsp.copyFile(s, d);
    }
  }
}

async function main() {
  // Clean dist/
  await fsp.rm(DIST, { recursive: true, force: true });
  await fsp.mkdir(DIST, { recursive: true });

  // Root redirect
  await fsp.writeFile(path.join(DIST, 'index.html'), ROOT_HTML);
  console.log('  wrote  dist/index.html  (root redirect → /pt)');

  // Render each route
  for (const [route, outFile] of ROUTES) {
    const html    = await fetchPage(route);
    const outPath = path.join(DIST, outFile);
    await fsp.mkdir(path.dirname(outPath), { recursive: true });
    await fsp.writeFile(outPath, html);
    console.log(`  wrote  dist/${outFile}`);
  }

  // Copy public/ assets (css, js, images, fonts)
  await copyDir(PUBLIC, DIST);
  console.log('  copied public/ → dist/');

  console.log(`\nBuild complete — ${ROUTES.length + 1} pages, assets copied.`);
}

main().catch(err => { console.error(err); process.exit(1); });
