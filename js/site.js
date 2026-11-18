// Общие части сайта: шапка, подвал, ботаника вокруг арок, бутылки, корзина, сет, формы.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';
const param = (k) => new URLSearchParams(location.search).get(k);
const byId = (list, id) => list.find((x) => x.id === id);
const family = (id) => byId(FAMILIES, id);
const lineName = (id) => byId(LINES, id).name;

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ---------- Цвет ---------- */
function mix(hex, to = '#f4efe6', w = 0.72) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(to);
  return '#' + a.map((v, i) => Math.round(v * (1 - w) + b[i] * w).toString(16).padStart(2, '0')).join('');
}

/* ---------- Ботаника вокруг арки ---------- */
// Координаты в системе 128 x 146.7: арка занимает x 14..114, верх дуги с центром (64, 60.7).
function seeded(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Стебель идёт вверх по краю арки и заворачивает по дуге: слева выше, справа ниже.
function vine(side) {
  const pts = [], cx = 64, cy = 60.7, r = 56, x0 = cx + side * r;
  for (let y = 142; y > cy; y -= 4) pts.push([x0 + Math.sin(y / 9) * 1.2, y]);
  const from = side < 0 ? Math.PI : 0, to = side < 0 ? Math.PI * 0.62 : Math.PI * 0.3;
  for (let i = 0; i <= 12; i++) {
    const a = from + (to - from) * (i / 12);
    pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]);
  }
  return pts;
}

function botanic(fam, seed = 'x') {
  const rnd = seeded(seed + fam);
  const ink = family(fam)?.color || '#5d7a3a';
  const leaf = (x, y, ang, len) => `<path d="M0 0 C${len * 0.3} ${-len * 0.32} ${len * 0.75} ${-len * 0.3} ${len} 0 C${len * 0.75} ${len * 0.3} ${len * 0.3} ${len * 0.32} 0 0Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)})"/>`;
  const berry = (x, y) => [[0, 0], [2.6, 1.6], [-0.4, 3]].map(([dx, dy]) => `<circle cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" r="1.7"/>`).join('');
  const flower = (x, y) => [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${(x + Math.cos(a * Math.PI / 180) * 2.2).toFixed(1)}" cy="${(y + Math.sin(a * Math.PI / 180) * 2.2).toFixed(1)}" rx="1.7" ry="1.1" transform="rotate(${a} ${(x + Math.cos(a * Math.PI / 180) * 2.2).toFixed(1)} ${(y + Math.sin(a * Math.PI / 180) * 2.2).toFixed(1)})"/>`).join('') + `<circle cx="${x}" cy="${y}" r="0.9" fill="${ink}"/>`;
  let stems = '', leaves = '', extras = '';
  for (const side of [-1, 1]) {
    const pts = vine(side);
    stems += `<path d="M${pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')}"/>`;
    pts.forEach((p, i) => {
      if (i === 0 || i % 2) return;
      const q = pts[Math.min(i + 1, pts.length - 1)];
      const t = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
      const flip = (i / 2) % 2 ? 1 : -1;
      leaves += leaf(p[0], p[1], t + flip * (48 + rnd() * 14), 6.5 + rnd() * 3.5);
      if (fam === 'berry' && i % 8 === 4) extras += berry(p[0] + flip * 3, p[1] + 2);
      if (fam === 'flower' && i % 6 === 0) extras += flower(p[0] - flip * 4, p[1]);
      if ((fam === 'fruit' || fam === 'dessert') && i % 8 === 0) extras += `<circle cx="${(p[0] + flip * 3.5).toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.4"/>`;
    });
  }
  return `<svg class="botanic" viewBox="0 0 128 146.7" aria-hidden="true"><g fill="none" stroke="${ink}" stroke-width=".7" stroke-linecap="round">${stems}</g><g fill="${ink}" fill-opacity=".16" stroke="${ink}" stroke-width=".55">${leaves}</g><g fill="${ink}" fill-opacity=".55" stroke="${ink}" stroke-width=".4">${extras}</g></svg>`;
}

/* ---------- Бутылка ---------- */
function bottleSVG(p) {
  const id = 'c' + p.id.replace(/[^a-z0-9]/gi, '');
  const parts = p.name.split(' / ').slice(0, 4);
  const lines = parts.map((t, i) => `<text x="47" y="${214 + i * 11}" font-size="7.4">${esc(t.length > 13 ? t.slice(0, 12) + '…' : t)}</text>`).join('');
  return `<svg class="bottle" viewBox="0 0 100 360" role="img" aria-label="${esc(p.name)}">
    <defs><clipPath id="${id}"><path d="M42 8h16v92c0 22 28 34 28 70v170q0 10-10 10H24q-10 0-10-10V170c0-36 28-48 28-70z"/></clipPath></defs>
    <path d="M42 8h16v92c0 22 28 34 28 70v170q0 10-10 10H24q-10 0-10-10V170c0-36 28-48 28-70z" fill="#e9e4dc"/>
    <rect clip-path="url(#${id})" x="0" y="118" width="100" height="250" fill="${p.color}"/>
    <rect clip-path="url(#${id})" x="20" y="118" width="7" height="230" fill="#fff" opacity=".18"/>
    <rect x="40.5" y="2" width="19" height="44" rx="2" fill="#f4f1ea" stroke="#d9d2c6" stroke-width=".6"/>
    <rect x="18" y="186" width="64" height="150" fill="#fbf8f2"/>
    <text x="36" y="326" transform="rotate(-90 36 326)" font-family="Cormorant Garamond, serif" font-size="30" fill="#7a1f2e" letter-spacing="1">CLAVIS</text>
    <text x="47" y="200" font-size="5.2" fill="#8a8178" font-family="Manrope, sans-serif">Основа для коктейля</text>
    <g font-family="Manrope, sans-serif" fill="#3a302b" font-weight="600">${lines}</g>
    <text x="47" y="328" font-size="5" fill="#8a8178" font-family="Manrope, sans-serif">0% ABV · ${esc(p.vol)}</text>
  </svg>`;
}

function bottleEl(p) { return p.img ? `<img class="bottle" src="${p.img}" alt="${esc(p.name)}" loading="lazy">` : bottleSVG(p); }
function archFor(p, extra = '') { return `<div class="arch-frame">${botanic(p.family, p.id)}<div class="arch" style="--tint:${mix(p.color)}">${bottleEl(p)}</div>${extra}</div>`; }

function productCard(p) {
  const priceText = p.price ? rub(p.price) : 'по запросу';
  return `<a class="product" href="tovar.html?id=${p.id}">
    ${archFor(p, p.line === 'new' ? '<span class="pbadge">Новинка</span>' : '')}
    <div class="product__line">${esc(lineName(p.line))}</div>
    <div class="product__name">${esc(p.name)}</div>
    <div class="product__meta"><span>${esc(family(p.family).name)} · ${esc(p.vol)}</span><b>${priceText}</b></div>
  </a>`;
}

// Шесть линеек рядом, у каждой своя бутылка в арке. Число позиций по колоде 2026.
function lineCards() {
  const counts = { new: 11, cordial: 20, concentrate: 5, cocktail: 4, fruitopia: 9, perfume: 11 };
  const face = { new: byId(PRODUCTS, 'klyukva-citrus-rozmarin'), cordial: byId(PRODUCTS, 'yudzu-bambuk-lemongrass'), concentrate: byId(PRODUCTS, 'feyhoa-klubnika-myata'), cocktail: byId(PRODUCTS, 'wildberry-spritz'),
    fruitopia: byId(PRODUCTS, 'fruitopia-yudzu'), perfume: { id: 'perfume', name: 'Парфюм для напитков', family: 'flower', color: '#3b2a2a', vol: '30 мл' } };
  return LINES.map((l) => `<a class="line-card" href="katalog.html?line=${l.id}">${archFor(face[l.id])}<b>${l.name}</b><span>${counts[l.id]} поз. · ${l.note}</span></a>`).join('');
}

// Стена логотипов партнёров: каждый логотип отдельным файлом
function partnersImg() {
  return `<ul class="logo-wall">${PARTNERS.map(([f, n]) => `<li><img src="img/logos/${f}.png" alt="${esc(n)}" loading="lazy"></li>`).join('')}</ul>`;
}

function recipeCard(r) {
  return `<a class="entry" href="recept.html?id=${r.id}"><div class="entry__img"><img src="${r.img}" alt="${esc(r.name)}" loading="lazy"></div>
    <div class="entry__body"><div class="eyebrow">${KINDS[r.kind]} · ${r.time}</div><h3>${esc(r.name)}</h3><p>${esc(byId(PRODUCTS, r.product).name)}</p></div></a>`;
}

function articleCard(a) {
  return `<a class="entry" href="statya.html?id=${a.id}"><div class="entry__img"><img src="${a.img}" alt="" loading="lazy"></div>
    <div class="entry__body"><div class="eyebrow">${esc(a.tag)}</div><h3>${esc(a.title)}</h3><p>${esc(a.lead)}</p><span class="link">Читать</span></div></a>`;
}

/* ---------- Корзина и дегустационный сет ---------- */
const cart = {
  all() { return store.get('clavis_cart', {}); },
  add(id, n = 1) { const c = cart.all(); c[id] = (c[id] || 0) + n; if (c[id] <= 0) delete c[id]; store.set('clavis_cart', c); syncBadges(); },
  count() { return Object.values(cart.all()).reduce((a, b) => a + b, 0); },
  clear() { store.set('clavis_cart', {}); syncBadges(); },
};
const tasting = {
  max: 6,
  all() { return store.get('clavis_set', []); },
  toggle(id) {
    let s = tasting.all();
    if (s.includes(id)) s = s.filter((x) => x !== id);
    else if (s.length >= tasting.max) { toast('В дегустационном сете уже 6 вкусов'); return false; }
    else s.push(id);
    store.set('clavis_set', s); syncBadges(); return s.includes(id);
  },
};
function syncBadges() {
  $$('[data-badge="cart"]').forEach((b) => { b.textContent = cart.count(); b.dataset.n = cart.count(); });
  $$('[data-badge="set"]').forEach((b) => { const n = tasting.all().length; b.textContent = n || ''; b.dataset.n = n; });
}

/* ---------- Тост ---------- */
function toast(t) {
  let el = $('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
  el.textContent = t; el.classList.add('is-on');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('is-on'), 2600);
}

/* ---------- Шапка и подвал ---------- */
const ICON_CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>';

function header() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const a = (href, text) => `<a href="${href}"${href === here ? ' aria-current="page"' : ''}>${text}</a>`;
  return `<a class="sr" href="#main">К содержанию</a>
  <header class="top"><div class="wrap top__in">
    <a href="index.html" aria-label="CLAVIS, на главную"><img class="logo" src="img/logo-dark.png" alt="CLAVIS"></a>
    <nav class="nav" aria-label="Главное меню">
      <div class="drop"><button type="button" aria-expanded="false" data-drop>Для бизнеса ▾</button>
        <div class="drop__menu">
          <a href="zavedeniyam.html">Заведениям<small>Бары, рестораны, кофейни</small></a>
          <a href="distributoram.html">Дистрибьюторам<small>Условия по региону</small></a>
          <a href="kontraktnoe-proizvodstvo.html">Контрактное производство<small>Ваш вкус партией от 500 л</small></a>
        </div></div>
      ${a('katalog.html', 'Каталог')}${a('recepty.html', 'Рецепты')}${a('dlya-doma.html', 'Для дома')}${a('zhurnal.html', 'Журнал')}${a('o-kompanii.html', 'О компании')}${a('kontakty.html', 'Контакты')}
    </nav>
    <div class="top__tools">
      <a class="icon-btn" href="korzina.html" title="Корзина">${ICON_CART}<span class="t">Корзина</span><span class="badge" data-badge="cart"></span></a>
      <a class="btn btn--wine btn--sm" href="zavedeniyam.html#form" title="Вкусы, которые вы отметили в каталоге, попадут в заявку">Заказать дегустацию<span class="badge badge--light" data-badge="set"></span></a>
      <button class="icon-btn burger" type="button" aria-label="Меню" aria-expanded="false" data-burger>☰</button>
    </div>
  </div></header>
  <nav class="mnav" aria-label="Мобильное меню">
    <a href="dlya-biznesa.html">Для бизнеса</a>
    <a class="sub" href="zavedeniyam.html">Заведениям</a><a class="sub" href="distributoram.html">Дистрибьюторам</a><a class="sub" href="kontraktnoe-proizvodstvo.html">Контрактное производство</a>
    <a href="katalog.html">Каталог</a><a href="recepty.html">Рецепты</a><a href="dlya-doma.html">Для дома</a><a href="zhurnal.html">Журнал</a><a href="o-kompanii.html">О компании</a><a href="kontakty.html">Контакты</a>
    <a class="btn btn--wine" href="zavedeniyam.html#form">Заказать дегустацию</a>
  </nav>`;
}

function footer() {
  return `<footer class="foot"><div class="wrap">
    <div class="foot__grid">
      <div><img class="logo" src="img/logo-white.png" alt="CLAVIS"><p>Основы для коктейлей, лимонадов и чая. Все позиции 0% ABV. Варим с 2020 года.</p>
        <a href="tel:${CONTACTS.phoneHref}">${CONTACTS.phone}</a><a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a></div>
      <div><h4>Для бизнеса</h4><a href="zavedeniyam.html">Заведениям</a><a href="distributoram.html">Дистрибьюторам</a><a href="kontraktnoe-proizvodstvo.html">Контрактное производство</a></div>
      <div><h4>Вкусы</h4><a href="katalog.html">Каталог</a><a href="recepty.html">Рецепты</a><a href="kordial-koncentrat-sirop.html">Кордиал, концентрат и сироп</a><a href="dlya-doma.html">Для дома</a><a href="zhurnal.html">Журнал</a></div>
      <div><h4>Компания</h4><a href="o-kompanii.html">О компании</a><a href="kontakty.html">Контакты</a><a href="dostavka.html">Доставка и возврат</a><a href="oferta.html">Оферта</a><a href="politika.html">Политика персональных данных</a><a href="soglasie.html">Согласие на обработку</a></div>
    </div>
    <div class="foot__legal"><span>© CLAVIS, 2020–2026. Продукция не содержит алкоголя.</span><span>Строки о смешивании с крепким алкоголем адресованы профессионалам 18+.</span></div>
  </div></footer>`;
}

/* ---------- Формы ---------- */
// Тема письма начинается с направления, чтобы менеджер видел его до открытия.
const DIRECTIONS = { venue: 'Заведение', distributor: 'Дистрибьютор', contract: 'Контракт', home: 'Дом', general: 'Вопрос' };

function consentField(id) {
  return `<label class="check"><input type="checkbox" name="consent" required id="${id}"> <span>Согласен на обработку персональных данных по <a href="politika.html">политике</a> и <a href="soglasie.html">согласию</a></span></label>
  <label class="check"><input type="checkbox" name="news"> <span>Хочу получать новости и рецепты CLAVIS</span></label>`;
}

function bindForms() {
  $$('form[data-lead]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const d = Object.fromEntries(new FormData(f));
    const dir = d.direction || f.dataset.lead;
    const title = d.company || d.venue || d.name || 'Без названия';
    const subject = `[${DIRECTIONS[dir] || dir}] ${title}${d.city || d.region ? ' · ' + (d.city || d.region) : ''}`;
    if (f.dataset.withSet !== undefined) d.set = tasting.all().map((id) => byId(PRODUCTS, id)?.name).join('; ');
    const leads = store.get('clavis_leads', []); leads.push({ subject, ...d, at: new Date().toISOString() }); store.set('clavis_leads', leads);
    try { sessionStorage.setItem('clavis_last', JSON.stringify({ kind: 'lead', subject })); } catch {}
    location.href = 'spasibo.html';
  }));
}

/* ---------- Запуск ---------- */
function mount() {
  $('[data-header]')?.insertAdjacentHTML('afterbegin', header());
  $('[data-footer]')?.insertAdjacentHTML('afterbegin', footer());
  document.addEventListener('click', (e) => {
    const drop = e.target.closest('[data-drop]');
    $$('.drop').forEach((d) => { if (!drop || d !== drop.parentElement) { d.classList.remove('is-open'); d.firstElementChild.setAttribute('aria-expanded', 'false'); } });
    if (drop) { const open = drop.parentElement.classList.toggle('is-open'); drop.setAttribute('aria-expanded', open); }
    const burger = e.target.closest('[data-burger]');
    if (burger) { const open = $('.mnav').classList.toggle('is-open'); burger.setAttribute('aria-expanded', open); burger.textContent = open ? '✕' : '☰'; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.drop').forEach((d) => d.classList.remove('is-open')); });
  syncBadges();
  bindForms();
}
document.addEventListener('DOMContentLoaded', mount);
