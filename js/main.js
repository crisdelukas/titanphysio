/* Titan Physio — interactions (no dependencies) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header stays transparent over the hero scene, turns solid afterwards.
     The section counter is hidden while the hero's own scroll meter is visible. */
  const header = $('#header');
  const stage = $('.hero-stage');
  const counter = $('.counter');
  const onScrollHeader = () => {
    const end = stage ? stage.offsetTop + stage.offsetHeight - innerHeight : 0;
    const sticky = stage && stage.offsetHeight > innerHeight + 1; // compact (non-sticky) hero on phones
    header.classList.toggle('is-solid', sticky ? scrollY > end + 2 : scrollY > 40); // solid as soon as the hero starts scrolling away
    counter.classList.toggle('is-hidden', scrollY < end + innerHeight * .5);
  };

  /* Mobile menu */
  const burger = $('.burger'), menu = $('#mobile-menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* Reveal on scroll (staggered within each parent) */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sibs = $$('.reveal', e.target.parentElement);
      e.target.style.transitionDelay = (Math.max(0, sibs.indexOf(e.target)) % 6) * 80 + 'ms';
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  const bandIO = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .4 });
  $$('.band').forEach(b => bandIO.observe(b));

  /* Services accordion (one open at a time) */
  $$('.svc__head').forEach(btn => btn.addEventListener('click', () => {
    const li = btn.parentElement, open = !li.classList.contains('is-open');
    $$('.svc.is-open').forEach(o => { o.classList.remove('is-open'); $('.svc__head', o).setAttribute('aria-expanded', 'false'); });
    li.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
  }));

  /* Section counter + active nav link */
  const sections = $$('section[data-index]');
  const counterN = $('#counter-n'), counterBar = $('#counter-bar');
  const navLinks = $$('.nav a');
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    counterN.textContent = e.target.dataset.index;
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => secIO.observe(s));

  /* Scroll-linked parallax for the image band (hero motion lives in js/hero.js) */
  const parallax = $$('.parallax');
  let ticking = false;
  /* "Our approach": the hero light continues and travels down the section with the scroll */
  const approach = $('#approach'), apLight = $('.approach__light');
  const LIGHT = { screenY: .58, maxOpacity: 1, fadeOut: .3 }; // fractions of the screen / section
  const moveLight = () => {
    if (!approach || !apLight) return;
    const w = innerWidth, r = approach.getBoundingClientRect();
    const W = w <= 700 ? 1.25 * w : Math.min(.79 * w, 1150);   // hero halo size
    const size = W * 1.11, cx = .43 * w + W / 2;                 // where the hero light ends
    // same light as the hero: while the hero leaves, both use window.titanLightCenterY, so they line up exactly
    const stageEl = $('.hero-stage');
    const sticky = stageEl && stageEl.offsetHeight > innerHeight + 1 && window.titanLightCenterY;
    let screenY;
    if (sticky) {
      const post = Math.max(0, innerHeight - stageEl.getBoundingClientRect().bottom);
      screenY = window.titanLightCenterY(post, innerHeight, .45 * innerHeight + W / 2);
      LIGHT.maxOpacity = window.titanLightOpacity(post);
    } else { screenY = innerHeight * LIGHT.screenY; LIGHT.maxOpacity = .62; }
    const cy = reduce ? r.height * .4 : Math.max(0, Math.min(r.height, screenY - r.top));
    const t = cy / r.height;
    const o = LIGHT.maxOpacity * Math.min(1, (1 - t) / LIGHT.fadeOut); // full from the start (continuity), dissolves at the bottom
    approach.style.setProperty('--ls', size + 'px');
    approach.style.setProperty('--lx', (cx - size / 2).toFixed(1) + 'px');
    approach.style.setProperty('--ly', (cy - size / 2).toFixed(1) + 'px');
    approach.style.setProperty('--lo', Math.max(0, o).toFixed(3));
  };


  /* Services atlas: the section is as tall as the row is wide; vertical scroll moves the row sideways.
     Each card "comes into focus" (annotation appears, image settles) as it reaches the left third. */
  const atlas = $('.atlas'), track = $('.atlas__track'), atlasI = $('#atlas-i');
  const cards = $$('.atlas__card');
  const sizeAtlas = () => {
    if (!atlas) return;
    const sticky = innerWidth > 700 && !reduce;
    atlas.style.height = sticky ? (innerHeight + Math.max(0, track.scrollWidth - innerWidth)) + 'px' : '';
  };
  const moveAtlas = () => {
    if (!atlas) return;
    const sticky = innerWidth > 700 && !reduce;
    const dist = Math.max(0, track.scrollWidth - innerWidth);
    const r = atlas.getBoundingClientRect();
    const p = sticky ? Math.max(0, Math.min(1, -r.top / Math.max(1, atlas.offsetHeight - innerHeight))) : 0;
    if (sticky) track.style.setProperty('--ax', (-p * dist).toFixed(1) + 'px');
    atlas.style.setProperty('--ap', p.toFixed(4));
    let best = 0, bestD = 1e9;
    cards.forEach((c, i) => {
      const b = c.getBoundingClientRect(), cx = b.left + b.width / 2;
      const target = sticky ? innerWidth * .32 : innerWidth / 2;
      const d = Math.abs(cx - target);
      if (d < bestD) { bestD = d; best = i; }
      const f = Math.max(0, 1 - d / (b.width * 1.1));
      c.style.setProperty('--f', (f * f * (3 - 2 * f)).toFixed(3));
    });
    if (atlasI) atlasI.textContent = String(best + 1).padStart(2, '0'); // cards only (the divider is not a card)
  };
  if (atlas) $('.atlas__viewport').addEventListener('scroll', moveAtlas, { passive: true });
  addEventListener('resize', sizeAtlas);
  addEventListener('load', () => { sizeAtlas(); moveAtlas(); });
  sizeAtlas();

  const frame = () => {
    ticking = false;
    onScrollHeader();
    moveLight();
    moveAtlas();
    const max = document.documentElement.scrollHeight - innerHeight;
    counterBar.style.setProperty('--prog', max > 0 ? scrollY / max : 0);
    if (reduce) return;
    parallax.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const p = (innerHeight - r.top) / (innerHeight + r.height); // 0 → 1 while crossing viewport
      if (p > -0.1 && p < 1.1) el.style.setProperty('--p', (p - .5).toFixed(3));
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();

  /* Map: insert the Google Maps iframe only when the visitor asks for it */
  const map = $('.map');
  if (map) $('.map__load', map).addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = map.dataset.src; f.title = 'Map: Titan Physio, Allschwilerstrasse 14, Basel';
    f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    map.appendChild(f); $('.map__placeholder', map).remove();
  });

  /* Practice gallery: open each image full size */
  const lb = $('.lightbox');
  if (lb) {
    $$('.pg__open').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      $('img', lb).src = a.getAttribute('href'); $('img', lb).alt = $('img', a).alt;
      $('.lightbox__cap', lb).textContent = a.closest('figure').querySelector('figcaption').textContent.replace(/^\d+/, m => m + '  ');
      lb.showModal();
    }));
    $('.lightbox__close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  }

  /* Contact form: submit via fetch (Formspree), stay on page */
  const form = $('.form'), status = $('.form__status');
  form.addEventListener('submit', async ev => {
    if (form.action.includes('YOUR_FORM_ID')) { ev.preventDefault(); status.textContent = 'Form not connected yet (draft).'; return; }
    ev.preventDefault();
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = 'Thank you — we will get back to you soon.';
    } catch {
      status.textContent = 'Something went wrong. Please write to aaron.deza@hin.physio.';
    }
  });
})();
