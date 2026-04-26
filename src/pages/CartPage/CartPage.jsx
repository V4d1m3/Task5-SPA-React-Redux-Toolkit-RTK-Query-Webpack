import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, removeFromCart, setNotice } from '../../app/appSlice';
import { Icon } from '../../shared/icons/Icons';
import './CartPage.css';

export function CartPage() {
  const dispatch = useDispatch();
  const items = Object.values(useSelector((s) => s.app.cart));
  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <section className="cart-page page">
      <div className="cart-page__head">
        <h1 className="page-title">
          <Icon name="cart" size={26} className="page-title__icon" aria-hidden />
          Cart
        </h1>
      </div>

      {items.length === 0 ? (
        <p className="state-msg">
          Cart is empty. <Link to="/catalog">Go to catalog</Link>
        </p>
      ) : (
        <>
          <ul className="cart-page__list">
            {items.map((item) => (
              <li key={item.id} className="cart-page__item">
                <Link to={`/products/${item.id}`} className="cart-page__item-link">
                  <img src={item.thumbnail} alt="" width={86} height={86} />
                  <div>
                    <h2>{item.title}</h2>
                    <p>
                      ${item.price} x {item.qty}
                    </p>
                  </div>
                </Link>
                <strong className="cart-page__line-total">${(item.price * item.qty).toFixed(2)}</strong>
                <button
                  type="button"
                  className="cart-page__remove-btn"
                  onClick={() => {
                    dispatch(removeFromCart(item.id));
                    dispatch(
                      setNotice({
                        kind: 'info',
                        message: `${item.title} removed from cart.`,
                      }),
                    );
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-page__summary">
            <p>
              Total: <strong>${total.toFixed(2)}</strong>
            </p>
            <button type="button" onClick={() => dispatch(clearCart())}>
              Clear cart
            </button>
          </div>
        </>
      )}
    </section>
  );
}
