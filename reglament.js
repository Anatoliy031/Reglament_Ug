/*
 * Скрипт для детальной страницы регламента.
 * Загружает общий перечень регламентов, находит нужный по ID из URL
 * и отображает его подробные сведения с ссылками на вложения и связанные
 * документы. Для ссылок используется кодирование путей, чтобы поддерживать
 * русские буквы и пробелы.
 */

async function loadReglament() {
  const params = new URLSearchParams(window.location.search);
  const regId = params.get('id');
  const detailsEl = document.getElementById('regDetails');
  const fileListEl = document.getElementById('fileList');
  const relatedListEl = document.getElementById('relatedList');
  if (!regId) {
    detailsEl.innerHTML = '<p>Не указан идентификатор регламента.</p>';
    return;
  }
  try {
    const response = await fetch('https://raw.githubusercontent.com/Anatoliy031/Reglament_Ug/main/docs/data/reglaments.json');
    if (!response.ok) {
      throw new Error('Ошибка загрузки данных: ' + response.status);
    }
    const data = await response.json();
    const regs = data.reglaments || [];
    const reg = regs.find(r => r.id === regId);
    if (!reg) {
      detailsEl.innerHTML = '<p>Документ не найден.</p>';
      return;
    }
    // Заголовок
    document.getElementById('regTitle').textContent = `${reg.code}. ${reg.title}`;
    // Формируем основные сведения
    let html = '';
    html += `<p><strong>Код:</strong> ${reg.code}</p>`;
    html += `<p><strong>Дата:</strong> ${reg.date || '—'}</p>`;
    html += `<p><strong>Тема:</strong> ${reg.theme || '—'}</p>`;
    html += `<p><strong>Статус:</strong> ${reg.status || '—'}</p>`;
    if (reg.short) {
      html += `<p><strong>Описание:</strong> ${reg.short}</p>`;
    }
    if (reg.tags && reg.tags.length) {
      html += '<div><strong>Теги:</strong> ';
      html += reg.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');
      html += '</div>';
    }
    detailsEl.innerHTML = html;
    // Формируем список файлов
    fileListEl.innerHTML = '';
    const baseUrl = 'https://raw.githubusercontent.com/Anatoliy031/Reglament_Ug/main/docs/';
    if (reg.files && reg.files.length) {
      reg.files.forEach(file => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // Для формирования ссылки используем свойство `web`, потому что оно уже содержит префикс assets/...
        // Кодируем каждый сегмент пути отдельно, чтобы корректно обрабатывать пробелы, скобки и другие спецсимволы.
        const segments = file.web.split('/');
        const encodedSegments = segments.map(segment => encodeURIComponent(segment));
        const encodedPath = encodedSegments.join('/');
        a.href = baseUrl + encodedPath;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = file.name || file.web;
        li.appendChild(a);
        li.appendChild(document.createTextNode(` (${file.ext.toUpperCase()}, ${formatSize(file.size)})`));
        fileListEl.appendChild(li);
      });
    }
    if (reg.pack) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      // Аналогично кодируем путь к архиву: разбиваем по слешам и кодируем каждый сегмент
      const encodedPackSegments = reg.pack.split('/')
        .map(segment => encodeURIComponent(segment));
      const encodedPack = encodedPackSegments.join('/');
      a.href = baseUrl + encodedPack;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Скачать архив со всеми файлами';
      li.appendChild(a);
      fileListEl.appendChild(li);
    }
    if (!reg.files || !reg.files.length) {
      fileListEl.innerHTML = '<li>Нет вложенных файлов.</li>';
    }
    // Формируем список связанных регламентов
    relatedListEl.innerHTML = '';
    if (reg.related && reg.related.length) {
      reg.related.forEach(rel => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `reglament.html?id=${encodeURIComponent(rel.id)}`;
        a.textContent = `#${rel.id}`;
        li.appendChild(a);
        if (rel.type) {
          li.appendChild(document.createTextNode(` – ${rel.type}`));
        }
        relatedListEl.appendChild(li);
      });
    } else {
      relatedListEl.innerHTML = '<li>Связанных документов нет.</li>';
    }
  } catch (err) {
    console.error(err);
    detailsEl.innerHTML = '<p>Произошла ошибка при загрузке данных. Попробуйте позже.</p>';
  }
}

// Форматирование размера файла в килобайтах/мегабайтах
function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  const kb = 1024;
  if (bytes < kb) return `${bytes} Б`;
  const m = bytes / (kb * kb);
  if (m >= 1) return m.toFixed(2) + ' МБ';
  return (bytes / kb).toFixed(1) + ' КБ';
}

document.addEventListener('DOMContentLoaded', loadReglament);