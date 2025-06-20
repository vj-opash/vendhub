'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Package2, 
  Home, 
  MapPin, 
  Package, 
  Upload, 
  Menu, 
  X,
  LogOut,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Upload CSV', href: '/dashboard/upload', icon: Upload },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-white hover:bg-gray-600"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex items-center px-4">
                <Package2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">VendHub</span>
              </div>
              <nav className="mt-8 flex-1 space-y-1 px-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600 truncate">
                  {user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="mt-2 w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5 pb-4">
          <div className="flex items-center px-4">
            <Package2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">VendHub</span>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center mb-3">
              <User className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600 truncate">
                {user?.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-1 flex-col">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <div className="flex items-center">
                <Package2 className="h-6 w-6 text-blue-600" />
                <span className="ml-2 font-bold text-gray-900">VendHub</span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}