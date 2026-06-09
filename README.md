# American Logistics Group LLC — Website

Premium cinematic scroll-driven website for ALG, a US-based 3PL freight broker.

## Quick Start

1. Open `index.html` in a browser — or use VS Code **Live Server** for best results.
2. No build step required. All dependencies are loaded via CDN.

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Three.js | r128 | 3D night-time freight yard hero scene |
| GSAP | 3.12.5 | Scroll-triggered animations, hero camera fly-through |
| ScrollTrigger | 3.12.5 | Hero section pin + all section reveals |
| Lenis | 1.0.42 | Buttery smooth scrolling |
| Font Awesome | 6.5 | Icons |
| Google Fonts | — | Inter + Space Grotesk |

## File Structure

```
alg-website/
├── index.html              — Full HTML, all 13 sections
├── css/
│   ├── style.css           — Design system, components, layout
│   ├── animations.css      — @keyframes, entrance states
│   └── responsive.css      — Breakpoints (480 / 768 / 1024 / 1280 / 1440px)
├── js/
│   ├── hero-scene.js       — Three.js 3D container yard scene
│   ├── scroll-animations.js— GSAP ScrollTrigger timelines
│   ├── counters.js         — Animated number counters
│   └── main.js             — Navbar, tabs, slider, form, smooth scroll
└── assets/
    ├── images/             — Add real ALG photos here
    └── icons/              — Add brand icons here
```

## Replacing Placeholder Images

All images are currently hotlinked from Unsplash. Replace with real ALG assets:

| Section | Current | Replace with |
|---|---|---|
| Hero 3D | Three.js procedural | Keep or add real GLB model |
| About | photo-1601584115197... | Real ALG truck photo |
| OTR offering | photo-1519003722824... | Real OTR route photo |
| Drayage offering | photo-1494412574643... | Real port/yard photo |
| Intermodal | photo-1558618666... | Real rail photo |
| Hazmat | photo-1587293852726... | Real hazmat truck photo |
| Carrier CTA | photo-1578575437130... | Real yard wide shot |
| Jay Singh | photo-1560250097... | Real headshot |
| Parmod Lamba | photo-1472099645785... | Real headshot |
| Robert Reeb | photo-1507003211169... | Real headshot |

To replace: update the `src` attribute on `<img>` tags in `index.html`.

## Customization

### Colors
Edit `css/style.css` → `:root` block:
```css
--accent:  #C8FF3C;   /* Lime — change for different brand color */
--bg-primary: #0a0a0a; /* Main background */
```

### Hero 3D Scene
Edit `js/hero-scene.js`:
- `containerColors[]` — change container colors
- `truckGroup` — modify truck geometry
- `particleCount` — more/fewer dust particles
- Camera positions in `js/scroll-animations.js` → `camTl.to(camera.position, ...)`

### Animations
Edit `js/scroll-animations.js`:
- `scrollEnd` controls how long the hero is pinned (`'+=180%'` = 1.8x viewport height)
- Each `ScrollTrigger.create({ start: 'top 75%' })` — adjust 75% to change when sections animate in

### Contact Form
The form currently simulates submission (fake delay). To wire up a real endpoint:
```js
// In js/main.js → initForm()
// Replace the setTimeout block with:
fetch('/api/contact', { method: 'POST', body: new FormData(form) })
  .then(r => r.ok && (success.hidden = false));
```

### Stats Counters
Numbers come from `data-target` attributes in `index.html`:
```html
<span class="counter" data-target="100000" data-format="compact">0</span>
<!-- data-format="compact" renders 100000 as "100K" -->
```

## Performance Notes

- Three.js scene is **disabled on screens < 480px** (pure CSS fallback gradient)
- Pixel ratio is capped at 2 for the renderer
- `will-change` is not used (browser decides)
- Images are lazy-loaded with `loading="lazy"`
- Fonts use `<link rel="preconnect">` for faster loading

## Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| IE 11 | ❌ Not supported |

---

**Client:** American Logistics Group LLC  
**Location:** 68 S Service Rd 100, Melville, NY 11747  
**Contact:** info@algusa.com | +1 716-337-5000
