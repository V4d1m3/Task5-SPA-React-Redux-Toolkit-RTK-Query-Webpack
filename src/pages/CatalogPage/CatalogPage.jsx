import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useGetProductCategoriesQuery,
  useGetProductListQuery,
  useGetTechFacetTagsQuery,
} from '../../entities/dummyJson/api/dummyJsonApi';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Icon } from '../../shared/icons/Icons';
import {
  CATALOG_MIN_RATINGS,
  CATALOG_VIEW_ALL,
  formatFacetTagLabel,
  isTechCategory,
  pickTechCategories,
} from '../../shared/catalogDefaults';
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

function parseFacetTags(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function serializeFacetTags(tags) {
  return tags.length ? tags.join(',') : '';
}

function formatMoney(n) {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** Parse price from URL (supports comma decimals and thin spaces). */
function parseUrlPrice(raw) {
  if (raw == null || raw === '') return NaN;
  const normalized = String(raw).replace(/\u00a0/g, ' ').replace(/\s/g, '').replace(',', '.');
  return Number.parseFloat(normalized);
}

function roundPriceForUrl(n) {
  return Math.round(Number(n) * 100) / 100;
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const sortKey = searchParams.get('sort') || 'title-asc';
  const categoryParam = searchParams.get('category');
  const q = searchParams.get('q') || '';
  const facetTags = useMemo(() => parseFacetTags(searchParams.get('tags')), [searchParams]);
  const tagMode = searchParams.get('tagMode') === 'and' ? 'and' : 'or';
  const minRating = useMemo(() => {
    const v = searchParams.get('minRating');
    if (v == null || v === '') return 0;
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }, [searchParams]);

  const pminRaw = searchParams.get('pmin');
  const pmaxRaw = searchParams.get('pmax');
  const priceLoFromUrl = pminRaw != null && pminRaw !== '' ? parseUrlPrice(pminRaw) : NaN;
  const priceHiFromUrl = pmaxRaw != null && pmaxRaw !== '' ? parseUrlPrice(pmaxRaw) : NaN;

  const category = useMemo(() => resolveCategoryParam(categoryParam), [categoryParam]);

  const { sortBy, order } = useMemo(() => parseSort(sortKey), [sortKey]);
  const skip = (page - 1) * PAGE_SIZE;

  const { data: categories } = useGetProductCategoriesQuery();
  const techCategories = useMemo(() => pickTechCategories(categories), [categories]);
  const { data: facetData } = useGetTechFacetTagsQuery();

  const catalogMin = facetData?.priceMin;
  const catalogMax = facetData?.priceMax;
  const boundsReady =
    Number.isFinite(catalogMin) && Number.isFinite(catalogMax) && catalogMax >= catalogMin;

  const [priceDraft, setPriceDraft] = useState(null);

  useEffect(() => {
    if (!boundsReady) {
      setPriceDraft(null);
      return;
    }
    const lo = Number.isFinite(priceLoFromUrl) ? priceLoFromUrl : catalogMin;
    const hi = Number.isFinite(priceHiFromUrl) ? priceHiFromUrl : catalogMax;
    let cl = Math.min(Math.max(lo, catalogMin), catalogMax);
    let ch = Math.min(Math.max(hi, catalogMin), catalogMax);
    if (cl > ch) {
      [cl, ch] = [ch, cl];
    }
    setPriceDraft({ lo: cl, hi: ch });
  }, [boundsReady, catalogMin, catalogMax, priceLoFromUrl, priceHiFromUrl]);

  const priceSliderStep = useMemo(() => {
    if (!boundsReady || catalogMax <= catalogMin) return 1;
    return Math.max(1, Math.round((catalogMax - catalogMin) / 500));
  }, [boundsReady, catalogMin, catalogMax]);

  const priceFilterActive = useMemo(() => {
    if (!Number.isFinite(priceLoFromUrl) || !Number.isFinite(priceHiFromUrl)) return false;
    if (priceLoFromUrl > priceHiFromUrl) return false;
    if (!boundsReady) return true;
    return (
      priceLoFromUrl > catalogMin + 1e-6 ||
      priceHiFromUrl < catalogMax - 1e-6
    );
  }, [priceLoFromUrl, priceHiFromUrl, boundsReady, catalogMin, catalogMax]);

  const queryArgs = useMemo(
    () => ({
      category,
      q,
      limit: PAGE_SIZE,
      skip,
      sortBy,
      order,
      facetTags,
      tagMode,
      minRating,
      priceLo: priceFilterActive ? priceLoFromUrl : undefined,
      priceHi: priceFilterActive ? priceHiFromUrl : undefined,
      priceFilterActive,
    }),
    [
      category,
      q,
      skip,
      sortBy,
      order,
      facetTags,
      tagMode,
      minRating,
      priceLoFromUrl,
      priceHiFromUrl,
      priceFilterActive,
    ],
  );

  const { data, isFetching, isError } = useGetProductListQuery(queryArgs);

  useEffect(() => {
    if (!boundsReady) return;
    if (!Number.isFinite(priceLoFromUrl) || !Number.isFinite(priceHiFromUrl)) return;
    const full =
      Math.abs(priceLoFromUrl - catalogMin) < 1e-4 &&
      Math.abs(priceHiFromUrl - catalogMax) < 1e-4;
    if (!full) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('pmin');
        next.delete('pmax');
        return next;
      },
      { replace: true },
    );
  }, [boundsReady, catalogMin, catalogMax, priceLoFromUrl, priceHiFromUrl, setSearchParams]);

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

  const applyPriceDraft = () => {
    if (!boundsReady || !priceDraft) return;
    const lo = roundPriceForUrl(priceDraft.lo);
    const hi = roundPriceForUrl(priceDraft.hi);
    const atFull =
      Math.abs(lo - catalogMin) < 1e-2 && Math.abs(hi - catalogMax) < 1e-2;
    if (atFull) {
      setParams({ pmin: '', pmax: '' });
    } else {
      setParams({ pmin: String(lo), pmax: String(hi) });
    }
  };

  const clearAppliedPrice = () => {
    setParams({ pmin: '', pmax: '' });
  };

  const onDualLoChange = (e) => {
    const v = Number.parseFloat(e.target.value);
    if (!Number.isFinite(v) || !priceDraft) return;
    setPriceDraft((d) => ({ lo: Math.min(v, d.hi), hi: d.hi }));
  };

  const onDualHiChange = (e) => {
    const v = Number.parseFloat(e.target.value);
    if (!Number.isFinite(v) || !priceDraft) return;
    setPriceDraft((d) => ({ lo: d.lo, hi: Math.max(v, d.lo) }));
  };

  const committedLo = priceFilterActive && Number.isFinite(priceLoFromUrl) ? priceLoFromUrl : catalogMin;
  const committedHi = priceFilterActive && Number.isFinite(priceHiFromUrl) ? priceHiFromUrl : catalogMax;
  const priceDraftDirty =
    boundsReady &&
    priceDraft &&
    Number.isFinite(catalogMin) &&
    Number.isFinite(catalogMax) &&
    (Math.abs(priceDraft.lo - committedLo) > 1e-2 || Math.abs(priceDraft.hi - committedHi) > 1e-2);
  const priceSpan = boundsReady ? Math.max(1, catalogMax - catalogMin) : 1;
  const loPct = boundsReady && priceDraft ? ((priceDraft.lo - catalogMin) / priceSpan) * 100 : 0;
  const hiPct = boundsReady && priceDraft ? ((priceDraft.hi - catalogMin) / priceSpan) * 100 : 100;

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

  const activeFacetCount = facetTags.length + (minRating > 0 ? 1 : 0) + (priceFilterActive ? 1 : 0);

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

  const toggleFacetTag = (tag) => {
    const next = facetTags.includes(tag) ? facetTags.filter((t) => t !== tag) : [...facetTags, tag];
    setParams({ tags: serializeFacetTags(next) });
  };

  const onMinRatingChange = (e) => {
    const v = e.target.value;
    setParams({ minRating: v });
  };

  const clearFacetTags = () => {
    setParams({ tags: '', tagMode: '' });
  };

  const onTagModeChange = (mode) => {
    if (mode === 'or') {
      setParams({ tagMode: '' });
    } else {
      setParams({ tagMode: 'and' });
    }
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

      <details className="catalog-filters-details">
        <summary className="catalog-filters-details__summary">
          <span className="catalog-filters-details__summary-main">
            <Icon name="chevron-right" size={18} className="catalog-filters-details__disclosure" aria-hidden />
            <h2 className="catalog-filters-details__title" id="catalog-filters-heading">
              Refine results
            </h2>
            {activeFacetCount > 0 && (
              <span className="catalog-filters__count">
                {activeFacetCount} active {activeFacetCount === 1 ? 'constraint' : 'constraints'}
              </span>
            )}
          </span>
        </summary>

        <div className="catalog-filters catalog-filters--panel" aria-labelledby="catalog-filters-heading">
          <p className="catalog-filters__hint">
            Combine category, search, sort, tags, price range, and minimum rating. Use <strong>Match any</strong> or{' '}
            <strong>Match all</strong> for multiple tags. Set the price range with the sliders, then press{' '}
            <strong>Apply price</strong> — the catalog updates only after that.
          </p>

          <div className="catalog-filters__row catalog-filters__row--split">
            <div className="catalog-filters__field catalog-filters__field--grow">
              <div className="catalog-filters__label-row">
                <span className="catalog-filters__label" id="price-range-label">
                  Price (${boundsReady ? `${formatMoney(catalogMin)} – ${formatMoney(catalogMax)}` : '…'})
                </span>
                {boundsReady && priceDraft && (
                  <span className="catalog-filters__range-values">
                    ${formatMoney(priceDraft.lo)} — ${formatMoney(priceDraft.hi)}
                    {priceDraftDirty && (
                      <span className="catalog-filters__range-unsaved"> · not applied</span>
                    )}
                  </span>
                )}
              </div>
              {!boundsReady && (
                <p className="catalog-filters__tags-loading">Loading price range from catalog…</p>
              )}
              {boundsReady && priceDraft && (
                <div className="catalog-filters__price-dual" role="group" aria-labelledby="price-range-label">
                  <div className="catalog-filters__dual-range">
                    <div className="catalog-filters__dual-range-track" />
                    <div
                      className="catalog-filters__dual-range-active"
                      style={{ left: `${loPct}%`, width: `${Math.max(0, hiPct - loPct)}%` }}
                    />
                    <input
                      id="catalog-price-dual-lo"
                      type="range"
                      className="catalog-filters__range catalog-filters__range--lo"
                      min={catalogMin}
                      max={catalogMax}
                      step={priceSliderStep}
                      value={priceDraft.lo}
                      onChange={onDualLoChange}
                      aria-label="Minimum price in range"
                    />
                    <input
                      id="catalog-price-dual-hi"
                      type="range"
                      className="catalog-filters__range catalog-filters__range--hi"
                      min={catalogMin}
                      max={catalogMax}
                      step={priceSliderStep}
                      value={priceDraft.hi}
                      onChange={onDualHiChange}
                      aria-label="Maximum price in range"
                    />
                    <span className="catalog-filters__handle catalog-filters__handle--lo" style={{ left: `${loPct}%` }} />
                    <span className="catalog-filters__handle catalog-filters__handle--hi" style={{ left: `${hiPct}%` }} />
                  </div>
                  <div className="catalog-filters__price-actions">
                    <button type="button" className="catalog-filters__apply-price" onClick={applyPriceDraft}>
                      Apply price
                    </button>
                    <button type="button" className="catalog-filters__clear-price" onClick={clearAppliedPrice}>
                      Clear price filter
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="catalog-filters__field">
              <label className="catalog-filters__label" htmlFor="catalog-min-rating">
                Minimum rating
              </label>
              <select
                id="catalog-min-rating"
                className="catalog-toolbar__select"
                value={minRating > 0 ? String(minRating) : ''}
                onChange={onMinRatingChange}
              >
                {CATALOG_MIN_RATINGS.map((o) => (
                  <option key={o.value || 'any'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="catalog-filters__tags-block">
            <div className="catalog-filters__tags-head">
              <span className="catalog-filters__label">Tags &amp; markers</span>
              {facetTags.length > 0 && (
                <button type="button" className="catalog-filters__clear-tags" onClick={clearFacetTags}>
                  Clear tags
                </button>
              )}
            </div>
            {facetTags.length >= 2 && (
              <div className="catalog-filters__tag-mode" role="group" aria-label="Tag matching mode">
                <span className="catalog-filters__tag-mode-label">Tags</span>
                <div className="catalog-filters__segment">
                  <button
                    type="button"
                    className={`catalog-filters__segment-btn${tagMode === 'or' ? ' catalog-filters__segment-btn--on' : ''}`}
                    onClick={() => onTagModeChange('or')}
                    aria-pressed={tagMode === 'or'}
                  >
                    Match any (OR)
                  </button>
                  <button
                    type="button"
                    className={`catalog-filters__segment-btn${tagMode === 'and' ? ' catalog-filters__segment-btn--on' : ''}`}
                    onClick={() => onTagModeChange('and')}
                    aria-pressed={tagMode === 'and'}
                  >
                    Match all (AND)
                  </button>
                </div>
              </div>
            )}
            {!facetData?.tags?.length && (
              <p className="catalog-filters__tags-loading">Loading tag list from catalog…</p>
            )}
            {facetData?.tags && facetData.tags.length > 0 && (
              <ul className="catalog-filters__chips" aria-label="Filter by tags or category markers">
                {facetData.tags.map((tag) => {
                  const on = facetTags.includes(tag);
                  return (
                    <li key={tag}>
                      <button
                        type="button"
                        className={`catalog-filters__chip${on ? ' catalog-filters__chip--on' : ''}`}
                        onClick={() => toggleFacetTag(tag)}
                        aria-pressed={on}
                      >
                        {formatFacetTagLabel(tag)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </details>

      {isFetching && <p className="state-msg">Loading catalog…</p>}
      {isError && (
        <p className="state-msg state-msg--error" role="alert">
          Could not load products. <Link to="/catalog">Try again</Link>
        </p>
      )}

      {data && !isFetching && !isError && (
        <p className="catalog-page__range" aria-live="polite">
          Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
        </p>
      )}

      {data?.products && !isError && (
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
