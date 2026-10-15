import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const DEMO_STORAGE_KEY = 'braids_by_helen_demo_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (mounted) {
            setSession(data.session);
            setUser(data.session?.user || null);
          }

          const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            if (mounted) {
              setSession(currentSession);
              setUser(currentSession?.user || null);
            }
          });

          return () => {
            listener.subscription.unsubscribe();
          };
        } else {
          // Offline demo mode: check local storage for demo session
          const stored = localStorage.getItem(DEMO_STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (mounted) {
                setUser(parsed.user);
                setSession(parsed.session);
              }
            } catch (e) {
              localStorage.removeItem(DEMO_STORAGE_KEY);
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setAuthError(err.message || 'Authentication error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const cleanupPromise = initializeAuth();

    return () => {
      mounted = false;
      if (cleanupPromise && typeof cleanupPromise.then === 'function') {
        cleanupPromise.then(cleanup => cleanup && cleanup());
      }
    };
  }, []);

  const signIn = async (email, password) => {
    setAuthError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setUser(data.user);
        setSession(data.session);
        return { success: true, user: data.user };
      } else {
        // Offline demo fallback login
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }

        const mockUser = {
          id: 'demo-helen-admin',
          email: email.trim(),
          role: 'authenticated',
          user_metadata: {
            full_name: 'Helen (Admin)',
            role: 'owner',
          },
        };

        const mockSession = {
          access_token: 'demo-jwt-token',
          user: mockUser,
          expires_at: Date.now() + 86400000,
        };

        localStorage.setItem(
          DEMO_STORAGE_KEY,
          JSON.stringify({ user: mockUser, session: mockSession })
        );

        setUser(mockUser);
        setSession(mockSession);
        return { success: true, user: mockUser, isDemo: true };
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid credentials');
      return { success: false, error: err.message || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }

      setUser(null);
      setSession(null);
      return { success: true };
    } catch (err) {
      setAuthError(err.message || 'Error signing out');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateCredentials = async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);

    try {
      if (isSupabaseConfigured && supabase) {
        const attributes = {};
        if (email && email.trim() && email.trim() !== user?.email) {
          attributes.email = email.trim();
        }
        if (password && password.trim()) {
          attributes.password = password.trim();
        }

        if (Object.keys(attributes).length === 0) {
          throw new Error('Please provide a new email address or password to update.');
        }

        const { data, error } = await supabase.auth.updateUser(attributes);
        if (error) throw error;

        if (data.user) {
          setUser(data.user);
        }
        return { success: true, user: data.user };
      } else {
        // Offline demo mode
        if (!email && !password) {
          throw new Error('Please provide a new email address or password to update.');
        }

        const updatedUser = {
          ...user,
          email: email && email.trim() ? email.trim() : user?.email,
        };
        const updatedSession = {
          ...session,
          user: updatedUser,
        };

        localStorage.setItem(
          DEMO_STORAGE_KEY,
          JSON.stringify({ user: updatedUser, session: updatedSession })
        );

        setUser(updatedUser);
        setSession(updatedSession);
        return { success: true, user: updatedUser, isDemo: true };
      }
    } catch (err) {
      const message = err.message || 'Failed to update account credentials';
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    isAdmin: Boolean(user),
    loading,
    authError,
    signIn,
    signOut,
    updateCredentials,
    isLiveBackend: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
