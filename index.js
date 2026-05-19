#!/usr/bin/env node
// Simple Node server to serve a single-page CV rendered from Markdown
// Usage: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DOCS_DIR = path.join(__dirname);
const MD_FILE = path.join(DOCS_DIR, 'README.md');

function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function escapeHtmlSafe(s) { 
  // Não escapa tags HTML existentes, apenas texto dentro das tags
  let result = '';
  let inTag = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '<') {
      inTag = true;
      result += s[i];
    } else if (s[i] === '>') {
      inTag = false;
      result += s[i];
    } else if (!inTag) {
      result += s[i].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
      result += s[i];
    }
  }
  return result;
}
function renderInline(text) {
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => `<a href="${u}">${escapeHtml(t)}</a>`);
  text = text.replace(/\*\*([^*]+)\*\*/g, (m, t) => `<strong>${escapeHtml(t)}</strong>`);
  text = text.replace(/\*([^*]+)\*/g, (m, t) => `<em>${escapeHtml(t)}</em>`);
  return text;
}

function parse(md) {
  const lines = md.split(/\r?\n/);
  let out = '';
  let i = 0, inList = false;
  while (i < lines.length) {
    let line = lines[i].trimEnd();
    if (line.match(/^\s*$/)) { if (inList) { out += '</ul>'; inList = false } i++; continue }
    let h = line.match(/^(#{1,6})\s+(.*)/);
    if (h) { if (inList) { out += '</ul>'; inList = false } const level = h[1].length; out += `<h${level}>${renderInline(h[2].trim())}</h${level}>\n`; i++; continue }
    if (/^---+$/.test(line)) { if (inList) { out += '</ul>'; inList = false } out += '<hr/>'; i++; continue }
    let li = line.match(/^[-+*]\s+(.*)/);
    if (li) { if (!inList) { inList = true; out += '<ul>' } out += `<li>${renderInline(li[1].trim())}</li>`; i++; continue }
    let para = [];
    while (i < lines.length && !lines[i].trim().match(/^\s*$/) && !lines[i].trim().match(/^(#{1,6}|[-+*]\s+|---)/)) {
      para.push(lines[i]); i++
    }
    if (para.length) { let text = para.join(' ').trim(); out += `<p>${renderInline(escapeHtmlSafe(text))}</p>\n`; continue }
  }
  if (inList) out += '</ul>';
  return out;
}

function buildPage(contentHtml) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Henrique Felix — CV</title>
  <style>
    body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial;margin:0;background:#f8fafc;color:#0f172a}
    .wrap{max-width:880px;margin:28px auto;padding:18px;background:#fff;border-radius:8px;box-shadow:0 6px 20px rgba(2,6,23,.06)}
    .markdown-body{padding:8px 6px}
    h1{font-size:22px}
    h2{font-size:18px}
    code{background:#f1f5f9;padding:2px 6px;border-radius:6px}
    @media print{body{background:white}.wrap{box-shadow:none;border-radius:0;margin:0;padding:0}}
  </style>
</head>
<body>
  <main class="wrap">
    <div class="markdown-body">${contentHtml}</div>
    <p style="margin-top:18px"><a href="/resume">📄 Resume HTML</a></p>
  </main>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') {
    fs.readFile(MD_FILE, 'utf8', (err, md) => {
      if (err) { res.statusCode = 500; res.end('Could not read CV markdown'); return }
      const html = parse(md);
      const page = buildPage(html);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(page);
    });
    return;
  }
  if (url === '/cv.md') {
    fs.createReadStream(MD_FILE).on('error', () => { res.statusCode = 404; res.end('Not found') }).pipe(res);
    return;
  }

  // Serve resume.html na rota /resume
  if (url === '/resume' || url === '/resume.html') {
    const resumeFile = path.join(DOCS_DIR, 'resume.html');
    fs.readFile(resumeFile, 'utf8', (err, html) => {
      if (err) { res.statusCode = 404; res.end('Resume not found'); return; }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
    });
    return;
  }

  // static file fallback
  const filePath = path.join(DOCS_DIR, decodeURIComponent(url));
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.statusCode = 404; res.end('Not found'); return }
    const stream = fs.createReadStream(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
