import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProductCategoriesQuery, useGetProductListQuery } from '../../entities/dummyJson/api/dummyJsonApi';
import { CATALOG_VIEW_ALL, aisleIconNameForSlug, pickTechCategories } from '../../shared/catalogDefaults';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Icon } from '../../shared/icons/Icons';
import './HomePage.css';

export function HomePage() {
  const token = useSelector((s) => s.auth.token);
  const { data: categories, isLoading: catLoading, isError: catError } = useGetProductCategoriesQuery();
  const showcase = pickTechCategories(categories);
  const { data: teaser } = useGetProductListQuery({
    category: CATALOG_VIEW_ALL,
    q: '',
    limit: 4,
    skip: 0,
    sortBy: 'title',
    order: 'asc',
  });

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow">
            <Icon name="sparkles" size={18} aria-hidden />
            Voltline store
          </p>
          <h1 className="home-hero__title">Tech for home, city and road</h1>
          <p className="home-hero__text">
            Catalog includes multiple DummyJSON tech categories: phones, laptops, tablets, mobile
            accessories, plus cars and motorcycles. The default view merges all supported categories,
            and you can narrow it by aisle or search.
          </p>
          <div className="home-hero__actions">
            <Link className="home-hero__btn home-hero__btn--primary" to="/catalog">
              <Icon name="grid" size={20} aria-hidden />
              Open catalog
            </Link>
            <Link className="home-hero__btn home-hero__btn--ghost" to={token ? '/catalog' : '/login'}>
              <Icon name="user" size={20} aria-hidden />
              {token ? 'Continue shopping' : 'Sign in'}
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="aisles-heading">
        <h2 id="aisles-heading" className="home-section__title">
          <Icon name="grid" size={22} className="home-section__title-icon" aria-hidden />
          Tech aisles
        </h2>
        {catLoading && <p className="state-msg">Loading categories…</p>}
        {catError && (
          <p className="state-msg state-msg--error" role="alert">
            Could not load categories. Check your network or try again later.
          </p>
        )}
        {showcase.length > 0 && (
          <ul className="home-aisles">
            {showcase.map((cat) => (
              <li key={cat.slug}>
                <Link className="home-aisle" to={`/catalog?category=${encodeURIComponent(cat.slug)}`}>
                  <span className="home-aisle__icon" aria-hidden>
                    <Icon name={aisleIconNameForSlug(cat.slug)} size={20} />
                  </span>
                  <span className="home-aisle__label">{cat.name}</span>
                  <Icon name="arrow-right" size={18} className="home-aisle__chevron" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-section" aria-labelledby="teaser-heading">
        <h2 id="teaser-heading" className="home-section__title">
          <Icon name="star" size={22} className="home-section__title-icon" aria-hidden />
          Featured picks · <code>all tech</code>
        </h2>
        <p className="catalog-page__lead">
          Quick preview of a few products from the full catalog to jump into details faster.
        </p>
        {teaser?.products && (
          <ul className="home-teaser__grid">
            {teaser.products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
