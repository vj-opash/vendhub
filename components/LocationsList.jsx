'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, AlertTriangle, DollarSign } from 'lucide-react';

export default function LocationsList({ locations, loading }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStockStatus = (stats) => {
    if (stats.outOfStockItems > 0) {
      return { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700' };
    } else if (stats.lowStockItems > 0) {
      return { label: 'Low Stock', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    } else {
      return { label: 'Well Stocked', color: 'bg-green-500', textColor: 'text-green-700' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        <p className="text-gray-600 mt-2">Manage your vending machine locations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const stockStatus = getStockStatus(location.stats);
          
          return (
            <Card key={location.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    {location.name}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${stockStatus.textColor} border-current`}
                  >
                    <div className={`w-2 h-2 rounded-full ${stockStatus.color} mr-1`}></div>
                    {stockStatus.label}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {location.location_id}
                  </span>
                  {location.address && (
                    <span className="ml-2 truncate">{location.address}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {location.stats.totalProducts}
                      </p>
                      <p className="text-xs text-gray-500">Products</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${location.stats.totalValue.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Inventory Value</p>
                    </div>
                  </div>
                </div>

                {(location.stats.lowStockItems > 0 || location.stats.outOfStockItems > 0) && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-gray-600">
                        {location.stats.outOfStockItems > 0 && (
                          <span className="text-red-600 font-medium">
                            {location.stats.outOfStockItems} out of stock
                          </span>
                        )}
                        {location.stats.outOfStockItems > 0 && location.stats.lowStockItems > 0 && ', '}
                        {location.stats.lowStockItems > 0 && (
                          <span className="text-orange-600 font-medium">
                            {location.stats.lowStockItems} low stock
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {locations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-500">
              Upload CSV files to automatically create locations and populate inventory data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}