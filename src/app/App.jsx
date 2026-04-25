import { Routes, Route, Navigate } from 'react-router-dom';
import { AppHeader } from '../widgets/AppHeader/AppHeader';
import { HomePage } from '../pages/HomePage/HomePage';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { CatalogPage } from '../pages/CatalogPage/CatalogPage';
import { CartPage } from '../pages/CartPage/CartPage';
import { ProductDetailPage } from '../pages/ProductDetailPage/ProductDetailPage';

export default function App() {
  return (
    <div className="app">
      <AppHeader />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
