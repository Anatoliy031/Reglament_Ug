/*
 * Скрипт для главной страницы каталога регламентов.
 * Загружает данные из удалённого репозитория на GitHub, заполняет фильтры
 * и динамически генерирует список документов. Все ссылки на детальные
 * страницы строятся через идентификаторы регламентов.
 */

let reglaments = [];

// Загрузка данных с GitHub
async function loadData() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/Anatoliy031/Reglament_Ug/main/docs/data/reglaments.json');
    if (!response.ok) {
      throw new Error('Ошибка загрузки данных: ' + response.status);
    }
    const data = await response.json();
    reglaments = data.reglaments || [];
    populateFilters();
    updateList();
  } catch (err) {
    console.error(err);
    const listEl = document.getElementById('reglamentList');
    listEl.innerHTML = `<p class="error">Не удалось загрузить данные. Попробуйте позже.</p>`;
  }
}

// Заполнение выпадающих списков статуса и темы
function populateFilters() {
  const statusSelect = document.getElementById('statusFilter');
  const themeSelect = document.getElementById('themeFilter');
  // собираем уникальные значения
  const statuses = new Set();
  const themes = new Set();
  reglaments.forEach(r => {
    if (r.status) statuses.add(r.status);
    if (r.theme) themes.add(r.theme);
  });
  // сортировка по алфавиту
  Array.from(statuses).sort().forEach(st => {
    const opt = document.createElement('option');
    opt.value = st;
    opt.textContent = st;
    statusSelect.appendChild(opt);
  });
  Array.from(themes).sort().forEach(th => {
    const opt = document.createElement('option');
    opt.value = th;
    opt.textContent = th;
    themeSelect.appendChild(opt);
  });
}

// Обновление списка регламентов в соответствии с фильтрами и поиском
function updateList() {
  const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
  const statusVal = document.getElementById('statusFilter').value;
  const themeVal = document.getElementById('themeFilter').value;
  const listEl = document.getElementById('reglamentList');
  listEl.innerHTML = '';
  if (!reglaments.length) {
    listEl.innerHTML = '<p class="loading">Загрузка данных…</p>';
    return;
  }
  // фильтрация
  let filtered = reglaments.filter(r => {
    if (statusVal && r.status !== statusVal) return false;
    if (themeVal && r.theme !== themeVal) return false;
    if (searchValue) {
      const titleMatch = r.title && r.title.toLowerCase().includes(searchValue);
      const codeMatch = r.code && r.code.toLowerCase().includes(searchValue);
      return titleMatch || codeMatch;
    }
    return true;
  });
  // сортируем по дате (от новой к старой)
  filtered.sort((a, b) => {
    // если дата не указана, помещаем в конец
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });
  // создаём карточки
  filtered.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    const h3 = document.createElement('h3');
    h3.textContent = `${r.code}. ${r.title}`;
    card.appendChild(h3);
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${r.date || 'Без даты'} • ${r.theme || 'Без темы'} • ${r.status || 'Без статуса'}`;
    card.appendChild(meta);
    if (r.short) {
      const short = document.createElement('p');
      short.textContent = r.short;
      card.appendChild(short);
    }
    // теги
    if (r.tags && r.tags.length) {
      const tagsDiv = document.createElement('div');
      r.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        tagsDiv.appendChild(span);
      });
      card.appendChild(tagsDiv);
    }
    const link = document.createElement('a');
    link.href = `reglament.html?id=${encodeURIComponent(r.id)}`;
    link.textContent = 'Открыть';
    card.appendChild(link);
    listEl.appendChild(card);
  });
  if (!filtered.length) {
    listEl.innerHTML = '<p class="empty">Ничего не найдено. Попробуйте изменить фильтры или поисковый запрос.</p>';
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadData);