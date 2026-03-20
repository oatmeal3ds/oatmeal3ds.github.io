// OATSS 1.2 — Cave Scrolls Engine
// Modes: simple (home page widget) | complex (full news page)
// Usage:
//   Simple:  <div data-oatss="all" data-mode="simple" data-limit="3" data-age="week"></div>
//   Complex: <div data-oatss="all" data-mode="complex" data-paginate="5" data-search="true" data-filter="true"></div>

// --- MARKDOWN PARSER ---
function oatMD(text) {
  if (!text) return "";
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, lang, code) => {
    const safe = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<pre><code>${safe}</code></pre>`;
  });
  return text
    .replace(/^### (.*)$/gim, "<h3>$1</h3>")
    .replace(/^## (.*)$/gim, "<h2>$1</h2>")
    .replace(/^# (.*)$/gim, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/gim, "<b>$1</b>")
    .replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/gim, "$1<i>$2</i>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, "<a href='$2'>$1</a>")
    .replace(/^> (.*)$/gim, "<blockquote>$1</blockquote>")
    .replace(/(?:^- .+\n?)+/gim, match => {
      const items = match.trim().split("\n")
        .map(line => line.replace(/^- /, ""))
        .map(item => `<li>${item}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    })
    .replace(/\n{2,}/g, "<br><br>");
}

// --- DATE AGE FILTER ---
function oatAgeFilter(items, age) {
  if (!age) return items;
  const now = new Date();
  const days = { recent: 3, week: 7, month: 30, year: 365 };
  const cutoff = new Date(now - (days[age] || 7) * 86400000);
  return items.filter(item => {
    const d = new Date(item.dt || item.date || '');
    return !isNaN(d) && d >= cutoff;
  });
}

// --- MODAL (for complex mode) ---
(function() {
  const modal = document.createElement('div');
  modal.id = 'oatss-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.85);
    display:none;align-items:center;justify-content:center;
    padding:20px;z-index:99999;`;
  modal.innerHTML = `
    <div id="oatss-modal-content" style="
      background:#1c1c1c;border:1px solid #333;border-left:3px solid #2e4d22;
      max-width:800px;width:100%;padding:24px;
      max-height:90vh;overflow-y:auto;position:relative;">
      <button id="oatss-close" style="
        position:absolute;top:12px;right:12px;
        background:none;border:1px solid #333;color:#eee;
        padding:4px 10px;cursor:pointer;font-size:14px;">✕</button>
      <div id="oatss-modal-body" style="color:#eee;line-height:1.8;"></div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('oatss-close').addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
})();

function oatssOpenModal(post) {
  document.getElementById('oatss-modal-body').innerHTML = `
    <h2 style="margin-top:0;font-family:'Roboto',sans-serif;font-weight:100;letter-spacing:3px;">${post.t || post.title || ''}</h2>
    <p style="color:#777;font-size:0.8rem;margin-bottom:16px;">
      ${post.dt || post.date || ''}
      ${(post.c) ? '— ' + (Array.isArray(post.c) ? post.c.join(', ') : post.c) : ''}
    </p>
    ${oatMD(post.f || post.d || post.desc || '')}`;
  document.getElementById('oatss-modal').style.display = 'flex';
}

// --- MAIN CALLBACK ---
function oatSS_Callback(data) {
  window._oatssData = data;

  document.querySelectorAll('[data-oatss]').forEach(container => {
    const cat    = container.dataset.oatss;
    const mode   = container.dataset.mode || 'complex';
    const limit  = container.dataset.limit ? parseInt(container.dataset.limit) : null;
    const age    = container.dataset.age || null;
    const pag    = container.dataset.paginate ? parseInt(container.dataset.paginate) : null;
    const search = container.dataset.search === 'true';
    const filter = container.dataset.filter === 'true';

    // filter by category
    let items = (cat === 'all' || !cat)
      ? data
      : data.filter(item => {
          const cats = Array.isArray(item.c) ? item.c : (item.c ? [item.c] : []);
          return cats.includes(cat);
        });

    // filter by age
    if (age) items = oatAgeFilter(items, age);

    // limit
    if (limit) items = items.slice(0, limit);

    container.innerHTML = '';

    if (mode === 'simple') {
      renderSimple(container, items);
    } else {
      renderComplex(container, items, pag, search, filter);
    }
  });
}

// --- SIMPLE MODE ---
function renderSimple(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = '<p style="color:#777;">No scrolls yet.</p>';
    return;
  }
  items.forEach(item => container.appendChild(buildItem(item, false)));
}

// --- COMPLEX MODE ---
function renderComplex(container, data, paginate, showSearch, showFilter) {
  // search + filter bar
  if (showSearch || showFilter) {
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:8px;margin-bottom:15px;';
    if (showSearch) bar.innerHTML += `<input type="text" class="oatss-search" placeholder="Search scrolls..." style="flex-grow:1;">`;
    if (showFilter) bar.innerHTML += `
      <select class="oatss-filter">
        <option value="all">All</option>
        <option value="t">Title</option>
        <option value="d">Description</option>
      </select>`;
    container.appendChild(bar);

    const searchInput = container.querySelector('.oatss-search');
    const filterSelect = container.querySelector('.oatss-filter');

    function doSearch() {
      const query = searchInput ? searchInput.value.toLowerCase() : '';
      const field = filterSelect ? filterSelect.value : 'all';
      container.querySelectorAll('.news-item').forEach(item => {
        const t = item.querySelector('.news-link')?.textContent.toLowerCase() || '';
        const d = item.querySelector('.news-desc')?.textContent.toLowerCase() || '';
        let match = false;
        if (field === 'all') match = t.includes(query) || d.includes(query);
        if (field === 't') match = t.includes(query);
        if (field === 'd') match = d.includes(query);
        item.style.display = (!query || match) ? '' : 'none';
      });
    }

    if (searchInput) searchInput.addEventListener('input', doSearch);
    if (filterSelect) filterSelect.addEventListener('change', doSearch);
  }

  const feed = document.createElement('div');
  feed.className = 'oatss-feed';
  container.appendChild(feed);
  renderItems(feed, data, paginate);
}

// --- PAGINATED ITEMS ---
function renderItems(feed, data, paginate) {
  if (!data || data.length === 0) {
    feed.innerHTML = '<p style="color:#777;">No scrolls yet.</p>';
    return;
  }

  if (paginate) {
    let page = 1;
    const totalPages = Math.ceil(data.length / paginate);

    function renderPage(p) {
      page = p;
      const slice = data.slice((p - 1) * paginate, p * paginate);
      feed.innerHTML = '';
      slice.forEach(item => feed.appendChild(buildItem(item, true)));

      const pg = document.createElement('div');
      pg.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;';

      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '&#8249;';
      if (p === 1) { prevBtn.disabled = true; prevBtn.style.opacity = '0.4'; }
      prevBtn.addEventListener('click', () => renderPage(page - 1));
      pg.appendChild(prevBtn);

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === p) { btn.style.background = '#fdd835'; btn.style.color = '#111'; }
        btn.addEventListener('click', () => renderPage(i));
        pg.appendChild(btn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '&#8250;';
      if (p === totalPages) { nextBtn.disabled = true; nextBtn.style.opacity = '0.4'; }
      nextBtn.addEventListener('click', () => renderPage(page + 1));
      pg.appendChild(nextBtn);

      feed.appendChild(pg);
    }

    renderPage(1);
  } else {
    data.forEach(item => feed.appendChild(buildItem(item, true)));
  }
}

// --- BUILD ITEM ---
function buildItem(item, allowExpand) {
  const div = document.createElement('div');
  div.className = 'news-item';
  const cats = Array.isArray(item.c) ? item.c : (item.c ? [item.c] : []);
  const url = item.u || item.url || '';
  div.innerHTML = `
    <span class="news-date">${item.dt || item.date || ''}</span>
    <a href="${url}" target="_blank" class="news-link">
      ${item.t || item.title || 'Untitled'}
      ${url ? '<i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem;margin-left:5px;"></i>' : ''}
    </a>
    <p class="news-desc">${item.d || item.desc || ''}</p>
    ${cats.length ? `<p style="font-size:0.75rem;color:#555;margin:4px 0 0;">${cats.join(' · ')}</p>` : ''}
    ${(allowExpand && item.f) ? `<button class="oatss-expand" style="margin-top:6px;font-size:11px;padding:2px 10px;">Read More</button>` : ''}`;

  if (allowExpand && item.f) {
    div.querySelector('.oatss-expand').addEventListener('click', () => oatssOpenModal(item));
  }
  return div;
}
