import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../entities/dummyJson/api/dummyJsonApi';
import { Icon } from '../../shared/icons/Icons';
import './LoginPage.css';

function formatLoginError(error) {
  if (!error) return 'Login failed.';
  if (typeof error === 'object' && 'data' in error && error.data) {
    const { data } = error;
    if (typeof data === 'string') return data;
    if (data && typeof data.message === 'string') return data.message;
  }
  return 'Login failed. Try another DummyJSON user.';
}

export function LoginPage() {
  const token = useSelector((s) => s.auth.token);
  const navigate = useNavigate();
  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [login, { isLoading, isError, error }] = useLoginMutation();

  if (token) {
    return <Navigate to="/catalog" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login({
        username,
        password,
        expiresInMins: 60,
      }).unwrap();
      navigate('/catalog');
    } catch {
      /* surfaced below */
    }
  }

  return (
    <section className="login-page page">
      <div className="login-page__panel">
        <div className="login-page__brand">
          <Icon name="logo-device" size={36} aria-hidden />
          <div>
            <h1 className="login-page__title">Sign in</h1>
            <p className="login-page__subtitle">Uses DummyJSON <code>/auth/login</code></p>
          </div>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <label className="login-page__field">
            <span className="login-page__label">
              <Icon name="user" size={16} aria-hidden /> Username
            </span>
            <input
              className="login-page__input"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="login-page__field">
            <span className="login-page__label">
              <Icon name="sparkles" size={16} aria-hidden /> Password
            </span>
            <input
              className="login-page__input"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {isError && (
            <p className="login-page__error" role="alert">
              {formatLoginError(error)}
            </p>
          )}

          <button className="login-page__submit" type="submit" disabled={isLoading}>
            <Icon name="user" size={18} aria-hidden />
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-page__hint">
          Demo accounts from{' '}
          <a href="https://dummyjson.com/docs/auth" target="_blank" rel="noreferrer">
            DummyJSON auth docs
          </a>
          , e.g. <code>emilys</code> / <code>emilyspass</code>.
        </p>

        <Link className="login-page__back" to="/">
          <Icon name="home" size={16} aria-hidden /> Back home
        </Link>
      </div>
    </section>
  );
}
