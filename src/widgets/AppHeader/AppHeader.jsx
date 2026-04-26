import { useEffect, useMemo, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '../../shared/icons/Icons';
import { logout } from '../../features/auth/authSlice';
import { clearNotice } from '../../app/appSlice';
import './AppHeader.css';

const navClass = ({ isActive }) =>
  `app-header__link${isActive ? ' app-header__link--active' : ''}`;

export function AppHeader() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const cart = useSelector((s) => s.app.cart);
  const notice = useSelector((s) => s.app.notice);
  const [accountOpen, setAccountOpen] = useState(false);
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartQty = useMemo(() => cartItems.reduce((acc, item) => acc + item.qty, 0), [cartItems]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = window.setTimeout(() => dispatch(clearNotice()), 2400);
    return () => window.clearTimeout(id);
  }, [notice, dispatch]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand" aria-label="Home">
          <span className="app-header__brand-icon" aria-hidden>
            <Icon name="logo-device" size={28} />
          </span>
          <span className="app-header__brand-text">
            <span className="app-header__brand-title">Voltline</span>
            <span className="app-header__brand-sub">Tech store · DummyJSON demo</span>
          </span>
        </Link>

        <nav className="app-header__nav" aria-label="Main">
          <NavLink to="/catalog" className={navClass}>
            <Icon name="grid" size={20} aria-hidden />
            <span>Catalog</span>
          </NavLink>
          {token ? (
            <div className="app-header__menu-wrap">
              <button
                type="button"
                className="app-header__link app-header__menu-btn"
                onClick={() => setAccountOpen((v) => !v)}
              >
                <Icon name="user" size={20} aria-hidden />
                <span>Account</span>
              </button>
              {accountOpen && (
                <div className="app-header__menu" role="dialog" aria-label="Account panel">
                  <div className="app-header__menu-user">
                    {user?.image ? (
                      <img src={user.image} alt="" className="app-header__avatar" width={36} height={36} />
                    ) : (
                      <span className="app-header__avatar-fallback" aria-hidden>
                        <Icon name="user" size={22} aria-hidden />
                      </span>
                    )}
                    <div className="app-header__menu-user-meta">
                      <strong>{user?.firstName || user?.username}</strong>
                      <span>@{user?.username}</span>
                      <span>{user?.email || 'No email'}</span>
                    </div>
                  </div>
                  <button type="button" className="app-header__menu-action" onClick={() => dispatch(logout())}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className={navClass}>
              <Icon name="user" size={20} aria-hidden />
              <span>Sign in</span>
            </NavLink>
          )}
        </nav>

        <div className="app-header__aside">
          <div className="app-header__menu-wrap">
            <Link className="app-header__cart-btn" to="/cart" title="Cart" aria-label="Open cart">
              <Icon name="cart" size={20} aria-hidden />
              <span>Cart</span>
              <strong>{cartQty}</strong>
            </Link>
          </div>
        </div>
      </div>
      {notice && <div className={`app-header__notice app-header__notice--${notice.kind}`}>{notice.message}</div>}
    </header>
  );
}
