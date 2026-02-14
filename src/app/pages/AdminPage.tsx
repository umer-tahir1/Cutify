import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { useApp } from '../context/AppContext';
import api from '../api/client';
import { OptimizedImage } from '../components/OptimizedImage';
import {
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Tag,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Ticket,
  Archive,
  Shield,
  LogIn,
  Loader2,
  BoxIcon,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */
interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  category: { _id: string; name: string; slug: string } | null;
  sku: string;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  hoverImage?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

interface AdminOrder {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string };
  items: any[];
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: any;
}

interface AdminCoupon {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

interface InventoryReport {
  totalProducts: number;
  outOfStock: any[];
  lowStock: any[];
  categoryBreakdown: any[];
  totalStockValue: number;
}

type Tab = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons' | 'inventory';

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
const fmt = (n: number) => `${n.toLocaleString()} PKR`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/* ------------------------------------------------------------------ */
/*  SMALL SHARED COMPONENTS                                            */
/* ------------------------------------------------------------------ */
const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Empty: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <Archive className="w-12 h-12 mb-3 opacity-40" />
    <p>{msg}</p>
  </div>
);

const Badge: React.FC<{ status: string }> = ({ status }) => {
  const c: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${c[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

const Pages: React.FC<{ page: number; pages: number; go: (p: number) => void }> = ({ page, pages, go }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => go(page - 1)} disabled={page <= 1} className="p-2 rounded-lg hover:bg-accent disabled:opacity-30">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-muted-foreground px-3">Page {page} of {pages}</span>
      <button onClick={() => go(page + 1)} disabled={page >= pages} className="p-2 rounded-lg hover:bg-accent disabled:opacity-30">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const Confirm: React.FC<{
  open: boolean;
  title: string;
  msg: string;
  onYes: () => void;
  onNo: () => void;
  busy?: boolean;
  danger?: boolean;
}> = ({ open, title, msg, onYes, onNo, busy, danger }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onNo}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{msg}</p>
        <div className="flex gap-3">
          <button onClick={onNo} className="flex-1 py-2.5 border border-border rounded-xl hover:bg-accent text-sm">Cancel</button>
          <button
            onClick={onYes}
            disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2 ${danger ? 'bg-destructive hover:bg-destructive/90' : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg'}`}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  ADMIN LOGIN GATE                                                   */
/* ------------------------------------------------------------------ */
const AdminLoginGate: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.data?.user?.role === 'admin' || res.data?.user?.role === 'superadmin') {
        onLogin();
      } else {
        setError('Access denied. Admin privileges required.');
        await api.logout();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-pacifico mb-2">Admin Portal</h2>
          <p className="text-muted-foreground text-sm">Sign in with your admin credentials</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cutify.com"
              className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-60">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {loading ? 'Signing in…' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  MAIN ADMIN PAGE                                                    */
/* ================================================================== */
export const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const { isAuthenticated } = useApp();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('cutify-token');
      if (!token) { setChecking(false); return; }
      try {
        const res = await api.getMe();
        if (res.data?.user?.role === 'admin' || res.data?.user?.role === 'superadmin') setIsAdmin(true);
      } catch { /* token invalid */ }
      setChecking(false);
    })();
  }, [isAuthenticated]);

  const tabs: { id: Tab; label: string; icon: React.FC<any> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'inventory', label: 'Inventory', icon: BoxIcon },
  ];

  if (checking) return (
    <><FloatingFlowers /><Header />
      <main className="container mx-auto px-4 py-8 relative z-10 min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></main>
      <Footer /></>
  );

  return (
    <><FloatingFlowers /><Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        {!isAdmin ? (
          <AdminLoginGate onLogin={() => setIsAdmin(true)} />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-pacifico text-center mb-2">Admin Panel</h1>
              <p className="text-center text-muted-foreground">Manage your entire store</p>
            </div>

            {/* Tab bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md mb-8 overflow-x-auto">
              <div className="flex">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm whitespace-nowrap transition-colors ${tab === t.id ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'hover:bg-accent'}`}>
                    <t.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              {tab === 'dashboard' && <DashboardTab />}
              {tab === 'products' && <ProductsTab />}
              {tab === 'categories' && <CategoriesTab />}
              {tab === 'orders' && <OrdersTab />}
              {tab === 'customers' && <CustomersTab />}
              {tab === 'coupons' && <CouponsTab />}
              {tab === 'inventory' && <InventoryTab />}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

/* ================================================================== */
/*  DASHBOARD                                                          */
/* ================================================================== */
const DashboardTab: React.FC = () => {
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await api.getAdminDashboard(); setD(r.data); } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (!d) return <Empty msg="Failed to load dashboard" />;

  const cards = [
    { label: 'Total Revenue', value: fmt(d.totalRevenue || 0), icon: DollarSign, color: 'from-green-400 to-emerald-500', trend: d.revenueTrend },
    { label: 'Total Orders', value: d.totalOrders || 0, icon: Package, color: 'from-primary to-secondary', trend: d.orderTrend },
    { label: 'Total Products', value: d.totalProducts || 0, icon: ShoppingBag, color: 'from-purple-400 to-pink-500' },
    { label: 'Total Users', value: d.totalUsers || 0, icon: Users, color: 'from-orange-400 to-yellow-500', trend: d.userTrend },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
        <button onClick={load} className="p-2 hover:bg-accent rounded-lg"><RefreshCw className="w-5 h-5 text-muted-foreground" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((s) => (
          <div key={s.label} className="bg-gradient-to-br from-accent/50 to-accent/20 rounded-2xl p-6 shadow-sm">
            <div className={`w-12 h-12 bg-gradient-to-r ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-semibold mb-1">{s.value}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              {s.trend !== undefined && s.trend !== 0 && (
                <span className={`flex items-center text-xs font-medium ${s.trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {s.trend > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(s.trend)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-accent/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          {d.recentOrders?.length ? d.recentOrders.slice(0, 5).map((o: any) => (
            <div key={o._id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 rounded-xl px-4 py-3 mb-2 last:mb-0">
              <div><p className="font-mono text-xs font-medium">{o.orderNumber}</p><p className="text-muted-foreground text-xs">{o.user?.name || 'Guest'}</p></div>
              <div className="text-right"><p className="font-semibold text-sm">{fmt(o.total)}</p><Badge status={o.status} /></div>
            </div>
          )) : <p className="text-muted-foreground text-sm">No recent orders</p>}
        </div>

        {/* Top Products */}
        <div className="bg-accent/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          {d.topProducts?.length ? d.topProducts.slice(0, 5).map((p: any, i: number) => (
            <div key={p._id} className="flex items-center gap-3 bg-white dark:bg-gray-700 rounded-xl px-4 py-3 mb-2 last:mb-0">
              <span className="text-lg font-bold text-muted-foreground/40 w-6">#{i + 1}</span>
              <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.name || p._id}</p><p className="text-xs text-muted-foreground">{p.totalSold || 0} sold</p></div>
              <p className="font-semibold text-sm">{fmt(p.totalRevenue || 0)}</p>
            </div>
          )) : <p className="text-muted-foreground text-sm">No sales data yet</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-600">{d.activeProducts || 0}</p><p className="text-xs text-muted-foreground">Active Products</p></div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{d.pendingOrders || 0}</p><p className="text-xs text-muted-foreground">Pending Orders</p></div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-600">{d.totalOrders || 0}</p><p className="text-xs text-muted-foreground">Total Orders</p></div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-purple-600">{d.totalUsers || 0}</p><p className="text-xs text-muted-foreground">Registered Users</p></div>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  PRODUCTS                                                           */
/* ================================================================== */
const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [delTarget, setDelTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cats, setCats] = useState<AdminCategory[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: '10' };
      if (search) p.search = search;
      const r = await api.getAdminProducts(p);
      setProducts(r.data?.products || []);
      setPages(r.pagination?.pages || 1);
    } catch { /* */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.getAdminCategories().then((r) => setCats(r.data?.categories || [])).catch(() => {}); }, []);

  const onDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try { await api.deleteProduct(delTarget._id); setDelTarget(null); load(); } catch { /* */ }
    setDeleting(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Manage Products</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products…"
              className="pl-9 pr-4 py-2 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm w-48" />
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full hover:shadow-lg text-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {showForm && <ProductForm product={editing} cats={cats} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}

      {loading ? <Spinner /> : products.length === 0 ? <Empty msg="No products found" /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  {['Product', 'SKU', 'Price', 'Stock', 'Category', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <OptimizedImage src={p.images?.[0] || 'https://placehold.co/40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-accent" srcSetWidths={[40, 80]} sizes="40px" quality={60} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[180px]">{p.name}</p>
                          {p.isBestSeller && <span className="text-xs text-yellow-600">Best Seller</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm font-mono text-muted-foreground">{p.sku}</td>
                    <td className="py-3 px-3 text-sm">
                      {p.salePrice
                        ? <><span className="font-semibold text-destructive">{p.salePrice}</span><span className="text-xs text-muted-foreground line-through ml-1">{p.price}</span></>
                        : <span className="font-semibold">{p.price} PKR</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-sm font-medium ${p.stock === 0 ? 'text-red-500' : p.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>{p.stock}</span>
                    </td>
                    <td className="py-3 px-3 text-sm">{p.category?.name || '-'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 hover:bg-accent rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDelTarget(p)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pages page={page} pages={pages} go={setPage} />
        </>
      )}

      <Confirm open={!!delTarget} title="Delete Product" msg={`Delete "${delTarget?.name}"? This cannot be undone.`} onYes={onDelete} onNo={() => setDelTarget(null)} busy={deleting} danger />
    </div>
  );
};

/* -- Product Form ---------------------------------------------------*/
const ProductForm: React.FC<{
  product: AdminProduct | null;
  cats: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ product, cats, onClose, onSaved }) => {
  const [f, setF] = useState({
    name: product?.name || '', description: '', price: product?.price || 0, salePrice: product?.salePrice || 0,
    category: product?.category?._id || '', sku: product?.sku || '', stock: product?.stock || 0,
    isBestSeller: product?.isBestSeller || false, isActive: product?.isActive ?? true, tags: product?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const data = { ...f, salePrice: f.salePrice || undefined, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      product ? await api.updateProduct(product._id, data) : await api.createProduct(data);
      onSaved();
    } catch (e: any) { setErr(e.message || 'Failed'); }
    setSaving(false);
  };

  const inp = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  return (
    <div className="bg-accent/30 rounded-2xl p-6 mb-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h3>
        <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-4 h-4" /></button>
      </div>
      {err && <div className="bg-destructive/10 text-destructive rounded-xl p-3 mb-4 text-sm">{err}</div>}
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Name *</label><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea className={inp + ' resize-none'} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div><label className="block text-sm font-medium mb-1">Price (PKR) *</label><input type="number" className={inp} value={f.price} onChange={(e) => setF({ ...f, price: +e.target.value })} required min={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Sale Price</label><input type="number" className={inp} value={f.salePrice} onChange={(e) => setF({ ...f, salePrice: +e.target.value })} min={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Category *</label>
          <select className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} required>
            <option value="">Select</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">SKU *</label><input className={inp} value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} required /></div>
        <div><label className="block text-sm font-medium mb-1">Stock *</label><input type="number" className={inp} value={f.stock} onChange={(e) => setF({ ...f, stock: +e.target.value })} required min={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Tags (comma sep.)</label><input className={inp} value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="cute, pink" /></div>
        <div className="md:col-span-2 flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={f.isBestSeller} onChange={(e) => setF({ ...f, isBestSeller: e.target.checked })} /> Best Seller</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active</label>
        </div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-6 py-2.5 border border-border rounded-xl hover:bg-accent text-sm">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-xl hover:shadow-lg text-sm disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{product ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================== */
/*  CATEGORIES                                                         */
/* ================================================================== */
const CategoriesTab: React.FC = () => {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [delTarget, setDelTarget] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { const r = await api.getAdminCategories(); setCats(r.data?.categories || []); } catch { } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const onDelete = async () => { if (!delTarget) return; setDeleting(true); try { await api.deleteCategory(delTarget._id); setDelTarget(null); load(); } catch { } setDeleting(false); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Manage Categories</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full hover:shadow-lg text-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && <CategoryForm category={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}

      {loading ? <Spinner /> : cats.length === 0 ? <Empty msg="No categories found" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((c) => (
            <div key={c._id} className="bg-accent/30 rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <OptimizedImage src={c.image || 'https://placehold.co/400x225'} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" srcSetWidths={[200, 400, 600]} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={70} />
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-lg">{c.name}</h3><span className="text-sm text-muted-foreground">{c.productCount} products</span></div>
                {c.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.description}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(c); setShowForm(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-accent text-sm"><Edit className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => setDelTarget(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 text-sm"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Confirm open={!!delTarget} title="Delete Category" msg={`Delete "${delTarget?.name}"?`} onYes={onDelete} onNo={() => setDelTarget(null)} busy={deleting} danger />
    </div>
  );
};

/* -- Category Form --------------------------------------------------*/
const CategoryForm: React.FC<{ category: AdminCategory | null; onClose: () => void; onSaved: () => void }> = ({ category, onClose, onSaved }) => {
  const [f, setF] = useState({
    name: category?.name || '', description: category?.description || '', image: category?.image || '',
    hoverImage: category?.hoverImage || '', sortOrder: category?.sortOrder || 0, isActive: category?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const inp = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr('');
    try { category ? await api.updateCategory(category._id, f) : await api.createCategory(f); onSaved(); } catch (e: any) { setErr(e.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="bg-accent/30 rounded-2xl p-6 mb-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{category ? 'Edit Category' : 'Add New Category'}</h3>
        <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-4 h-4" /></button>
      </div>
      {err && <div className="bg-destructive/10 text-destructive rounded-xl p-3 mb-4 text-sm">{err}</div>}
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Name *</label><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
        <div><label className="block text-sm font-medium mb-1">Sort Order</label><input type="number" className={inp} value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: +e.target.value })} /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea className={inp + ' resize-none'} rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div><label className="block text-sm font-medium mb-1">Image URL</label><input className={inp} value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} placeholder="https://…" /></div>
        <div><label className="block text-sm font-medium mb-1">Hover Image URL</label><input className={inp} value={f.hoverImage} onChange={(e) => setF({ ...f, hoverImage: e.target.value })} placeholder="https://…" /></div>
        <div className="flex items-center"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active</label></div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-6 py-2.5 border border-border rounded-xl hover:bg-accent text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-xl hover:shadow-lg text-sm disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{category ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================== */
/*  ORDERS                                                             */
/* ================================================================== */
const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: '10' };
      if (filter) p.status = filter;
      const r = await api.getAdminOrders(p);
      setOrders(r.data?.orders || []);
      setPages(r.pagination?.pages || 1);
    } catch { }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setBusy(true);
    try { await api.updateOrderStatus(id, status); load(); if (selected?._id === id) setSelected({ ...selected, status }); }
    catch (e: any) { alert(e.message || 'Failed'); }
    setBusy(false);
  };

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Order Management</h2>
        <div className="flex gap-3">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl bg-accent/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={load} className="p-2 hover:bg-accent rounded-lg"><RefreshCw className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} onUpdate={updateStatus} busy={busy} />}

      {loading ? <Spinner /> : orders.length === 0 ? <Empty msg="No orders found" /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border text-left">
                {['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>{orders.map((o) => (
                <tr key={o._id} className="border-b border-border/50 hover:bg-accent/20">
                  <td className="py-3 px-3 font-mono text-xs">{o.orderNumber}</td>
                  <td className="py-3 px-3"><p className="text-sm font-medium">{o.user?.name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{o.user?.email}</p></td>
                  <td className="py-3 px-3 text-sm">{fmtDate(o.createdAt)}</td>
                  <td className="py-3 px-3 text-sm font-semibold">{fmt(o.total)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.paymentStatus}</span>
                  </td>
                  <td className="py-3 px-3"><Badge status={o.status} /></td>
                  <td className="py-3 px-3"><button onClick={() => setSelected(o)} className="flex items-center gap-1 text-primary hover:underline text-sm"><Eye className="w-3.5 h-3.5" /> View</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pages page={page} pages={pages} go={setPage} />
        </>
      )}
    </div>
  );
};

/* -- Order Detail Modal ------------------------------------------------*/
const OrderDetail: React.FC<{ order: AdminOrder; onClose: () => void; onUpdate: (id: string, s: string) => void; busy: boolean }> = ({ order, onClose, onUpdate, busy }) => {
  const [ns, setNs] = useState(order.status);
  const flow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div><h3 className="text-lg font-semibold">Order {order.orderNumber}</h3><p className="text-sm text-muted-foreground">{fmtDate(order.createdAt)}</p></div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="bg-accent/30 rounded-xl p-4">
            <label className="block text-sm font-medium mb-2">Update Status</label>
            <div className="flex gap-2">
              <select value={ns} onChange={(e) => setNs(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-border text-sm">
                {flow.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button onClick={() => onUpdate(order._id, ns)} disabled={busy || ns === order.status}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm disabled:opacity-50">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Update
              </button>
            </div>
          </div>

          {/* Customer */}
          <div><h4 className="font-medium mb-1 text-sm text-muted-foreground uppercase">Customer</h4><p className="text-sm">{order.user?.name} ({order.user?.email})</p></div>

          {/* Address */}
          {order.shippingAddress && (
            <div>
              <h4 className="font-medium mb-1 text-sm text-muted-foreground uppercase">Shipping Address</h4>
              <p className="text-sm">{order.shippingAddress.fullName}<br />{order.shippingAddress.addressLine1}<br />
                {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />{order.shippingAddress.phone}
              </p>
            </div>
          )}

          {/* Items */}
          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase">Items ({order.items?.length || 0})</h4>
            <div className="space-y-2">
              {order.items?.map((it: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-accent/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    {it.image && <img src={it.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div><p className="text-sm font-medium">{it.name}</p><p className="text-xs text-muted-foreground">Qty: {it.quantity}</p></div>
                  </div>
                  <p className="text-sm font-semibold">{fmt((it.salePrice || it.price) * it.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-green-600">-{fmt(order.discount)}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{order.shippingCost === 0 ? 'Free' : fmt(order.shippingCost)}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border"><span>Total</span><span>{fmt(order.total)}</span></div>
          </div>

          <div className="flex gap-4 text-sm">
            <div><span className="text-muted-foreground">Payment:</span> <span className="font-medium uppercase">{order.paymentMethod}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  CUSTOMERS                                                          */
/* ================================================================== */
const CustomersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: '15' };
      if (search) p.search = search;
      const r = await api.getAdminUsers(p);
      setUsers(r.data?.users || []);
      setPages(r.pagination?.pages || 1);
    } catch { }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id: string) => { setToggling(id); try { await api.toggleUserStatus(id); load(); } catch { } setToggling(null); };
  const changeRole = async (id: string, role: string) => { try { await api.updateUserRole(id, role); load(); } catch (e: any) { alert(e.message || 'Failed'); } };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Customer Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…"
            className="pl-9 pr-4 py-2 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm w-48" />
        </div>
      </div>

      {loading ? <Spinner /> : users.length === 0 ? <Empty msg="No users found" /> : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border text-left">
                {['User', 'Role', 'Status', 'Joined', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="py-3 px-3 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>{users.map((u) => (
                <tr key={u._id} className="border-b border-border/50 hover:bg-accent/20">
                  <td className="py-3 px-3"><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
                  <td className="py-3 px-3">
                    <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)} className="px-2 py-1 rounded-lg text-xs bg-accent/50 border border-border">
                      <option value="user">User</option><option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm">{fmtDate(u.createdAt)}</td>
                  <td className="py-3 px-3 text-sm text-muted-foreground">{u.lastLogin ? fmtDate(u.lastLogin) : 'Never'}</td>
                  <td className="py-3 px-3">
                    <button onClick={() => toggle(u._id)} disabled={toggling === u._id}
                      className={`text-xs px-3 py-1.5 rounded-lg ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {toggling === u._id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pages page={page} pages={pages} go={setPage} />
        </>
      )}
    </div>
  );
};

/* ================================================================== */
/*  COUPONS                                                            */
/* ================================================================== */
const CouponsTab: React.FC = () => {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [delTarget, setDelTarget] = useState<AdminCoupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => { setLoading(true); try { const r = await api.getAdminCoupons(); setCoupons(r.data?.coupons || []); } catch { } setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const onDelete = async () => { if (!delTarget) return; setDeleting(true); try { await api.deleteCoupon(delTarget._id); setDelTarget(null); load(); } catch { } setDeleting(false); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Coupon Management</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full hover:shadow-lg text-sm">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && <CouponForm coupon={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}

      {loading ? <Spinner /> : coupons.length === 0 ? <Empty msg="No coupons" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => {
            const expired = new Date(c.expiresAt) < new Date();
            return (
              <div key={c._id} className={`border rounded-2xl p-5 hover:shadow-md transition-shadow ${!c.isActive || expired ? 'border-border opacity-60' : 'border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold font-mono text-lg tracking-wide">{c.code}</span>
                      {!c.isActive && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">Disabled</span>}
                      {expired && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">Expired</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-2 hover:bg-accent rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDelTarget(c)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Discount:</span><p className="font-semibold">{c.type === 'percentage' ? `${c.value}% OFF` : `${fmt(c.value)} OFF`}</p></div>
                  <div><span className="text-muted-foreground">Min Order:</span><p className="font-semibold">{fmt(c.minOrderAmount)}</p></div>
                  <div><span className="text-muted-foreground">Usage:</span><p className="font-semibold">{c.usedCount} / {c.usageLimit}</p></div>
                  <div><span className="text-muted-foreground">Expires:</span><p className="font-semibold">{fmtDate(c.expiresAt)}</p></div>
                </div>
                <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${Math.min((c.usedCount / c.usageLimit) * 100, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Confirm open={!!delTarget} title="Delete Coupon" msg={`Delete coupon "${delTarget?.code}"?`} onYes={onDelete} onNo={() => setDelTarget(null)} busy={deleting} danger />
    </div>
  );
};

/* -- Coupon Form ----------------------------------------------------*/
const CouponForm: React.FC<{ coupon: AdminCoupon | null; onClose: () => void; onSaved: () => void }> = ({ coupon, onClose, onSaved }) => {
  const [f, setF] = useState({
    code: coupon?.code || '', description: coupon?.description || '', type: coupon?.type || 'percentage' as 'percentage' | 'fixed',
    value: coupon?.value || 10, minOrderAmount: coupon?.minOrderAmount || 0, maxDiscount: coupon?.maxDiscount || 0,
    usageLimit: coupon?.usageLimit || 100, isActive: coupon?.isActive ?? true,
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const inp = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const data = { ...f, maxDiscount: f.maxDiscount || undefined, expiresAt: f.expiresAt ? new Date(f.expiresAt).toISOString() : undefined };
      coupon ? await api.updateCoupon(coupon._id, data) : await api.createCoupon(data);
      onSaved();
    } catch (e: any) { setErr(e.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="bg-accent/30 rounded-2xl p-6 mb-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{coupon ? 'Edit Coupon' : 'Add New Coupon'}</h3>
        <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-4 h-4" /></button>
      </div>
      {err && <div className="bg-destructive/10 text-destructive rounded-xl p-3 mb-4 text-sm">{err}</div>}
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Code *</label><input className={inp + ' font-mono'} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="CUTIFY10" required /></div>
        <div><label className="block text-sm font-medium mb-1">Type *</label>
          <select className={inp} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as 'percentage' | 'fixed' })}>
            <option value="percentage">Percentage (%)</option><option value="fixed">Fixed (PKR)</option>
          </select>
        </div>
        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Description</label><input className={inp} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="10% off" /></div>
        <div><label className="block text-sm font-medium mb-1">Value *</label><input type="number" className={inp} value={f.value} onChange={(e) => setF({ ...f, value: +e.target.value })} required min={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Min Order</label><input type="number" className={inp} value={f.minOrderAmount} onChange={(e) => setF({ ...f, minOrderAmount: +e.target.value })} min={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Max Discount (0 = none)</label><input type="number" className={inp} value={f.maxDiscount} onChange={(e) => setF({ ...f, maxDiscount: +e.target.value })} min={0} /></div>
        <div><label className="block text-sm font-medium mb-1">Usage Limit</label><input type="number" className={inp} value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: +e.target.value })} min={1} /></div>
        <div><label className="block text-sm font-medium mb-1">Expires At</label><input type="date" className={inp} value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} /></div>
        <div className="flex items-center"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active</label></div>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-6 py-2.5 border border-border rounded-xl hover:bg-accent text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-xl hover:shadow-lg text-sm disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{coupon ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================== */
/*  INVENTORY                                                          */
/* ================================================================== */
const InventoryTab: React.FC = () => {
  const [rpt, setRpt] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { const r = await api.getAdminInventory(); setRpt(r.data); } catch { } setLoading(false); };
  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;
  if (!rpt) return <Empty msg="Failed to load inventory" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Inventory Report</h2>
        <button onClick={load} className="p-2 hover:bg-accent rounded-lg"><RefreshCw className="w-5 h-5 text-muted-foreground" /></button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-blue-600">{rpt.totalProducts}</p><p className="text-xs text-muted-foreground">Total Products</p></div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-red-600">{rpt.outOfStock?.length || 0}</p><p className="text-xs text-muted-foreground">Out of Stock</p></div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{rpt.lowStock?.length || 0}</p><p className="text-xs text-muted-foreground">Low Stock (&lt;10)</p></div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-600">{fmt(rpt.totalStockValue || 0)}</p><p className="text-xs text-muted-foreground">Stock Value</p></div>
      </div>

      {/* Out of Stock */}
      {rpt.outOfStock?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5" /> Out of Stock ({rpt.outOfStock.length})</h3>
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-red-200">
                {['Product', 'SKU', 'Price'].map((h) => <th key={h} className="py-2 px-4 text-left text-xs font-medium text-red-600 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>{rpt.outOfStock.map((it: any) => (
                <tr key={it._id} className="border-b border-red-100">
                  <td className="py-2.5 px-4 text-sm">{it.name}</td>
                  <td className="py-2.5 px-4 text-sm font-mono text-muted-foreground">{it.sku}</td>
                  <td className="py-2.5 px-4 text-sm">{fmt(it.price)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock */}
      {rpt.lowStock?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-600 flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5" /> Low Stock ({rpt.lowStock.length})</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-yellow-200">
                {['Product', 'SKU', 'Stock', 'Price'].map((h) => <th key={h} className="py-2 px-4 text-left text-xs font-medium text-yellow-600 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>{rpt.lowStock.map((it: any) => (
                <tr key={it._id} className="border-b border-yellow-100">
                  <td className="py-2.5 px-4 text-sm">{it.name}</td>
                  <td className="py-2.5 px-4 text-sm font-mono text-muted-foreground">{it.sku}</td>
                  <td className="py-2.5 px-4 text-sm font-semibold text-yellow-700">{it.stock}</td>
                  <td className="py-2.5 px-4 text-sm">{fmt(it.price)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {rpt.categoryBreakdown?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Stock by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rpt.categoryBreakdown.map((cat: any) => (
              <div key={cat._id || cat.category} className="bg-accent/30 rounded-xl p-4">
                <h4 className="font-semibold mb-1">{cat.category || cat._id || 'Unknown'}</h4>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{cat.count || cat.totalProducts || 0} products</span>
                  <span>{cat.totalStock || 0} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
