import { useCallback, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetProductCategoriesQuery, useGetProductListQuery } from '../../entities/dummyJson/api/dummyJsonApi';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Icon } from '../../shared/icons/Icons';
import { CATALOG_VIEW_ALL, isTechCategory, pickTechCategories } from '../../shared/catalogDefaults';
import './CatalogPage.css';

/** Slightly larger pages; merged tech categories are still small enough for client pagination. */
const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
  { value: 'price-asc', label: 'Price · low to high' },
  { value: 'price-desc', label: 'Price · high to low' },
  { value: 'rating-asc', label: 'Rating · low to high' },
  { value: 'rating-desc', label: 'Rating · high to low' },
  { value: 'stock-asc', label: 'Stock · fewest first' },
  { value: 'stock-desc', label: 'Stock · most first' },
];

function parseSort(sortParam) {
  const raw = sortParam && SORT_OPTIONS.some((o) => o.value === sortParam) ? sortParam : 'title-asc';
  const [sortBy, order] = raw.split('-');
  return { sortKey: raw, sortBy, order };
}

function resolveCategoryParam(raw) {
  const t = raw?.trim();
  if (!t || t === CATALOG_VIEW_ALL) return CATALOG_VIEW_ALL;
  if (isTechCategory(t)) return t;
  return CATALOG_VIEW_ALL;
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const sortKey = searchParams.get('sort') || 'title-asc';
  const categoryParam = searchParams.get('category');
  const q = searchParams.get('q') || '';

  const category = useMemo(() => resolveCategoryParam(categoryParam), [categoryParam]);

  const { sortBy, order } = useMemo(() => parseSort(sortKey), [sortKey]);
  const skip = (page - 1) * PAGE_SIZE;

  const queryArgs = useMemo(
    () => ({
      category,
      q,
      limit: PAGE_SIZE,
      skip,
      sortBy,
      order,
    }),
    [category, q, skip, sortBy, order],
  );

  const { data, isFetching, isError } = useGetProductListQuery(queryArgs);

  const { data: categories } = useGetProductCategoriesQuery();
  const techCategories = useMemo(() => pickTechCategories(categories), [categories]);

  useEffect(() => {
    if (!categoryParam?.trim()) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!next.get('category')) next.set('category', CATALOG_VIEW_ALL);
          return next;
        },
        { replace: true },
      );
    }
  }, [categoryParam, setSearchParams]);

  useEffect(() => {
    const raw = categoryParam?.trim();
    if (raw && raw !== CATALOG_VIEW_ALL && !isTechCategory(raw)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('category', CATALOG_VIEW_ALL);
          next.set('page', '1');
          return next;
        },
        { replace: true },
      );
    }
  }, [categoryParam, setSearchParams]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (data?.total == null) return;
    const tp = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
    if (page > tp) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(tp));
          return next;
        },
        { replace: true },
      );
    }
  }, [data?.total, page, setSearchParams]);

  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);

  const setParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === '' || value === undefined || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      if (resetPage && !('page' in patch)) {
        next.set('page', '1');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const onSortChange = (e) => {
    setParams({ sort: e.target.value });
  };

  const onCategoryChange = (e) => {
    setParams({ category: e.target.value, q: '' });
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextQ = String(fd.get('q') ?? '').trim();
    if (nextQ) {
      setParams({ q: nextQ, category: CATALOG_VIEW_ALL });
    } else {
      setParams({ q: '' });
    }
  };

  const goPage = (p) => {
    setParams({ page: String(Math.max(1, Math.min(p, totalPages))) }, { resetPage: false });
  };

  const selectCategoryValue = category === CATALOG_VIEW_ALL ? CATALOG_VIEW_ALL : category;

  const titleSuffix = useMemo(() => {
    if (q.trim()) return `Search · “${q.trim()}”`;
    if (category === CATALOG_VIEW_ALL) return 'All tech';
    return category.replace(/-/g, ' ');
  }, [q, category]);

  const resetFilters = () => {
    setSearchParams(
      new URLSearchParams({
        category: CATALOG_VIEW_ALL,
        sort: 'title-asc',
        page: '1',
      }),
      { replace: true },
    );
  };

  return (
    <section className="catalog-page page">
      <div className="catalog-page__head">
        <h1 className="page-title">
          <Icon name="grid" size={26} className="page-title__icon" aria-hidden />
          Catalog
          <span className="page-title__muted"> / {titleSuffix}</span>
        </h1>
        <p className="catalog-page__lead">
          Catalog combines multiple tech-focused areas from DummyJSON: personal electronics,
          household tech accessories, plus vehicles and motorcycles. Search hits the public API,
          then keeps only these categories.
        </p>
      </div>

      <div className="catalog-toolbar">
        <form className="catalog-toolbar__search" onSubmit={onSearchSubmit}>
          <label className="catalog-toolbar__label" htmlFor="catalog-q">
            <Icon name="sparkles" size={16} aria-hidden /> Search
          </label>
          <div className="catalog-toolbar__search-row">
            <input
              id="catalog-q"
              name="q"
              className="catalog-toolbar__input"
              type="search"
              placeholder="Search in tech catalog…"
              defaultValue={q}
              key={q}
            />
            <button type="submit" className="catalog-toolbar__btn">
              Apply
            </button>
          </div>
        </form>

        <div className="catalog-toolbar__field">
          <label className="catalog-toolbar__label" htmlFor="catalog-category">
            <Icon name="tag" size={16} aria-hidden /> Category
          </label>
          <select
            id="catalog-category"
            className="catalog-toolbar__select"
            value={selectCategoryValue}
            onChange={onCategoryChange}
          >
            <option value={CATALOG_VIEW_ALL}>All tech</option>
            {(techCategories.length
              ? techCategories
              : [{ slug: 'smartphones', name: 'Smartphones' }]
            ).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="catalog-toolbar__field">
          <label className="catalog-toolbar__label" htmlFor="catalog-sort">
            <Icon name="star" size={16} aria-hidden /> Sort
          </label>
          <select
            id="catalog-sort"
            className="catalog-toolbar__select"
            value={sortKey}
            onChange={onSortChange}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="catalog-toolbar__reset" onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      {isFetching && <p className="state-msg">Loading catalog…</p>}
      {isError && (
        <p className="state-msg state-msg--error" role="alert">
          Could not load products. <Link to="/catalog">Try again</Link>
        </p>
      )}

      {data && !isFetching && (
        <p className="catalog-page__range" aria-live="polite">
          Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
        </p>
      )}

      {data?.products && (
        <>
          <ul className="catalog-page__grid">
            {data.products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="catalog-pagination" aria-label="Pagination">
              <button
                type="button"
                className="catalog-pagination__btn"
                disabled={safePage <= 1}
                onClick={() => goPage(safePage - 1)}
              >
                <Icon name="chevron-left" size={18} aria-hidden />
                Previous
              </button>
              <span className="catalog-pagination__status">
                Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                type="button"
                className="catalog-pagination__btn"
                disabled={safePage >= totalPages}
                onClick={() => goPage(safePage + 1)}
              >
                Next
                <Icon name="chevron-right" size={18} aria-hidden />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
