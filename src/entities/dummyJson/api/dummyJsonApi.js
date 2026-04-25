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

function hasFacetFilters(arg) {
  const tags = arg.facetTags;
  const hasTags = Array.isArray(tags) && tags.length > 0;
  const mr = Number(arg.minRating);
  const hasRating = Number.isFinite(mr) && mr > 0;
  const lo = arg.priceLo != null ? Number(arg.priceLo) : NaN;
  const hi = arg.priceHi != null ? Number(arg.priceHi) : NaN;
  const hasPrice =
    arg.priceFilterActive === true && Number.isFinite(lo) && Number.isFinite(hi) && lo <= hi;
  return hasTags || hasRating || hasPrice;
}

function applyProductFacets(products, arg) {
  let list = products;
  const mr = Number(arg.minRating);
  if (Number.isFinite(mr) && mr > 0) {
    list = list.filter((p) => (Number(p.rating) || 0) >= mr);
  }
  const lo = arg.priceLo != null ? Number(arg.priceLo) : NaN;
  const hi = arg.priceHi != null ? Number(arg.priceHi) : NaN;
  if (arg.priceFilterActive === true && Number.isFinite(lo) && Number.isFinite(hi) && lo <= hi) {
    list = list.filter((p) => {
      const price = Number(p.price);
      return Number.isFinite(price) && price >= lo && price <= hi;
    });
  }
  const facetTags = Array.isArray(arg.facetTags) ? arg.facetTags.filter(Boolean) : [];
  if (facetTags.length > 0) {
    const mode = arg.tagMode === 'and' ? 'and' : 'or';
    list = list.filter((p) => {
      const bag = new Set([...(p.tags || []), p.category].filter(Boolean));
      if (mode === 'and') {
        return facetTags.every((t) => bag.has(t));
      }
      return facetTags.some((t) => bag.has(t));
    });
  }
  return list;
}

async function fetchFullCategoryProducts(slug, sortBy, order) {
  const batch = 100;
  let skip = 0;
  let total = null;
  const all = [];
  for (;;) {
    const url = new URL(`${BASE_URL}/products/category/${encodeURIComponent(slug)}`);
    url.searchParams.set('limit', String(batch));
    url.searchParams.set('skip', String(skip));
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('order', order);
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) return { error: { status: res.status, data: json } };
    if (total == null) total = json.total ?? 0;
    const chunk = json.products || [];
    all.push(...chunk);
    if (chunk.length === 0 || all.length >= total) break;
    skip += chunk.length;
  }
  return { data: all };
}

/**
 * @param {{ category: string; q?: string; limit: number; skip: number; sortBy: string; order: string; facetTags?: string[]; tagMode?: 'and'|'or'; minRating?: number; priceLo?: number; priceHi?: number; priceFilterActive?: boolean }} arg
 * - category === `all` → merge supported tech categories (DummyJSON totals are small enough to load in one go).
 * - category slug → native category endpoint with server sort + pagination.
 * - q → search DummyJSON, keep only supported tech categories, then sort + slice (client pagination).
 * - facetTags + tagMode, minRating, price range → client-side filters; when active, full category lists are loaded before slicing.
 */
async function fetchProductList(arg) {
  const { category, q, limit, skip, sortBy, order } = arg;
  const qTrim = typeof q === 'string' ? q.trim() : '';
  const facetsOn = hasFacetFilters(arg);

  const finish = (list) => {
    const filtered = facetsOn ? applyProductFacets(list, arg) : list;
    const sorted = sortProducts(filtered, sortBy, order);
    const total = sorted.length;
    const products = sorted.slice(skip, skip + limit);
    return { data: { products, total, skip, limit } };
  };

  if (qTrim) {
    if (category && category !== CATALOG_VIEW_ALL && TECH_CATEGORY_SLUGS.includes(category)) {
      const needle = qTrim.toLowerCase();
      let list;
      if (facetsOn) {
        const full = await fetchFullCategoryProducts(category, sortBy, order);
        if ('error' in full) return full;
        list = (full.data || []).filter(
          (p) =>
            p.title?.toLowerCase().includes(needle) ||
            p.description?.toLowerCase().includes(needle) ||
            p.brand?.toLowerCase().includes(needle),
        );
      } else {
        const res = await fetch(
          `${BASE_URL}/products/category/${encodeURIComponent(category)}?limit=100&sortBy=${encodeURIComponent(
            sortBy,
          )}&order=${encodeURIComponent(order)}`,
        );
        const json = await res.json();
        if (!res.ok) return { error: { status: res.status, data: json } };
        list = (json.products || []).filter(
          (p) =>
            p.title?.toLowerCase().includes(needle) ||
            p.description?.toLowerCase().includes(needle) ||
            p.brand?.toLowerCase().includes(needle),
        );
      }
      return finish(list);
    }

    const res = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(qTrim)}&limit=250&skip=0`);
    const json = await res.json();
    if (!res.ok) return { error: { status: res.status, data: json } };
    let list = (json.products || []).filter((p) => TECH_CATEGORY_SLUGS.includes(p.category));
    return finish(list);
  }

  if (category && category !== CATALOG_VIEW_ALL) {
    if (facetsOn) {
      const full = await fetchFullCategoryProducts(category, sortBy, order);
      if ('error' in full) return full;
      return finish(full.data || []);
    }

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
  return finish(merged);
}

async function fetchTechFacetTags() {
  const merged = await fetchMergedTech('title', 'asc');
  const tagSet = new Set();
  let priceMin = Infinity;
  let priceMax = -Infinity;
  for (const p of merged) {
    if (p.category) tagSet.add(p.category);
    (p.tags || []).forEach((t) => tagSet.add(t));
    const x = Number(p.price);
    if (Number.isFinite(x)) {
      priceMin = Math.min(priceMin, x);
      priceMax = Math.max(priceMax, x);
    }
  }
  const tags = [...tagSet].sort((a, b) => a.localeCompare(b));
  if (!Number.isFinite(priceMin) || !Number.isFinite(priceMax)) {
    priceMin = 0;
    priceMax = 0;
  }
  return { data: { tags, priceMin, priceMax } };
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
    getTechFacetTags: builder.query({
      queryFn: fetchTechFacetTags,
      providesTags: [{ type: 'CategoryList', id: 'FACET_TAGS' }],
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
  useGetTechFacetTagsQuery,
  useGetProductListQuery,
  useGetProductByIdQuery,
  useLoginMutation,
} = dummyJsonApi;
