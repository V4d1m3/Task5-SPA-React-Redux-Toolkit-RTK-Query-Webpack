# Task 5 — React SPA (Webpack + Redux Toolkit + RTK Query)

Кратко: многостраничное SPA на React без Create React App, сборка Webpack, маршрутизация React Router, состояние Redux Toolkit, данные DummyJSON через RTK Query, стили — обычный CSS.

## Функциональность (план)

- **Страницы (минимум 3):** логин, список сущностей (например, продукты или посты), детальная карточка.
- **Данные:** запросы только к [DummyJSON](https://dummyjson.com/), кэш и повторное использование — RTK Query.
- **Состояние:** слайсы RTK / локальный UI-стейт в hooks; при необходимости — отдельные слайсы для auth (токен из ответа логина DummyJSON).

## Зависимости

| Пакет | Назначение |
|--------|-------------|
| `react`, `react-dom` | UI |
| `react-router-dom` | Маршруты SPA |
| `@reduxjs/toolkit`, `react-redux` | Store, слайсы, интеграция с React |
| `webpack`, `webpack-cli`, `webpack-dev-server` | Сборка и dev-сервер |
| `html-webpack-plugin` | Подключение бандла в HTML |
| `babel-loader`, `@babel/*` | JSX и современный JS в браузерных таргетах |
| `css-loader`, `style-loader` | Импорт CSS из JS (без UI-библиотек) |
| `eslint` + плагины | Проверка кода (опционально для оценки) |

## Запуск

```bash
npm install
npm start
```

Откроется dev-сервер (по умолчанию http://localhost:3000). Для прод-сборки:

```bash
npm run build
```

Артефакты — в папке `dist/`. Для деплоя на Netlify/Vercel/GitHub Pages укажи команду сборки `npm run build` и публикацию каталога `dist`; для GitHub Pages часто нужен `publicPath` в Webpack — обсуди с ментором базовый URL репозитория.

## Структура проекта (текущая и рекомендуемая)

```
TASK5_INNO/
├── public/
│   └── index.html          # шаблон для HtmlWebpackPlugin
├── src/
│   ├── app/
│   │   ├── App.jsx         # корневой layout + Routes
│   │   └── store.js        # configureStore
│   ├── pages/              # страницы по маршрутам
│   ├── components/         # переиспользуемые UI (по мере роста)
│   ├── features/           # опционально: фичи (auth, productList, …)
│   ├── entities/           # опционально: API-слой RTK Query, типичные мапперы
│   └── styles/
│       └── global.css
├── webpack.config.js
├── babel.config.js
└── package.json
```

Дальше имеет смысл завести, например, `src/entities/dummyJson/api/dummyJsonApi.js` с `createApi` и эндпоинтами под выбранные ресурсы DummyJSON.

## Этапы выполнения задания

1. **Инициализация** — Webpack, Babel, React, dev-сервер с `historyApiFallback` (уже сделано).
2. **Маршруты** — три страницы: `/login`, список (`/products` или `/posts`), деталь (`/products/:id`). Защищённый layout: редирект на логин без токена (после реализации auth).
3. **RTK Query** — `baseQuery` на `https://dummyjson.com`, эндпоинты login, list, byId; подключение `reducer` + `middleware` в `store.js`.
4. **Redux Toolkit** — слайс для сессии (токен, user) с `extraReducers` на успешный login или отдельный listener; формы на неконтролируемом/контролируемом вводе — на твой выбор.
5. **UI** — таблица/карточки на CSS Grid/Flexbox, адаптивные брейкпоинты, без Bootstrap/MUI.
6. **Полировка** — README с деплоем, осмысленные коммиты, по желанию Lighthouse и валидаторы HTML/CSS.

## Ссылка на деплой

_(добавь после публикации, например: Netlify / Vercel / GitHub Pages)_

---

## Справка по технологиям

### Webpack

**Что это:** сборщик модулей. Берёт точку входа (`src/main.jsx`), обходит `import`, применяет лоадеры (Babel для JSX, CSS loader для стилей), выдаёт оптимизированный бандл в `dist/`. **Webpack Dev Server** поднимает сервер с HMR и перезагрузкой.

**Что сделать в проекте:** конфиг с `entry`, `output`, `module.rules`, `HtmlWebpackPlugin`, для SPA — `devServer.historyApiFallback: true`, чтобы прямые заходы на `/login` не давали 404.

### Redux

**Что это:** предсказуемый глобальный store: один объект состояния, изменения только через чистые **редьюсеры** и **actions**. Подходит для данных, которые шарятся между страницами (сессия, UI-флаги).

**Redux Toolkit (RTK):** официальный «современный» Redux: меньше шаблонного кода, `createSlice` (редьюсер + actions в одном месте), `configureStore` с DevTools и проверками из коробки.

**Что сделать в проекте:** `configureStore` в `store.js`, оборачивание приложения в `<Provider store={store}>` (уже есть). Подключать новые редьюсеры по мере появления слайсов/API.

### RTK Query

**Что это:** часть `@reduxjs/toolkit` для **серверного** состояния: описываешь эндпоинты (`createApi`), получаешь автогенерируемые хуки (`useLoginMutation`, `useGetProductsQuery`), кэш по аргументам, дедупликацию запросов, инвалидацию тегов, polling при необходимости.

**Что сделать в проекте:** один `createApi` с `baseUrl: 'https://dummyjson.com'`, в `prepareHeaders` подставлять `Authorization: Bearer <token>` после логина, если эндпоинты это требуют. Подключить `api.reducer` и `api.middleware` в store (см. комментарий в `store.js`).

### DummyJSON

**Что это:** публичный REST API с тестовыми пользователями, продуктами, постами, корзинами и т.д. Документация на сайте: пути, query-параметры (`limit`, `skip`), тело для `POST /auth/login`.

**Что сделать заранее:** выбрать сценарий (например, логин + список продуктов + продукт по `id`), открыть в доке точные URL и поля ответа; учесть, что данные могут отличаться от Figma — согласовать с ментором подстановки.

---

Лицензия: учебный проект.
