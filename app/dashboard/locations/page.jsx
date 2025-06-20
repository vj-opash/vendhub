'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LocationsList from '@/components/LocationsList';

export default function LocationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchLocations();
    }
  }, [user]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      
      if (response.ok) {
        setLocations(data.locations);
      } else {
        console.error('Failed to fetch locations:', data.error);
      }
    } catch (error) {
      console.error('Locations fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <LocationsList locations={locations} loading={isLoading} />
    </DashboardLayout>
  );
}