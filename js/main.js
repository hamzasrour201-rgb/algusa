/* ══════════════════════════════════════════════════════════════
   American Logistics Group — Main Script (single, lightweight)
   Nav · reveals · counters · tabs · slider · form
   No dependencies. Deferred. ~5KB.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── 1. Sticky navbar on scroll ───────── */
  const navbar = $('#navbar');
  const onScroll = () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ───────── 2. Mobile menu ───────── */
  const toggle = $('#nav-toggle');
  const menu = $('#nav-menu');
  let backdrop = null;

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        backdrop.addEventListener('click', () => setMenu(false));
        document.body.appendChild(backdrop);
      }
      requestAnimationFrame(() => backdrop.classList.add('show'));
    } else if (backdrop) {
      backdrop.classList.remove('show');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () =>
      setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  }
  if (menu) {
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  // Close menu if resized up to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenu(false);
  });

  /* ───────── 3. Active nav link via scroll spy ───────── */
  const navLinks = $$('.nav-link');
  const spyMap = navLinks
    .map((a) => {
      const id = a.getAttribute('href');
      return id && id.startsWith('#') ? { a, sec: $(id) } : null;
    })
    .filter((x) => x && x.sec);

  if (spyMap.length && 'IntersectionObserver' in window) {
    const spyObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const id = '#' + en.target.id;
            navLinks.forEach((a) =>
              a.classList.toggle('active', a.getAttribute('href') === id));
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    spyMap.forEach(({ sec }) => spyObs.observe(sec));
  }

  /* ───────── 4. Reveal on scroll ───────── */
  const reveals = $$('[data-r]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const revObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            obs.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    reveals.forEach((el) => revObs.observe(el));
  }

  /* ───────── 5. Animated counters ───────── */
  function formatNum(val, compact) {
    if (compact) {
      if (val >= 1000) {
        const k = val / 1000;
        return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(0)) + 'K';
      }
    }
    return Math.round(val).toLocaleString('en-US');
  }

  function runCounter(el) {
    const target = parseFloat(el.dataset.count) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const compact = el.hasAttribute('data-compact');
    if (reduceMotion) {
      el.textContent = prefix + formatNum(target, compact) + suffix;
      return;
    }
    const dur = 1600;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + formatNum(target * eased, compact) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + formatNum(target, compact) + suffix;
    }
    requestAnimationFrame(frame);
  }

  const counters = $$('.hstat-num[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      const cObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              runCounter(en.target);
              obs.unobserve(en.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((c) => cObs.observe(c));
    }
  }

  /* ───────── 6. Technology tabs ───────── */
  const tabBtns = $$('.tab-btn');
  if (tabBtns.length) {
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const pane = $('#tab-' + btn.dataset.tab);
        tabBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        $$('.tab-pane').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        if (pane) pane.classList.add('active');
      });
    });
  }

  /* ───────── 7. Testimonial slider ───────── */
  const track = $('#slider-track');
  if (track) {
    const slides = $$('.quote', track);
    const dotsWrap = $('#slider-dots');
    const prev = $('#slider-prev');
    const next = $('#slider-next');
    let idx = 0;
    let timer = null;

    // dots
    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.type = 'button';
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', () => go(i, true));
      dotsWrap && dotsWrap.appendChild(d);
      return d;
    });

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + -idx * 100 + '%)';
      dots.forEach((d, n) => d.classList.toggle('active', n === idx));
      if (user) restart();
    }
    function start() {
      if (reduceMotion || slides.length < 2) return;
      timer = setInterval(() => go(idx + 1), 6000);
    }
    function restart() {
      clearInterval(timer);
      start();
    }

    prev && prev.addEventListener('click', () => go(idx - 1, true));
    next && next.addEventListener('click', () => go(idx + 1, true));

    // swipe
    let sx = 0;
    const vp = $('.slider-viewport') || track;
    vp.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) go(idx + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    // pause on hover
    const sliderEl = $('.slider');
    if (sliderEl) {
      sliderEl.addEventListener('mouseenter', () => clearInterval(timer));
      sliderEl.addEventListener('mouseleave', start);
    }
    start();
  }

  /* ───────── 8. Contact form (client-side) ───────── */
  const form = $('#contact-form');
  if (form) {
    const success = $('#form-success');

    function showError(group, msg) {
      group.classList.add('invalid');
      let er = group.querySelector('.ferror');
      if (!er) {
        er = document.createElement('p');
        er.className = 'ferror';
        group.appendChild(er);
      }
      er.textContent = msg;
    }
    function clearError(group) {
      group.classList.remove('invalid');
      const er = group.querySelector('.ferror');
      if (er) er.textContent = '';
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;

      const name = $('#name'), email = $('#email'), msg = $('#message');

      [name, email, msg].forEach((f) => clearError(f.closest('.fgroup')));

      if (!name.value.trim()) { showError(name.closest('.fgroup'), 'Please enter your name.'); ok = false; }
      if (!emailRe.test(email.value.trim())) { showError(email.closest('.fgroup'), 'Enter a valid email address.'); ok = false; }
      if (msg.value.trim().length < 10) { showError(msg.closest('.fgroup'), 'Please tell us a bit more (10+ characters).'); ok = false; }

      if (!ok) {
        const firstBad = form.querySelector('.fgroup.invalid input, .fgroup.invalid textarea');
        firstBad && firstBad.focus();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Simulated async submit (no backend on a static host)
      setTimeout(() => {
        form.querySelectorAll('input, select, textarea').forEach((el) => (el.value = ''));
        btn.disabled = false;
        btn.innerHTML = original;
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          setTimeout(() => { success.hidden = true; }, 6000);
        }
      }, 900);
    });

    // live clear on input
    form.addEventListener('input', (e) => {
      const g = e.target.closest('.fgroup');
      if (g && g.classList.contains('invalid')) clearError(g);
    });
  }

  /* ───────── 9. Footer year (safety) ───────── */
  // (Year is hardcoded in markup; nothing to do.)

})();
