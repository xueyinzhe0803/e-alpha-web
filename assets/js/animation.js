/**
 * 页面动画效果脚本
 * 用于处理页面元素的入场动画效果
 * 使用 Intersection Observer API 实现性能优化的滚动动画
 */


(() => {
  const items = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();
