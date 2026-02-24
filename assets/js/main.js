// 轮播切换
(function () {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  let index = 0;

  function setActive(i) {
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === i);
    });
    carousel.dataset.activeIndex = String(i);
  }

  function go(step) {
    index = (index + step + slides.length) % slides.length;
    setActive(index);
  }

  prev && prev.addEventListener('click', () => go(-1));
  next && next.addEventListener('click', () => go(1));

  // 自动轮播（可选）
  let timer = setInterval(() => go(1), 6000);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => timer = setInterval(() => go(1), 6000));

  // 初始状态
  setActive(0);
})();

// "Shop All Categories" 下拉
(function () {
  const wrapper = document.querySelector('.all-categories');
  if (!wrapper) return;
  const toggle = wrapper.querySelector('.categories-toggle');
  toggle.addEventListener('click', () => {
    const isOpen = wrapper.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// 移动端Burger菜单功能 - 已禁用，由nav.js处理
(function () {
  // 禁用此功能，因为nav.js已经处理了移动端菜单
  return;

  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navSections = document.querySelector('.nav-sections');
  const body = document.body;

  if (!mobileMenuToggle || !navSections) return;

  // 切换菜单状态
  function toggleMobileMenu() {
    const isOpen = navSections.classList.contains('mobile-menu-open');

    if (isOpen) {
      // 关闭菜单
      navSections.classList.remove('mobile-menu-open');
      mobileMenuToggle.classList.remove('active');
      body.style.overflow = ''; // 恢复页面滚动
    } else {
      // 打开菜单
      navSections.classList.add('mobile-menu-open');
      mobileMenuToggle.classList.add('active');
      body.style.overflow = 'hidden'; // 防止页面滚动
    }
  }

  // Burger按钮点击事件
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);

  // 点击菜单项后关闭菜单
  const navItems = navSections.querySelectorAll('.nav-item a, .dropdown-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navSections.classList.remove('mobile-menu-open');
      mobileMenuToggle.classList.remove('active');
      body.style.overflow = '';
    });
  });

  // 窗口大小改变时处理菜单状态
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      // 大屏幕时重置菜单状态
      navSections.classList.remove('mobile-menu-open');
      mobileMenuToggle.classList.remove('active');
      body.style.overflow = '';
    }
  });

  // ESC键关闭菜单
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navSections.classList.contains('mobile-menu-open')) {
      toggleMobileMenu();
    }
  });
})();

