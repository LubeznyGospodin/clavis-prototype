/* CLAVIS прототип: проходка «бармен собирает хайбол», вкусы, калькулятор, попап */
gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---------- плавный скролл ---------- */
const lenis = new Lenis({ lerp: .085, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { duration: 1.6 }); }
}));

const portrait = () => innerWidth < 900 || innerHeight > innerWidth;

/* заголовки режем на слова: каждое выезжает из-под маски */
$$('.words .ln').forEach(ln => {
  ln.querySelectorAll('em').forEach(em => em.outerHTML = em.innerHTML.split(' ').map(w => `<span><em>${w}</em></span>`).join(' '));
  ln.innerHTML = ln.innerHTML.replace(/(^|\s)([^<\s][^\s<]*)(?=\s|$)/g, '$1<span>$2</span>');
});
const words = el => el.querySelectorAll('.ln > span');

/* ---------- ФИЛЬМ: кадры видео на canvas, промотка скроллом ---------- */
// FILM = { count, seg: [первый кадр каждой склейки], w, h } пишет hf/build_film.py
const F = window.FILM;
const canvas = $('#film'), g = canvas.getContext('2d', { alpha: false });
const imgs = new Array(F.count);
const src = i => `img/film/f_${String(i).padStart(4, '0')}.webp`;
function load(i) {
  return imgs[i] ? Promise.resolve() : new Promise(r => { const im = new Image(); im.decoding = 'async'; im.onload = () => { imgs[i] = im; r(); }; im.onerror = r; im.src = src(i); });
}
// сначала каждый 8-й кадр по всей длине, потом гуще: скролл не попадает в дыры
async function preloadAll() {
  for (const step of [8, 4, 2, 1]) {
    const q = []; for (let i = 0; i < F.count; i += step) if (!imgs[i]) q.push(i);
    for (let k = 0; k < q.length; k += 8) await Promise.all(q.slice(k, k + 8).map(load));
  }
}
const near = i => { for (let d = 0; d < F.count; d++) { if (imgs[i - d]) return i - d; if (imgs[i + d]) return i + d; } return -1; };

// раскладка кадра: на десктопе cover, на телефоне полоса сверху с фокусом между стаканом и бутылкой
let box = { x: 0, y: 0, w: 0, h: 0 };
function sizeFilm() {
  const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.imageSmoothingQuality = 'high';
  if (portrait()) {
    const s = Math.max(W / (F.w * .5), H * .62 / F.h), w = F.w * s;
    box = { w, h: F.h * s, x: W / 2 - w * .58, y: Math.max(56, H * .06) };
  } else {
    const s = Math.max(W / F.w, H / F.h);
    // кадр чуть ниже центра: крышка бутылки не уходит под меню, верх растворяется в фон
    box = { w: F.w * s, h: F.h * s, x: (W - F.w * s) / 2, y: (H - F.h * s) / 2 + H * .07 };
  }
  shownDrawn = -1;
}
// плавность: показанный кадр догоняет целевой, соседние кадры смешиваются по дробной части
const film = { target: 0 };
let shown = 0, shownDrawn = -1;
function render() {
  requestAnimationFrame(render);
  const d = film.target - shown;
  shown = Math.abs(d) < .01 ? film.target : shown + d * .16;
  if (shown === shownDrawn) return;
  const i = Math.floor(shown), a = shown - i, i0 = near(i);
  if (i0 < 0) return;
  g.fillStyle = '#f6ead9'; g.fillRect(0, 0, innerWidth, innerHeight);
  g.globalAlpha = 1; g.drawImage(imgs[i0], box.x, box.y, box.w, box.h);
  if (a > .02 && imgs[i + 1] && i0 === i) { g.globalAlpha = a; g.drawImage(imgs[i + 1], box.x, box.y, box.w, box.h); g.globalAlpha = 1; }
  shownDrawn = shown;
}

/* ---------- прелоадер: первые кадры, шрифты, остальное догружается фоном ---------- */
const fill = $('#loaderFill');
const first = Array.from({ length: Math.min(24, F.count) }, (_, i) => i).concat(F.seg);
let got = 0;
Promise.all(first.map(i => load(i).then(() => fill.style.width = (++got / first.length * 100) + '%')))
  .then(() => document.fonts.ready)
  .then(() => { sizeFilm(); render(); setTimeout(() => { $('#loader').classList.add('out'); intro(); preloadAll(); }, 250); });

function intro() {
  const hero = $('.cap-hero');
  gsap.from(words(hero), { yPercent: 115, rotation: 6, duration: 1.4, stagger: .08, ease: 'expo.out', delay: .1 });
  gsap.from(hero.querySelectorAll(':scope > :not(h1)'), { y: 30, opacity: 0, duration: 1.3, stagger: .1, ease: 'expo.out', delay: .4 });
  gsap.from('#film', { opacity: 0, scale: 1.06, duration: 2.2, ease: 'expo.out', clearProps: 'transform' });
}

/* ---------- ПРОХОДКА ---------- */
const stage = $('#stage');
// план скролла: [кадр от, кадр до, вес]; вес травела = кадры, паузы в экранах
const PX_PER_FRAME = 10;
let plan, walkTL;
// план скролла по дублям фильма (F.seg = первый кадр каждого дубля):
// 0 стакан и бармен, 1 лёд, 2 бутылка в джиггер, 3 бутылку на место, 4 джиггер в стакан,
// 5 содовая, 6 ложка, 7 гарниш, 8 бармен уходит
function buildPlan() {
  const S = F.seg, E = F.count - 1, H = innerHeight / PX_PER_FRAME;
  return [
    [0, 0, H * .35],            // герой: бутылка одна
    [0, S[1], S[1]],            // стакан выезжает, бармен подходит
    [S[1], S[2], S[2] - S[1]],  // лёд
    [S[2], S[2], H * .4],
    [S[2], S[5], S[5] - S[2]],  // бутылка, джиггер, основа в стакан
    [S[5], S[5], H * .4],
    [S[5], S[7], S[7] - S[5]],  // содовая по ложке, поворот
    [S[7], S[7], H * .4],
    [S[7], E, E - S[7]],        // гарниш, трубочки, бармен уходит
    [E, E, H * .9],
  ];
}
// позиции частей плана в долях прокрутки
const at = k => plan.slice(0, k).reduce((s, p) => s + p[2], 0) / plan.reduce((s, p) => s + p[2], 0);
function frameAt(p) {
  const tot = plan.reduce((s, x) => s + x[2], 0); let acc = 0;
  for (const [f0, f1, w] of plan) {
    if (p * tot <= acc + w) return f0 + (f1 - f0) * ((p * tot - acc) / w);
    acc += w;
  }
  return F.count - 1;
}

function buildWalk() {
  walkTL && walkTL.scrollTrigger.kill(), walkTL && walkTL.kill();
  plan = buildPlan();
  const W = innerWidth, total = plan.reduce((s, p) => s + p[2], 0) * PX_PER_FRAME;
  $('#walk').style.height = (innerHeight + total) + 'px';

  // колонки текста: левее стакана (≈44% кадра) и левее бутылки на крупном плане (≈55%)
  const capLeft = Math.max(16, Math.min(96, W * .06));
  stage.style.setProperty('--colw', Math.max(240, box.x + box.w * .42 - capLeft - 40) + 'px');
  // колонка героя: от левого поля до бутылки (левый край ~62% кадра), но не шире 46% экрана
  const herow = Math.max(260, Math.min(W * .46, 720, box.x + box.w * .6 - capLeft - 48));
  stage.style.setProperty('--herow', herow + 'px');
  stage.style.setProperty('--capl', capLeft + 'px');
  // кегль: самая длинная строка «топовые коктейли» ≈ 7.2 em; по высоте три строки + чипы + кнопка
  stage.style.setProperty('--herofs', Math.round(Math.max(40, Math.min(herow / 7.4, (innerHeight - 330) / 3.1, 128))) + 'px');
  gsap.set('.cap, .cap-hero', { yPercent: portrait() ? 0 : -50 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#walk', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: s => { film.target = frameAt(s.progress); railUpdate(s.progress); } }
  });
  tl.to({}, { duration: 1 }, 0); // шкала таймлайна = доля прокрутки 0..1

  // герой уходит по словам в первой половине отъезда
  const hero = $('.cap-hero'), d1 = at(1), d2 = at(2);
  tl.to(words(hero), { yPercent: -120, rotation: -4, stagger: .006, duration: (d2 - d1) * .45, ease: 'power2.in' }, d1);
  tl.to(hero.querySelectorAll(':scope > :not(h1)'), { y: -40, opacity: 0, stagger: .004, duration: (d2 - d1) * .35, ease: 'power2.in' }, d1);
  tl.set(hero, { autoAlpha: 0 }, d1 + (d2 - d1) * .6);
  tl.to('#heroShade', { opacity: 0, duration: (d2 - d1) * .6 }, d1);
  tl.fromTo('#capsShade', { opacity: 0 }, { opacity: 1, duration: (d2 - d1) * .6 }, d1);
  tl.fromTo('#rail', { opacity: 0 }, { opacity: 1, duration: .02 }, d2);

  cap(tl, 1, at(2), at(4) - .005);
  cap(tl, 2, at(4), at(6) - .005);
  cap(tl, 3, at(6), at(8) - .005);
  cap(tl, 4, at(8) + (at(9) - at(8)) * .55, 2);
  walkTL = tl;
}

function cap(tl, i, tin, tout) {
  const el = $(`.cap[data-cap="${i}"]`), w = words(el), rest = el.querySelectorAll(':scope > :not(h2):not(.bignum)'), num = el.querySelector('.bignum');
  const D = .022; // длительность входа/выхода в долях прокрутки
  tl.set(el, { autoAlpha: 1 }, tin);
  tl.fromTo(w, { yPercent: 115, rotation: 7 }, { yPercent: 0, rotation: 0, stagger: D / 8, duration: D, ease: 'power3.out' }, tin);
  tl.fromTo(rest, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: D / 6, duration: D, ease: 'power3.out' }, tin + D * .3);
  if (num) tl.fromTo(num, { yPercent: 40, opacity: 0 }, { yPercent: -20, opacity: 1, duration: Math.min(tout, 1) - tin, ease: 'none' }, tin);
  if (tout < 1) {
    tl.to(w, { yPercent: -120, rotation: -5, stagger: D / 10, duration: D * .8, ease: 'power2.in' }, tout - D);
    tl.to(rest, { y: -30, opacity: 0, duration: D * .7, ease: 'power2.in' }, tout - D);
    if (num) tl.to(num, { opacity: 0, duration: D * .7 }, tout - D);
    tl.set(el, { autoAlpha: 0 }, tout);
  }
}

const railItems = $$('#rail li');
function railUpdate(p) {
  const idx = p < at(2) ? -1 : p < at(4) ? 0 : p < at(6) ? 1 : p < at(8) ? 2 : 3;
  railItems.forEach((li, k) => { li.classList.toggle('on', k === idx); li.classList.toggle('done', k < idx); });
  const light = p < .985;
  $('#nav').classList.toggle('solid', !light);
  if ($('#nav').classList.contains('light') !== light) {
    $('#nav').classList.toggle('light', light);
    $('.nav-logo img').src = light ? 'img/logo-dark.png' : 'img/logo-white.png';
  }
}

/* ---------- ВКУСЫ ---------- */
const FLAVORS = [
  { name: 'Клюква', sub: 'цитрус · розмарин', img: 'f1', b: 'b1', bg: '#a3122a', notes: 'Кислая клюква и хвойный розмарин, сверху свежая цедра. Согревает даже в хайболе со льдом.', fam: 'Ягодные', brix: 40, ph: '3,0' },
  { name: 'Роза', sub: 'ревень · грейпфрут', img: 'f2', b: 'b2', bg: '#e98f9a', notes: 'Роза с хрустким ревенем и горчинкой грейпфрута. Сам просится в спритц.', fam: 'Цветочные', brix: 41, ph: '3,1' },
  { name: 'Юдзу', sub: 'бамбук · лемонграсс', img: 'f3', b: 'b3', bg: '#7fa83a', notes: 'Японский цитрус и травяная свежесть. Летний лимонад вы соберёте за минуту.', fam: 'Цитрусовые', brix: 38, ph: '2,8', isNew: 1 },
  { name: 'Мандарин', sub: 'безалкогольный биттер', img: 'f4', b: 'b4', bg: '#e2741c', notes: 'Новогодний мандарин с горчинкой биттера. Хорош с тоником и в горячем.', fam: 'Пряные', brix: 42, ph: '2,9', isNew: 1 },
  { name: 'Лаванда', sub: 'зизифора · кактус', img: 'f5', b: 'b5', bg: '#7b4fa8', notes: 'Лаванда и горная мята зизифора, для сочности кактус. У него самый яркий цвет в линейке.', fam: 'Цветочные', brix: 39, ph: '3,0', isNew: 1 },
  { name: 'Шисо', sub: 'земляника · лемонграсс', img: 'f6', b: 'b6', bg: '#e04a3a', notes: 'Лесная земляника и пряный шисо. Вкус дачного лета в одном стакане.', fam: 'Ягодные', brix: 40, ph: '2,9', isNew: 1 }
];
const track = $('#flavorsTrack');
track.innerHTML = FLAVORS.map((f, i) => `
  <article class="fl" style="--bg:${f.bg}">
    <span class="fl-big" aria-hidden="true">${f.name}</span>
    <div class="fl-photo"><img src="img/${f.img}.webp" alt="Напиток ${f.name}, ${f.sub}" loading="lazy"></div>
    <div class="fl-body">
      <span class="fl-tag">${f.isNew ? 'Новинка · ' : ''}${f.fam}</span>
      <h3 class="fl-name">${f.name}<em>${f.sub}</em></h3>
      <p class="fl-notes">${f.notes}</p>
      <div class="fl-meta"><span><b>0,75 л</b>кордиал</span><span><b>${f.brix}</b>Brix</span><span><b>${f.ph}</b>pH</span><span><b>800 ₽</b>на маркетплейсе</span></div>
      <div class="fl-buy"><button type="button" class="btn btn-light" data-order>Заказать</button><a href="#" class="chip">Ozon</a><a href="#" class="chip">WB</a><a href="#" class="chip">Я.Маркет</a></div>
    </div>
    <img src="img/${f.b}.png" alt="" class="fl-bottle">
  </article>`).join('');

function buildFlavors() {
  const panels = $$('.fl');
  const dist = () => track.scrollWidth - innerWidth;
  const hz = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '#flavors', pin: '.flavors-pin', start: 'top top', end: () => '+=' + dist(), scrub: true, invalidateOnRefresh: true,
      onUpdate: s => { $('#flavorNum').textContent = String(Math.min(6, Math.round(s.progress * 5) + 1)).padStart(2, '0'); }
    }
  });
  panels.forEach(p => {
    const st = { containerAnimation: hz, trigger: p, start: 'left right', end: 'right left', scrub: true };
    gsap.fromTo(p.querySelector('.fl-photo img'), { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: st });
    gsap.fromTo(p.querySelector('.fl-bottle'), { rotation: 18, y: 80 }, { rotation: -10, y: -40, ease: 'none', scrollTrigger: st });
    gsap.fromTo(p.querySelector('.fl-big'), { xPercent: 30 }, { xPercent: -30, ease: 'none', scrollTrigger: st });
  });
  ScrollTrigger.create({ trigger: '#flavors', start: 'top 40%', once: true, onEnter: () => setTimeout(showPop, 1400) });
}

/* ---------- появления ---------- */
function buildReveals() {
  $$('.reveal').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

  $$('[data-count]').forEach(el => {
    const n = +el.dataset.count, suffix = el.textContent.replace(/^[\d\s]*\d/, ''), o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () =>
      gsap.to(o, { v: n, duration: 1.6, ease: 'expo.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('ru-RU') + suffix }) });
  });

  $$('.glass-card').forEach((c, k) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 75%' }, delay: k * .15 });
    tl.to(c.querySelector('.g-top'), { scaleY: .82, duration: 1.4, ease: 'power2.out' })
      .to(c.querySelector('.g-base'), { scaleY: 1, duration: .8, ease: 'power2.out' }, 0);
  });

  $$('.split-bg, .contract-img img').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } }));
  gsap.from('#bottleRow img', { y: 160, opacity: 0, rotation: (i) => (i - 2.5) * 6, stagger: .08, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#bottleRow', start: 'top 85%' } });
}

/* ---------- калькулятор ---------- */
function calc() {
  const price = +$('#cPrice').value || 0, dose = Math.max(1, +$('#cDose').value || 1), menu = +$('#cMenu').value || 0;
  const serv = Math.floor(750 / dose);
  $('#oServ').textContent = serv;
  $('#oCost').textContent = Math.round(price * dose / 750) + ' ₽';
  $('#oRev').textContent = (serv * menu).toLocaleString('ru-RU') + ' ₽';
  $('#oShare').textContent = menu ? Math.round(price * dose / 750 / menu * 100) + '%' : '0%';
}
$$('#calc input').forEach(i => i.addEventListener('input', calc)); calc();

/* ---------- попап «пробка» ---------- */
const pop = $('#pop');
let popShown = false;
function seenPop() { try { return sessionStorage.getItem('clvPop') === '1'; } catch (e) { return false; } }
// режимы попапа: промокод (вылетает сам) и заявка на заказ (по кнопке)
const POP = {
  promo: { title: 'Минус 10% на первый заказ', lead: 'Пришлём промокод и первыми расскажем о новых вкусах, сезонных подачах и акциях.', btn: 'Получить промокод', ok: 'Промокод уже летит к вам на почту!', phone: false },
  order: { title: 'Заказ со скидкой 10%', lead: 'Оставьте телефон. Менеджер перезвонит, поможет выбрать вкусы и оформит доставку.', btn: 'Оставить заявку', ok: 'Заявка принята, скоро перезвоним!', phone: true },
};
function popMode(m) {
  const c = POP[m];
  $('#popTitle').textContent = c.title; $('#popLead').textContent = c.lead;
  $('#popBtn').textContent = c.btn; $('#popOk').textContent = c.ok;
  $('#popPhone').hidden = !c.phone; $('#popEmail').hidden = c.phone;
  $('#popPhone input').required = c.phone; $('#popEmail input').required = !c.phone;
  $('.pop-form').classList.remove('done');
}
function showPop(force, mode = 'promo') {
  if (popShown || (!force && seenPop())) return;
  popShown = true;
  popMode(mode);
  if (mode === 'order') { // по кнопке без шоу с пробкой: сразу карточка
    lenis.stop(); pop.classList.add('on'); pop.setAttribute('aria-hidden', 'false');
    gsap.to(pop, { backgroundColor: 'rgba(10,5,3,.82)', duration: .3 });
    gsap.fromTo('#popCard', { scale: .92, y: 30, opacity: 0, rotation: 0 }, { scale: 1, y: 0, opacity: 1, duration: .6, ease: 'expo.out' });
    return;
  }
  try { sessionStorage.setItem('clvPop', '1'); } catch (e) {}
  lenis.stop();
  pop.classList.add('on'); pop.setAttribute('aria-hidden', 'false');
  const bottle = $('#popBottle'), card = $('#popCard'), burst = $('#popBurst');
  burst.innerHTML = '';
  const tl = gsap.timeline();
  tl.to(pop, { backgroundColor: 'rgba(10,5,3,.82)', duration: .4 })
    .fromTo(bottle, { y: 120, opacity: 0, rotation: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'back.out(1.6)' })
    .to(bottle, { keyframes: { rotation: [-12, 12, -16, 16, -10, 10, -6, 0], x: [-6, 6, -8, 8, -4, 4, 0, 0] }, duration: .9, ease: 'none' })
    .add(() => {
      const r = bottle.getBoundingClientRect();
      const nx = r.left + r.width / 2, ny = r.top + r.height * .03;
      // пробка летит прямо в зрителя
      gsap.fromTo('#popCork', { x: nx, y: ny, scale: 1, rotation: 0, opacity: 1 },
        { y: ny - innerHeight * .25, x: nx + 40, scale: 16, rotation: 300, duration: .65, ease: 'power3.in',
          onComplete: () => gsap.set('#popCork', { opacity: 0 }) });
      gsap.fromTo('#popFlash', { opacity: 0 }, { opacity: .7, duration: .12, delay: .55, yoyo: true, repeat: 1 });
      const cols = ['#b4152f', '#d9334d', '#e8b46a', '#fff4e6', '#ffffff'];
      for (let i = 0; i < 70; i++) {
        const d = document.createElement('i');
        const s = rnd(6, 26);
        d.style.cssText = `width:${s}px;height:${s}px;left:${nx}px;top:${ny}px;background:${cols[i % cols.length]}`;
        burst.appendChild(d);
        const a = rnd(-Math.PI, 0), v = rnd(.3, 1) * Math.max(innerWidth, innerHeight) * .7;
        gsap.fromTo(d, { x: 0, y: 0, scale: .2, opacity: 1 },
          { x: Math.cos(a) * v, y: Math.sin(a) * v * .9 + rnd(80, 260), scale: rnd(1, 3), opacity: 0, duration: rnd(1, 1.8), ease: 'expo.out' });
      }
    })
    .to(bottle, { y: '60vh', rotation: 20, opacity: 0, duration: .7, ease: 'power3.in' }, '+=.05')
    .fromTo(card, { scale: .4, y: -60, opacity: 0, rotation: -4 }, { scale: 1, y: 0, opacity: 1, rotation: 0, duration: .9, ease: 'back.out(1.5)' }, '-=.3')
    .from('.pop-body > *, .pop-form > *', { y: 20, opacity: 0, stagger: .04, duration: .5, ease: 'power3.out' }, '-=.45')
    .from('.pop-img img', { scale: 1.15, duration: 1.2, ease: 'expo.out' }, '<');
}
function hidePop() {
  gsap.to('#popCard', { scale: .9, opacity: 0, duration: .3 });
  gsap.to(pop, { backgroundColor: 'rgba(10,5,3,0)', duration: .4, onComplete: () => { pop.classList.remove('on'); pop.setAttribute('aria-hidden', 'true'); lenis.start(); popShown = false; } });
}
$('#popX').addEventListener('click', hidePop);
pop.addEventListener('click', e => { if (e.target === pop) hidePop(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && pop.classList.contains('on')) hidePop(); });
if (location.search.includes('pop')) setTimeout(() => showPop(true), 2200);
$$('[data-order]').forEach(b => b.addEventListener('click', () => showPop(true, 'order')));

/* ---------- сборка ---------- */
sizeFilm();
buildWalk();
buildFlavors();
buildReveals();
let rw, lastW = innerWidth;
addEventListener('resize', () => {
  clearTimeout(rw);
  if (innerWidth === lastW) return; // мобильный адресбар меняет только высоту
  rw = setTimeout(() => { lastW = innerWidth; sizeFilm(); buildWalk(); ScrollTrigger.refresh(); }, 250);
});
