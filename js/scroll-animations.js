/* ============================================================
   ALG — Scroll Animations
   4-scene cinematic hero + all section entrance animations
   ============================================================ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Lenis smooth scroll ─────────────────────────────────── */
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.2,
        touchMultiplier: 2,
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      window.algLenis = lenis;
    }

    /* ── Navbar scroll state ─────────────────────────────────── */
    ScrollTrigger.create({
      start: 60,
      onEnter:     () => document.getElementById('navbar')?.classList.add('scrolled'),
      onLeaveBack: () => document.getElementById('navbar')?.classList.remove('scrolled'),
    });

    /* ════════════════════════════════════════════════════════════
       HERO — 4-SCENE CINEMATIC MANAGER
    ════════════════════════════════════════════════════════════

       The hero section is 400vh tall.
       .hero-pin is sticky (100vh).
       Scroll progress 0→1 maps to 4 scenes × 25% each.

       Scene ranges: [fadeInStart, peakStart, peakEnd, fadeOutEnd]
       — overlap between scenes creates a crossfade.
    ════════════════════════════════════════════════════════════ */

    const heroSection  = document.getElementById('hero');
    const heroPinEl    = document.getElementById('hero-pin');
    const scrollHint   = document.getElementById('hero-scroll-hint');
    const sceneDots    = document.getElementById('scene-dots');
    const dotBtns      = sceneDots ? sceneDots.querySelectorAll('.scene-dot') : [];

    if (!heroSection) return;

    const scenes = [
      document.getElementById('scene-1'),
      document.getElementById('scene-2'),
      document.getElementById('scene-3'),
      document.getElementById('scene-4'),
    ].filter(Boolean);

    /* Scene opacity ranges — [fadeInStart, peakStart, peakEnd, fadeOutEnd]
       Scenes overlap by 0.04 for a smooth crossfade.
       Scene 1 b=a=0 so it is fully visible the instant the page loads.
       Scene 4 d=1.01 so it stays at peak opacity all the way to scroll end. */
    const RANGES = [
      [0.00, 0.00, 0.21, 0.27],  // Scene 1 — no fade-in, immediately visible
      [0.23, 0.27, 0.46, 0.52],  // Scene 2
      [0.48, 0.52, 0.71, 0.77],  // Scene 3
      [0.73, 0.77, 1.00, 1.01],  // Scene 4 — stays visible at scroll end
    ];

    /* Smooth easing for scene crossfades */
    function easeInOut3(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function calcSceneOpacity(p, range) {
      const [a, b, c, d] = range;
      if (p < a || p > d) return 0;      // strict: handles p=0 for Scene 1
      if (p >= b && p <= c) return 1;
      if (b > a && p < b) return easeInOut3((p - a) / (b - a));
      if (d > c && p > c) return easeInOut3((d - p) / (d - c));
      return 1;
    }

    /* Opacity for text elements within a scene's visible window  */
    function calcTextOpacity(p, appear, disappear) {
      if (p < appear || p > disappear) return 0;
      const span     = disappear - appear;
      const fadeSpan = span * 0.18;
      if (p < appear + fadeSpan)     return (p - appear)    / fadeSpan;
      if (p > disappear - fadeSpan)  return (disappear - p) / fadeSpan;
      return 1;
    }

    /* Apply opacity + translateY to an element */
    function setEl(el, op, y) {
      if (!el) return;
      el.style.opacity   = op;
      el.style.transform = y !== undefined ? `translateY(${(1 - Math.min(op * 1.25, 1)) * y}px)` : '';
    }

    /* Cache DOM refs — scene 1 */
    const s1 = {
      label:    document.querySelector('.scene-1 .scene-label'),
      headline: document.querySelector('.scene-1 .scene-headline'),
      sub:      document.querySelector('.scene-1 .scene-sub'),
    };

    /* Scene 2 */
    const s2 = {
      label:    document.querySelector('.scene-2 .scene-label'),
      headline: document.querySelector('.scene-2 .scene-headline'),
      sub:      document.querySelector('.scene-2 .scene-sub'),
    };

    /* Scene 3 */
    const s3 = {
      label: document.querySelector('.scene-3-label'),
      lines: document.querySelectorAll('.scene-3-line'),
    };

    /* Scene 4 */
    const s4 = {
      headline: document.querySelector('.scene-4 .scene-headline'),
      actions:  document.querySelector('.scene-4-actions'),
      stats:    document.querySelector('.scene-4-stats'),
    };

    let lastActiveScene = -1;

    /* ── Hero update function (shared by ScrollTrigger + init) ── */
    function applyHeroState(p) {
      /* ── Scroll hint ── */
      if (scrollHint) {
        scrollHint.style.opacity = p < 0.04 ? String(1 - p / 0.04) : '0';
      }

      /* ── Scene opacities + pointer-events ── */
      scenes.forEach((scene, i) => {
        const op = calcSceneOpacity(p, RANGES[i]);
        scene.style.opacity       = op;
        scene.style.pointerEvents = op > 0.45 ? 'auto' : 'none';
      });

      /* ── Active dot indicator ── */
      const activeIdx   = RANGES.findIndex(([, b, c]) => p >= b && p <= c);
      const dominantIdx = activeIdx >= 0 ? activeIdx
        : RANGES.findIndex(([a, , , d]) => p >= a && p < d);

      if (dominantIdx !== lastActiveScene) {
        lastActiveScene = dominantIdx;
        dotBtns.forEach((d, i) => d.classList.toggle('active', i === dominantIdx));
        if (sceneDots) {
          sceneDots.classList.toggle('scene-light-mode', dominantIdx === 2);
        }
      }

      /* ════ Scene 1 text ════ */
      const op1 = calcTextOpacity(p, -0.10, 0.24); /* negative appear → full at p=0 */
      setEl(s1.label,    op1, 20);
      setEl(s1.headline, op1, 36);
      setEl(s1.sub,      op1, 22);

      /* ════ Scene 2 text ════ */
      const op2 = calcTextOpacity(p, 0.26, 0.50);
      setEl(s2.label,    op2, 20);
      setEl(s2.headline, op2, 36);
      setEl(s2.sub,      op2, 22);

      /* ════ Scene 3 — staggered lines ════ */
      const op3label = calcTextOpacity(p, 0.50, 0.75);
      setEl(s3.label, op3label, 16);

      s3.lines.forEach((line, i) => {
        const delay = i * 0.035;
        const op3   = calcTextOpacity(p, 0.51 + delay, 0.75);
        line.style.opacity   = op3;
        line.style.transform = `translateY(${(1 - Math.min(op3 * 1.25, 1)) * 28}px)`;
      });

      /* ════ Scene 4 text — disappear=1.10 so text stays at scroll end ════ */
      const op4h = calcTextOpacity(p, 0.76, 1.10);
      setEl(s4.headline, op4h, 36);

      const op4a = calcTextOpacity(p, 0.81, 1.10);
      setEl(s4.actions, op4a, 22);

      const op4s = calcTextOpacity(p, 0.86, 1.10);
      if (s4.stats) {
        s4.stats.style.opacity   = op4s;
        s4.stats.style.transform = `translateY(${(1 - Math.min(op4s * 1.25, 1)) * 16}px)`;
      }
    }

    /* ── Main scroll update loop ─────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#hero',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   0,
      onUpdate(self) { applyHeroState(self.progress); },
    });

    /* onUpdate only fires when scroll CHANGES — prime the initial state */
    requestAnimationFrame(() => applyHeroState(0));

    /* ── Scene dot click → scroll to scene position ─────────── */
    dotBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        const heroTop    = heroSection.getBoundingClientRect().top + window.scrollY;
        const heroHeight = heroSection.offsetHeight;          // 400vh
        const target     = heroTop + (heroHeight * i / 4) + 10;

        if (window.algLenis) {
          window.algLenis.scrollTo(target, { duration: 1.4 });
        } else {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      });
    });

    /* ════════════════════════════════════════════════════════════
       REST OF PAGE — section entrance animations
    ════════════════════════════════════════════════════════════ */

    /* ── Stats ─────────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#stats',
      start: 'top 80%',
      once: true,
      onEnter() {
        document.querySelectorAll('.stat-card').forEach(c => c.classList.add('is-visible'));
        window.ALGCounters?.start();
      },
    });

    /* ── About ─────────────────────────────────────────────── */
    gsap.to('.about-img-wrap img', {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '#about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 72%',
      once: true,
      onEnter() {
        document.querySelectorAll('#about .reveal-left, #about .reveal-right')
          .forEach(el => el.classList.add('is-visible'));
      },
    });

    /* ── Services ───────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#services',
      start: 'top 76%',
      once: true,
      onEnter() {
        gsap.to('.service-card', {
          autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out',
        });
        document.querySelectorAll('.service-card').forEach(c => c.classList.add('is-visible'));
      },
    });

    /* ── Offerings ──────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#offerings',
      start: 'top 78%',
      once: true,
      onEnter() {
        gsap.fromTo('.offerings-wrapper',
          { autoAlpha: 0, x: 40 },
          { autoAlpha: 1, x: 0, duration: 0.9, ease: 'power3.out' }
        );
      },
    });

    /* ── Technology ─────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#technology',
      start: 'top 74%',
      once: true,
      onEnter() {
        document.querySelectorAll('#technology .reveal-left, #technology .reveal-right')
          .forEach(el => el.classList.add('is-visible'));
      },
    });

    /* ── Certifications ──────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#certifications',
      start: 'top 80%',
      once: true,
      onEnter() {
        gsap.fromTo('.certs-carousel-wrap',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1, ease: 'power2.out' }
        );
      },
    });

    /* ── Testimonials ────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#testimonials',
      start: 'top 76%',
      once: true,
      onEnter() {
        document.querySelector('.testimonials-container')?.classList.add('is-visible');
      },
    });

    /* ── Team ────────────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#team',
      start: 'top 76%',
      once: true,
      onEnter() {
        document.querySelectorAll('.team-card').forEach(c => c.classList.add('is-visible'));
      },
    });

    /* ── Carrier CTA ─────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#carrier-cta',
      start: 'top 76%',
      once: true,
      onEnter() {
        document.querySelector('.carrier-content')?.classList.add('is-visible');
      },
    });

    /* ── Contact ─────────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 76%',
      once: true,
      onEnter() {
        document.querySelectorAll('#contact .reveal-left, #contact .reveal-right')
          .forEach(el => el.classList.add('is-visible'));
      },
    });

    /* ── Section headers ─────────────────────────────────────── */
    document.querySelectorAll('.section-header').forEach(header => {
      ScrollTrigger.create({
        trigger: header,
        start: 'top 84%',
        once: true,
        onEnter() {
          gsap.fromTo(header.children,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
          );
        },
      });
    });

    /* ── Footer ──────────────────────────────────────────────── */
    ScrollTrigger.create({
      trigger: '#footer',
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.fromTo('.footer-grid > *',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
        );
      },
    });

  }); // end DOMContentLoaded

})();
