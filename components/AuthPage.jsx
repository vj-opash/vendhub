'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Package2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
    const router = useRouter();
  

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(loginData.email, loginData.password);
      toast.success('Login successful!');
      router.push('/dashboard');

    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(registerData.email, registerData.password, registerData.fullName);
      toast.success('Registration successful! Please check your email for verification.');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Package2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">VendHub</h1>
          <p className="text-gray-600 mt-2">Professional Inventory Management</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Full name"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Manage your vending inventory with confidence</p>
        </div>
      </div>
    </div>
  );
}
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { toast } from 'sonner';
// import { Package2, Loader2 } from 'lucide-react';

// export default function AuthPage() {
//   const [loading, setLoading] = useState(false);
//   const { user, loading: authLoading, signIn, signUp } = useAuth();
//   const router = useRouter();

//   const [loginData, setLoginData] = useState({ email: '', password: '' });
//   const [registerData, setRegisterData] = useState({ email: '', password: '', fullName: '' });

//   useEffect(() => {
//     if (!authLoading && user) {
//       router.push('/dashboard');
//     }
//   }, [user, authLoading]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await signIn(loginData.email, loginData.password);
//       toast.success('Login successful!');
//     } catch (error) {
//       toast.error(error.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await signUp(registerData.email, registerData.password, registerData.fullName);
//       toast.success('Registration successful! Check your email for verification.');
//     } catch (error) {
//       toast.error(error.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-8">
//         <div className="text-center">
//           <div className="flex justify-center mb-4">
//             <Package2 className="h-12 w-12 text-blue-600" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900">VendHub</h1>
//           <p className="text-gray-600 mt-2">Professional Inventory Management</p>
//         </div>

//         <Card className="border-0 shadow-xl">
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl text-center">Welcome</CardTitle>
//             <CardDescription className="text-center">
//               Sign in to your account or create a new one
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="login" className="w-full">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="login">Login</TabsTrigger>
//                 <TabsTrigger value="register">Register</TabsTrigger>
//               </TabsList>

//               <TabsContent value="login">
//                 <form onSubmit={handleLogin} className="space-y-4">
//                   <Input
//                     type="email"
//                     autoComplete="email"
//                     placeholder="Email address"
//                     value={loginData.email}
//                     onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
//                     required
//                     disabled={loading}
//                   />
//                   <Input
//                     type="password"
//                     autoComplete="current-password"
//                     placeholder="Password"
//                     value={loginData.password}
//                     onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//                     required
//                     disabled={loading}
//                   />
//                   <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
//                     {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
//                   </Button>
//                 </form>
//               </TabsContent>

//               <TabsContent value="register">
//                 <form onSubmit={handleRegister} className="space-y-4">
//                   <Input
//                     type="text"
//                     placeholder="Full name"
//                     value={registerData.fullName}
//                     onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
//                     disabled={loading}
//                   />
//                   <Input
//                     type="email"
//                     autoComplete="email"
//                     placeholder="Email address"
//                     value={registerData.email}
//                     onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
//                     required
//                     disabled={loading}
//                   />
//                   <Input
//                     type="password"
//                     autoComplete="new-password"
//                     placeholder="Password"
//                     value={registerData.password}
//                     onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
//                     required
//                     disabled={loading}
//                   />
//                   <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
//                     {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>

//         <div className="text-center text-sm text-gray-500">
//           <p>Manage your vending inventory with confidence</p>
//         </div>
//       </div>
//     </div>
//   );
// }
