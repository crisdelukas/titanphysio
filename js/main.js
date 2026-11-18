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
    header.classList.toggle('is-solid', sticky ? scrollY > end + innerHeight - header.offsetHeight : scrollY > 40);
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
  const frame = () => {
    ticking = false;
    onScrollHeader();
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
