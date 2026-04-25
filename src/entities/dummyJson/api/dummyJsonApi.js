import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CATALOG_VIEW_ALL, TECH_CATEGORY_SLUGS } from '../../../shared/catalogDefaults';

const BASE_URL = 'https://dummyjson.com';

function normalizeCategories(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.value)) return response.value;
  return [];
}

function sortProducts(products, sortBy, order) {
  const dir = order === 'desc' ? -1 : 1;
  const key = sortBy || 'title';
  return [...products].sort((a, b) => {
    if (key === 'title') return a.title.localeCompare(b.title) * dir;
    if (key === 'price') return (a.price - b.price) * dir;
    if (key === 'rating') return (a.rating - b.rating) * dir;
    if (key === 'stock') return (a.stock - b.stock) * dir;
    return 0;
  });
}

async function fetchMergedTech(sortBy, order) {
  const cap = 100;
  const lists = await Promise.all(
    TECH_CATEGORY_SLUGS.map((slug) =>
      fetch(`${BASE_URL}/products/category/${encodeURIComponent(slug)}?limit=${cap}`)
        .then((r) => r.json())
        .then((json) => json.products || []),
    ),
  );
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const p of list) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
  }
  return sortProducts(merged, sortBy, order);
}

/**
 * @param {{ category: string; q?: string; limit: number; skip: number; sortBy: string; order: string }} arg
 * - category === `all` → merge supported tech categories (DummyJSON totals are small enough to load in one go).
 * - category slug → native category endpoint with server sort + pagination.
 * - q → search DummyJSON, keep only supported tech categories, then sort + slice (client pagination).
 */
async function fetchProductList(arg) {
  const { category, q, limit, skip, sortBy, order } = arg;
  const qTrim = typeof q === 'string' ? q.trim() : '';

  if (qTrim) {
    if (category && category !== CATALOG_VIEW_ALL && TECH_CATEGORY_SLUGS.includes(category)) {
      const res = await fetch(
        `${BASE_URL}/products/category/${encodeURIComponent(category)}?limit=100&sortBy=${encodeURIComponent(
          sortBy,
        )}&order=${encodeURIComponent(order)}`,
      );
      const json = await res.json();
      if (!res.ok) return { error: { status: res.status, data: json } };
      const needle = qTrim.toLowerCase();
      let list = (json.products || []).filter(
        (p) =>
          p.title?.toLowerCase().includes(needle) ||
          p.description?.toLowerCase().includes(needle) ||
          p.brand?.toLowerCase().includes(needle),
      );
      list = sortProducts(list, sortBy, order);
      const total = list.length;
      const products = list.slice(skip, skip + limit);
      return { data: { products, total, skip, limit } };
    }

    const res = await fetch(
      `${BASE_URL}/products/search?q=${encodeURIComponent(qTrim)}&limit=250&skip=0`,
    );
    const json = await res.json();
    if (!res.ok) return { error: { status: res.status, data: json } };
    let list = (json.products || []).filter((p) => TECH_CATEGORY_SLUGS.includes(p.category));
    list = sortProducts(list, sortBy, order);
    const total = list.length;
    const products = list.slice(skip, skip + limit);
    return { data: { products, total, skip, limit } };
  }

  if (category && category !== CATALOG_VIEW_ALL) {
    const url = new URL(`${BASE_URL}/products/category/${encodeURIComponent(category)}`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('skip', String(skip));
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('order', order);
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) return { error: { status: res.status, data: json } };
    return { data: json };
  }

  const merged = await fetchMergedTech(sortBy, order);
  const total = merged.length;
  const products = merged.slice(skip, skip + limit);
  return { data: { products, total, skip, limit } };
}

export const dummyJsonApi = createApi({
  reducerPath: 'dummyJsonApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Product', 'CategoryList'],
  endpoints: (builder) => ({
    getProductCategories: builder.query({
      query: () => '/products/categories',
      transformResponse: normalizeCategories,
      providesTags: [{ type: 'CategoryList', id: 'ALL' }],
    }),
    getProductList: builder.query({
      queryFn: fetchProductList,
      providesTags: (result) =>
        result?.products?.length
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product', id: String(id) })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id: String(id) }],
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    }),
  }),
});

export const {
  useGetProductCategoriesQuery,
  useGetProductListQuery,
  useGetProductByIdQuery,
  useLoginMutation,
} = dummyJsonApi;
