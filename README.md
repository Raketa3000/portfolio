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

## Запуск

Откройте `index.html` в браузере.

## Развертывание на GitHub Pages

1. Создайте репозиторий на GitHub.
2. Загрузите файлы проекта.
3. В настройках репозитория включите GitHub Pages, выбрав ветку main и папку root.

Сайт будет доступен по адресу: `https://username.github.io/repository-name/`
