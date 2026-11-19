// Главная в механике ciaoenergy.com: карусель бутылок, сцены на скролле, звуки интерфейса.
document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const seg = (t, a, b) => ease((t - a) / (b - a));
  const mobile = () => innerWidth <= 760;

  /* ---------- Звук: файлы CC0 с Freesound, подобраны по спектру под звуки ciaoenergy ---------- */
  // click: Squirrel_404 #683048, tick: SignatureSoundsOrg #872340, whoosh и pop: AudioPapkin #648541 и #649061
  const sfx = (() => {
    let on = false; // по умолчанию OFF: браузер всё равно молчит до нажатия, а нажатие на ON и есть разрешение
    const AC = window.AudioContext || window.webkitAudioContext;
    // Контекст создаём сразу: браузер держит его на паузе, но файлы уже декодируются и готовы к первому жесту
    const ctx = AC ? new AC() : null;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {} // iPhone: играть и при беззвучном режиме
    const last = {}, buf = {};
    if (ctx) ['click', 'tick', 'whoosh', 'pop'].forEach((k) => fetch(`sfx/${k}.mp3`).then((r) => r.arrayBuffer())
      .then((a) => new Promise((ok, no) => ctx.decodeAudioData(a, ok, no))).then((b) => { buf[k] = b; }).catch(() => {}));
    let primed = false;
    return {
      get on() { return on; },
      toggle() { on = !on; if (on) this.unlock(); return on; },
      unlock() {
        if (!ctx || !on) return;
        if (ctx.state !== 'running') ctx.resume();
        if (!primed) { primed = true; const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0); } // старый Safari открывает звук только так
      },
      play(k, gap = 45) {
        if (!on || !ctx || !buf[k] || ctx.state !== 'running') return;
        const n = performance.now(); if (n - (last[k] || 0) < gap) return; last[k] = n;
        const s = ctx.createBufferSource(); s.buffer = buf[k]; s.connect(ctx.destination); s.start();
      },
    };
  })();
  const buzz = (ms) => { if (sfx.on && navigator.vibrate) try { navigator.vibrate(ms); } catch {} }; // Android: лёгкий отклик пальцу
  ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach((ev) => addEventListener(ev, () => sfx.unlock(), { passive: true, capture: true }));
  const soundBtn = $('#sound');
  const paintSound = () => { soundBtn.setAttribute('aria-pressed', sfx.on); $('#soundTxt').textContent = sfx.on ? 'ON' : 'OFF'; };
  paintSound();
  soundBtn.addEventListener('click', () => { sfx.toggle(); paintSound(); sfx.play('click'); });
  document.addEventListener('click', (e) => { if (e.target.closest('a, button:not(#sound), summary')) sfx.play('click'); });

  /* ---------- Меню ---------- */
  const menu = $('.hmenu');
  $('#menuBtn').addEventListener('click', () => { const o = menu.classList.toggle('is-open'); $('#menuBtn').setAttribute('aria-expanded', o); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.hmenu')) menu.classList.remove('is-open'); });
  $$('[data-t]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); menu.classList.remove('is-open');
    scrollTo({ top: $('#story').offsetTop + parseFloat(a.dataset.t) * H, behavior: 'smooth' });
  }));

  /* ---------- Карусель вкусов ---------- */
  const HERO = ['klyukva-citrus-rozmarin', 'yudzu-bambuk-lemongrass', 'roza-reven-greypfrut', 'mango-marakuya-kokos', 'wildberry-spritz', 'lavanda-zizifora-kaktus',
    'kivi-kryzhovnik-estragon', 'oblepiha-donnik', 'watermelon-negroni', 'vasilki-cheremuha-golubika', 'shiso-zemlyanika-lemongrass', 'zhimolost-zemlyanika-smorodina']
    .map((id) => byId(PRODUCTS, id)).filter((p) => p && p.img);
  const N = HERO.length;
  const TILT = HERO.map((_, i) => ((i * 37) % 26) - 13);
  const TYPE = { cordial: 'Кордиал', concentrate: 'Концентрат', juice: 'Сок', tonic: 'Тоник', cocktail: 'Коктейльная основа', syrup: 'Сироп' };
  const ring = $('#ring'), big = $('#big'), bigImg = $('#bigImg'), range = $('#range');
  ring.innerHTML = HERO.map((p, i) => `<img src="${p.img}" alt="${esc(p.name)}" data-i="${i}" draggable="false">`).join('');
  const ringImgs = $$('img', ring);
  range.max = N - 1;
  range.style.setProperty('--track', `linear-gradient(90deg, ${HERO.map((p) => mix(p.color, '#ffffff', 0.15)).join(', ')})`);
  let act = 0, pos = 0;

  function setAct(i, quiet) {
    i = ((i % N) + N) % N;
    if (i === act && !quiet) return;
    let d = i - act; if (d > N / 2) d -= N; if (d < -N / 2) d += N;
    act = i; if (!quiet) { pos += d; sfx.play('tick'); buzz(8); }
    const p = HERO[act];
    bigImg.src = p.img; bigImg.alt = p.name;
    big.classList.remove('is-swap'); void big.offsetWidth; big.classList.add('is-swap');
    const accent = mix(p.color, '#ffffff', 0.2);
    $('#stage').style.setProperty('--accent', accent);
    $('#bg').style.background = `radial-gradient(ellipse 55% 45% at 50% 100%, ${mix(p.color, '#000000', 0.25)} 0%, transparent 70%), radial-gradient(ellipse 90% 80% at 50% 45%, ${mix(p.color, '#000000', 0.72)} 0%, #000 78%)`;
    const name = $('#heroName'); name.textContent = p.name.replace(/ \/ /g, ' · '); name.href = `tovar.html?id=${p.id}`;
    range.value = act; range.style.setProperty('--thumb', accent);
    const letters = p.name.toUpperCase().replace(/[^А-ЯЁA-Z]/g, '').slice(0, 10).split('');
    $('#letters').innerHTML = letters.map((c) => `<span>${c}</span>`).join('');
    $('#profTag').textContent = `${TYPE[p.type]} · ${lineName(p.line)}`;
    $('#profName').textContent = p.name.replace(/ \/ /g, ' · ');
    $('#profText').textContent = `${p.profile}. ${family(p.family).name}, ${p.vol}${p.brix ? `, Brix ${p.brix}, pH ${p.ph}` : ''}.`;
    $('#profLink').href = `tovar.html?id=${p.id}`;
    trio();
  }
  $('#prev').addEventListener('click', () => setAct(act - 1));
  $('#next').addEventListener('click', () => setAct(act + 1));
  range.addEventListener('input', () => setAct(+range.value));
  ring.addEventListener('click', (e) => { const im = e.target.closest('img'); if (im) setAct(+im.dataset.i); });
  addEventListener('keydown', (e) => {
    if (T > 0.3 || e.target.closest('input, select, textarea')) return;
    if (e.key === 'ArrowLeft') setAct(act - 1); if (e.key === 'ArrowRight') setAct(act + 1);
  });
  // Свайп и горизонтальная прокрутка тачпада листают вкусы
  let sx = 0, sy = 0, wx = 0;
  const stage = $('#stage');
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (T < 0.3 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) setAct(act + (dx < 0 ? 1 : -1));
  }, { passive: true });
  stage.addEventListener('wheel', (e) => {
    if (T > 0.3 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    wx += e.deltaX; if (Math.abs(wx) > 90) { setAct(act + Math.sign(wx)); wx = 0; }
  }, { passive: true });
  // Двойной клик открывает бутылку
  const popBig = () => { sfx.play('pop', 400); buzz(18); big.classList.remove('is-pop'); void big.offsetWidth; big.classList.add('is-pop'); };
  big.addEventListener('dblclick', popBig);
  let lastTap = 0; // iPhone не присылает dblclick, ловим двойной тап сами
  big.addEventListener('touchend', (e) => { const n = Date.now(); if (n - lastTap < 320) { e.preventDefault(); popBig(); lastTap = 0; } else lastTap = n; });

  /* ---------- Преимущества ---------- */
  const ICON = {
    leaf: '<svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19 14 10"/></svg>',
    time: '<svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>',
    glass: '<svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h12l-1.5 17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1z"/><path d="M6.5 9h11"/></svg>',
    zero: '<svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="12" cy="12" rx="6" ry="8.5"/><path d="M5 20 19 4"/></svg>',
  };
  const BEN = [
    { icon: 'leaf', old: 'Сахарный сироп', title: 'До 93% натурального', text: 'Технологи CLAVIS варят основу из пюре, ягод и трав. Собственное производство в Подмосковье работает по ХАССП, состав подтверждает сертификат Clean Label.' },
    { icon: 'time', old: 'Час заготовок', title: 'Напиток за минуту', text: 'Бармен наливает 30 мл основы, добавляет лёд и содовую. Кислоту, сладость и пряность мы уже собрали в бутылке.' },
    { icon: 'glass', old: 'Фреш в списание', title: 'До 40 порций', text: 'Из одной бутылки 0,75 л бар наливает от 15 до 40 напитков. Лайм больше не нужно закупать и выжимать каждую смену.' },
    { icon: 'zero', old: 'Спирт в составе', title: '0% алкоголя', text: 'В основах CLAVIS нет алкоголя, поэтому лимонады из них пьют дети и водители. Крепкое бармен добавит сам, если гость закажет коктейль.' },
  ];
  const B0 = 1.9, BS = 1.03;
  $('#bnav').innerHTML = BEN.map((b, i) => `<button type="button" data-b="${i}" aria-label="${esc(b.title)}">${ICON[b.icon]}</button>`).join('');
  $('#bnav').addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (b) scrollTo({ top: $('#story').offsetTop + (B0 + (+b.dataset.b + 0.5) * BS) * H, behavior: 'smooth' }); });
  const CH = 'АБВГДЕЖЗИКЛМНОПРСТУФХЧШЩЭЮЯ0123456789%';
  function scramble(el, text) {
    cancelAnimationFrame(el._r);
    if (reduce) { el.textContent = text; return; }
    let f = 0; const total = 16;
    const step = () => {
      f++; const k = f / total;
      el.textContent = [...text].map((c, i) => (c === ' ' || i / text.length < k ? c : CH[(Math.random() * CH.length) | 0])).join('');
      if (f < total) el._r = requestAnimationFrame(step);
    };
    step();
  }
  let ben = -1;
  function showBen(i) {
    if (i === ben) return; ben = i;
    const b = BEN[i];
    scramble($('#benOld'), b.old); scramble($('#benTitle'), b.title); $('#benText').textContent = b.text;
    $$('#bnav button').forEach((x, j) => x.classList.toggle('is-on', j === i));
    sfx.play('tick');
  }

  /* ---------- Три бутылки в финале истории ---------- */
  const TRIO_POOL = ['wildberry-spritz', 'fruitopia-malina', 'yudzu-bambuk-lemongrass', 'mango-marakuya-kokos'].map((id) => byId(PRODUCTS, id));
  function trio() {
    const cur = HERO[act];
    const side = TRIO_POOL.filter((p) => p.line !== cur.line && p.id !== cur.id).slice(0, 2);
    $('#trio').innerHTML = side.map((p, j) => `<a href="tovar.html?id=${p.id}" data-side="${j ? 1 : -1}"><img src="${p.img}" alt="${esc(p.name)}"><span class="trio-lbl">${esc(lineName(p.line))}</span></a>`).join('')
      + `<span class="trio-lbl" id="trioMid">${esc(lineName(cur.line))}</span>`;
  }

  /* ---------- Покадровая анимация от скролла ---------- */
  // t в высотах экрана от начала истории: 0 карусель, 1 профиль вкуса, 1.9..6 преимущества, 6.7 «Сложный вкус», 7.3 три линейки
  const KF = [[0, 0, -5, 1, 0], [1, 10, 6, 1.75, -14], [1.85, 4, 30, 2.5, 10], [6, 4, -34, 2.5, 6], [6.7, 0, 0, 1.05, 8], [7.3, 0, -3, 0.82, 0], [8, 0, -3, 0.82, 0]];
  // на телефоне бутылка по центру и выше, чтобы этикетка не уходила под текстовую плашку
  const KFM = [[0, 0, -8, 1, 0], [1, 0, -13, 1.3, -10], [1.85, 0, -14, 1.55, 8], [6, 0, -24, 1.55, 6], [6.7, 0, 0, 1.05, 8], [7.3, 0, -3, 0.82, 0], [8, 0, -3, 0.82, 0]];
  function kf(t) {
    const K = mobile() ? KFM : KF;
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const a = K[i - 1], b = K[i], e = ease((t - a[0]) / (b[0] - a[0])); return a.map((v, j) => v + (b[j] - v) * e); }
    return K[K.length - 1];
  }
  let T = 0, scene = 0;
  const story = $('#story'), heroUi = $('#heroUi');
  // На телефоне адресная строка прячется и меняет innerHeight. Высоту берём только при смене ширины, иначе сцены дёргаются.
  let H = innerHeight, lastW = innerWidth;
  const setH = () => document.documentElement.style.setProperty('--sh', `${H}px`);
  addEventListener('resize', () => { if (innerWidth !== lastW || !mobile()) { lastW = innerWidth; H = innerHeight; setH(); } });
  setH();
  function frame(now) {
    const W = innerWidth;
    T = clamp((scrollY - story.offsetTop) / H, -1, 9);
    const t = T;
    // карусель плавно доезжает до выбранного вкуса
    const target = pos + (((act - pos) % N) + N * 1.5) % N - N / 2;
    pos += (target - pos) * 0.12;
    const out = seg(t, 0.02, 0.8);
    const spread = Math.min(W * (mobile() ? 0.3 : 0.15), 250) * (1 + out * 1.8);
    const fl = reduce ? 0 : now / 1000;
    ringImgs.forEach((im, i) => {
      let d = i - pos; d = ((d % N) + N * 1.5) % N - N / 2;
      const ad = Math.abs(d);
      const x = d * spread * (1 - 0.05 * Math.min(ad, 5));
      const y = d * d * 0.9 + Math.sin(fl * 0.9 + i) * 1.2;
      const s = 1 - Math.min(ad, 5) * 0.08;
      const r = TILT[i] * Math.min(ad, 1) + Math.sin(fl * 0.7 + i * 2) * 2;
      im.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}vh) rotate(${r}deg) scale(${s})`;
      im.style.opacity = clamp(ad * 1.6) * clamp(5.2 - ad) * (1 - out);
      im.style.filter = `brightness(${0.5 - Math.min(ad, 4) * 0.06}) drop-shadow(0 30px 40px rgba(0,0,0,.6))`;
      im.style.zIndex = 10 - Math.round(ad);
      im.style.pointerEvents = out > 0.1 ? 'none' : 'auto';
    });
    let [, bx, by, bs, br] = kf(clamp(t, 0, 8));
    const float = t < 0.3 && !reduce ? Math.sin(fl * 1.1) * 1 : 0;
    const fadeEnd = 1 - seg(t, 8.0, 8.6);
    big.style.transform = `translate(-50%, -50%) translate(${bx}vw, ${by + float}vh) rotate(${br}deg) scale(${bs})`;
    big.style.filter = `brightness(${1 - seg(t, 1.7, 2.1) * 0.55 + seg(t, 5.9, 6.4) * 0.55})`;
    big.style.opacity = fadeEnd;

    heroUi.style.opacity = 1 - seg(t, 0.02, 0.28); heroUi.style.visibility = t > 0.3 ? 'hidden' : '';
    $('#letters').style.opacity = 1 - seg(t, 1.6, 2);
    const prof = seg(t, 0.7, 1) * (1 - seg(t, 1.5, 1.75));
    $('#profile').style.opacity = prof; $('#profile').classList.toggle('is-on', prof > 0.5);
    const bOn = seg(t, 1.85, 2.1) * (1 - seg(t, 5.85, 6.1));
    $('#benefit').style.opacity = bOn; $('#bnav').style.opacity = bOn; $('#bnav').style.pointerEvents = bOn > 0.5 ? 'auto' : 'none';
    $('#spot').style.opacity = seg(t, 1.7, 2.1) * (1 - seg(t, 5.9, 6.4));
    if (t >= B0 && t < 6) showBen(clamp(Math.floor((t - B0) / BS), 0, BEN.length - 1));
    const g = seg(t, 6.2, 6.8) * fadeEnd;
    $('#giant').style.opacity = g; $('#giant').style.transform = `scale(${1.15 - g * 0.15})`;
    const tr = seg(t, 6.9, 7.4);
    $$('#trio a').forEach((a) => {
      const sd = +a.dataset.side;
      a.style.cssText = `position:absolute;inset:0;pointer-events:${tr > 0.6 ? 'auto' : 'none'};opacity:${tr * fadeEnd}`;
      const im = a.firstElementChild, lbl = a.lastElementChild;
      const x = sd * (mobile() ? 70 - 40 * tr : 60 - 38 * tr);
      im.style.transform = `translate(-50%, -50%) translate(${x}vw, 2vh) rotate(${sd * (14 - 8 * tr)}deg) scale(.95)`;
      lbl.style.left = `calc(50% + ${x}vw)`;
    });
    $('#trioMid').style.opacity = tr * fadeEnd;
    $('#trioCap').style.opacity = tr * fadeEnd;
    // смена сцены звучит переходом
    const sc = t < 0.5 ? 0 : t < 1.8 ? 1 : t < 6.2 ? 2 : t < 8 ? 3 : 4;
    if (sc !== scene) { scene = sc; sfx.play('whoosh', 600); }
    $('#progress').style.width = `${clamp(scrollY / (document.documentElement.scrollHeight - H)) * 100}%`;
    requestAnimationFrame(frame);
  }

  /* ---------- Вся линейка ---------- */
  const wave = $('#wave');
  const withImg = PRODUCTS.filter((p) => p.img);
  let wl = '';
  function drawWave() {
    const lines = LINES.filter((l) => withImg.some((p) => p.line === l.id));
    $('#lineChips').innerHTML = [['', 'Все'], ...lines.map((l) => [l.id, l.name])].map(([id, n]) => `<button type="button" data-wl="${id}" class="${id === wl ? 'is-on' : ''}">${n}</button>`).join('');
    wave.innerHTML = withImg.filter((p) => !wl || p.line === wl).map((p, i) => {
      const y = Math.sin(i * 0.55) * 6, r = Math.sin(i * 0.9) * 8;
      return `<a href="tovar.html?id=${p.id}" style="--y:${y}vh;transform:translateY(${y}vh) rotate(${r}deg)" data-name="${esc(p.name)}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></a>`;
    }).join('');
    wave.scrollLeft = 0;
  }
  $('#lineChips').addEventListener('click', (e) => { const b = e.target.closest('[data-wl]'); if (b) { wl = b.dataset.wl; drawWave(); } });
  const named = (e) => { const a = e.target.closest('a[data-name]'); if (a) { $('#waveName').textContent = a.dataset.name; sfx.play('tick', 60); } };
  wave.addEventListener('mouseover', named); wave.addEventListener('focusin', named);
  // перетаскивание мышью
  let drag = null, moved = 0;
  wave.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, s: wave.scrollLeft }; moved = 0; });
  addEventListener('pointermove', (e) => { if (!drag) return; moved = Math.abs(e.clientX - drag.x); wave.scrollLeft = drag.s - (e.clientX - drag.x); wave.classList.toggle('is-drag', moved > 4); });
  addEventListener('pointerup', () => { drag = null; wave.classList.remove('is-drag'); });
  wave.addEventListener('click', (e) => { if (moved > 5) { e.preventDefault(); moved = 0; } }, true);
  let lastTick = 0;
  // на телефоне наводить нечем: подпись показывает бутылку в центре экрана
  const touch = matchMedia('(hover: none)').matches;
  const centerName = () => { const c = innerWidth / 2; let best, bd = 1e9; $$('a', wave).forEach((el) => { const r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - c); if (d < bd) { bd = d; best = el; } }); if (best) $('#waveName').textContent = best.dataset.name; };
  wave.addEventListener('scroll', () => {
    if (Math.abs(wave.scrollLeft - lastTick) > 120) { lastTick = wave.scrollLeft; sfx.play('tick', 80); buzz(5); }
    if (touch) centerName();
  }, { passive: true });
  if (touch) $('#waveName').textContent = 'Листайте вбок';
  drawWave();

  /* ---------- Остальное ---------- */
  $('#stats').innerHTML = STATS.map((s) => `<div class="stat"><b>${s.n}</b><span>${s.t}</span></div>`).join('');
  $('#partners').innerHTML = partnersImg();
  $('[data-consent]').innerHTML = consentField('g-consent');
  const FAQ = [
    ['Чем кордиал отличается от сиропа?', 'Сироп даёт напитку сладость, кислоту бармен добавляет сам. В кордиал CLAVIS технологи уже собрали кислоту, сладость и пряность, поэтому на хайбол бармену хватает 30 мл основы. <a class="link" href="kordial-koncentrat-sirop.html">Сравнение по составу и закладке</a>'],
    ['Сколько напитков получится из бутылки?', 'Из кордиала 0,75 л бар наливает 25 хайболов при закладке 30 мл. С концентратом выходит от 15 до 40 порций, смотря по рецепту.'],
    ['Есть ли в основах алкоголь?', 'Нет. Все основы CLAVIS безалкогольные, 0% ABV. Крепкое бармен добавляет сам, когда гость заказывает коктейль.'],
    ['Как купить CLAVIS домой?', 'Выберите вкусы в <a class="link" href="dlya-doma.html">магазине</a> и оплатите онлайн. Заказ мы отправим через Ozon Доставку или СДЭК.'],
    ['Как бару попробовать вкусы?', 'Оставьте <a class="link" href="zavedeniyam.html#form">заявку на дегустацию</a>, и менеджер свяжется с вами в течение рабочего дня. Коктейльную карту наши миксологи проработают с вами бесплатно.'],
    ['Можно сделать свой вкус?', 'Да. Мы сварим основу по вашей рецептуре партией от 500 литров. Первую партию производство выпускает примерно за 30 дней.'],
    ['Вы работаете с регионами?', 'Да, CLAVIS ищет дистрибьюторов в регионах. Оставьте <a class="link" href="distributoram.html">заявку</a>, и менеджер пришлёт условия для вашей территории.'],
  ];
  $('#faqs').innerHTML = FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');

  // Форма захвата: один раз за визит, когда гость пролистал историю и линейку
  const cap = $('#capture');
  let shown = false; try { shown = sessionStorage.getItem('clavis_cap') === '1'; } catch {}
  let timer;
  function openCap() {
    if (shown) return; shown = true; try { sessionStorage.setItem('clavis_cap', '1'); } catch {}
    const p = HERO[act];
    $('#capVisual').style.setProperty('--accent', mix(p.color, '#000000', 0.3));
    $('#capVisual').innerHTML = `<img src="${p.img}" alt="">`;
    cap.classList.add('is-open'); if (!mobile()) $('#c-mail').focus(); sfx.play('whoosh'); buzz(20);
    let left = 30; timer = setInterval(() => { left = Math.max(0, left - 1); $('#capTimer').textContent = `0:${String(left).padStart(2, '0')}`; if (!left) clearInterval(timer); }, 1000);
  }
  function closeCap() { cap.classList.remove('is-open'); clearInterval(timer); }
  addEventListener('scroll', () => { if (scrollY > $('#who').offsetTop) openCap(); }, { passive: true });
  cap.addEventListener('click', (e) => { if (e.target === cap || e.target.closest('[data-close]')) closeCap(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCap(); });
  $('#capForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const who = e.submitter?.value || 'home';
    const leads = store.get('clavis_leads', []); leads.push({ subject: `[${who === 'pro' ? 'Заведение' : 'Дом'}] Подарок с главной`, ...Object.fromEntries(new FormData(e.target)), at: new Date().toISOString() }); store.set('clavis_leads', leads);
    store.set('clavis_promo', 'CLAVIS5');
    closeCap();
    if (who === 'pro') location.href = 'zavedeniyam.html#form';
    else { toast('Промокод CLAVIS5 уже в корзине'); setTimeout(() => (location.href = 'katalog.html'), 900); }
  });

  /* ---------- Загрузка ---------- */
  setAct(0, true);
  let done = 0;
  const loader = $('#loader');
  const finish = () => loader.classList.add('is-done');
  HERO.forEach((p) => { const im = new Image(); im.onload = im.onerror = () => { done++; $('#loaderPct').textContent = Math.round((done / N) * 100); if (done === N) setTimeout(finish, 250); }; im.src = p.img; });
  setTimeout(finish, 3000);
  requestAnimationFrame(frame);
});
