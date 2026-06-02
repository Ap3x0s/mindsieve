# MindSieve

**AI-куратор контента** — сохраняйте статьи и заметки, получайте AI-саммари, проходите квизы и повторяйте материал по интервалам (SM-2). С геймификацией, тёмной темой и офлайн-режимом.

```
Frontend (Vite + React) ──► Backend (Express + Prisma)
       │                           │
       ▼                           ▼
  localStorage ◄──────────────► SQLite
  (offline-first)             (server)
```

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | Vite 8 + React 19 + TypeScript + Tailwind v4 + react-router-dom v7 |
| Backend | Express 5 + Prisma + SQLite + Docker |
| AI | OmniRoute (OpenAI, Anthropic, Google, Ollama, Custom) + mockAI для офлайн |
| PWA | Service Worker + manifest + иконки 192/512 |
| Auth | scrypt + JWT (30d) |
| Тесты | Vitest + jsdom |

## Быстрый старт

```bash
# 1. Backend
cd server
npx prisma db push    # создать SQLite БД
npx tsx src/index.ts  # запустить на :3001

# 2. Frontend (другой терминал)
npm install
npm run dev           # запустить на :5173
```

Или через Docker:

```bash
docker compose up --build
```

## Структура проекта

```
mindsieve/
├── src/                      # Frontend (React)
│   ├── components/           # 17 UI-компонентов
│   │   ├── Header, BottomNav, CommandPalette
│   │   ├── QuickInput, ContentCard, SieveView
│   │   ├── SwipeableCard, ImportModal, ConfirmDialog
│   │   ├── ShareCard, LoadingSkeleton, ErrorBoundary
│   │   ├── Confetti, LevelUpModal, TutorialOverlay
│   │   ├── SetupWizard, ProviderIcons
│   ├── pages/                # 9 страниц
│   │   ├── Dashboard, Library, SievePage
│   │   ├── Review, Stats, Settings, ThemeEditor
│   │   └── AuthPage
│   ├── hooks/                # 5 кастомных хуков
│   │   ├── useAI, useQuiz, useXP
│   │   ├── useFilteredItems, useRetention
│   ├── context/
│   │   └── AppContext.tsx     # Центральное состояние
│   ├── lib/                  # 16 модулей
│   │   ├── constants.ts       # Конфиги, пороги, префиксы
│   │   ├── omniroute.ts       # AI-роутер (5 провайдеров)
│   │   ├── sm2.ts             # Spaced Repetition SM-2
│   │   ├── xp.ts, achievements.ts, quests.ts
│   │   ├── api.ts, auth.ts, storage.ts
│   │   ├── themes.ts          # 8 пресетов + редактор
│   │   ├── extractUrl.ts, mockAI.ts
│   │   └── exportObsidian.ts
│   ├── types.ts              # Все TypeScript-типы
│   └── index.css              # Темизация + анимации
├── server/                   # Backend (Express)
│   ├── src/
│   │   ├── index.ts           # Express-сервер (:3001)
│   │   ├── seed.ts            # Начальные данные
│   │   ├── middleware/auth.ts  # JWT-проверка
│   │   └── routes/            # 8 роутеров
│   ├── prisma/
│   │   └── schema.prisma      # 7 моделей (SQLite)
│   └── Dockerfile
├── public/                   # PWA
│   ├── sw.js, manifest.json
│   └── icon-{192,512}.png
├── docker-compose.yml
└── Dockerfile                # Nginx для frontend
```

## Возможности

### 🧠 AI-обработка
- Вставьте URL или текст → AI извлекает саммари, action items и генерирует квиз из 3 вопросов
- Поддержка OpenAI, Anthropic Claude, Google Gemini, Ollama (локально) и кастомных эндпоинтов
- Офлайн-режим: без ключа работает встроенный mockAI (выделение ключевых слов + генерация)

### 📚 Управление контентом
- Библиотека с поиском, фильтрацией по статусу/тегам, сортировкой
- Массовые операции: архивировать, удалить, в избранное
- Свайп-жесты на мобильных
- Импорт через URL или текст (QuickInput / ImportModal)

### 🔁 Интервальные повторения (SM-2)
- Каждый элемент получает расписание повторений
- Оценка 1-5 пересчитывает easeFactor и интервал
- Прогресс и статистика retention (календарь + timeline)
- Keyboard shortcuts: 1-5, Space/Enter, S (skip)

### 🎮 Геймификация
- XP и уровни (100 XP = 1 уровень)
- Ежедневные квесты (прочитать, пройти квиз, повторить)
- 9 достижений (First Read, Quiz Ace, Streak Master, Curator и др.)
- Полосы streak с freeze-днями
- Конфетти и LevelUp-модалка

### 🎨 Темизация
- 8 пресетов: Dark, Light, Sepia, Nord, Dracula, Monokai, Tokyo Night, Catppuccin
- Кастомный редактор: 14 CSS-переменных через color pickers
- Светлая/тёмная тема с сохранением в localStorage

### 📤 Экспорт
- Копирование Markdown в буфер обмена
- Скачивание .md / .json
- Экспорт в Obsidian (YAML frontmatter + контент)

## Разработка

```bash
npm run dev       # Frontend + Backend (concurrently)
npm run build     # tsc + vite build
npm run test      # Vitest (40+ тестов)
npm run lint      # ESLint
```

## API endpoints

| Метод | Путь | Описание |
|-------|------|---------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |
| GET | /api/auth/me | Профиль |
| GET/POST | /api/items | CRUD статей |
| GET/PUT | /api/user | Состояние пользователя |
| GET/POST/DELETE | /api/tags | Теги |
| GET/PUT | /api/achievements | Достижения |
| GET/PUT | /api/quests | Квесты |
| GET/POST | /api/reviews | Логи повторений |
| POST | /api/migrate | Импорт данных |

## Фазы разработки

### Фаза 1: Фундамент ✅
PWA-иконки, Service Worker, Bulk import, OG image extraction

### Фаза 2: Бэкенд и авторизация ✅
Express 5 + Prisma + SQLite, REST API, JWT, Docker, миграция localStorage→API

### Фаза 3: AI-теги ✅
AIResult.tags, suggestTags(), авто-создание TagInfo

### Фаза 4: Spaced Repetition 2.0 ✅
ReviewLog, SM-2 настройки, Retention Calendar/Timeline, bulk review, keyboard shortcuts

### Фаза 5: Сообщество ✅ (частично)
Share/Export, Obsidian, Stats. ⬜ RSS Reader, Browser Extension, Public Sharing

### Фаза 6: Pro-features ✅ (частично)
Theme Editor, единый конфиг. ⬜ Virtual scroll, full-text search, граф знаний
