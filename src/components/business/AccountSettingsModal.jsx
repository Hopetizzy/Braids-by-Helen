import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, KeyRound, Eye, EyeOff, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';

export const AccountSettingsModal = ({ isOpen, onClose }) => {
  const { user, updateCredentials, loading, isLiveBackend } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(user?.email || '');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setShowPassword(false);
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    const hasEmailChange = trimmedEmail && trimmedEmail !== user?.email;
    const hasPasswordChange = password.trim().length > 0;

    if (!hasEmailChange && !hasPasswordChange) {
      setError('Please enter a new email or password to update.');
      return;
    }

    if (hasPasswordChange) {
      if (password.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please recheck your new password.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await updateCredentials({
        email: hasEmailChange ? trimmedEmail : undefined,
        password: hasPasswordChange ? password : undefined,
      });

      if (res.success) {
        setSuccess('Your administrator credentials have been updated successfully.');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Failed to update credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while updating credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div 
          className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden text-left transform transition-all my-8"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-espresso-900 to-rosewood-900 text-white p-6 sm:p-7 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 border border-white/15">
              <KeyRound className="w-6 h-6 text-[#E8C2A0]" />
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              Security & Credentials
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Update Helen's administrator login email and password.
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-7 space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Studio Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="helen@braidsbyhelen.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rosewood-600 focus:ring-2 focus:ring-rosewood-100 outline-none transition-all"
                    required
                  />
                </div>
                <span className="text-[11px] text-stone-400 block mt-1">
                  Current login: {user?.email || 'helen@braidsbyhelen.com'}
                </span>
              </div>

              {/* New Password Field */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new private password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rosewood-600 focus:ring-2 focus:ring-rosewood-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-stone-400 block mt-1">
                  Leave blank if you only want to change your email. Minimum 6 characters.
                </span>
              </div>

              {/* Confirm Password Field */}
              {password.trim().length > 0 && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rosewood-600 focus:ring-2 focus:ring-rosewood-100 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-rosewood-600 hover:bg-rosewood-700 active:scale-98 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-card transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Saving Changes...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Update Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-stone-400">
                {isLiveBackend 
                  ? 'Synchronized directly with Supabase secure authentication' 
                  : 'Active in local session storage'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
