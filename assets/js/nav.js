/* nav.js — 导航/页脚加载 + 交互 + 图标修复（完整可替换版） */
(function () {
  'use strict';

  /** ========== 小工具 ========== */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const fetchText = async (url) => {
    const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) throw new Error(`${res.status} @ ${url}`);
    return res.text();
  };

  // 按顺序尝试多个 url，全部失败抛错
  const fetchFirst = async (candidates) => {
    let lastErr;
    for (const u of candidates) {
      try { return await fetchText(u); } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('No candidate url succeeded');
  };

  // 把一段 HTML 字符串插入到某个容器
  const mountHTML = (container, html) => {
    container.innerHTML = html;
  };

  // 如果没有占位容器，则把 html 注入到 <body> 开头
  const mountAtBodyTop = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    const frag = document.createDocumentFragment();
    Array.from(tmp.childNodes).forEach(n => frag.appendChild(n));
    document.body.insertBefore(frag, document.body.firstChild);
  };

  /** ========== 兜底模板（最小可用） ========== */
  function fallbackNav() {
    // 注意：这里的 Facebook path 已经是 fill="currentColor"
    return `
<header class="main-header" role="banner" aria-label="Site header">
  <div class="header-container">
    <a href="index.html" class="brand" aria-label="E-ALPHA Home">
      <span class="brand-text">E-ALPHA</span>
    </a>

    <button class="mobile-menu-toggle" aria-label="Open menu" aria-expanded="false">
      <span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span>
    </button>

    <nav class="nav-menu" role="navigation" aria-label="Primary">
      <a href="index.html" class="nav-item">Home</a>
      <a href="products.html" class="nav-item">Products</a>
      <a href="instant-quote.html" class="nav-item">Quote</a>
      <a href="contact.html" class="nav-item">Contact</a>
      <a href="download.html" class="nav-item">Download</a>
    </nav>

  </div>
</header>
<div class="menu-backdrop" hidden></div>`;
  }

  function fallbackFooter() {
    const y = new Date().getFullYear();
    return `
<footer class="site-footer">
  <div class="footer-bottom">
    <div class="footer-container footer-bottom-row">
      <p class="copyright">© <span id="year">${y}</span> E-Alpha</p>
      <a class="footer-link" href="privacy-policy.html">Privacy Policy</a>
      <p class="foot-mail"><a href="mailto:info@e-alpha.co.nz">info@e-alpha.co.nz</a></p>
    </div>
  </div>
</footer>`;
  }

  /** ========== 加载部分（nav/footer） ========== */
  async function loadNav() {
    // 如果页面已经有 .main-header，就不重复注入，只做交互初始化
    if ($('.main-header')) return;

    const holder = document.getElementById('header-placeholder');
    const candidates = ['partials/nav.html', 'nav.html']; // 相对路径更稳
    try {
      const html = await fetchFirst(candidates);
      if (holder) { mountHTML(holder, html); }
      else { mountAtBodyTop(html); }
    } catch (e) {
      console.warn('[nav] load failed, using fallback:', e);
      if (holder) mountHTML(holder, fallbackNav());
      else mountAtBodyTop(fallbackNav());
    }
  }

  async function loadFooter() {
    if ($('.site-footer')) return;
    const holder = document.getElementById('footer-placeholder');
    const candidates = ['partials/footer.html', 'footer.html'];
    try {
      const html = await fetchFirst(candidates);
      if (holder) mountHTML(holder, html);
      else document.body.insertAdjacentHTML('beforeend', html);
    } catch (e) {
      console.warn('[footer] load failed, using fallback:', e);
      const html = fallbackFooter();
      if (holder) mountHTML(holder, html);
      else document.body.insertAdjacentHTML('beforeend', html);
    }
  }

  /** ========== 交互 ========== */
  function initMobileMenu(root = document) {
    const header = $('.main-header', root) || root;
    const toggle = $('.mobile-menu-toggle', header);
    const menu = $('.nav-menu', header);
    let backdrop = $('.menu-backdrop', document);

    if (!toggle || !menu) {
      console.warn('[nav] Mobile menu elements not found:', { toggle, menu, header });
      return;
    }

    console.log('[nav] Mobile menu elements found:', { toggle, menu, header });

    // 检查所有导航链接
    const navLinks = $$('.nav-menu a', header);
    console.log('[nav] Found navigation links:', navLinks.map(a => ({ href: a.href, text: a.textContent })));

    // 检查菜单的初始状态
    console.log('[nav] Menu initial classes:', menu.className);
    console.log('[nav] Menu initial transform:', window.getComputedStyle(menu).transform);
    console.log('[nav] Menu initial display:', window.getComputedStyle(menu).display);
    console.log('[nav] Menu initial position:', window.getComputedStyle(menu).position);

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'menu-backdrop';
      backdrop.hidden = true;
      document.body.appendChild(backdrop);
    }

    const setOpen = (open) => {
      console.log('[nav] Setting menu open state to:', open);

      if (open) {
        menu.classList.add('mobile-open');
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        if (backdrop) {
          backdrop.classList.add('open');
          backdrop.hidden = false;
        }
      } else {
        menu.classList.remove('mobile-open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (backdrop) {
          backdrop.classList.remove('open');
          backdrop.hidden = true;
        }
      }

      console.log('[nav] Menu classes after:', menu.className);
      console.log('[nav] Menu computed style transform:', window.getComputedStyle(menu).transform);
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = menu.classList.contains('mobile-open');
      console.log('[nav] Mobile menu toggle clicked, current state:', isOpen);
      console.log('[nav] About to set menu state to:', !isOpen);
      setOpen(!isOpen);
    }, true); // 使用捕获阶段
    // —— 替换开始 ——
    // 点击菜单里的链接：先收起抽屉，再可靠跳转（使用属性 href，避免被解析成绝对地址后的判断误差）
    $$('.nav-menu a', header).forEach(a => {
      a.addEventListener('click', (e) => {
        const hrefAttr = a.getAttribute('href')?.trim() || '';
        const target = a.getAttribute('target') || '_self';

        console.log('[nav] Link clicked:', { hrefAttr, target });

        // 关闭抽屉
        setOpen(false);

        // 1) 空/占位链接：仅收起抽屉，不跳
        if (!hrefAttr || hrefAttr === '#') {
          e.preventDefault();
          return;
        }

        // 2) 新窗口（如外链 target="_blank"、mailto 等）：让浏览器自己处理
        if (target === '_blank' || hrefAttr.startsWith('mailto:') || hrefAttr.startsWith('tel:')) {
          // 不阻止默认行为
          return;
        }

        // 3) 同窗口跳转：我们手动执行，避免被其他脚本意外拦截
        e.preventDefault();
        // 给 120ms 动画时间再跳（避免动画被页面卸载中断）
        setTimeout(() => {
          // 用属性值（相对路径）跳，等价于你手点链接
          window.location.assign(hrefAttr);
        }, 120);
      }, { passive: false });
    });
    // —— 替换结束 ——

    backdrop && backdrop.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (innerWidth > 900) setOpen(false); });
  }

  function initDropdowns(root = document) {
    $$('.dropdown', root).forEach(dd => {
      const btn = $('.nav-link', dd);
      const menu = $('.dropdown-menu', dd);
      if (!btn || !menu) return;

      const set = (v) => {
        dd.classList.toggle('open', v);
        btn.setAttribute('aria-expanded', String(v));
      };

      // 桌面：hover
      dd.addEventListener('mouseenter', () => { if (innerWidth > 900) set(true); });
      dd.addEventListener('mouseleave', () => { if (innerWidth > 900) set(false); });
      // 移动端：点击折叠
      btn.addEventListener('click', (e) => {
        if (innerWidth <= 900) {
          e.preventDefault();
          set(!dd.classList.contains('open'));
        }
      });
    });
  }

  function initScrollEffect() {
    const hd = $('.main-header');
    if (!hd) return;
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      hd.classList.toggle('scrolled', y > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /** ========== 初始化入口 ========== */
  async function boot() {
    console.log('[nav] Starting initialization...');
    await Promise.all([loadNav(), loadFooter()]);
    // 注入完成后再做初始化与修复
    console.log('[nav] Initializing mobile menu...');
    initMobileMenu(document);
    initDropdowns(document);
    initScrollEffect();
    console.log('[nav] Initialization complete');
  }

  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', boot, { once: true })
    : boot();
})();


