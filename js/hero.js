/* Titan Physio — Hero v0.3 scroll choreography
   All motion parameters live in CONFIG (values from the approved prototype).
   Progress p goes 0 → 1 while the 330vh stage scrolls past the sticky hero. */
(() => {
  const CONFIG = {
    // Light: cubic Bézier path (fractions of viewport width / height)
    haloX: [0.28, 0.46, 0.78, 0.43],
    haloY: [0.11, -0.23, -0.04, 0.45],
    haloScale: 0.11,        // grows to 1 + 0.11
    // Body depth movement
    bodyX: -22,             // px
    bodyY: -32,             // px
    bodyScale: 0.065,
    // Relighting: the right-lit photo fades in between these two points of the scroll
    relight: [0.10, 0.70],  // start, end (0–1)
    relightMax: 1,          // final opacity of the right-lit photo (like Photoshop's opacity slider)
    // Timing windows
    cvIn: [0.12, 0.18],     // annotations: start, duration
    titleDim: [0.78, 0.22, 0.22], // start, duration, max dim (headline stays visible)
    // Headline rises while scrolling, up to this fraction of the body photo's height (0.25 ≈ mid-forearm)
    lift: [0.10, 0.50],     // start, end (0–1)
    liftTo: 0.25,
    // Aaron's info appears under the paragraph while the headline rises
    info: [0.52, 0.62],     // "Aaron Deza…" — starts once the headline has stopped rising
    info2: [0.64, 0.74],    // "The practice…" — right after
    fadeOut: [0.84, 0.16]   // exit fade into "Our approach"
  };

  const stage = document.querySelector('.hero-stage');
  const hero = document.getElementById('hero');
  if (!stage || !hero) return;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const bezier = ([p0, p1, p2, p3], t) => { const u = 1 - t; return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3; };
  const set = (k, v) => hero.style.setProperty(k, v);
  const ease = t => t * t * (3 - 2 * t);
  const figure = hero.querySelector('.hero__figure');
  const headline = hero.querySelector('.hero__headline');
  const items = hero.querySelectorAll('.hero__item');


  /* One light for hero + "Our approach": once the hero is released, its light stays fixed on screen and
     eases from where it ended up to mid-screen — "Our approach" uses the same function, so both halves match. */
  const LIGHT_SCREEN_Y = .58, LIGHT_EASE_PX = 650;
  window.titanLightCenterY = (post, h, endY) => {
    const t = Math.min(1, Math.max(0, post / LIGHT_EASE_PX)), e = t * t * (3 - 2 * t);
    return endY + (h * LIGHT_SCREEN_Y - endY) * e;              // screen y of the light centre
  };
  const LIGHT_DIM = .38;                                          // how much the shared light softens once it has settled
  window.titanLightOpacity = post => { const t = Math.min(1, Math.max(0, post / LIGHT_EASE_PX)); return 1 - LIGHT_DIM * t * t * (3 - 2 * t); };

  let pending = false, lastP = -1, lastPost = -1, lastW = 0, lastH = 0;

  function update() {
    pending = false;
    const rect = stage.getBoundingClientRect();
    // Sticky mode (desktop/tablet): progress over the extra stage height.
    // Compact mode (mobile, stage no taller than the screen): progress while the hero scrolls away.
    const extra = stage.offsetHeight - innerHeight;
    const range = extra > 1 ? extra : stage.offsetHeight;
    const p = clamp(-rect.top / Math.max(1, range));
    const w = innerWidth, h = hero.clientHeight;
    const sticky = extra > 1;
    const post = sticky ? Math.max(0, -rect.top - extra) : 0;   // px scrolled after the hero was released
    if (p === lastP && post === lastPost && w === lastW && h === lastH) return; // nothing changed
    lastP = p; lastPost = post; lastW = w; lastH = h;
    const C = CONFIG;

    set('--hx', `${bezier(C.haloX, p) * w}px`);
    if (post > 0) {
      const W = Math.min(.79 * w, 1150), endY = C.haloY[3] * h + W / 2;   // light centre at the end of the hero
      set('--hy', `${(window.titanLightCenterY(post, h, endY) + post - W / 2).toFixed(1)}px`);
      set('--ho', window.titanLightOpacity(post).toFixed(3));
    } else { set('--hy', `${bezier(C.haloY, p) * h}px`); set('--ho', 1); }
    set('--hs', (1 + C.haloScale * p).toFixed(4));

    set('--bx', `${C.bodyX * p}px`);
    set('--by', `${C.bodyY * p}px`);
    set('--bs', (1 + C.bodyScale * p).toFixed(4));

    const r = clamp((p - C.relight[0]) / (C.relight[1] - C.relight[0]));
    set('--relight', (C.relightMax * r * r * (3 - 2 * r)).toFixed(3)); // smooth ease in/out

    set('--cv', clamp((p - C.cvIn[0]) / C.cvIn[1]).toFixed(3));
    set('--title-opacity', (1 - C.titleDim[2] * clamp((p - C.titleDim[0]) / C.titleDim[1])).toFixed(3));
    // distance from the headline's resting position to the target height on the photo
    let rise = 0;
    if (stage.offsetHeight > innerHeight + 1) {            // only in the sticky (desktop/tablet) layout
      const imgH = Math.max(figure.offsetHeight, figure.offsetWidth * 1152 / 2048); // object-fit: cover
      const target = figure.offsetTop + C.liftTo * imgH;
      rise = Math.min(0, target - headline.offsetTop);
    }
    set('--title-y', `${(rise * ease(clamp((p - C.lift[0]) / (C.lift[1] - C.lift[0])))).toFixed(1)}px`);
    const step = ([a, b]) => rise ? ease(clamp((p - a) / (b - a))) : 0;
    const i1 = step(C.info), i2 = step(C.info2);
    set('--info', i1.toFixed(3));
    set('--info2', i2.toFixed(3));
    items[0].classList.toggle('is-on', i1 > .6);
    items[1].classList.toggle('is-on', i2 > .6);
    set('--fade', clamp((p - C.fadeOut[0]) / C.fadeOut[1]).toFixed(3));
    set('--meter', `${(p * 100).toFixed(1)}%`);
  }

  const request = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();
})();
