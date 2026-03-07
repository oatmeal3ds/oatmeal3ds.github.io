// 1. DEFINE all callbacks first
function mtnprogress_Callback(data) {
  if (data && data.length > 0) {
    const percent = data[0].progress;
    document.querySelector('.progress-fill').style.width = percent + '%';
    document.querySelector('.progress-text').textContent = 'Mountain Progress: ' + percent + '%';
  }
}

function oatHeader_Callback(html) {
  document.getElementById('site-header').innerHTML = html;

  // Inject progress bar after hero
  const progress = document.createElement('div');
  progress.className = 'progress-container';
  progress.innerHTML = `
    <div class="progress-fill"></div>
    <div class="progress-text">Mountain Progress: 0%</div>`;
  document.querySelector('.hero').after(progress);

  // Load progress data
  const progressScript = document.createElement('script');
  progressScript.src = `https://oatmeal3ds.github.io/assets/progress.js?t=${Date.now()}`;
  document.body.appendChild(progressScript);

  const header    = document.getElementById('main-header');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('site-nav');
  const overlay   = document.getElementById('menu-overlay');
  const heroBg    = document.getElementById('hero-bg');

  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('is-active');
    overlay.classList.toggle('active');
    if (isOpen) {
      header.classList.add('menu-active');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      if (window.scrollY <= 20) header.classList.remove('menu-active');
    }
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) toggleMenu();
    });
  });

  window.addEventListener('scroll', () => {
    const val = window.scrollY;
    if (val > 50) header.classList.add('scrolled');
    else if (!navMenu.classList.contains('open')) header.classList.remove('scrolled');
    if (heroBg) heroBg.style.transform = `translateY(${val * 0.4}px)`;
  });
}
// --- FAVICON ---
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'https://github.com/oatmeal3ds.png';
document.head.appendChild(favicon);

// --- TITLE ---
const SITE_NAME = "Oatmeal's Cave";
document.title = document.title + ' — ' + SITE_NAME;

function oatFooter_Callback(text) {
  document.getElementById('site-footer').textContent = text;
}

// 2. CALL them after
oatHeader_Callback(`
  <header class="site-header" id="main-header">
    <a href="/" class="brand">
      <img src="https://github.com/oatmeal3ds.png" alt="Logo">
      <span>Oatmeal's Cave</span>
    </a>
    <div class="hamburger" id="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <nav class="site-nav" id="site-nav">
      <a href="/" class="nav-link">Home</a>
      <a href="/projects" class="nav-link">Projects</a>
      <a href="/news" class="nav-link">Cave Scrolls</a>
    </nav>
  </header>
`);

oatFooter_Callback(`© Oatmeal Plays — Made by Oatmeal Plays, Maintained by a bunch of mountain air and pixelated cats.`);

function initCodeBlocks() {
  document.querySelectorAll('pre').forEach(pre => {
    const header = document.createElement('div');
    header.className = 'pre-header';
    const btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.style.cssText = 'padding:2px 10px;font-size:11px;';
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    });
    header.appendChild(btn);
    pre.prepend(header);
  });
}
initCodeBlocks();
const gcScript = document.createElement('script');
gcScript.dataset.goatcounter = 'https://oatmeal3ds.goatcounter.com/count';
gcScript.async = true;
gcScript.src = 'https://gc.zgo.at/count.js';
document.head.appendChild(gcScript);
