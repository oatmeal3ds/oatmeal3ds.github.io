// Oatmeal's Cave — layout.js
// Contains header and footer for all pages.
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
