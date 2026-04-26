import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart, setNotice } from '../../app/appSlice';
import { Icon } from '../../shared/icons/Icons';
import './ProductCard.css';

export function ProductCard({ product, imageLoading = 'lazy' }) {
  const dispatch = useDispatch();
  const { id, title, thumbnail, price, rating, brand, availabilityStatus } = product;
  const isOutOfStock = availabilityStatus === 'Out of Stock';

  const handleAdd = () => {
    if (isOutOfStock) {
      dispatch(
        setNotice({
          kind: 'warning',
          message: `${title} is out of stock and cannot be added.`,
        }),
      );
      return;
    }

    dispatch(addToCart({ id, title, thumbnail, price }));
    dispatch(
      setNotice({
        kind: 'success',
        message: `${title} added to cart.`,
      }),
    );
  };

  return (
    <article className="product-card">
      <Link to={`/products/${id}`} className="product-card__media-link">
        <img
          className="product-card__img"
          src={thumbnail}
          alt=""
          loading={imageLoading}
          width={320}
          height={320}
        />
        <span className="product-card__badge" data-status={availabilityStatus}>
          <Icon name="tag" size={14} aria-hidden />
          {availabilityStatus}
        </span>
      </Link>
      <div className="product-card__body">
        <p className="product-card__brand">{brand}</p>
        <h2 className="product-card__title">
          <Link to={`/products/${id}`}>{title}</Link>
        </h2>
        <div className="product-card__meta">
          <span className="product-card__price">${price}</span>
          <div className="product-card__actions">
            <span className="product-card__rating" title="Average rating">
              <Icon name="star" size={16} aria-hidden />
              {rating}
            </span>
            <button
              type="button"
              className={`product-card__add${isOutOfStock ? ' product-card__add--disabled' : ''}`}
              onClick={handleAdd}
              aria-label={isOutOfStock ? `${title} is out of stock` : `Add ${title} to cart`}
              title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
