// ============================================
// 1. Мобильное меню (бургер)
// ============================================
const burger = document.querySelector('.burger'); // находим кнопку
const nav = document.querySelector('.nav');       // находим меню

burger.addEventListener('click', () => {
  // toggle: если класс есть — убирает, если нет — добавляет
  const isOpen = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', isOpen);
});

// Закрываем меню, когда нажали на любой пункт
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('is-open'));
});

// ============================================
// 2. Меню с перелистыванием (данные — из menu-data.js)
// ============================================
const groupsEl = document.getElementById('menuGroups');
const tabsEl = document.getElementById('menuTabs');
const pagesEl = document.getElementById('menuPages');
const counterEl = document.getElementById('menuCounter');
const prevBtn = document.getElementById('menuPrev');
const nextBtn = document.getElementById('menuNext');

// Цена: 1400 -> "1 400 ₸", [1090, 1190] -> "1 090 / 1 190 ₸"
const fmt = (n) => n.toLocaleString('ru-RU');
const formatPrice = (p) => (Array.isArray(p) ? p.map(fmt).join(' / ') : fmt(p)) + ' ₸';

// Список групп без повторов: ["Кухня", "Бар"]
const groups = [...new Set(MENU.map(s => s.group))];
let sections = [];  // категории выбранной группы
let current = 0;    // номер открытой страницы

// Кнопки "Кухня / Бар"
groups.forEach(g => {
  const btn = document.createElement('button');
  btn.className = 'menu-group';
  btn.textContent = g;
  btn.addEventListener('click', () => showGroup(g));
  groupsEl.append(btn);
});

// Перестраиваем вкладки и страницы под выбранную группу
function showGroup(group) {
  groupsEl.querySelectorAll('.menu-group').forEach(b => b.classList.toggle('is-active', b.textContent === group));
  sections = MENU.filter(s => s.group === group);
  tabsEl.innerHTML = '';
  pagesEl.innerHTML = '';

  sections.forEach((section, i) => {
    const tab = document.createElement('button');
    tab.className = 'menu-tab';
    tab.textContent = section.category;
    tab.addEventListener('click', () => goToPage(i));
    tabsEl.append(tab);

    const page = document.createElement('div');
    page.className = 'menu-page';
    page.innerHTML =
      `<h3>${section.category}</h3>` +
      (section.note ? `<p class="menu-page__note">${section.note}</p>` : '') +
      section.items.map(item => `
        <div class="menu__item">
          <span>
            ${item.name}${item.isNew ? '<span class="menu__new">NEW</span>' : ''}
            ${item.desc ? `<span class="menu__desc">${item.desc}</span>` : ''}
          </span>
          <span class="menu__price">${formatPrice(item.price)}</span>
        </div>`).join('');
    pagesEl.append(page);
  });

  pagesEl.scrollTo({ left: 0, behavior: 'instant' });
  updateUI();
}

function goToPage(i) {
  pagesEl.scrollTo({ left: i * pagesEl.clientWidth }); // листаем к нужной странице
}

// Когда страницу пролистали (стрелкой, вкладкой или пальцем) — обновляем вкладки и счётчик
function updateUI() {
  current = Math.round(pagesEl.scrollLeft / pagesEl.clientWidth);
  tabsEl.querySelectorAll('.menu-tab').forEach((t, i) => t.classList.toggle('is-active', i === current));
  const tab = tabsEl.children[current];
  if (tab) tabsEl.scrollTo({ left: tab.offsetLeft - tabsEl.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' });
  const page = pagesEl.children[current];
  if (page) pagesEl.style.height = page.offsetHeight + 'px'; // высота = высоте открытой страницы
  counterEl.textContent = `${current + 1} / ${sections.length}`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === sections.length - 1;
}

pagesEl.addEventListener('scroll', () => requestAnimationFrame(updateUI));
prevBtn.addEventListener('click', () => goToPage(current - 1));
nextBtn.addEventListener('click', () => goToPage(current + 1));
showGroup(groups[0]);

// ============================================
// 3. Форма бронирования
// ============================================
const form = document.getElementById('bookingForm');
const success = document.getElementById('formSuccess');

// Нельзя выбрать дату в прошлом
form.date.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', (event) => {
  event.preventDefault(); // не даём странице перезагрузиться

  // Собираем данные формы в обычный объект
  const data = Object.fromEntries(new FormData(form));
  console.log('Заявка:', data);

  // В реальном заказе здесь отправка на сервер или в Telegram-бота:
  // fetch('/api/booking', { method: 'POST', body: JSON.stringify(data) })

  form.reset();
  success.hidden = false;
  setTimeout(() => (success.hidden = true), 5000);
});
