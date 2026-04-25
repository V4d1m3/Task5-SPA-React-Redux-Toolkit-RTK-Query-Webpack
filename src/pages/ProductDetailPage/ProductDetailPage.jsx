import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetProductByIdQuery } from '../../entities/dummyJson/api/dummyJsonApi';
import { Icon } from '../../shared/icons/Icons';
import { CATALOG_VIEW_ALL, isTechCategory } from '../../shared/catalogDefaults';
import './ProductDetailPage.css';

export function ProductDetailPage() {
  const { productId } = useParams();
  const { data: product, isFetching, isError } = useGetProductByIdQuery(productId ?? skipToken);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images;
    return product.thumbnail ? [product.thumbnail] : [];
  }, [product]);

  useEffect(() => {
    setActiveIndex(0);
  }, [productId]);

  useEffect(() => {
    if (activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, images.length]);

  if (!productId) {
    return <p className="state-msg state-msg--error">Missing product id.</p>;
  }

  if (isFetching) {
    return <p className="state-msg">Loading product…</p>;
  }

  if (isError || !product) {
    return (
      <p className="state-msg state-msg--error" role="alert">
        Product not found. <Link to="/catalog">Back to catalog</Link>
      </p>
    );
  }

  const catalogCategory = isTechCategory(product.category) ? product.category : CATALOG_VIEW_ALL;
  const catalogHref = `/catalog?category=${encodeURIComponent(catalogCategory)}`;
  const mainSrc = images[activeIndex] ?? product.thumbnail;
  const last = images.length - 1;

  function goPrev() {
    setActiveIndex((i) => (i <= 0 ? last : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i >= last ? 0 : i + 1));
  }

  return (
    <article className="product-detail page">
      <nav className="product-detail__crumb" aria-label="Breadcrumb">
        <Link to="/">
          <Icon name="home" size={16} aria-hidden /> Home
        </Link>
        <Icon name="arrow-right" size={14} aria-hidden />
        <Link to={catalogHref}>
          <Icon name="grid" size={16} aria-hidden /> Catalog
        </Link>
        <Icon name="arrow-right" size={14} aria-hidden />
        <span>{product.title}</span>
      </nav>

      <div className="product-detail__layout">
        <div className="product-detail__gallery">
          <div className="product-detail__hero-wrap">
            {images.length > 1 && (
              <button
                type="button"
                className="product-detail__nav product-detail__nav--prev"
                onClick={goPrev}
                aria-label="Previous image"
              >
                <Icon name="chevron-left" size={22} aria-hidden />
              </button>
            )}
            <img className="product-detail__hero" src={mainSrc} alt="" width={560} height={560} />
            {images.length > 1 && (
              <button
                type="button"
                className="product-detail__nav product-detail__nav--next"
                onClick={goNext}
                aria-label="Next image"
              >
                <Icon name="chevron-right" size={22} aria-hidden />
              </button>
            )}
          </div>

          {images.length > 0 && (
            <ul className="product-detail__thumbs" role="tablist" aria-label="Product images">
              {images.map((src, index) => (
                <li key={`${index}-${src}`}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    className={`product-detail__thumb${index === activeIndex ? ' product-detail__thumb--active' : ''}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    <img src={src} alt="" width={96} height={96} loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="product-detail__info">
          <p className="product-detail__brand">
            <Icon name="tag" size={16} aria-hidden /> {product.brand}
          </p>
          <h1 className="product-detail__title">{product.title}</h1>
          <div className="product-detail__price-row">
            <span className="product-detail__price">${product.price}</span>
            <span className="product-detail__rating">
              <Icon name="star" size={18} aria-hidden />
              {product.rating} · {product.stock} in stock
            </span>
          </div>
          <p className="product-detail__desc">{product.description}</p>
          <ul className="product-detail__tags">
            {(product.tags || []).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
