'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, AlertTriangle, DollarSign, Upload, Calendar } from 'lucide-react';

export default function DashboardOverview({ data, loading }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Locations',
      value: data.totalLocations,
      icon: MapPin,
      description: 'Active vending locations',
      color: 'text-blue-600'
    },
    {
      title: 'Total Products',
      value: data.totalProducts,
      icon: Package,
      description: 'Products in catalog',
      color: 'text-green-600'
    },
    {
      title: 'Low Stock Items',
      value: data.lowStockItems,
      icon: AlertTriangle,
      description: 'Require restocking',
      color: 'text-orange-600'
    },
    {
      title: 'Sales (7 days)',
      value: `$${data.totalSalesAmount.toFixed(2)}`,
      icon: DollarSign,
      description: 'Revenue this week',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your inventory management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Performing Locations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Top Performing Locations
            </CardTitle>
            <CardDescription>Highest sales in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topPerformingLocations.length === 0 ? (
              <p className="text-gray-500 text-sm">No sales data available</p>
            ) : (
              <div className="space-y-3">
                {data.topPerformingLocations.map((location, index) => (
                  <div key={location.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-gray-900">{location.name}</span>
                    </div>
                    <span className="text-green-600 font-semibold">
                      ${location.sales.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-green-600" />
              Recent CSV Uploads
            </CardTitle>
            <CardDescription>Latest data processing activity</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentUploads.length === 0 ? (
              <p className="text-gray-500 text-sm">No uploads yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{upload.filename}</p>
                      <p className="text-xs text-gray-500">
                        {upload.processed_records} of {upload.total_records} processed
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={upload.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {upload.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(upload.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}