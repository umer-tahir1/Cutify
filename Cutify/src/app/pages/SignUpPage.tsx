import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StoreRating } from '../components/StoreRating';
import { FloatingFlowers } from '../components/FloatingFlowers';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import api from '../api/client';
import { Loader2, Eye, EyeOff, MapPin, Phone, Mail, User, Lock } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setIsAuthenticated, setUser } = useApp();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Valid email is required';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) errs.password = 'Must include uppercase, lowercase & number';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (whatsappNumber && !/^\+?[0-9\s\-()]{7,15}$/.test(whatsappNumber.replace(/\s/g, '')))
      errs.whatsappNumber = 'Invalid phone number format';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.register(
        name.trim(),
        email.trim(),
        password,
        whatsappNumber.trim() || undefined,
        location.trim() || undefined,
      );
      const u = res.data?.user;
      if (u) {
        if (res.data?.accessToken) {
          localStorage.setItem('cutify-token', res.data.accessToken);
          localStorage.setItem('cutify-refresh-token', res.data.refreshToken);
        }
        setIsAuthenticated(true);
        setUser({ name: u.name, email: u.email, role: u.role });
        toast.success(`Welcome to Cutify, ${u.name}! 💖`);
        if (whatsappNumber) {
          toast.info('A welcome message is being sent to your WhatsApp! 📱');
        }
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full pl-11 pr-4 py-3 rounded-xl bg-accent/50 border text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-border focus:ring-[#e8508a]/30 focus:border-[#e8508a]'
    }`;

  return (
    <>
      <FloatingFlowers />
      <Header />
      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          className="max-w-lg mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-pacifico text-center mb-1 bg-gradient-to-r from-[#e8508a] to-[#c964cf] bg-clip-text text-transparent">
            Join Cutify! 🎀
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Create your account and join our kawaii family
          </p>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full Name <span className="text-[#e8508a]">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="Ayesha Khan"
                  className={inputClass('name')}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address <span className="text-[#e8508a]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                  placeholder="you@example.com"
                  className={inputClass('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                WhatsApp Number
                <span className="text-xs text-muted-foreground font-normal ml-1.5">(we'll send a welcome message 📱)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={e => { setWhatsappNumber(e.target.value); setErrors(prev => ({ ...prev, whatsappNumber: '' })); }}
                  placeholder="+92 330 6387976"
                  className={inputClass('whatsappNumber')}
                />
              </div>
              {errors.whatsappNumber && <p className="text-xs text-red-500 mt-1">{errors.whatsappNumber}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Location
                <span className="text-xs text-muted-foreground font-normal ml-1.5">(city / area)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Lahore, Pakistan"
                  className={inputClass('location')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password <span className="text-[#e8508a]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                  placeholder="Min. 8 chars, upper+lower+number"
                  className={`${inputClass('password')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirm Password <span className="text-[#e8508a]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                  placeholder="Re-enter your password"
                  className={inputClass('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-[#e8508a] hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-[#e8508a] hover:underline">Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-[#e8508a] to-[#c964cf] text-white py-3.5 rounded-full hover:shadow-lg hover:shadow-[#e8508a]/25 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Creating account…' : 'Create Account 🎀'}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#e8508a] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </main>
      <StoreRating />
      <Footer />
    </>
  );
};
