/* ============================================
   TrailNest — theme toggle (light/dark)
   Applies the saved theme immediately (before
   paint) to avoid a flash of the wrong theme, and
   wires up any button with [data-theme-toggle].
   Uses the data-theme="light" attribute on <html>,
   matching the [data-theme="light"] rules in
   styles.css.
   ============================================ */
(function () {
  try {
    const saved = localStorage.getItem('tn_theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    // localStorage unavailable (privacy mode, some file:// setups) — default to dark
  }
})();

function initThemeToggle() {
  const btns = document.querySelectorAll('[data-theme-toggle]');
  function updateIcons() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btns.forEach(function (btn) {
      btn.innerHTML = isLight
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
    });
  }
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      try {
        if (isLight) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('tn_theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('tn_theme', 'light');
        }
      } catch (e) {
        // Storage write failed — theme still switches visually for this session
        if (isLight) document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', 'light');
      }
      updateIcons();
    });
  });
  updateIcons();
}

document.addEventListener('DOMContentLoaded', initThemeToggle);

// If this page was opened by double-clicking the file (file:// protocol),
// warn visibly: some browsers isolate localStorage per file under file://,
// so data saved on one page (e.g. a published blog post, a submitted
// booking) won't show up on another page. Serving the folder with a
// simple local server (see README) fixes this completely.
document.addEventListener('DOMContentLoaded', function () {
  if (window.location.protocol !== 'file:') return;
  const bar = document.createElement('div');
  bar.style.cssText = 'background:#F2A34B; color:#1a1409; font-family:Inter,sans-serif; font-size:13.5px; text-align:center; padding:10px 16px; position:relative; z-index:200;';
  bar.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> You\'re opening this file directly. Some browsers won\'t share saved data (posts, bookings, messages) between pages this way — run a local server instead (see README) for everything to work.';
  document.body.insertBefore(bar, document.body.firstChild);
});
