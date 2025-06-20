// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';

// const AuthContext = createContext({});

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Get initial session
//     const getInitialSession = async () => {
//       try {
//         const { data: { session }, error } = await supabase.auth.getSession();
//         if (error) {
//           console.error('Error getting session:', error);
//         }
//         setUser(session?.user || null);
//       } catch (error) {
//         console.error('Session error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getInitialSession();

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         console.log('Auth state changed:', event, session?.user?.email);
//         setUser(session?.user || null);
//         setLoading(false);
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, []);

//   const signUp = async (email, password, fullName = '') => {
//     try {
//       const response = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password, fullName }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Registration failed');
//       }

//       return data;
//     } catch (error) {
//       console.error('Sign up error:', error);
//       throw error;
//     }
//   };

//   const signIn = async (email, password) => {
//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Login failed');
//       }

//       // The auth state change will be handled by the listener
//       return data;
//     } catch (error) {
//       console.error('Sign in error:', error);
//       throw error;
//     }
//   };

//   const signOut = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();
//       if (error) throw error;
//     } catch (error) {
//       console.error('Sign out error:', error);
//       throw error;
//     }
//   };

//   const value = {
//     user,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// contexts/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { fullName }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
