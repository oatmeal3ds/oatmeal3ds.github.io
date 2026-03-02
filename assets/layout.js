// Oatmeal's Cave — layout.js
// Edit this file to update the header/footer across the entire site.

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

// --- HEADER LOGIC ---
function oatHeader_Callback(html) {
  document.getElementById('site-header').innerHTML = html;

  const header   = document.getElementById('main-header');
  const hamburger = document.getElementById('hamburger');
  const navMenu  = document.getElementById('site-nav');
  const overlay  = document.getElementById('menu-overlay');
  const heroBg   = document.getElementById('hero-bg');

  // Active page highlight
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });

  // Hamburger toggle
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

  // Scroll — header + hero parallax
  window.addEventListener('scroll', () => {
    const val = window.scrollY;
    if (val > 50) header.classList.add('scrolled');
    else if (!navMenu.classList.contains('open')) header.classList.remove('scrolled');
    if (heroBg) heroBg.style.transform = `translateY(${val * 0.4}px)`;
  });
}

// --- FOOTER LOGIC ---
function oatFooter_Callback(text) {
  document.getElementById('site-footer').textContent = text;
}
// --- PROGRESS BAR ---
function mtnprogress_Callback(data) {
  if (data && data.length > 0) {
    const percent = data[0].progress;
    document.querySelector('.progress-fill').style.width = percent + '%';
    document.querySelector('.progress-text').textContent = 'Mountain Progress: ' + percent + '%';
  }
}
function loadOatProgress() {
  const script = document.createElement('script');
  script.src = `https://oatmeal3ds.github.io/assets/progress.js?t=${Date.now()}`;
  document.body.appendChild(script);
}
loadOatProgress();
