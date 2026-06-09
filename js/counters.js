/* ============================================================
   ALG — Animated Number Counters
   ============================================================ */

(function () {
  'use strict';

  let hasRun = false;

  function formatNumber(value, format) {
    if (format === 'compact') {
      if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
      if (value >= 1000)    return (value / 1000).toFixed(0) + 'K';
    }
    return Math.round(value).toLocaleString();
  }

  function startCounters() {
    if (hasRun) return;
    hasRun = true;

    document.querySelectorAll('.counter').forEach((el) => {
      const target   = parseFloat(el.dataset.target) || 0;
      const duration = parseFloat(el.dataset.duration) || 2;
      const format   = el.dataset.format || '';

      const startTime = performance.now();

      function tick(now) {
        const elapsed  = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        el.textContent = formatNumber(current, format);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = formatNumber(target, format);
        }
      }

      requestAnimationFrame(tick);
    });
  }

  // Expose so scroll-animations.js can call it
  window.ALGCounters = { start: startCounters };

  // Fallback: if IntersectionObserver available, trigger on own
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            startCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.getElementById('stats');
    if (statsSection) observer.observe(statsSection);
  }

})();
