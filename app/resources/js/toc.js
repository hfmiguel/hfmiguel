document.addEventListener('DOMContentLoaded', function(){
  // Find article headings
  const content = document.querySelector('main.container article');
  if(!content) return;
  const allHeadings = Array.from(content.querySelectorAll('h2, h3'));
  // filter out headings that are inside tables/nav or are empty or are page chrome
  const headings = allHeadings.filter(h => {
    const text = (h.textContent || '').trim();
    if(!text) return false;
    if(h.closest('table') || h.closest('nav') || h.closest('footer')) return false;
    if(/^conteudo$/i.test(text) || /^menu$/i.test(text)) return false;
    // ignore extremely long heading lines
    if(text.length > 200) return false;
    return true;
  });
  if(!headings.length) return;

  // Create TOC container
  const toc = document.createElement('nav');
  toc.className = 'toc';
  toc.innerHTML = '<h4>Conteúdo <button class="toc-toggle" aria-label="Alternar índice">☰</button></h4><ul></ul>';
  const list = toc.querySelector('ul');
  const toggleBtn = toc.querySelector('.toc-toggle');

  // Toggle behavior for TOC
  toggleBtn.addEventListener('click', function(){
    toc.classList.toggle('collapsed');
  });

  function slugify(text){
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g,'-')
      .replace(/[^a-z0-9\-]/g,'')
      .replace(/\-+/g,'-');
  }

  headings.forEach((h, i) => {
    // ensure id by slugifying the heading text for predictable anchors
    if(!h.id){
      const slug = slugify(h.textContent || ('heading-' + i));
      h.id = slug || ('heading-' + i);
    }
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      document.getElementById(h.id).scrollIntoView({behavior:'smooth', block:'start'});
      // ensure TOC marks this as active
      list.querySelectorAll('a').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      // update body active index for coloring
      const idx = Array.from(headings).indexOf(h);
      document.body.setAttribute('data-active-index', String(Math.max(0, Math.min(8, idx))));
    });
    li.appendChild(a);
    list.appendChild(li);
  });

  // Insert TOC and content into a wrapper at the same position the article had
  const parent = content.parentElement;
  const wrapper = document.createElement('div');
  wrapper.className = 'content-with-toc';
  // insert wrapper before the content to preserve document order
  parent.insertBefore(wrapper, content);
  // append toc first so it appears on the left (CSS grid: 240px 1fr)
  wrapper.appendChild(toc);
  wrapper.appendChild(content);

  // Use IntersectionObserver for precise active section tracking
  const links = Array.from(list.querySelectorAll('a'));
  const observerOpts = { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 };
  let activeIdx = -1;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const idx = Array.from(headings).indexOf(entry.target);
      if(entry.isIntersecting){
        activeIdx = idx;
        links.forEach((a,i)=> a.classList.toggle('active', i===activeIdx));
        // set body attribute so CSS can style accents
        document.body.setAttribute('data-active-index', String(Math.max(0, Math.min(3, activeIdx))));
        // add active class to heading
        headings.forEach(h=>h.classList.remove('active-heading'));
        entry.target.classList.add('active-heading');
      }
    });
  }, observerOpts);
  headings.forEach(h=> io.observe(h));

  // Make TOC responsive: show/hide toggle on small screens
  function updateTOCBehaviour(){
    if(window.innerWidth <= 900){
      // collapsed by default on small screens
      toc.classList.add('collapsed');
      toggleBtn.style.display = 'inline-block';
    } else {
      toc.classList.remove('collapsed');
      toggleBtn.style.display = 'none';
    }
  }
  window.addEventListener('resize', updateTOCBehaviour);
  updateTOCBehaviour();

  // Accessibility: close TOC with Escape when it is open
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      toc.classList.add('collapsed');
    }
  });
});
