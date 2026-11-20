(() => {
  'use strict';

  const projectRoot = new URL('../../', document.currentScript.src);

  // Как в проекте кикбоксинга: заменяем mount-point готовым HTML.
  async function mount(id, url) {
    const target = document.getElementById(id);
    if (!target || !target.dataset.include) return;

    try {
      const componentUrl = new URL(url.replace(/^\//, ''), projectRoot);
      componentUrl.searchParams.set('v', 'header4');
      const response = await fetch(componentUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      target.insertAdjacentHTML('beforebegin', await response.text());
      target.remove();
    } catch (error) {
      console.warn(`Не удалось загрузить компонент ${id}:`, error);
      return null;
    }
  }

  function initHeader() {
    const header = document.querySelector('.header');
    if (!header || header.dataset.initialized === 'true') return;
    header.dataset.initialized = 'true';
    const burger = header.querySelector('.header__burger');
    const menu = header.querySelector('.mobile-menu');
    const events = header.querySelector('.header__events');
    const search = header.querySelector('.header__search');
    const desktop = window.matchMedia('(min-width: 1181px)');
    // Как в Landshaft Park: вниз — скрываем, вверх — показываем.
    let lastScrollY = Math.max(window.scrollY, 0);
    let ticking = false;
    const updateScroll = () => {
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastScrollY;
      if (header.classList.contains('is-active') || document.getElementById('site-search')?.open || y <= 12) {
        header.classList.remove('is-hidden');
      } else if (Math.abs(delta) >= 6) {
        header.classList.toggle('is-hidden', delta > 0);
        if (delta > 0 && events) events.open = false;
      }
      if (Math.abs(delta) >= 6 || y <= 12) lastScrollY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScroll);
    }, { passive: true });


    function closeEvents() {
      if (events) events.open = false;
    }

    // Механика полноэкранного меню перенесена из проекта кикбоксинга.
    function setMenu(open) {
      if (!burger || !menu) return;
      header.classList.toggle('is-active', open);
      if (open) header.classList.remove('is-hidden');
      document.body.classList.toggle('menu-open', open || Boolean(document.getElementById('site-search')?.open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      if (!open) closeEvents();
    }

    burger?.addEventListener('click', () => setMenu(!header.classList.contains('is-active')));
    desktop.addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
    menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

    function markCurrent() {
      const current = window.location;
      header.querySelectorAll('.header__nav a, .mobile-menu__nav a').forEach((link) => {
        const url = new URL(link.href);
        const active = url.pathname === current.pathname &&
          (url.hash === current.hash || (!current.hash && url.hash === '#trainers'));
        link.classList.toggle('is-current', active);
        if (active) link.setAttribute('aria-current', url.hash ? 'location' : 'page');
        else link.removeAttribute('aria-current');
      });
      if (events) events.classList.toggle('is-current', Boolean(events.querySelector('.is-current')));
    }

    markCurrent();
    window.addEventListener('hashchange', markCurrent);
    document.addEventListener('click', (event) => {
      if (events && !events.contains(event.target)) closeEvents();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || document.getElementById('site-search')?.open) return;
      if (events?.open) {
        closeEvents();
        events.querySelector('summary').focus();
      } else if (header.classList.contains('is-active')) {
        setMenu(false);
        burger?.focus();
      }
    });

    // Поиск запускается независимо от наличия кнопки и разметки мобильного меню.
    initSearch(search, () => setMenu(false));
  }

  function initSearch(trigger, closeMenu) {
    const dialog = document.getElementById('site-search');
    if (!dialog || !trigger) return;
    const input = dialog.querySelector('.site-search__input');
    const summary = dialog.querySelector('.site-search__summary');
    const links = [...dialog.querySelectorAll('.site-search__results a')];
    const normalize = (value) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();

    function filter() {
      const words = normalize(input.value).split(/\s+/).filter(Boolean);
      let count = 0;
      links.forEach((link) => {
        const text = normalize(`${link.textContent} ${link.dataset.keywords || ''}`);
        link.hidden = !words.every((word) => text.includes(word));
        if (!link.hidden) count += 1;
      });
      summary.textContent = words.length ? (count ? `Найдено разделов: ${count}` : 'Ничего не найдено') : 'Все разделы сайта';
    }

    function closeSearch() {
      dialog.close();
      document.body.classList.remove('menu-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    trigger.addEventListener('click', () => {
      closeMenu();
      input.value = '';
      filter();
      dialog.showModal();
      trigger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      input.focus();
    });
    input.addEventListener('input', filter);
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeSearch();
    });
    dialog.querySelector('.site-search__close').addEventListener('click', () => closeSearch());
    dialog.addEventListener('click', (event) => {
      if (event.target.closest('.site-search__results a')) closeSearch();
      else if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSearch();
      }
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('menu-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    });
  }

  // Как в кикбоксинге: загрузка компонентов независима, поиск header после вставки.
  // Live Server открывает HTML из /public/, Express использует канонические адреса.
  function resolvePreviewLinks() {
    const previewRoot = new URL('public/', projectRoot);
    if (!location.pathname.startsWith(previewRoot.pathname)) return;
    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      const url = new URL(link.getAttribute('href'), location.origin);
      if (url.origin !== location.origin || !/^\/(?:[a-z0-9-]+)?$/.test(url.pathname)) return;
      const name = url.pathname === '/' ? 'index' : url.pathname.slice(1);
      const target = new URL(`${name}.html`, previewRoot);
      target.search = url.search;
      target.hash = url.hash;
      link.href = target.href;
    });
  }

  function init() {
    resolvePreviewLinks();
    if (document.querySelector('.header')) initHeader();
    else mount('site-header', '/components/header.html').then(initHeader);
    if (!document.querySelector('footer.footer')) mount('site-footer', '/components/footer.html');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
