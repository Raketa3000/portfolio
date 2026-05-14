# Landing Page - Студия стратегия и креатив

Это одностраничный сайт для креативной студии.

## Структура проекта

```
landing-page-prod/
├── index.html          # Основной HTML файл
├── README.md           # Описание проекта
├── .gitignore          # Исключаемые файлы
└── assets/
    ├── css/
    │   └── styles.css  # Стили CSS
    ├── i18n/           # UI-тексты по языкам
    ├── js/
    │   └── script.js   # JavaScript код
    └── images/         # Изображения (добавьте сюда profile1.jpg и profile2.jpg)
```

## Настройка

1. **Изображения**: Замените файлы в `assets/images/` на реальные фото `profile1.jpg` и `profile2.jpg`.
2. **Кейсы**: Добавьте JSON файлы в `assets/cases/` с данными для кейсов (beeline-eto-vyshka.json, beeline-kiberbitva-s-moshennikami.json, letual-prohor-shalyapin.json).

### Медиа в кейсах

В JSON кейса можно добавить массив `media`. Поддерживаются картинки, видео и iframe-вставки:

```json
{
  "media": [
    {
      "type": "image",
      "src": "assets/cases/media/case-image.webp",
      "alt": "Описание изображения",
      "caption": "Кадр из проекта",
      "fit": "contain"
    },
    {
      "type": "video",
      "src": "assets/cases/media/case-video.mp4",
      "poster": "assets/cases/media/case-poster.webp",
      "caption": "Ролик проекта",
      "fit": "cover"
    },
    {
      "type": "embed",
      "html": "<iframe src=\"https://player.vimeo.com/video/000000000\" allowfullscreen></iframe>",
      "caption": "Внешний плеер"
    }
  ]
}
```

Если `media` не указан, кейс остается текстовым.

## Локализация

UI-тексты вынесены в `assets/i18n/`.

Поддерживаемые локали:

- `ru` - основной язык и fallback
- `en` - английская версия
- `es-la` - испанский для Latin America

Язык можно проверить через отдельные URL:

```text
http://127.0.0.1:4173/ru/
http://127.0.0.1:4173/eng/
http://127.0.0.1:4173/es/
```

Если язык не указан в URL, сайт автоматически выбирает язык по `navigator.languages`:

- `ru-*` → `ru`
- `en-*` → `en`
- `es-*`, `es-419`, `es-la` → `es-la`
- все остальное → `ru`

Если в `en.json` или `es-la.json` нет ключа, сайт берет значение из `ru.json`. Это позволяет переводить страницу постепенно без поломки интерфейса.

Кейсы пока читаются из `assets/cases/*.json`. Для полного перевода кейсов используйте ту же структуру JSON и добавьте локализованные файлы отдельным слоем, например `assets/cases/en/` и `assets/cases/es-la/`.

## Запуск

Запускайте сайт через локальный HTTP-сервер из корня проекта:

```bash
python3 -m http.server 4173
```

После запуска откройте в браузере:

```text
http://127.0.0.1:4173/
```

Не открывайте `index.html` напрямую через `file://`: браузер заблокирует загрузку JSON-файлов кейсов через `fetch()`.

## Развертывание на GitHub Pages

1. Создайте репозиторий на GitHub.
2. Загрузите файлы проекта.
3. В настройках репозитория включите GitHub Pages, выбрав ветку main и папку root.

Сайт будет доступен по адресу: `https://username.github.io/repository-name/`
