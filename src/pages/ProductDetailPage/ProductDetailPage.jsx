import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductByIdQuery } from '../../entities/dummyJson/api/dummyJsonApi';
import { addToCart, removeFromCart, setNotice } from '../../app/appSlice';
import { Icon } from '../../shared/icons/Icons';
import { CATALOG_VIEW_ALL, formatFacetTagLabel, isTechCategory } from '../../shared/catalogDefaults';
import './ProductDetailPage.css';

function formatReviewDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ProductDetailPage() {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const inCart = useSelector((s) => (productId ? Boolean(s.app.cart[String(productId)]) : false));
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

  const discount = Number(product.discountPercentage);
  const hasDiscount = Number.isFinite(discount) && discount > 0;
  const dims = product.dimensions;
  const isOutOfStock = product.availabilityStatus === 'Out of Stock';

  function goPrev() {
    setActiveIndex((i) => (i <= 0 ? last : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i >= last ? 0 : i + 1));
  }

  function handleAddToCart() {
    if (isOutOfStock) {
      dispatch(
        setNotice({
          kind: 'warning',
          message: `${product.title} is out of stock and cannot be added.`,
        }),
      );
      return;
    }

    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
      }),
    );
    dispatch(
      setNotice({
        kind: 'success',
        message: `${product.title} added to cart.`,
      }),
    );
  }

  function handleRemoveFromCart() {
    dispatch(removeFromCart(product.id));
    dispatch(
      setNotice({
        kind: 'info',
        message: `${product.title} removed from cart.`,
      }),
    );
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
            {hasDiscount && (
              <span className="product-detail__discount" title="Discount from DummyJSON">
                −{discount.toFixed(2)}% list discount
              </span>
            )}
            <span className="product-detail__rating">
              <Icon name="star" size={18} aria-hidden />
              {product.rating} · {product.stock} in stock
            </span>
          </div>
          <p className="product-detail__availability">
            <strong>{product.availabilityStatus || 'Availability unknown'}</strong>
            {product.sku ? (
              <>
                {' '}
                · SKU <code className="product-detail__code">{product.sku}</code>
              </>
            ) : null}
          </p>
          <div className="product-detail__actions">
            <button
              type="button"
              className={`product-detail__add${isOutOfStock ? ' product-detail__add--disabled' : ''}`}
              onClick={handleAddToCart}
              aria-label={isOutOfStock ? `${product.title} is out of stock` : `Add ${product.title} to cart`}
              title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            >
              <Icon name="cart" size={18} aria-hidden />
              Add to cart
            </button>
            {inCart && (
              <button
                type="button"
                className="product-detail__remove"
                onClick={handleRemoveFromCart}
                aria-label={`Remove ${product.title} from cart`}
                title="Remove from cart"
              >
                Remove from cart
              </button>
            )}
          </div>
          <p className="product-detail__desc">{product.description}</p>

          <div className="product-detail__markers">
            <span className="product-detail__markers-label">Category</span>
            <Link
              className="product-detail__chip product-detail__chip--category"
              to={`/catalog?category=${encodeURIComponent(product.category)}`}
            >
              {formatFacetTagLabel(product.category)}
            </Link>
            {(product.tags || []).length > 0 && (
              <>
                <span className="product-detail__markers-label">Tags</span>
                <ul className="product-detail__chip-list">
                  {(product.tags || []).map((t) => (
                    <li key={t}>
                      <Link
                        className="product-detail__chip product-detail__chip--tag"
                        to={`/catalog?category=${encodeURIComponent(CATALOG_VIEW_ALL)}&tags=${encodeURIComponent(t)}`}
                      >
                        {formatFacetTagLabel(t)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <dl className="product-detail__specs">
            {product.weight != null && (
              <>
                <dt>Weight</dt>
                <dd>{product.weight} (demo units)</dd>
              </>
            )}
            {dims && (dims.width != null || dims.height != null || dims.depth != null) && (
              <>
                <dt>Dimensions (W × H × D)</dt>
                <dd>
                  {[dims.width, dims.height, dims.depth].filter((v) => v != null).join(' × ')}
                </dd>
              </>
            )}
            {product.minimumOrderQuantity != null && (
              <>
                <dt>Minimum order</dt>
                <dd>{product.minimumOrderQuantity} units</dd>
              </>
            )}
          </dl>

          <ul className="product-detail__logistics">
            {product.warrantyInformation && (
              <li>
                <strong>Warranty</strong> {product.warrantyInformation}
              </li>
            )}
            {product.shippingInformation && (
              <li>
                <strong>Shipping</strong> {product.shippingInformation}
              </li>
            )}
            {product.returnPolicy && (
              <li>
                <strong>Returns</strong> {product.returnPolicy}
              </li>
            )}
          </ul>

          {product.meta?.barcode && (
            <p className="product-detail__meta-line">
              <span className="product-detail__meta-label">Barcode</span>{' '}
              <code className="product-detail__code">{product.meta.barcode}</code>
            </p>
          )}

          {product.reviews?.length > 0 && (
            <section className="product-detail__reviews" aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="product-detail__reviews-title">
                Customer reviews ({product.reviews.length})
              </h2>
              <ul className="product-detail__review-list">
                {product.reviews.map((r, idx) => (
                  <li key={`${r.reviewerEmail || idx}-${r.date || idx}`} className="product-detail__review">
                    <div className="product-detail__review-head">
                      <span className="product-detail__review-name">{r.reviewerName}</span>
                      <span className="product-detail__review-rating">
                        <Icon name="star" size={14} aria-hidden />
                        {r.rating}/5
                      </span>
                      <span className="product-detail__review-date">{formatReviewDate(r.date)}</span>
                    </div>
                    <p className="product-detail__review-text">{r.comment}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
