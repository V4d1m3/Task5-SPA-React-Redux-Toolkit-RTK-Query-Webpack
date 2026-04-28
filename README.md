# Task 5 — React SPA (Webpack + Redux Toolkit + RTK Query)

Educational multi-page React SPA without Create React App.  
The project uses React Router for navigation, Redux Toolkit for client state, RTK Query as the API layer with request caching for DummyJSON, and plain CSS for the UI.

## Current functionality

- Pages:
  - `/` — Home.
  - `/login` — authentication via DummyJSON.
  - `/catalog` — catalog with search, sorting, filters, and pagination.
  - `/products/:productId` — product details page.
  - `/cart` — shopping cart.
- API:
  - login (`POST /auth/login`);
  - categories;
  - product list (including search/filtering/sorting);
  - product by id.
- Global state:
  - user session (`auth`);
  - cart + notifications (`app`).
- Cart:
  - add from catalog and product details page;
  - remove from cart;
  - remove from the product details page (if the item is already in the cart).
- Persistence:
  - `token`, `refreshToken`, `user`, and cart contents are stored in `localStorage` and restored after page reload.

## What is used and how

### Redux Toolkit

The project uses `configureStore` + `createSlice`:

- `src/features/auth/authSlice.js`:
  - stores `token`, `refreshToken`, `user`;
  - updates the session via `extraReducers` on successful `login.matchFulfilled`;
  - provides the `logout` action.
- `src/app/appSlice.js`:
  - cart (`cart`);
  - notifications (`notice`);
  - actions `addToCart`, `removeFromCart`, `clearCart`, `setNotice`, `clearNotice`.
- `src/app/store.js`:
  - combines `app`, `auth`, and the RTK Query reducer;
  - adds RTK Query middleware;
  - loads `preloadedState` from `localStorage` and subscribes to state persistence.

### RTK Query

The project has a single API service: `src/entities/dummyJson/api/dummyJsonApi.js`:

- `createApi` with `reducerPath: 'dummyJsonApi'`;
- endpoints:
  - `getProductCategories`,
  - `getTechFacetTags`,
  - `getProductList`,
  - `getProductById`,
  - `login`.
- generated hooks are used in pages:
  - `useLoginMutation` — `LoginPage`,
  - `useGetProductCategoriesQuery`, `useGetProductListQuery`, `useGetTechFacetTagsQuery` — `HomePage` and `CatalogPage`,
  - `useGetProductByIdQuery` — `ProductDetailPage`.

RTK Query provides response caching, data reuse, and convenient loading/error states for the UI (`isFetching`, `isError`, `error`).

## Tech stack

- `react`, `react-dom`
- `react-router-dom`
- `@reduxjs/toolkit`, `react-redux`
- `webpack`, `webpack-cli`, `webpack-dev-server`
- `html-webpack-plugin`
- `babel-loader`, `@babel/preset-env`, `@babel/preset-react`
- `css-loader`, `style-loader`
- `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`

## Running the project

```bash
npm install
npm start
```

Default dev server: [http://localhost:3000](http://localhost:3000)

Demo user for login testing:
- `username`: `emilys`
- `password`: `emilyspass`

Production build:

```bash
npm run build
```

The build output is generated in `dist/`.

## Scripts

- `npm start` — start the Webpack dev server.
- `npm run build` — production build.
- `npm run lint` — ESLint for `src/**/*.{js,jsx}`.
- `npm run prepare:gh-pages` — creates `dist/404.html` for SPA fallback on GitHub Pages.
- `npm run deploy:gh-pages` — builds and publishes `dist` to GitHub Pages.

## Project structure

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

## Deployment

- GitHub Pages: [https://v4d1m3.github.io/Task5-SPA-React-Redux-Toolkit-RTK-Query-Webpack/](https://v4d1m3.github.io/Task5-SPA-React-Redux-Toolkit-RTK-Query-Webpack/)
- Publish command: `npm run deploy:gh-pages`
- For SPA routing on GitHub Pages, `dist/404.html` is created (a copy of `index.html`) so direct navigation to routes like `/catalog` does not return an empty 404 without the app.

## Lighthouse / accessibility (changes made)

- SEO: meta description in `public/index.html`.
- Contrast: darker colors for catalog captions, card rating, labels, and dates on the product page.
- ARIA: thumbnail gallery without incorrect `tablist`/`tab`; frame selection buttons have `aria-label` and `aria-pressed`.
- Navigation: a single Home link in the header (logo with `aria-label="Home"`), without a duplicate “Home” item.
- LCP: `fetchPriority="high"` for the main product image; some catalog cards and the first one on the home page use `loading="eager"`.
- Build: in production, CSS is extracted into a separate minified file (`MiniCssExtractPlugin` + `css-minimizer-webpack-plugin`).

---

Educational project.
