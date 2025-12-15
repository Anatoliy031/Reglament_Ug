# Регламенты ЮГ (GitHub Pages)

Этот репозиторий — статический сайт с регламентами на базе **MkDocs + Material**.

## Локальный запуск
```bash
pip install -r requirements.txt
mkdocs serve
```
Откройте: http://127.0.0.1:8000/

## Публикация в GitHub Pages
В репозитории уже есть workflow `.github/workflows/deploy.yml`.
1) Залейте код в GitHub (ветка `main` или `master`).
2) В настройках репозитория включите GitHub Pages (если требуется) и выберите источник `gh-pages`.

После push в `main/master` сайт будет собран и опубликован.
