# Регламенты ЮГ — готовый сайт для GitHub Pages

## Как опубликовать (самый простой способ)
1. Создайте новый репозиторий на GitHub (например, `reglaments-yug`).
2. Загрузите **весь** этот архив в репозиторий (важно: папка `docs/` должна лежать в корне репозитория).
3. В репозитории откройте: **Settings → Pages**.
4. В разделе **Build and deployment** выберите:
   - Source: **Deploy from a branch**
   - Branch: `main` (или `master`)
   - Folder: **/docs**
5. Сохраните. GitHub покажет ссылку на сайт.

## Структура
- `docs/index.html` — главная
- `docs/catalog.html` — каталог с фильтрами
- `docs/reglament.html?id=...` — карточка регламента
- `docs/assets/…` — исходные файлы
- `docs/data/reglaments.json` — метаданные и список файлов
