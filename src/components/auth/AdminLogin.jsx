import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLogin = () => {
  const { signIn, loading, authError, isLiveBackend } = useAuth();
  const { setCurrentView } = useBooking();

  const [email, setEmail] = useState('helen@braidsbyhelen.com');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter your administrator email and password.');
      return;
    }

    const res = await signIn(email, password);
    if (!res.success) {
      setLocalError(res.error || 'Invalid credentials');
    }
  };

  const handleDemoSignIn = async () => {
    setLocalError(null);
    await signIn('helen@braidsbyhelen.com', 'demo-password');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-secondary-200 shadow-xl overflow-hidden animate-fadeIn">
        
        {/* Top Header */}
        <div className="bg-primary text-ivory px-8 pt-8 pb-6 text-center relative">
          <button
            onClick={() => setCurrentView('customer')}
            className="absolute top-6 left-6 text-ivory/80 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
            aria-label="Back to customer view"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
            Salon Admin Access
          </h2>
          <p className="text-xs text-ivory/80 mt-1 font-sans">
            Braids by Helen Private Studio Dashboard
          </p>
        </div>

        {/* Content & Form */}
        <div className="p-8">
          {(localError || authError) && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-espresso/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@braidsbyhelen.com"
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-espresso/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-espresso/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-sans"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary hover:bg-primary-900 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Log In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Offline demo notice & quick action */}
          {!isLiveBackend && (
            <div className="mt-6 pt-6 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500 mb-3">
                Live Supabase credentials are not configured. Running in offline demo mode.
              </p>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full bg-accent/15 hover:bg-accent/25 text-espresso text-xs font-semibold py-2.5 px-4 rounded-xl border border-accent/40 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Quick Sign In as Helen (Demo Mode)</span>
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setCurrentView('customer')}
              className="text-xs text-stone-500 hover:text-espresso font-medium inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Customer Presentation</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
