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

const fmt = (n) => n.toLocaleString('ru-RU');
const formatPrice = (p) => (Array.isArray(p) ? p.map(fmt).join(' / ') : fmt(p)) + ' ₸';

const groups = [...new Set(MENU.map(s => s.group))];
let sections = [];
let current = 0;

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
  if (page) pagesEl.style.height = page.offsetHeight + 'px';
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

// ---------- Дата и время только в часы работы ----------
const OPEN_HOUR = 9;        // открытие
const LAST_BOOKING = 22;    // последняя бронь 
const STEP_MIN = 20;        

const timeSelect = document.getElementById('timeSelect');
const pad = (n) => String(n).padStart(2, '0');

const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
form.date.min = today; // нельзя выбрать дату в прошлом

// Заполняем список времени. Если выбрана сегодняшняя дата — прошедшие слоты не показываем
function fillTimes() {
  const isToday = form.date.value === today;
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  timeSelect.innerHTML = '<option value="" disabled selected>Выберите</option>';

  for (let m = OPEN_HOUR * 60; m <= LAST_BOOKING * 60; m += STEP_MIN) {
    if (isToday && m <= nowMinutes) continue; // это время уже прошло
    const t = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    timeSelect.add(new Option(t, t));
  }

  // Сегодня свободных слотов не осталось
  if (timeSelect.options.length === 1) {
    timeSelect.options[0].textContent = 'Сегодня уже поздно';
  }
}

form.date.addEventListener('change', fillTimes);
fillTimes();

const WHATSAPP_NUMBER = '77019999512';

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  const date = data.date.split('-').reverse().join('.');

  const text =
    `Здравствуйте! Хочу забронировать столик.\n` +
    `Имя: ${data.name}\n` +
    `Дата: ${date}, ${data.time}\n` +
    `Гостей: ${data.guests}` +
    (data.comment ? `\nКомментарий: ${data.comment}` : '');

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');

  success.hidden = false;
  setTimeout(() => (success.hidden = true), 4000);
  form.reset();
  fillTimes();
});
