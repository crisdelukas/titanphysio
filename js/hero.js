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
    titleLift: -12,         // px
    fadeOut: [0.84, 0.16]   // exit fade into "Our approach"
  };

  const stage = document.querySelector('.hero-stage');
  const hero = document.getElementById('hero');
  if (!stage || !hero) return;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const bezier = ([p0, p1, p2, p3], t) => { const u = 1 - t; return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3; };
  const set = (k, v) => hero.style.setProperty(k, v);

  let pending = false, lastP = -1, lastW = 0, lastH = 0;

  function update() {
    pending = false;
    const rect = stage.getBoundingClientRect();
    // Sticky mode (desktop/tablet): progress over the extra stage height.
    // Compact mode (mobile, stage no taller than the screen): progress while the hero scrolls away.
    const extra = stage.offsetHeight - innerHeight;
    const range = extra > 1 ? extra : stage.offsetHeight;
    const p = clamp(-rect.top / Math.max(1, range));
    const w = innerWidth, h = hero.clientHeight;
    if (p === lastP && w === lastW && h === lastH) return; // nothing changed
    lastP = p; lastW = w; lastH = h;
    const C = CONFIG;

    set('--hx', `${bezier(C.haloX, p) * w}px`);
    set('--hy', `${bezier(C.haloY, p) * h}px`);
    set('--hs', (1 + C.haloScale * p).toFixed(4));

    set('--bx', `${C.bodyX * p}px`);
    set('--by', `${C.bodyY * p}px`);
    set('--bs', (1 + C.bodyScale * p).toFixed(4));

    const r = clamp((p - C.relight[0]) / (C.relight[1] - C.relight[0]));
    set('--relight', (C.relightMax * r * r * (3 - 2 * r)).toFixed(3)); // smooth ease in/out

    set('--cv', clamp((p - C.cvIn[0]) / C.cvIn[1]).toFixed(3));
    set('--title-opacity', (1 - C.titleDim[2] * clamp((p - C.titleDim[0]) / C.titleDim[1])).toFixed(3));
    set('--title-y', `${C.titleLift * p}px`);
    set('--fade', clamp((p - C.fadeOut[0]) / C.fadeOut[1]).toFixed(3));
    set('--meter', `${(p * 100).toFixed(1)}%`);
  }

  const request = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();
})();
