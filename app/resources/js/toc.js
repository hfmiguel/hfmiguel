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
  toc.setAttribute('role', 'navigation');
  toc.setAttribute('aria-hidden', 'false');
  toc.innerHTML = '<h4>Conteúdo <button class="toc-toggle" aria-label="Alternar índice">☰</button></h4><ul></ul>';
  const list = toc.querySelector('ul');
  const toggleBtn = toc.querySelector('.toc-toggle');

  // Create a floating mobile-only toggle (icon-only) so the button is
  // always reachable when the inline TOC is collapsed/hidden.
  const mobileToggle = document.createElement('button');
  mobileToggle.className = 'toc-mobile-toggle';
  mobileToggle.setAttribute('aria-label', 'Abrir índice');
  mobileToggle.setAttribute('aria-controls', 'toc');
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.innerHTML = '☰';
  // hide by default; only show when updateTOCBehaviour enables it for small screens
  mobileToggle.style.display = 'none';
  // give the toc an id so the mobileToggle aria-controls has a target
  toc.id = toc.id || 'toc';
  document.body.appendChild(mobileToggle);

  // Backdrop for off-canvas TOC on mobile
  const backdrop = document.createElement('div');
  backdrop.className = 'toc-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  // Toggle behavior for TOC (inline/desktop toggle)
  toggleBtn.addEventListener('click', function(){
    // If on mobile width, behave as an open/close for off-canvas
    if(window.innerWidth <= 900){
      const isOpen = toc.classList.toggle('open');
      toc.classList.toggle('collapsed', !isOpen);
      toc.setAttribute('aria-hidden', String(!isOpen));
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      backdrop.setAttribute('aria-hidden', String(!isOpen));
      if(isOpen){
        // focus first link for accessibility
        const firstLink = list.querySelector('a');
        if(firstLink) firstLink.focus();
      } else {
        mobileToggle.focus();
      }
    } else {
      toc.classList.toggle('collapsed');
    }
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
      // On mobile, close the off-canvas TOC automatically after selection
      if(window.innerWidth <= 900 || toc.classList.contains('open')){
        toc.classList.remove('open');
        toc.classList.add('collapsed');
        toc.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
        backdrop.style.display = 'none';
        backdrop.setAttribute('aria-hidden', 'true');
        // return focus to the toggle for accessibility
        mobileToggle.focus();
      }
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
      // collapsed by default on small screens; desktop inline toggle hidden
      toc.classList.add('collapsed');
      toggleBtn.style.display = 'none';
      mobileToggle.style.display = 'inline-flex';
      backdrop.style.display = 'none';
    } else {
      // desktop: normal inline TOC, hide mobile controls
      toc.classList.remove('collapsed');
      toc.classList.remove('open');
      toc.setAttribute('aria-hidden', 'false');
      toggleBtn.style.display = 'inline-block';
      mobileToggle.style.display = 'none';
      mobileToggle.setAttribute('aria-expanded', 'false');
      backdrop.style.display = 'none';
    }
  }
  window.addEventListener('resize', updateTOCBehaviour);
  updateTOCBehaviour();

  // Accessibility: close TOC with Escape when it is open
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      if(toc.classList.contains('open')){
        toc.classList.remove('open');
        toc.classList.add('collapsed');
        toc.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
        backdrop.setAttribute('aria-hidden', 'true');
        mobileToggle.focus();
      } else {
        toc.classList.add('collapsed');
      }
    }
  });

  // Mobile toggle click opens/closes off-canvas TOC
  mobileToggle.addEventListener('click', function(){
    const isOpen = !toc.classList.contains('open');
    toc.classList.toggle('open', isOpen);
    toc.classList.toggle('collapsed', !isOpen);
    toc.setAttribute('aria-hidden', String(!isOpen));
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    backdrop.style.display = isOpen ? 'block' : 'none';
    backdrop.setAttribute('aria-hidden', String(!isOpen));
    if(isOpen){
      const firstLink = list.querySelector('a');
      if(firstLink) firstLink.focus();
    } else {
      mobileToggle.focus();
    }
  });

  // Clicking backdrop closes TOC
  backdrop.addEventListener('click', function(){
    toc.classList.remove('open');
    toc.classList.add('collapsed');
    toc.setAttribute('aria-hidden', 'true');
    mobileToggle.setAttribute('aria-expanded', 'false');
    backdrop.style.display = 'none';
    backdrop.setAttribute('aria-hidden', 'true');
    mobileToggle.focus();
  });
});
