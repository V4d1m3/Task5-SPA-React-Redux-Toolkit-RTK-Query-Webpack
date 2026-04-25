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
