import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import api from '../api/client';
import { Loader2 } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, setUser } = useApp();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }

    setLoading(true);
    try {
      const res = await api.login(email, password);
      const u = res.data?.user;
      if (u) {
        setIsAuthenticated(true);
        setUser({ name: u.name, email: u.email, role: u.role });
        toast.success(`Welcome back, ${u.name}! 💖`);
        if (u.role === 'admin' || u.role === 'superadmin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingFlowers />
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-4xl font-pacifico text-center mb-2">
            Welcome Back! 💖
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Sign in to your Cutify account
          </p>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-accent/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-full hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
