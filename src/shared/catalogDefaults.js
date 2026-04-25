/**
 * Voltline demo store: tech-focused DummyJSON categories.
 * Includes electronics, home tech accessories, and vehicles.
 */
export const TECH_CATEGORY_SLUGS = Object.freeze([
  'smartphones',
  'laptops',
  'tablets',
  'mobile-accessories',
  'vehicle',
  'motorcycle',
]);

/** Default catalog view: merged products from every tech category above. */
export const CATALOG_VIEW_ALL = 'all';

export function isTechCategory(slug) {
  return Boolean(slug && TECH_CATEGORY_SLUGS.includes(slug));
}

/** Pick API category rows in a stable tech-category order (subset only). */
export function pickTechCategories(categoriesFromApi) {
  if (!categoriesFromApi?.length) return [];
  const bySlug = new Map(categoriesFromApi.map((c) => [c.slug, c]));
  return TECH_CATEGORY_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean);
}

/** Icon name for Tech aisles on the home page (see `Icons.jsx`). */
export function aisleIconNameForSlug(slug) {
  const map = {
    smartphones: 'aisle-smartphone',
    laptops: 'aisle-laptop',
    tablets: 'aisle-tablet',
    'mobile-accessories': 'aisle-accessories',
    vehicle: 'aisle-car',
    motorcycle: 'aisle-motorcycle',
  };
  return map[slug] || 'tag';
}

/** Labels for tag / category chips in the catalog UI. */
export function formatFacetTagLabel(raw) {
  const s = String(raw).trim();
  if (!s) return '';
  return s
    .split(/[\s_-]+/)
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
    .filter(Boolean)
    .join(' ');
}

export const CATALOG_MIN_RATINGS = Object.freeze([
  { value: '', label: 'Any rating' },
  { value: '3', label: '3+ stars' },
  { value: '3.5', label: '3.5+ stars' },
  { value: '4', label: '4+ stars' },
  { value: '4.5', label: '4.5+ stars' },
]);
