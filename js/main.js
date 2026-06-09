/* ============================================================
   ALG — Main Application Logic
   Navbar · Mobile menu · Loader · Tabs · Slider · Form
   ============================================================ */

(function () {
  'use strict';

  /* ── Loader ─────────────────────────────────────────────────── */
  (function initLoader() {
    const loader = document.getElementById('loader');
    const fill   = document.getElementById('loader-fill');
    if (!loader) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => loader.classList.add('hidden'), 300);
      }
      if (fill) fill.style.width = Math.min(progress, 100) + '%';
    }, 80);

    // Force hide after 3s regardless
    setTimeout(() => loader.classList.add('hidden'), 3000);
  })();

  /* ── Navbar ─────────────────────────────────────────────────── */
  (function initNavbar() {
    const navbar   = document.getElementById('navbar');
    const toggle   = document.getElementById('nav-toggle');
    const menu     = document.getElementById('nav-menu');
    if (!navbar || !toggle || !menu) return;

    // Scroll state handled by GSAP ScrollTrigger in scroll-animations.js
    // Fallback if GSAP not loaded
    if (typeof ScrollTrigger === 'undefined') {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
      }, { passive: true });
    }

    // Mobile menu toggle
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    menu.querySelectorAll('.nav-link, .btn').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') && !navbar.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  })();

  /* ── Active nav link on scroll ──────────────────────────────── */
  (function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link');
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  })();

  /* ── Technology Tabs ─────────────────────────────────────────── */
  (function initTabs() {
    const tabBtns   = document.querySelectorAll('.tab-btn');
    const tabPanes  = document.querySelectorAll('.tab-pane');
    if (!tabBtns.length) return;

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        tabBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanes.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const pane = document.getElementById('tab-' + target);
        if (pane) pane.classList.add('active');
      });
    });
  })();

  /* ── Testimonials Slider ─────────────────────────────────────── */
  (function initSlider() {
    const track  = document.getElementById('testimonials-track');
    const prev   = document.getElementById('slider-prev');
    const next   = document.getElementById('slider-next');
    const dotsEl = document.getElementById('slider-dots');
    if (!track || !prev || !next) return;

    const cards     = track.querySelectorAll('.testimonial-card');
    const count     = cards.length;
    let   current   = 0;
    let   autoTimer = null;

    // Build dots
    const dots = [];
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className  = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
      dots.push(dot);
    });

    function goTo(index) {
      current = (index + count) % count;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prev.addEventListener('click', () => { resetAuto(); goTo(current - 1); });
    next.addEventListener('click', () => { resetAuto(); goTo(current + 1); });

    // Auto-advance
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    resetAuto();

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        resetAuto();
        goTo(diff > 0 ? current + 1 : current - 1);
      }
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (document.activeElement.closest('#testimonials')) {
        if (e.key === 'ArrowLeft')  { resetAuto(); goTo(current - 1); }
        if (e.key === 'ArrowRight') { resetAuto(); goTo(current + 1); }
      }
    });
  })();

  /* ── Contact Form ─────────────────────────────────────────────── */
  (function initForm() {
    const form    = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      let valid = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const empty = !field.value.trim();
        field.style.borderColor = empty ? '#ff4444' : '';
        if (empty) valid = false;
      });

      if (!valid) return;

      // Simulate form submission (replace with real endpoint)
      const btn = form.querySelector('[type="submit"]');
      btn.disabled    = true;
      btn.textContent = 'Sending…';

      setTimeout(() => {
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        form.reset();
        btn.disabled    = false;
        btn.innerHTML   = 'Send Message <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
      }, 1400);
    });

    // Live field validation feedback
    form.querySelectorAll('[required]').forEach((field) => {
      field.addEventListener('blur', () => {
        field.style.borderColor = field.value.trim() ? '' : '#ff4444';
      });
      field.addEventListener('input', () => {
        if (field.value.trim()) field.style.borderColor = '';
      });
    });
  })();

  /* ── Smooth scroll for anchor links ─────────────────────────── */
  (function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();

        if (window.algLenis) {
          window.algLenis.scrollTo(target, { offset: -80, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  })();

  /* ── Reveal observer fallback (if GSAP not loaded) ───────────── */
  (function initRevealFallback() {
    if (typeof gsap !== 'undefined') return; // GSAP handles it

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right, .stat-card, .service-card, .team-card'
    ).forEach((el) => observer.observe(el));
  })();

  /* ── Prevent FOUC on nav active link ────────────────────────── */
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('mouseenter', () => link.style.opacity = '1');
    link.addEventListener('mouseleave', () => link.style.opacity = '');
  });

})();
