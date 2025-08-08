// App boot: theme toggle, mobile menu, router init, copy buttons
(function () {
  const { qs, qsa, initTheme, applyTheme, initRouter, copyText } = window.$utils;

  function onReady() {
    initTheme();
    initRouter();

    // Theme toggle
    const themeBtn = qs('#themeToggle');
    themeBtn?.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    });

    // Mobile menu
    const mobileBtn = qs('#mobileMenuBtn');
    const mobileMenu = qs('#mobileMenu');
    mobileBtn?.addEventListener('click', () => {
      mobileMenu?.classList.toggle('hidden');
    });

    // Generic copy buttons
    qsa('[data-copy-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-copy-target');
        const field = sel ? qs(sel) : null;
        if (field) copyText(field.value || field.textContent || '');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();

