'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardOverview from '@/components/DashboardOverview';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard - User:', user?.email, 'Loading:', loading);
    
    if (!loading && !user) {
      console.log('No user, redirecting to home...');
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching dashboard data...');
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch('/api/dashboard'); //api endpoint j khoto 6e agal baseurl ave backend no
      const data = await response.json();
      
      if (response.ok) {
        console.log('Dashboard data fetched successfully:', data);
        setDashboardData(data.dashboard);
      } else {
        console.error('Failed to fetch dashboard data:', data.error);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <DashboardOverview data={dashboardData} loading={isLoading} />
    </DashboardLayout>
  );
}