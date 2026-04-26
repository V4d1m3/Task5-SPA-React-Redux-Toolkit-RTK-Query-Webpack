# Task 5 — React SPA (Webpack + Redux Toolkit + RTK Query)

Учебное многостраничное SPA на React без Create React App.  
Проект использует React Router для навигации, Redux Toolkit для клиентского состояния, RTK Query для API-слоя и кэширования запросов к DummyJSON, и нативный CSS для UI.

## Текущая функциональность

- Страницы:
  - `/` — Home.
  - `/login` — авторизация через DummyJSON.
  - `/catalog` — каталог с поиском, сортировкой, фильтрами, пагинацией.
  - `/products/:productId` — детальная страница продукта.
  - `/cart` — корзина.
- Работа с API:
  - логин (`POST /auth/login`);
  - категории;
  - список продуктов (включая поиск/фильтрацию/сортировку);
  - продукт по id.
- Глобальное состояние:
  - сессия пользователя (`auth`);
  - корзина + уведомления (`app`).
- Корзина:
  - добавление из каталога и детальной страницы;
  - удаление из корзины;
  - удаление с детальной страницы (если товар уже в корзине).
- Persistence:
  - `token`, `refreshToken`, `user` и содержимое корзины сохраняются в `localStorage` и восстанавливаются после перезагрузки страницы.

## Что и как используется

### Redux Toolkit

В проекте используется `configureStore` + `createSlice`:

- `src/features/auth/authSlice.js`:
  - хранит `token`, `refreshToken`, `user`;
  - обновляет сессию через `extraReducers` на успешный `login.matchFulfilled`;
  - имеет action `logout`.
- `src/app/appSlice.js`:
  - корзина (`cart`);
  - уведомления (`notice`);
  - actions `addToCart`, `removeFromCart`, `clearCart`, `setNotice`, `clearNotice`.
- `src/app/store.js`:
  - объединяет `app`, `auth`, и RTK Query reducer;
  - подключает RTK Query middleware;
  - загружает `preloadedState` из `localStorage` и подписывается на сохранение state.

### RTK Query

В проекте есть единый API-сервис `src/entities/dummyJson/api/dummyJsonApi.js`:

- `createApi` с `reducerPath: 'dummyJsonApi'`;
- endpoints:
  - `getProductCategories`,
  - `getTechFacetTags`,
  - `getProductList`,
  - `getProductById`,
  - `login`.
- автосгенерированные хуки применяются в страницах:
  - `useLoginMutation` — `LoginPage`,
  - `useGetProductCategoriesQuery`, `useGetProductListQuery`, `useGetTechFacetTagsQuery` — `HomePage` и `CatalogPage`,
  - `useGetProductByIdQuery` — `ProductDetailPage`.

RTK Query обеспечивает кэширование ответов, повторное использование данных и удобные состояния загрузки/ошибки для UI (`isFetching`, `isError`, `error`).

## Технологии

- `react`, `react-dom`
- `react-router-dom`
- `@reduxjs/toolkit`, `react-redux`
- `webpack`, `webpack-cli`, `webpack-dev-server`
- `html-webpack-plugin`
- `babel-loader`, `@babel/preset-env`, `@babel/preset-react`
- `css-loader`, `style-loader`
- `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`

## Запуск проекта

```bash
npm install
npm start
```

Dev server по умолчанию: [http://localhost:3000](http://localhost:3000)

Демо-пользователь для проверки логина:
- `username`: `emilys`
- `password`: `emilyspass`

Production build:

```bash
npm run build
```

Сборка генерируется в `dist/`.

## Скрипты

- `npm start` — запуск dev-сервера Webpack.
- `npm run build` — production-сборка.
- `npm run lint` — ESLint для `src/**/*.{js,jsx}`.
- `npm run prepare:gh-pages` — создаёт `dist/404.html` для SPA fallback на GitHub Pages.
- `npm run deploy:gh-pages` — сборка и публикация `dist` в GitHub Pages.

## Структура проекта

```text
TASK5_INNO/
├── public/
│   └── index.html
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── appSlice.js
│   │   ├── persistence.js
│   │   └── store.js
│   ├── components/
│   ├── entities/
│   │   └── dummyJson/api/dummyJsonApi.js
│   ├── features/
│   │   └── auth/authSlice.js
│   ├── pages/
│   ├── shared/
│   ├── styles/
│   └── widgets/
├── webpack.config.js
├── babel.config.js
└── package.json
```

## Деплой

- GitHub Pages: [https://v4d1m3.github.io/Task5-SPA-React-Redux-Toolkit-RTK-Query-Webpack/](https://v4d1m3.github.io/Task5-SPA-React-Redux-Toolkit-RTK-Query-Webpack/)
- Команда публикации: `npm run deploy:gh-pages`
- Для SPA на GitHub Pages в `dist/` создаётся `404.html` (копия `index.html`), чтобы прямые заходы на маршруты вроде `/catalog` не отдавали пустой 404 без приложения.

## Lighthouse / доступность (что подправлено в коде)

- SEO: meta description в `public/index.html`.
- Контраст: более тёмные цвета для подписей каталога, рейтинга карточек, меток и дат на странице товара.
- ARIA: галерея миниатюр без некорректного `tablist`/`tab`; у кнопок выбора кадра есть `aria-label` и `aria-pressed`.
- Навигация: одна ссылка на главную в шапке (логотип с `aria-label="Home"`), без дублирующего пункта «Home».
- LCP: `fetchPriority="high"` у главного изображения товара; у части карточек каталога и первой на главной — `loading="eager"`.
- Сборка: в production CSS выносится в отдельный минифицированный файл (`MiniCssExtractPlugin` + `css-minimizer-webpack-plugin`).

---

Учебный проект.
