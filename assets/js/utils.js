/* Utils: theme, router, clipboard, dom helpers */
(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Clipboard helper
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied');
    } catch (e) {
      console.error(e);
      alert('Copy failed');
    }
  }

  // Tiny toast
  function toast(message) {
    let el = document.createElement('div');
    el.textContent = message;
    el.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-3 py-2 rounded-md bg-black/80 text-white text-sm';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // Theme handling
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('dt_theme', theme);
  }
  function initTheme() {
    const saved = localStorage.getItem('dt_theme');
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  // Simple hash router
  const routes = ['home','prettifier','palette','sql-in','markdown','uuid','case','timestamp','json'];
  function setActiveRoute() {
    const hash = location.hash.replace('#/', '') || 'home';
    qsa('.route').forEach((s) => s.classList.add('hidden'));
    const target = qs(`#route-${hash}`);
    if (target) target.classList.remove('hidden');
    qsa('.nav-link').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const name = href.replace('#/', '');
      a.classList.toggle('active', name === hash);
    });
    // Close mobile menu on navigation
    const mobileMenu = qs('#mobileMenu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
  }

  function initRouter() {
    window.addEventListener('hashchange', setActiveRoute);
    if (!location.hash) location.hash = '#/home';
    setActiveRoute();
  }

  // Expose helpers
  window.$utils = { qs, qsa, copyText, toast, initTheme, applyTheme, initRouter, routes };
})();

