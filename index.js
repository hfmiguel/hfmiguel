/*
  index.js — client-side Markdown renderer
  - Fetches README.md
  - Converts Markdown to HTML using a minimal marked implementation (lightweight)
  - Injects HTML into #content
*/
(function () {
  const mdPath = 'README.md';

  // Minimal marked-like converter for common blocks (headings, paragraphs, lists, bold, italics, links).
  // This is intentionally small to avoid external deps. It handles the markdown used in the CV.
  function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

  function renderInline(text) {
    // links: [text](href)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => `<a href="${u}">${escapeHtml(t)}</a>`);
    // bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, (m, t) => `<strong>${escapeHtml(t)}</strong>`);
    // italic *text*
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

      // heading
      let h = line.match(/^#{1,6}\s+(.*)/);
      if (h) { if (inList) { out += '</ul>'; inList = false } out += `<h${h[0].split(' ')[0].length}>${renderInline(h[1].trim())}</h${h[0].split(' ')[0].length}>\n`; i++; continue }

      // hr
      if (/^---+$/.test(line)) { if (inList) { out += '</ul>'; inList = false } out += '<hr/>'; i++; continue }

      // list
      let li = line.match(/^[-+*]\s+(.*)/);
      if (li) { if (!inList) { inList = true; out += '<ul>' } out += `<li>${renderInline(li[1].trim())}</li>`; i++; continue }

      // paragraph or continued paragraph
      let para = [];
      while (i < lines.length && !lines[i].trim().match(/^\s*$/) && !lines[i].trim().match(/^(#{1,6}|[-+*]\s+|---)/)) {
        para.push(lines[i]); i++
      }
      if (para.length) { let text = para.join(' ').trim(); out += `<p>${renderInline(escapeHtml(text))}</p>\n`; continue }
    }
    if (inList) out += '</ul>';
    return out;
  }

  function mount(html) {
    const el = document.getElementById('content');
    if (!el) return console.error('No #content');
    el.innerHTML = html;
    // small markdown-body styles
    el.querySelectorAll('h1').forEach(h => h.style.fontSize = '22px');
    el.querySelectorAll('h2').forEach(h => h.style.fontSize = '18px');
    el.querySelectorAll('code').forEach(c => { c.style.background = '#f1f5f9'; c.style.padding = '2px 6px'; c.style.borderRadius = '6px' });
  }

  fetch(mdPath).then(r => {
    if (!r.ok) throw new Error('Failed to fetch ' + mdPath);
    return r.text();
  }).then(md => {
    const html = parse(md);
    mount(html);
  }).catch(err => {
    document.getElementById('content').innerText = 'Error loading CV: ' + err.message;
    console.error(err);
  });
})();
