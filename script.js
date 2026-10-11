/* ==========================================================================
   SERENI FRIES – single-page app (fast page movement, no reloads)
   1 CONFIG · 2 CONTENT · 3 PAGE TEMPLATES · 4 ROUTER · 5 ANIMATIONS · 6 UI
   All page copy lives in sections 2 and 3 — edit text there, never in the router.
   Safety net: if GSAP fails to load, or the visitor prefers reduced motion,
   every page still renders — just without animation.
   ========================================================================== */
(() => {
'use strict';
// Tiny helpers: $ = first match, $$ = all matches as a real array
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const G = window.gsap, ST = window.ScrollTrigger, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (G && ST) G.registerPlugin(ST);                       // activate the scroll-animation plugin

/* ---------- 1. CONFIG — the site's three dials. EDIT here. ----------
   ⚠ MIGRATION: IMG and the two PDF links in NEWS (section 2) point at the OLD
   WordPress site. Your copies are downloaded — when ready, flip:
   IMG → '/img/'   and the NEWS links → '/pdf/...' (short lines, easy edits). */
const SITE = 'https://www.serenifries.co.ke';   // final domain for canonical URLs — EDIT if the domain ever changes
const IMG  = 'https://www.serenifries.co.ke/wp-content/uploads/2022/08/'; // image folder — flip to '/img/' after verifying local copies
const WA   = '254725690901';                    // WhatsApp number, no + (the contact form hands off to it)

/* ---------- 2. CONTENT DATA — all page copy. EDIT here. ---------- */
// Frozen fry cuts: [name, description, pack image]
const CUTS = [
  ['Matchstick cut', 'The name resembles the thinness of the chips. After frying, it has a sophisticated look and is crispier compared to other cuts.', 'Pack_Matchstick.png'],
  ['Medium cut', 'Slightly thicker than the matchstick but slightly thinner than the standard cut. Easily achieves a crunchier and buttery feel.', 'Pack_medium2.png'],
  ['Standard cut', 'The most common cut for fries. It has a fuller feel in the mouth, steaky and chunkier.', 'Pack_Standard.png']];
// Fresh products for restaurants, supermarkets and hotels.
// SLOT ORDER (must match the card template in PAGES['/products']):
// [name, description (always visible), image file, sizes — only the chips entry]
const FRESH = [
  ['Lyonnaise', 'Thinly sliced potatoes, ready for the pan or the fryer — crisp edges, soft centre.', 'Lyonniese.png'],
  ['Wedges', 'Thick, hearty potato wedges — fluffy inside with a golden crust.', 'Wedges.png'],
  ['Whole peeled', 'Farm-fresh potatoes, washed and peeled, ready to cook your way.', 'Whole-Pilled.png'],
  ['Chips, different sizes', 'Fresh cut chips sized for every kitchen — see the cuts below.', 'Chips.png', ['12 x 12', '10 x 10', '9 x 9', '8 x 8', '7 x 7']]];
// Shelf-life text swapped by the vacuum/normal toggle on /products (.v = vacuum, .n = normal)
const SHELF = { v: 'Vacuum sealed in 10 kg packets. Shelf life: 4 days refrigerated.', n: 'Normal sealed in 10 kg packets. Shelf life: 2 days refrigerated.' };
// News: [title, image, link]. ⚠ MIGRATION: both PDF links live on the old site —
// swap to '/pdf/DN-Sereni.pdf' and '/pdf/World-Potato-Congress.pdf' when ready.
// The 3rd link duplicates #2 on the old site — replace with the real article when found.
const NEWS = [
  ['Ten years on, Sereni Fries continues to add value to Kenya’s potatoes', 'DailyNation.jpg', 'https://serenifries.co.ke/pdf/DN%20-%20Sereni%20(1).pdf'],
  ['The Good Potato Initiative', 'WorldPotatoCongress.jpg', 'https://www.serenifries.co.ke/pdf/World%20Potato%20A0%20Poster.pdf'],
  ['Supplying fries to international fast-food chains', 'OOnineArticle.jpg', 'https://www.serenifries.co.ke/pdf/World%20Potato%20A0%20Poster.pdf']];
// Core values accordion on /about: [title, body]
const VALUES = [
  ['Integrity', 'We uphold high working ethics, openness, fairness, and honesty in our organization.'],
  ['Accountability', 'The entire Sereni fraternity is called upon to be responsible for their actions and to diligently accomplish tasks entrusted to them. We remain accountable to the rest of the stakeholders as well.'],
  ['Passion and Quality', 'Joy for the work one does is the catalyst to innovation, creativity and commitment to productivity and delivery of our mission. Quality and safe products is our mantra.'],
  ['Communication', 'For a seamless running of the company, proper internal and external communication is imperative and encouraged.'],
  ['Teamwork', 'We believe in group synergies, when people work together, magic is created.'],
  ['Diversity and Inclusivity', 'Regardless of who we are, where we come from, our roles in the company, we all play a vital role towards the company’s success and there is space for everyone.'],
  ['Learning and continual improvement', 'Every day presents a chance for self-amelioration, for our staff and company at large. We endeavor to sustainably grow ourselves by upholding a wholesome continuous learning and improvement.'],
  ['Local collaboration', '“Buy Kenya Build Kenya”. We hold our local potato farmers close to our hearts and create rapport with other stakeholders that are key in our processing and selling quality, safe potato products.']];

/* ---------- 3. PAGE TEMPLATES — structure of each page. ---------- */
// Image helper: file from the IMG folder, alt text, optional CSS class. Lazy-loads by default.
const img = (f, alt = '', c = '') => `<img class="${c}" src="${IMG}${f}" alt="${alt}" loading="lazy" decoding="async">`;
// data-r = fade/slide reveal on scroll · data-split = animated headline · data-n = count-up
// number (only ever used inside .stats blocks — the /products shelf lines reuse the
// attribute name for "normal sealed", which is why the counter is scoped in section 5).
// Hero used on EVERY page: rays + clouds + the real Sun image (it carries the logo). Chips and
// pack shots appear on home only. How deep the sun "sets" behind the skyline is the --dip
// variable in styles.css §7. The Tree/Animals/Ground images from the old site are unused
// (their placement was unknown) — drop them inside .art if you ever want them.
const hero = (h, p, home) => `<section class="hero${home ? ' home' : ''}" data-hero><div class="rays"></div><i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i>
  <div class="wrap hgrid"><div class="ht"><h1 data-split>${h}</h1><p>${p}</p>${home ? '<a class="btn" href="/products">See our cuts</a><a class="btn ghost" href="/contact">Place an order</a>' : ''}</div>
  <div class="art"><div class="sunw"><img class="sunimg" src="${IMG}Sun_SlideSHow.png" alt="Sereni Fries" fetchpriority="high"></div>${home ? `<img class="chips" src="${IMG}Chips_SlideSHow.png" alt="Golden fries"><img class="pack" src="${IMG}Pack_medium2.png" alt="Sereni Fries medium cut pack">` : ''}</div></div>${sk()}</section>`;
// Savanna silhouette divider (bottom of every hero and some pages) — recoloured to --soil in CSS
const sk = (c = '') => `<div class="sk ${c}" aria-hidden="true"><img src="${IMG}SkylineSavana_Divider.png" alt="" decoding="async"></div>`;
// The three frozen cut cards (home + /products/frozen-fries). Middle card gets the arched .alt style
const cuts = () => CUTS.map((c, i) => `<article class="card${i == 1 ? ' alt' : ''}" data-r><div><h3>${c[0]}</h3><p>${c[1]}</p><a class="btn" href="/contact">Order this cut</a></div>${img(c[2], c[0] + ' pack')}</article>`).join('');
// News grid: image, title, opens the article PDF in a new tab
const press = () => `<div class="press">${NEWS.map(n => `<a href="${n[2]}" target="_blank" rel="noopener noreferrer" data-r><div class="im">${img(n[1])}</div><h3>${n[0]}</h3></a>`).join('')}</div>`;
// Gold call-to-action band + divider, reused at the end of most pages
const cta = `<section class="cta"><div class="wrap"><h2 data-split>Ready to stock Sereni Fries?</h2><a class="btn" href="/contact">Get in touch</a></div></section>${sk('gold')}`;
// Product marquee words — EDIT the list, the belt repeats it seamlessly
const mq = ['Lyonnaise', 'Wedges', 'Whole peeled', 'Chips', 'Frozen chips'].map(t => `<span>${t}</span>`).join('');
// Legal page shell (privacy / terms / 404)
const legal = (h, body) => `<section class="wrap legal"><h2>${h}</h2>${body}<p><a class="btn" href="/">Back home</a></p></section>${sk()}`;

const PAGES = {
  // ---- HOME ----
  '/': { t: 'Sereni Fries – Best Quality Potato Products | Kenya', d: 'Sereni Fries processes high quality, safe frozen and fresh cut potato products in Kenya, from Nairobi, Naivasha, Nakuru and Mombasa.',
    v: () => hero('Best quality potato products.', 'Frozen and fresh cut fries, processed with care in Kenya for over ten years.', 1) +
    `<section class="wrap sec intro"><h2 data-split>Safe, consistent fries from Kenyan potatoes.</h2><div data-r>
      <p>Sereni Fries is a pioneer and leader in the processing of high quality and safe frozen and fresh cut potato products. We are headquartered in Nairobi with three branches in Naivasha, Nakuru and Mombasa.</p>
      <div class="stats"><div><b data-n="10">10</b><span>years of ware potato processing</span></div><div><b data-n="3">3</b><span>branches beyond Nairobi</span></div><div><b data-n="3">3</b><span>frozen fry cuts</span></div></div>
      <a class="btn" href="/about">Our story</a><a class="btn ghost" href="/products">See products</a>${img('ProductOfKenya_S2.jpg', 'Product of Kenya', 'badge')}</div></section>
    <div class="belt" aria-hidden="true"><div class="mq">${mq}${mq}${mq}${mq}</div></div>
    <section class="green"><div class="wrap"><h2 data-split>Three cuts, one standard of care.</h2><div class="cards three">${cuts()}</div></div></section>
    <section class="wrap sec"><h2 data-split>In the news</h2>${press()}</section>` + cta },
  // ---- ABOUT ----
  '/about': { t: 'About us – Sereni Fries', d: 'Our story, mission, vision, core values, production and supply at Sereni Fries, Kenya’s potato processing pioneer.',
    v: () => hero('About us', 'Over ten years of care in every batch.') +
    `<section class="wrap sec split2"><div data-r><p class="lead">Sereni Fries is a pioneer and leader in the processing of high quality and safe frozen and fresh cut potato products. We are headquartered in Nairobi, Kenya with three branches in Naivasha, Nakuru and Mombasa. Our brand is analogous to quality and safety, with each batch processed under a high degree of care.</p>
      <p class="lead">We buy Irish ware potatoes from small and medium scale farmers and process them into fresh and precooked products of different cuts and sizes. They are sold to customers across the B2B and B2C market in Kenya. We value our customers’ health and safety, so we run a stringent food safety management system.</p></div>
      <div data-r>${img('Crop-in-Bomet-County.jpeg', 'Potato crop in Bomet County', 'photo')}</div></section>
    <section class="green"><div class="wrap split2"><div data-r><h2 data-split>Our mission</h2><p class="lead">To offer quality potato products made with the utmost attention to quality and safety at good value to our customers.</p>
      <h2 data-split>Our vision</h2><p class="lead">To become the number one supplier of potato products in Kenya by selling and delivering the highest quality product on a timely basis and with 99% customer satisfaction.</p></div>
      <div data-r>${img('SF-Factory.jpg', 'Sereni Fries factory', 'photo')}</div></div></section>
    <section class="wrap sec"><h2 data-split>Our core values</h2><div data-r>${VALUES.map(v => `<details name="values"><summary>${v[0]}</summary><p>${v[1]}</p></details>`).join('')}</div></section>
    <section class="wrap sec split2"><div data-r><h2 data-split>Our production</h2><p class="lead">It all starts with farm grown potatoes, produced under good agricultural practices, that are perfectly processed by our committed team for a delightful meal. Our potato products are lovingly prepared in sizeable batches to ensure that only the best is supplied to our customers.</p></div><div data-r>${img('Production-line-3.jpg', 'Production line', 'photo')}</div>
      <div data-r>${img('Collection-and-Delivery.jpg', 'Collection and delivery', 'photo')}</div><div data-r><h2 data-split>Supply</h2><p class="lead">Our after-sales delivery service is top notch and highly reliable. Our delivery route planning is well thought out so that all our customers are promptly served.</p></div></section>
    <section class="wrap sec"><h2 data-split>Who we supply</h2><div data-r>${img('Clients-Logos.jpg', 'Sereni Fries client logos', 'logos')}</div></section>` + cta },
  // ---- PRODUCTS ----
  // Each fresh card shows a permanent description (f[1]) plus the shelf-life line the
  // toggle swaps (data-v/data-n attributes + .shelf class — untouched by the fix in §5).
  '/products': { t: 'Our products – Sereni Fries', d: 'Frozen chips, Lyonnaise potatoes, wedges, whole peeled potatoes and chips in five sizes for restaurants, supermarkets and hotels.',
    v: () => hero('Our products', 'Fresh and frozen, for restaurants, supermarkets and hotels.') +
    `<section class="wrap sec"><div class="card" data-r><div><span class="soon">Coming soon</span><h3>Frozen chips</h3><p>Our new frozen chips will be in the market soon. Discover the new varieties.</p><a class="btn" href="/products/frozen-fries">See the new varieties</a></div>${img('Pack_Matchstick.png', 'Frozen chips pack')}</div></section>
    <section class="green"><div class="wrap"><h2 data-split>For restaurants, supermarkets and hotels</h2>
      <div class="seg" role="group" aria-label="Packaging"><button data-m="v" aria-pressed="true">Vacuum sealed</button><button data-m="n" aria-pressed="false">Normal sealed</button></div>
      <div class="cards four">${FRESH.map(f => `<article class="card" data-r><div><h3>${f[0]}</h3><p>${f[1]}</p><p class="shelf" data-v="${SHELF.v}" data-n="${SHELF.n}">${SHELF.v}</p>${f[3] ? `<ul class="tags" aria-label="Sizes in mm">${f[3].map(s => `<li>${s} mm</li>`).join('')}</ul>` : ''}<a class="btn" href="/contact">Request a quote</a></div>${img(f[2], f[0])}</article>`).join('')}</div></div></section>` + cta },
  '/products/frozen-fries': { t: 'New frozen fries – Sereni Fries', d: 'Matchstick, medium and standard cut frozen fries from Sereni Fries, with cooking guidance.',
    v: () => hero('New frozen fries', 'Three cuts, ready for your fryer.') + `<section class="wrap sec"><p class="lead" data-r>Our new frozen chips will be in the market soon. Discover the three new cuts below.</p></section>` +
    `<section class="green"><div class="wrap"><div class="cards three">${cuts()}</div></div></section>
    <section class="wrap sec"><h2 data-split>How to cook</h2><p class="lead">Cooking guides below. EDIT: these are the original images; retype the steps as text so they are searchable.</p><div class="ph3" data-r>${img('HowToKook_TXT2b.png', 'How to cook, option 1')}${img('HowToKook_TXT2b2.png', 'How to cook, option 2')}</div></section>` + cta },
  // ---- CSR ----
  '/csr': { t: 'CSR – Sereni Fries', d: 'How Sereni trains and contracts small holder potato farmers in Kenya through climate smart agriculture and good agricultural practices.',
    v: () => hero('Corporate social responsibility', 'Growing with Kenya’s potato farmers.') +
    `<section class="wrap sec split2"><div data-r><h2 data-split>Our involvement with farmers</h2><p class="lead">In Kenya, potato farming has not been fully embraced as an agribusiness. The crop is mostly grown for subsistence and only slightly as a cash crop. Reluctance to farm commercially is largely due to failures from poor production practices, rainfall failure and gaps in the potato value chain.</p>
      <p>Ample and reliable supply of high-quality Irish ware potatoes is critical. Sereni pioneered a business model of collaboration with local small holder farmers. We onboard and train farmers on climate smart agriculture (CSA) and good agricultural practices (GAPs), covering land preparation, farm inputs and pesticide use, and we provide timely agronomy and weather information.</p>
      <p>We also create awareness on regenerative agriculture. Sereni engages farmers through their groups, partnering with key sector stakeholders, then contracts the trained farmers to grow our preferred ware potato variety. Farmers gain a ready market at a competitive price, which raises household income and creates employment.</p></div>
      <div data-r>${img('Harvest-Aggregation.jpeg', 'Harvest aggregation', 'photo')}<div class="stats"><div><b><span data-n="3000">3000</span>+</b><span>small holder farmers trained</span></div><div><b><span data-n="2000">2000</span>+</b><span>farmers benefitting from contracts</span></div></div></div></section>
    <section class="wrap sec"><div class="ph3" data-r>${img('Farmers-Harvesting-2.jpeg', 'Farmers harvesting', 'photo')}${img('Aggregation.jpeg', 'Aggregation', 'photo')}${img('Harvest-Aggregation.jpeg', 'Harvest', 'photo')}</div></section>` + cta },
  // ---- NEWS ----
  '/news': { t: 'News – Sereni Fries', d: 'Press coverage and updates from Sereni Fries.', v: () => hero('News', 'Coverage and updates.') + `<section class="wrap sec">${press()}</section>${sk()}` },
  // ---- CONTACT ----
  '/contact': { t: 'Contact – Sereni Fries', d: 'Contact Sereni Fries at Athi Business Park, Mlolongo, Nairobi. Call +254 725 690 901 or email info@serenifries.co.ke.',
    v: () => hero('Contact us', 'Orders, quotes and supply enquiries.') +
    `<section class="wrap sec cgrid"><div data-r><h2 data-split>Let’s talk fries.</h2>
      <address>Athi Business Park, 3<br>Old Msa Road, Mlolongo<br>P.O. Box 18108-00100, Nairobi, Kenya<br><br><a href="mailto:info@serenifries.co.ke">info@serenifries.co.ke</a><br><a href="tel:+254725690901">+254 725 690 901</a></address>
      <p>Branches: Naivasha, Nakuru and Mombasa.</p><p><a class="btn ghost" href="https://www.google.com/maps/search/?api=1&query=Athi+Business+Park+Mlolongo" target="_blank" rel="noopener noreferrer">Open in Maps</a></p></div>
      <form id="cf" novalidate data-r><label>Name<input name="name" autocomplete="name" required maxlength="80"><small class="err"></small></label>
      <label>Email<input name="email" type="email" autocomplete="email" required maxlength="120"><small class="err"></small></label>
      <label>Message<textarea name="message" rows="5" required maxlength="800"></textarea><small class="err"></small></label>
      <button class="btn" type="submit">Send on WhatsApp</button></form></section>${sk()}` },
  // ---- LEGAL (placeholder text: EDIT and have it reviewed before launch) ----
  '/privacy': { t: 'Privacy policy – Sereni Fries', d: 'How Sereni Fries handles your information.', v: () => legal('Privacy policy',
    `<p>This site does not use cookies or analytics. The contact form does not store your details on our servers: it prepares a WhatsApp message that you choose to send, so your name, email and message are shared with Sereni Fries only if you send it.</p><h3>Third-party services</h3><p>Fonts load from Google Fonts and animation code from cdnjs, which may receive your IP address.</p><h3>Contact</h3><p>Questions: info@serenifries.co.ke.</p>`) },
  '/terms': { t: 'Terms of use – Sereni Fries', d: 'Terms for using the Sereni Fries website.', v: () => legal('Terms of use',
    `<p>Content on this site is provided for general information. Product availability, packaging and shelf life may change, so confirm details with Sereni Fries before ordering. Logos, product images and text belong to Sereni Fries.</p>`) },
  '404': { t: 'Page not found – Sereni Fries', d: 'This page does not exist.', v: () => legal('That page isn’t on the menu.', `<p>The link may be old or mistyped.</p>`) }
};

/* ---------- 4. ROUTER (History API; hosting rewrites every path to index.html —
   see vercel.json / _redirects note in the deployment checklist) ---------- */
const app = $('#app'), wipe = $('#wipe');
let rt; const refresh = () => { clearTimeout(rt); rt = setTimeout(() => ST && ST.refresh(), 150); };
app.addEventListener('load', refresh, true);                       // lazy images change layout, so re-measure scroll triggers
let ready = false, busy = false; const queue = [];                 // queue = animations waiting for the preloader to finish
const when = f => ready ? f() : queue.push(f);
const norm = p => (p.replace(/\/+$/, '').replace(/\/index\.html$/, '') || '/');   // also maps /index.html to /
const anim = () => G && !RM && ready;

function draw(path) {                                              // render one page into <main>
  const p = PAGES[path] || PAGES['404'];                           // unknown path → soft 404 page
  ST && ST.getAll().forEach(t => t.kill());                        // old page's scroll animations must not linger
  app.innerHTML = p.v();
  document.title = p.t; $('#md').content = p.d;
  // An unknown path renders the 404 page — never advertise that dead URL to search
  // engines; point the canonical at home instead.
  $('#cn').href = SITE + (PAGES[path] && path !== '/' ? path : '');
  // Highlight the current nav link ("/products/frozen-fries" also lights "Products")
  $$('#menu a').forEach(a => a.toggleAttribute('aria-current', norm(a.getAttribute('href')) === path || (path.startsWith('/products') && a.getAttribute('href') === '/products')));
  setOpen(false); enhance(); app.focus({ preventScroll: true });   // focus <main> so keyboard users land in the new content
}
async function nav(href, push = true) {                            // animated page change
  const path = norm(new URL(href, location.origin).pathname);
  if (busy) return;                                                // a transition is already running — ignore
  if (push && path === norm(location.pathname)) return scrollTo({ top: 0, behavior: 'smooth' }); // same page = scroll to top
  busy = true;
  try {
    const fx = anim();
    if (fx) { G.set(wipe, { yPercent: 100, visibility: 'visible' }); await G.to(wipe, { yPercent: 0, duration: .5, ease: 'power3.inOut' }); } // curtain down
    if (push) history.pushState({}, '', path);
    draw(path);
    scrollTo({ top: 0, behavior: 'instant' });                     // instant: smooth scrolling here would animate under the curtain
    if (fx) { await G.to(wipe, { yPercent: -100, duration: .5, ease: 'power3.inOut' }); G.set(wipe, { visibility: 'hidden' }); } // curtain up
  } finally { busy = false; }                                      // never leave navigation locked
}
// Intercept internal links (anything starting with a single "/") — but ONLY real pages.
// Root-relative file links (e.g. locally hosted /pdf/ articles) are not pages, so
// they fall through to the browser and open normally instead of hitting the 404 route.
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="/"]');
  if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || a.getAttribute('href').startsWith('//')) return;
  if (!PAGES[norm(new URL(a.getAttribute('href'), location.origin).pathname)]) return; // not a page → let the browser handle it
  e.preventDefault(); nav(a.getAttribute('href'));
});
addEventListener('popstate', () => nav(location.pathname, false)); // back/forward buttons

/* ---------- 5. ANIMATIONS (all skipped if GSAP is missing or reduced motion is on) ---------- */
function enhance() {
  if (!G || RM) return;
  // Headline word reveal: hero headlines wait for the preloader, others play on scroll
  $$('[data-split]').forEach(el => {
    el.innerHTML = el.textContent.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
    const q = $$('.w>span', el); G.set(q, { yPercent: 115 });
    const play = () => G.to(q, { yPercent: 0, duration: .9, stagger: .06, ease: 'power4.out' });
    if (el.closest('.hero')) when(play); else ST && ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: play });
  });
  // Scroll reveal for [data-r] — guarded so pages without any don't log warnings
  if ($('[data-r]')) {
    G.set('[data-r]', { y: 40, opacity: 0 });
    ST && ST.batch('[data-r]', { start: 'top 90%', once: true, onEnter: b => G.to(b, { y: 0, opacity: 1, duration: .8, stagger: .12, overwrite: true, clearProps: 'transform,opacity' }) });
  }
  // Count-up numbers — ★ THE NaN FIX ★ scoped to .stats so it can never grab the
  // /products shelf lines, whose data-n attribute means "normal sealed". The old
  // selector [data-n] matched them too: it wiped their text to 0, then animated
  // it to NaN (counting to a sentence). Pages without stats simply do nothing.
  $$('.stats [data-n]').forEach(el => { const n = +el.dataset.n, o = { v: 0 }; el.textContent = 0;
    ST && ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => G.to(o, { v: n, duration: 1.4, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('en-US') }) }); });
  // Hero intro for the paragraph and buttons (headline handled by the split above) —
  // guarded: legal pages have no hero, and animating nothing also logs a warning
  if ($('.hero .ht p')) when(() => G.from('.hero .ht p,.hero .ht .btn', { y: 20, opacity: 0, duration: .7, stagger: .1, clearProps: 'transform,opacity' }));
  // Hero pointer parallax: JS only sets --mx/--my (-0.5..0.5); CSS does the movement (see .art in styles.css §7)
  const art = $('[data-hero] .art');
  if (art) {
    const hr = art.closest('.hero');
    hr.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = hr.getBoundingClientRect(); art.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); art.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    hr.addEventListener('pointerleave', () => { art.style.setProperty('--mx', 0); art.style.setProperty('--my', 0); });
  }
}
// Magnetic buttons + 3D card tilt (delegated, mouse only)
document.addEventListener('pointermove', e => {
  if (!G || RM || e.pointerType !== 'mouse') return;
  const b = e.target.closest('.btn'), c = e.target.closest('.card');
  if (b) { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); }
  if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg'); c.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 8 + 'deg'); }
});
document.addEventListener('pointerout', e => {                      // release: buttons spring back, cards level out
  const b = e.target.closest('.btn'), c = e.target.closest('.card');
  if (b && G) G.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' });
  if (c) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }
});

/* ---------- 6. UI: header, menu, toggle, form, preloader ---------- */
const header = $('header'), topBtn = $('.top'), burger = $('#burger');
// Opens/closes the mobile menu: .open drives the circle reveal + burger X in CSS;
// overflow hidden locks page scroll while the fullscreen menu is up
function setOpen(o) { header.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; }
burger.onclick = () => setOpen(!header.classList.contains('open')); // tap burger = toggle menu
addEventListener('keydown', e => e.key === 'Escape' && setOpen(false)); // Esc always closes
topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });   // floating ↑ button
addEventListener('scroll', () => topBtn.classList.toggle('show', scrollY > 700), { passive: true }); // show ↑ after 700px
// With the menu open, resizing past the desktop breakpoint used to leave the page
// scroll-locked with no visible menu — now it auto-closes at ≥860px. This number
// MUST match the desktop media query in styles.css §10.
const desk = matchMedia('(min-width:860px)');
const onGrow = () => { if (desk.matches) setOpen(false); };
desk.addEventListener ? desk.addEventListener('change', onGrow) : desk.addListener(onGrow); // addListener = old Safari fallback

// Vacuum / normal toggle on /products — swaps every .shelf line's text via data-v/data-n
document.addEventListener('click', e => {
  const b = e.target.closest('.seg button'); if (!b) return;
  $$('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
  $$('.shelf').forEach(p => p.textContent = p.dataset[b.dataset.m]);
});
// Contact form: validate, then hand off to WhatsApp (EDIT: replace with a backend/email service if wanted)
document.addEventListener('submit', e => {
  const f = e.target.closest('#cf'); if (!f) return; e.preventDefault(); let ok = true;
  $$('input,textarea', f).forEach(el => { const v = el.value.trim(), bad = !v || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(v));
    el.setAttribute('aria-invalid', bad); el.nextElementSibling.textContent = bad ? (v ? 'Enter a valid email address.' : 'This field is required.') : ''; ok = ok && !bad; });
  if (!ok) return;
  const d = Object.fromEntries(new FormData(f));
  open(`https://wa.me/${WA}?text=` + encodeURIComponent(`Hi Sereni Fries, I'm ${d.name} (${d.email}). ${d.message}`), '_blank', 'noopener'); f.reset();
});

// Preloader: home page, first visit per session. DUR ms of "fries rising" + logo
// reveal + curtain split. Click it to skip. DUR and WORDS are the timing/copy dials.
function boot() {
  draw(norm(location.pathname));                                   // render first so content is ready behind the loader
  const L = $('#loader'); let seen = false;
  try { seen = sessionStorage.getItem('sf'); sessionStorage.setItem('sf', 1); } catch (_) {} // private-mode safe
  const start = () => { ready = true; document.body.classList.remove('loading'); queue.forEach(f => f()); };
  if (seen || norm(location.pathname) !== '/' || RM) { L.remove(); return start(); } // skip: repeat visit, not home, or reduced motion
  const DUR = 5000, WORDS = ['Sourcing from Kenyan farms', 'Washing and peeling', 'Cutting to size', 'Packing with care']; // EDIT timing and words
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;      // smooth ease-in-out for the counter
  let loaded = document.readyState === 'complete', fin = false;
  addEventListener('load', () => loaded = true); setTimeout(() => loaded = true, 8000); // never wait on a stuck asset longer than 8s
  const pct = $('.pct'), lw = $('.lw'), t0 = performance.now();
  const finish = () => { if (fin) return; fin = true; L.classList.add('fin');                       // logo pops in
    setTimeout(() => { L.classList.add('done'); setTimeout(() => { L.remove(); start(); }, 900); }, 1500); }; // then the curtain splits (1500 = logo hold time)
  L.addEventListener('click', finish);                             // click anywhere = skip
  (function tick(t) {                                              // holds at 88% until the page has fully loaded
    if (fin) return;
    const p = Math.floor(Math.min(ease(Math.min((t - t0) / DUR, 1)) * 100, loaded ? 100 : 88));
    L.style.setProperty('--p', p); pct.textContent = p; lw.textContent = WORDS[Math.min(3, Math.floor(p / 25))];
    p >= 100 ? finish() : requestAnimationFrame(tick);
  })(t0);
}
boot();
})();