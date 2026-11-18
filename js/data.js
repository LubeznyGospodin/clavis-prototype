// Каталог, рецепты и статьи. Данные о товарах из колоды для дистрибьюторов 2026,
// цены 800 и 925 ₽ из прототипа Антония. В рабочей версии всё это придёт из админки.

const LINES = [
  { id: 'new', name: 'Новинки', note: 'Северные ягоды, хвоя и свежие соки' },
  { id: 'cordial', name: 'Кордиалы', note: 'Авторские сочетания, 0,75 л' },
  { id: 'concentrate', name: 'Концентраты', note: 'Плотный вкус для лимонадов и чая' },
  { id: 'cocktail', name: 'Коктейльная серия', note: 'Готовая идея коктейля в бутылке' },
  { id: 'fruitopia', name: 'FRUITOPIA', note: 'Сиропы и концентраты, 1 л' },
  { id: 'perfume', name: 'Парфюмы для напитков', note: 'Аромат поверх подачи, 30 мл' },
];

const FAMILIES = [
  { id: 'berry', name: 'Ягоды', color: '#8e2433' },
  { id: 'fruit', name: 'Фрукты и цитрус', color: '#d0782c' },
  { id: 'herb', name: 'Травы и специи', color: '#5d7a3a' },
  { id: 'flower', name: 'Цветы', color: '#a5527a' },
  { id: 'dessert', name: 'Десерт и чай', color: '#a8794a' },
];

const USES = { lemonade: 'Лимонады', bar: 'Бар', tea: 'Чай', coffee: 'Кофе' };

// type: cordial | concentrate | juice | tonic | cocktail
// price: цена бутылки для дома, null значит только по запросу
const PRODUCTS = [
  { id: 'granat-smorodina', name: 'Гранат / Чёрная смородина', line: 'new', type: 'concentrate', family: 'berry', brix: '45', ph: '2,4', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#6d1a2a', price: 800, profile: 'Терпкий, ягодный, глубокий' },
  { id: 'oblepiha-med-limon', name: 'Облепиха / Мёд / Лимон', line: 'new', type: 'cordial', family: 'fruit', brix: '37', ph: '3,0', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#e0892a', price: 800, profile: 'Солнечный, медовый, кислый' },
  { id: 'kalina-malina', name: 'Калина / Малина', line: 'new', type: 'cordial', family: 'berry', brix: '37', ph: '3,0', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#b8283b', price: 800, profile: 'Ягодный, с лёгкой горчинкой' },
  { id: 'brusnika-pihta', name: 'Брусника / Пихта', line: 'new', type: 'concentrate', family: 'berry', brix: '47', ph: '2,1', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#9c1f32', price: 800, profile: 'Хвойный, кислый, северный' },
  { id: 'moroshka-malina-pihta', name: 'Морошка / Малина / Пихта', line: 'new', type: 'cordial', family: 'berry', brix: '31,5', ph: '2,5', vol: '0,75 л', uses: ['lemonade', 'bar'], color: '#d9822b', price: 925, profile: 'Хвойный, ягодный, сладкий' },
  { id: 'klyukva-citrus-rozmarin', name: 'Клюква / Цитрус / Розмарин', line: 'new', type: 'cordial', family: 'berry', brix: '33,4', ph: '2,4', vol: '0,75 л', uses: ['bar', 'tea'], color: '#c42a3c', price: 800, profile: 'Согревающий, пряный, ягодный' },
  { id: 'malina-marakuya-lemongrass', name: 'Малина / Маракуйя / Лемонграсс', line: 'new', type: 'concentrate', family: 'fruit', brix: '51', ph: '3,0', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#c8324a', price: 800, profile: 'Тропический, ягодный, травяной' },
  { id: 'taivanskaya-dynya', name: 'Тайваньская дыня', line: 'new', type: 'concentrate', family: 'fruit', brix: '45', ph: '2,5', vol: '0,75 л', uses: ['lemonade', 'bar'], color: '#b9c95a', price: 800, profile: 'Сочный, сладкий, свежий' },
  { id: 'sok-limona', name: 'Сок лимона · прямой отжим', line: 'new', type: 'juice', family: 'fruit', brix: '7', ph: '2,3', vol: '1 л', uses: ['lemonade', 'bar', 'tea'], color: '#ead777', price: null, profile: 'Чистая кислота без отжима за стойкой' },
  { id: 'sok-layma', name: 'Сок лайма · прямой отжим', line: 'new', type: 'juice', family: 'fruit', brix: '6', ph: '2,3', vol: '1 л', uses: ['lemonade', 'bar', 'tea'], color: '#c9d77a', price: null, profile: 'Лайм для гимлета и мохито' },
  { id: 'osnova-dlya-tonika', name: 'Основа для тоника · 1:8', line: 'new', type: 'tonic', family: 'herb', brix: '40,6', ph: '2,1', vol: '1 л', uses: ['lemonade', 'bar'], color: '#d8c79a', price: null, profile: 'Домашний тоник из бутылки и содовой' },

  { id: 'feyhoa-klubnika-myata', name: 'Фейхоа / Клубника / Мята', line: 'concentrate', type: 'concentrate', family: 'fruit', brix: '53,6', ph: '3,1', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#9fb54a', price: 800, profile: 'Зелёный, ягодный, мятный' },
  { id: 'risling-granat-shalfey', name: 'Рислинг / Гранат / Шалфей', line: 'concentrate', type: 'concentrate', family: 'herb', brix: '59', ph: '2,8', vol: '0,75 л', uses: ['lemonade', 'tea'], color: '#a2384a', price: 800, profile: 'Винный, гранатовый, травяной' },
  { id: 'smorodina-apelsin-masala', name: 'Смородина / Апельсин / Масала', line: 'concentrate', type: 'concentrate', family: 'herb', brix: '52', ph: '2,9', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#5a1b2c', price: 800, profile: 'Пряный, цитрусовый, тёплый' },
  { id: 'glintveyn', name: 'Глинтвейн', line: 'concentrate', type: 'concentrate', family: 'herb', brix: '40,2', ph: '2,8', vol: '0,75 л', uses: ['bar', 'tea'], color: '#6a1d24', price: 800, profile: 'Корица, гвоздика, апельсин' },
  { id: 'kivi-kryzhovnik-estragon', name: 'Киви / Крыжовник / Эстрагон', line: 'concentrate', type: 'concentrate', family: 'herb', brix: '56', ph: '2,7', vol: '0,75 л', uses: ['lemonade', 'bar'], color: '#7fa33a', price: 800, profile: 'Кислый, зелёный, тархунный' },

  { id: 'wildberry-spritz', name: 'Wildberry Spritz', line: 'cocktail', type: 'cocktail', family: 'berry', brix: '39', ph: '2,6', vol: '0,75 л', uses: ['bar'], color: '#8c2238', price: 800, profile: 'Лесные ягоды для спритца', home: true },
  { id: 'watermelon-negroni', name: 'Watermelon Negroni', line: 'cocktail', type: 'cocktail', family: 'fruit', brix: '33', ph: '3,1', vol: '0,75 л', uses: ['bar'], color: '#c43a3a', price: 800, profile: 'Арбуз и горечь негрони', home: true },
  { id: 'special-bellini', name: 'Special Bellini', line: 'cocktail', type: 'cocktail', family: 'fruit', brix: '33', ph: '3,6', vol: '0,75 л', uses: ['bar'], color: '#e39a5a', price: 800, profile: 'Белый персик для беллини', home: true },
  { id: 'passion-vanilla-tiny', name: 'Passion Vanilla Tiny', line: 'cocktail', type: 'cocktail', family: 'dessert', brix: '32', ph: '2,4', vol: '0,75 л', uses: ['bar'], color: '#e5a33a', price: 800, profile: 'Маракуйя и ваниль', home: true },

  { id: 'shiso-zemlyanika-lemongrass', name: 'Шисо / Земляника / Лемонграсс', line: 'cordial', type: 'cordial', family: 'herb', brix: '33,2', ph: '2,2', vol: '0,75 л', uses: ['bar'], color: '#e0796a', price: 800, profile: 'Травяной, ягодный, свежий' },
  { id: 'kastella-klubnika-tonka', name: 'Кастелла кейк / Клубника / Бобы тонка', line: 'cordial', type: 'cordial', family: 'dessert', brix: '35', ph: '2,1', vol: '0,75 л', uses: ['bar'], color: '#e8485a', price: 800, profile: 'Десертный, клубничный, ванильный' },
  { id: 'arbuz-bitter', name: 'Арбуз / Безалкогольный биттер', line: 'cordial', type: 'cordial', family: 'fruit', brix: '33', ph: '2,6', vol: '0,75 л', uses: ['bar'], color: '#d84a50', price: 800, profile: 'Сочный, горьковатый' },
  { id: 'roza-reven-greypfrut', name: 'Роза / Ревень / Грейпфрут', line: 'cordial', type: 'cordial', family: 'flower', brix: '35,8', ph: '2,3', vol: '0,75 л', uses: ['bar'], color: '#efd7a6', price: 800, profile: 'Цветочный, кислый, горьковатый' },
  { id: 'persik-hanibush-laym-estragon', name: 'Персик / Ханибуш / Кафирский лайм / Эстрагон', line: 'cordial', type: 'cordial', family: 'fruit', brix: '36', ph: '2,1', vol: '0,75 л', uses: ['bar'], color: '#eab36a', price: 800, profile: 'Персиковый, чайный, цитрусовый' },
  { id: 'bazilik', name: 'Базилик', line: 'cordial', type: 'cordial', family: 'herb', brix: '33,4', ph: '2,7', vol: '0,75 л', uses: ['bar'], color: '#a9c46a', price: 800, profile: 'Душистый, пряный' },
  { id: 'dragonfrut-lichi-kardamon', name: 'Драгонфрут / Личи / Белый кардамон', line: 'cordial', type: 'cordial', family: 'fruit', brix: '33,9', ph: '2,3', vol: '0,75 л', uses: ['lemonade', 'bar'], color: '#d6457e', price: 800, profile: 'Экзотический, пряный' },
  { id: 'grusha-zhasmin-vinograd', name: 'Груша / Жасмин / Виноград', line: 'cordial', type: 'cordial', family: 'flower', brix: '32', ph: '2,2', vol: '0,75 л', uses: ['lemonade', 'bar'], color: '#e4d6a0', price: 800, profile: 'Цветочный, сочный' },
  { id: 'pandan-banan-vermut', name: 'Пандан / Банан / Безалкогольный вермут', line: 'cordial', type: 'cordial', family: 'dessert', brix: '33,3', ph: '2,0', vol: '0,75 л', uses: ['bar'], color: '#cdbf72', price: 800, profile: 'Сливочный, травяной, винный' },
  { id: 'limonnyy-tart-sencha-vanil', name: 'Лимонный тарт / Сенча / Ваниль', line: 'cordial', type: 'cordial', family: 'dessert', brix: '33', ph: '2,2', vol: '0,75 л', uses: ['bar'], color: '#ead98a', price: 800, profile: 'Десертный, чайный, лимонный' },
  { id: 'yudzu-bambuk-lemongrass', name: 'Юдзу / Бамбук / Лемонграсс', line: 'cordial', type: 'cordial', family: 'fruit', brix: '32,5', ph: '2,2', vol: '0,75 л', uses: ['bar'], color: '#efe4b0', price: 800, profile: 'Цитрусовый, свежий, травяной' },
  { id: 'lavanda-zizifora-kaktus', name: 'Лаванда / Зизифора / Кактус', line: 'cordial', type: 'cordial', family: 'flower', brix: '34', ph: '2,1', vol: '0,75 л', uses: ['bar'], color: '#b8455e', price: 800, profile: 'Цветочный, мятный, свежий' },
  { id: 'mango-marakuya-kokos', name: 'Манго / Маракуйя / Кокос', line: 'cordial', type: 'cordial', family: 'fruit', brix: '40', ph: '2,8', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#eeaa3a', price: 800, profile: 'Тропический, сливочный' },
  { id: 'vasilki-cheremuha-golubika', name: 'Васильки / Черёмуха / Голубика', line: 'cordial', type: 'cordial', family: 'flower', brix: '38', ph: '2,3', vol: '0,75 л', uses: ['bar'], color: '#5b5a9a', price: 800, profile: 'Цветочный, миндальный, ягодный' },
  { id: 'oblepiha-donnik', name: 'Облепиха / Донник', line: 'cordial', type: 'cordial', family: 'fruit', brix: '37,8', ph: '2,6', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#e48a26', price: 800, profile: 'Облепиховый, медовый, луговой' },
  { id: 'belgiyskaya-vishnya', name: 'Бельгийская вишня', line: 'cordial', type: 'cordial', family: 'berry', brix: '50', ph: '2,5', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#6e1426', price: 800, profile: 'Вишнёвый, плотный' },
  { id: 'mohito', name: 'Мохито', line: 'cordial', type: 'cordial', family: 'herb', brix: '49', ph: '2,5', vol: '0,75 л', uses: ['lemonade', 'bar'], color: '#cfe0a0', price: 800, profile: 'Мята и лайм' },
  { id: 'kalamansi-limonnyy-mirt', name: 'Каламанси / Лимонный мирт', line: 'cordial', type: 'cordial', family: 'fruit', brix: '44,6', ph: '2,5', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#e7c54a', price: 800, profile: 'Яркий цитрус' },
  { id: 'zhimolost-zemlyanika-smorodina', name: 'Жимолость / Земляника / Смородина', line: 'cordial', type: 'cordial', family: 'berry', brix: '45', ph: '2,7', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#7d1d33', price: 800, profile: 'Лесные ягоды' },
  { id: 'yudzu-buzina', name: 'Юдзу / Бузина', line: 'cordial', type: 'cordial', family: 'flower', brix: '45', ph: '2,6', vol: '0,75 л', uses: ['lemonade', 'bar', 'tea'], color: '#e9df9a', price: 800, profile: 'Цитрусовый, цветочный' },

  // FRUITOPIA: названия и тип с Яндекс Диска CLAVIS, Brix, pH и цены пока неизвестны
  { id: 'fruitopia-vanil', name: 'FRUITOPIA Ваниль с семенами ванили', line: 'fruitopia', type: 'syrup', family: 'dessert', vol: '1 л', uses: ['coffee', 'bar'], color: '#d9c58a', price: null, profile: 'Ванильный сироп для кофе и десертов' },
  { id: 'fruitopia-dragonfrut', name: 'FRUITOPIA Драгонфрут, клубника, мята', line: 'fruitopia', type: 'concentrate', family: 'fruit', vol: '1 л', uses: ['lemonade', 'bar'], color: '#c8304e', price: null, profile: 'Ягодный концентрат с мятой' },
  { id: 'fruitopia-masala', name: 'FRUITOPIA Масала', line: 'fruitopia', type: 'syrup', family: 'herb', vol: '1 л', uses: ['coffee', 'tea'], color: '#a8692f', price: null, profile: 'Пряный сироп для чая и кофе' },
  { id: 'fruitopia-karamel', name: 'FRUITOPIA Солёная карамель', line: 'fruitopia', type: 'syrup', family: 'dessert', vol: '1 л', uses: ['coffee', 'bar'], color: '#9c6a2c', price: null, profile: 'Карамельный сироп с солью' },
  { id: 'fruitopia-persik', name: 'FRUITOPIA Фиолетовый персик', line: 'fruitopia', type: 'syrup', family: 'fruit', vol: '1 л', uses: ['coffee', 'lemonade'], color: '#5e4a86', price: null, profile: 'Персиковый сироп' },
  { id: 'fruitopia-vishnya', name: 'FRUITOPIA Вишня', line: 'fruitopia', type: 'concentrate', family: 'berry', vol: '1 л', uses: ['lemonade', 'bar'], color: '#6e1a2a', price: null, profile: 'Вишнёвый концентрат' },
  { id: 'fruitopia-malina', name: 'FRUITOPIA Малина', line: 'fruitopia', type: 'concentrate', family: 'berry', vol: '1 л', uses: ['lemonade', 'bar'], color: '#8e1f3a', price: null, profile: 'Малиновый концентрат' },
  { id: 'fruitopia-shokolad', name: 'FRUITOPIA Швейцарский шоколад', line: 'fruitopia', type: 'syrup', family: 'dessert', vol: '1 л', uses: ['coffee'], color: '#3a2620', price: null, profile: 'Шоколадный сироп для кофе' },
  { id: 'fruitopia-yudzu', name: 'FRUITOPIA Юдзу', line: 'fruitopia', type: 'concentrate', family: 'fruit', vol: '1 л', uses: ['lemonade', 'bar', 'tea'], color: '#d9a72c', price: null, profile: 'Цитрусовый концентрат юдзу' },
];

// Фото бутылок с Яндекс Диска CLAVIS, фон вырезан. У остальных позиций рисованная бутылка.
const PHOTOS = ['moroshka-malina-pihta', 'klyukva-citrus-rozmarin', 'malina-marakuya-lemongrass', 'feyhoa-klubnika-myata', 'risling-granat-shalfey', 'smorodina-apelsin-masala', 'glintveyn', 'kivi-kryzhovnik-estragon', 'wildberry-spritz', 'watermelon-negroni', 'special-bellini', 'passion-vanilla-tiny', 'shiso-zemlyanika-lemongrass', 'kastella-klubnika-tonka', 'arbuz-bitter', 'roza-reven-greypfrut', 'persik-hanibush-laym-estragon', 'bazilik', 'dragonfrut-lichi-kardamon', 'grusha-zhasmin-vinograd', 'pandan-banan-vermut', 'limonnyy-tart-sencha-vanil', 'yudzu-bambuk-lemongrass', 'lavanda-zizifora-kaktus', 'mango-marakuya-kokos', 'vasilki-cheremuha-golubika', 'oblepiha-donnik', 'belgiyskaya-vishnya', 'mohito', 'kalamansi-limonnyy-mirt', 'zhimolost-zemlyanika-smorodina', 'yudzu-buzina', 'fruitopia-vanil', 'fruitopia-dragonfrut', 'fruitopia-masala', 'fruitopia-karamel', 'fruitopia-persik', 'fruitopia-vishnya', 'fruitopia-malina', 'fruitopia-shokolad', 'fruitopia-yudzu'];
PRODUCTS.forEach((p) => { if (PHOTOS.includes(p.id)) p.img = `img/p/${p.id}.webp`; });

const RECIPES = [
  { id: 'yudzu-highball', img: 'img/cocktail-3.webp', name: 'Юдзу-хайбол', kind: 'cocktail', where: 'bar', alcohol: true, product: 'yudzu-bambuk-lemongrass', glass: 'Хайбол', method: 'Билд', time: '1 минута',
    items: ['30 мл CLAVIS Юдзу / Бамбук / Лемонграсс', '40 мл джина', '120 мл содовой', 'Лёд доверху'], steps: ['Наполните хайбол льдом.', 'Влейте основу и джин.', 'Долейте содовую и один раз перемешайте барной ложкой.'] },
  { id: 'shiso-spark', img: 'img/format-mocktail.webp', name: 'Шисо в купе', kind: 'mocktail', where: 'bar', alcohol: false, product: 'shiso-zemlyanika-lemongrass', glass: 'Купе', method: 'Билд', time: '1 минута',
    items: ['30 мл CLAVIS Шисо / Земляника / Лемонграсс', '100 мл безалкогольного игристого'], steps: ['Охладите купе.', 'Влейте основу, долейте игристое.'] },
  { id: 'mango-coconut', img: 'img/sparkling.webp', name: 'Манго на кокосовой воде', kind: 'mocktail', where: 'home', alcohol: false, product: 'mango-marakuya-kokos', glass: 'Рокс', method: 'Билд', time: '1 минута',
    items: ['30 мл CLAVIS Манго / Маракуйя / Кокос', '90 мл кокосовой воды', 'Лёд'], steps: ['Положите лёд в рокс.', 'Влейте основу и кокосовую воду, перемешайте.'] },
  { id: 'oblepiha-lemonade', img: 'img/format-lemonade.webp', name: 'Облепиховый лимонад', kind: 'lemonade', where: 'home', alcohol: false, product: 'oblepiha-med-limon', glass: 'Хайбол', method: 'Билд', time: '2 минуты',
    items: ['30 мл CLAVIS Облепиха / Мёд / Лимон', '150 мл содовой', 'Лёд', 'Долька лимона'], steps: ['Наполните стакан льдом.', 'Влейте основу и содовую.', 'Украсьте долькой лимона.'] },
  { id: 'klyukva-tonic', img: 'img/pink.webp', name: 'Клюква с тоником', kind: 'lemonade', where: 'home', alcohol: false, product: 'klyukva-citrus-rozmarin', glass: 'Хайбол', method: 'Билд', time: '1 минута',
    items: ['30 мл CLAVIS Клюква / Цитрус / Розмарин', '150 мл тоника', 'Лёд', 'Веточка розмарина'], steps: ['Наполните стакан льдом.', 'Влейте основу, долейте тоник.', 'Добавьте розмарин.'] },
  { id: 'rose-sour', img: 'img/format-cocktail.webp', name: 'Розовый сауэр', kind: 'cocktail', where: 'bar', alcohol: true, product: 'roza-reven-greypfrut', glass: 'Купе', method: 'Шейк', time: '2 минуты',
    items: ['45 мл CLAVIS Роза / Ревень / Грейпфрут', '40 мл бурбона', '20 мл аквафабы', 'Лёд'], steps: ['Взбейте все ингредиенты в шейкере без льда.', 'Добавьте лёд и взбейте ещё раз.', 'Процедите в охлаждённое купе.'] },
  { id: 'wildberry-spritz-r', img: 'img/cocktail-4.webp', name: 'Ягодный спритц', kind: 'cocktail', where: 'home', alcohol: true, product: 'wildberry-spritz', glass: 'Винный бокал', method: 'Билд', time: '1 минута',
    items: ['40 мл CLAVIS Wildberry Spritz', '60 мл игристого', '30 мл содовой', 'Лёд'], steps: ['Наполните бокал льдом.', 'Влейте основу, игристое и содовую.'] },
  { id: 'bellini-zero', img: 'img/cocktail-2.webp', name: 'Беллини без алкоголя', kind: 'mocktail', where: 'home', alcohol: false, product: 'special-bellini', glass: 'Флюте', method: 'Билд', time: '1 минута',
    items: ['40 мл CLAVIS Special Bellini', '100 мл безалкогольного игристого'], steps: ['Влейте основу в охлаждённый бокал.', 'Аккуратно долейте игристое.'] },
  { id: 'watermelon-negroni-r', img: 'img/negroni.webp', name: 'Арбузный негрони', kind: 'cocktail', where: 'bar', alcohol: true, product: 'watermelon-negroni', glass: 'Рокс', method: 'Стир', time: '2 минуты',
    items: ['40 мл CLAVIS Watermelon Negroni', '30 мл джина', 'Крупный лёд', 'Апельсиновая цедра'], steps: ['Перемешайте основу и джин со льдом в стакане для смешивания.', 'Процедите в рокс на крупный лёд.', 'Сбрызните цедрой.'] },
  { id: 'masala-tea', img: 'img/format-hot.webp', name: 'Чай масала со смородиной', kind: 'hot', where: 'home', alcohol: false, product: 'smorodina-apelsin-masala', glass: 'Чайник', method: 'Заварить', time: '3 минуты',
    items: ['30 мл CLAVIS Смородина / Апельсин / Масала', '150 мл горячего чёрного чая', 'Долька апельсина'], steps: ['Заварите чёрный чай.', 'Влейте основу в чашку и долейте чай.', 'Добавьте дольку апельсина.'] },
  { id: 'glintveyn-zero', img: 'img/two-glasses.webp', name: 'Безалкогольный глинтвейн', kind: 'hot', where: 'home', alcohol: false, product: 'glintveyn', glass: 'Кружка', method: 'Нагреть', time: '3 минуты',
    items: ['40 мл CLAVIS Глинтвейн', '150 мл горячей воды', 'Палочка корицы'], steps: ['Нагрейте воду почти до кипения.', 'Влейте основу и перемешайте.', 'Добавьте корицу.'] },
  { id: 'vishnya-highball', img: 'img/martini.webp', name: 'Вишнёвый хайбол', kind: 'cocktail', where: 'bar', alcohol: true, product: 'belgiyskaya-vishnya', glass: 'Хайбол', method: 'Билд', time: '1 минута',
    items: ['30 мл CLAVIS Бельгийская вишня', '40 мл рома', '120 мл содовой', 'Лёд'], steps: ['Наполните хайбол льдом.', 'Влейте основу и ром, долейте содовую.'] },
];

const KINDS = { cocktail: 'Коктейль', mocktail: 'Моктейль', lemonade: 'Лимонад', hot: 'Горячий' };

const ARTICLES = [
  { id: 'sebestoimost-porcii', img: 'img/dist-bar.webp', title: 'Сколько стоит порция коктейля на основе CLAVIS', tag: 'Для бара',
    lead: 'Считаем себестоимость на реальных цифрах: цена бутылки, закладка и число порций.',
    body: [
      'Бутылка CLAVIS 0,75 л стоит 800 ₽. Для хайбола бармен наливает 30 мл основы, из бутылки выходит 25 порций. Основа в одном хайболе обходится в 32 ₽.',
      'Сауэр берёт больше: 45 мл на подачу. Из той же бутылки выйдет 16 порций, основа в каждой стоит 50 ₽.',
      'Кислота уже в составе кордиала, поэтому бармену не нужно выжимать лайм за стойкой. Бар экономит на закупке фреша и на часах бармена, а списаний в конце смены становится меньше.',
      'Посчитать свою карту можно в калькуляторе на странице для заведений. Введите закладку и цену бутылки, и сайт покажет выход порций.',
    ] },
  { id: 'odna-butylka-na-prazdnik', img: 'img/format-lemonade.webp', title: 'Одна бутылка на весь праздник', tag: 'Для дома',
    lead: 'Лимонад детям и хайбол взрослым из одного кордиала за две минуты.',
    body: [
      'Домашнему бару не нужен шейкер. Хватит бутылки CLAVIS, льда и содовой.',
      'Детям наливаем 30 мл основы и 150 мл содовой. Взрослым добавляем 40 мл крепкого, и лимонад становится хайболом.',
      'Одной бутылки 0,75 л хватит примерно на 25 стаканов. Для компании из десяти человек это два-три стакана на каждого.',
      'Подобрать вкус под ваш праздник поможет короткий тест на странице «Для дома».',
    ] },
  { id: 'novinki', img: 'img/new-2026.webp', title: 'Новинки: северные ягоды и хвоя', tag: 'Новинки',
    lead: 'Одиннадцать новых позиций: концентраты, кордиалы, соки прямого отжима и основа для тоника.',
    body: [
      'В новой линейке CLAVIS собрал вкусы северного леса: брусника с пихтой, морошка с малиной, калина. Рядом стоят гранат с чёрной смородиной и облепиха с мёдом.',
      'Для баров появились соки лимона и лайма прямого отжима в литровых бутылках. Бармену больше не нужно выжимать цитрусы перед сменой.',
      'Основа для тоника разводится содовой один к восьми. Из литра выходит девять литров тоника.',
    ] },
];

const STATS = [
  { n: '2020', t: 'год основания CLAVIS' },
  { n: '41 + 9', t: 'позиций CLAVIS и FRUITOPIA' },
  { n: '31', t: 'регион России' },
  { n: '30 млн', t: 'напитков приготовили партнёры' },
];

// Логотипы со слайда колоды для HoReCa, порезаны по одному в img/logos/
const PARTNERS = [
  ['novikov', 'Novikov Group'], ['pinskiy', 'Pinskiy & Co'], ['vasilchuki', 'Vasilchuki'], ['tanuki', 'Тануки'],
  ['yakitoriya', 'Якитория'], ['chayhona-1', 'Чайхона №1'], ['uryuk', 'Урюк'], ['rappoport', 'Рестораны Раппопорта'],
  ['lucky-group', 'Lucky Group'], ['stars-coffee', 'Stars Coffee'], ['moremaniya', 'Моремания'], ['macallan', 'The Macallan'],
  ['jameson', 'Jameson'], ['hine', 'Hine'], ['schmidt', 'Schmidt'], ['martignac', 'François de Martignac'],
];

const CONTACTS = { phone: '+7 977 644-88-45', phoneHref: '+79776448845', email: 'order.clavis@yandex.ru' };
