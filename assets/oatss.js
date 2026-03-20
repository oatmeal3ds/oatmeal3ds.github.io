// OATSS 1.2 — Cave Scrolls Engine
// Load this on any page that needs news, then load news.js

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

// --- MODAL ---
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
    <h2 style="margin-top:0;font-family:'Roboto',sans-serif;font-weight:100;letter-spacing:3px;">${post.t}</h2>
    <p style="color:#777;font-size:0.8rem;margin-bottom:16px;">${post.dt} ${Array.isArray(post.c) ? '— ' + post.c.join(', ') : post.c ? '— ' + post.c : ''}</p>
    ${oatMD(post.f || post.d)}`;
  document.getElementById('oatss-modal').style.display = 'flex';
}

// --- RENDERER ---
function oatSS_Callback(data) {
  window._oatssData = data;

  // find all feed containers on the page
  document.querySelectorAll('[data-oatss]').forEach(container => {
    const cat = container.dataset.oatss;
    const limit = container.dataset.limit ? parseInt(container.dataset.limit) : null;
    const paginate = container.dataset.paginate ? parseInt(container.dataset.paginate) : null;
    const showSearch = container.dataset.search === 'true';
    const showFilter = container.dataset.filter === 'true';

    // filter by category
    let filtered = cat === 'all' || !cat
      ? data
      : data.filter(item => {
          const cats = Array.isArray(item.c) ? item.c : [item.c];
          return cats.includes(cat);
        });

    // limit
    if (limit) filtered = filtered.slice(0, limit);

    renderFeed(container, filtered, paginate, showSearch, showFilter);
  });
}

function renderFeed(container, data, paginate, showSearch, showFilter) {
  container.innerHTML = '';

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
    const feed = document.createElement('div');
    feed.className = 'oatss-feed';
    container.appendChild(feed);

    function doSearch() {
      const query = searchInput ? searchInput.value.toLowerCase() : '';
      const field = filterSelect ? filterSelect.value : 'all';
      feed.querySelectorAll('.news-item').forEach(item => {
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

    renderItems(feed, data, paginate);
  } else {
    const feed = document.createElement('div');
    feed.className = 'oatss-feed';
    container.appendChild(feed);
    renderItems(feed, data, paginate);
  }
}

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
      slice.forEach(item => feed.appendChild(buildItem(item)));

      // pagination controls
      const pg = document.createElement('div');
      pg.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap;';
      pg.innerHTML = `<button onclick="void(0)" ${p === 1 ? 'disabled style="opacity:0.4"' : ''}>&#8249;</button>`;
      for (let i = 1; i <= totalPages; i++) {
        pg.innerHTML += `<button style="${i === p ? 'background:#fdd835;color:#111;' : ''}">${i}</button>`;
      }
      pg.innerHTML += `<button ${p === totalPages ? 'disabled style="opacity:0.4"' : ''}>&#8250;</button>`;
      feed.appendChild(pg);

      // wire buttons
      const btns = pg.querySelectorAll('button');
      btns[0].addEventListener('click', () => renderPage(page - 1));
      btns[btns.length - 1].addEventListener('click', () => renderPage(page + 1));
      const numbered = Array.from(btns).slice(1, -1);
      numbered.forEach((btn, i) => btn.addEventListener('click', () => renderPage(i + 1)));
    }

    renderPage(1);
  } else {
    data.forEach(item => feed.appendChild(buildItem(item)));
  }
}

function buildItem(item) {
  const div = document.createElement('div');
  div.className = 'news-item';
  const cats = Array.isArray(item.c) ? item.c : (item.c ? [item.c] : []);
  div.innerHTML = `
    <span class="news-date">${item.dt || item.date || ''}</span>
    <a href="${item.u || item.url || '#'}" target="_blank" class="news-link">
      ${item.t || item.title || 'Untitled'}
      <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem;margin-left:5px;"></i>
    </a>
    <p class="news-desc">${item.d || item.desc || ''}</p>
    ${cats.length ? `<p style="font-size:0.75rem;color:#555;margin:4px 0 0;">${cats.join(' · ')}</p>` : ''}
    ${item.f ? `<button class="oatss-expand" style="margin-top:6px;font-size:11px;padding:2px 10px;">Read More</button>` : ''}`;

  if (item.f) {
    div.querySelector('.oatss-expand').addEventListener('click', () => oatssOpenModal(item));
  }
  return div;
}
