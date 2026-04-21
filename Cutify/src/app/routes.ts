import { createBrowserRouter } from 'react-router';

// Eagerly loaded — critical landing page
import { HomePage } from './pages/HomePage';

// Base path must match Vite `base` for GitHub Pages deployment
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/category/:slug',
    lazy: () => import('./pages/CategoryPage').then(m => ({ Component: m.CategoryPage })),
  },
  {
    path: '/product/:id',
    lazy: () => import('./pages/ProductDetailPage').then(m => ({ Component: m.ProductDetailPage })),
  },
  {
    path: '/cart',
    lazy: () => import('./pages/CartPage').then(m => ({ Component: m.CartPage })),
  },
  {
    path: '/wishlist',
    lazy: () => import('./pages/WishlistPage').then(m => ({ Component: m.WishlistPage })),
  },
  {
    path: '/checkout',
    lazy: () => import('./pages/CheckoutPage').then(m => ({ Component: m.CheckoutPage })),
  },
  {
    path: '/admin',
    lazy: () => import('./pages/AdminPage').then(m => ({ Component: m.AdminPage })),
  },
  {
    path: '/signin',
    lazy: () => import('./pages/SignInPage').then(m => ({ Component: m.SignInPage })),
  },
  {
    path: '/signup',
    lazy: () => import('./pages/SignUpPage').then(m => ({ Component: m.SignUpPage })),
  },
  {
    path: '/about',
    lazy: () => import('./pages/AboutPage').then(m => ({ Component: m.AboutPage })),
  },
  {
    path: '/contact',
    lazy: () => import('./pages/ContactPage').then(m => ({ Component: m.ContactPage })),
  },
  {
    path: '/privacy',
    lazy: () => import('./pages/PrivacyPage').then(m => ({ Component: m.PrivacyPage })),
  },
  {
    path: '/terms',
    lazy: () => import('./pages/TermsPage').then(m => ({ Component: m.TermsPage })),
  },
  {
    path: '/refund',
    lazy: () => import('./pages/RefundPage').then(m => ({ Component: m.RefundPage })),
  },
], { basename });
