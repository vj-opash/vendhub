'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Edit, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    currentStock: '',
    minStock: '',
    maxStock: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      if (response.ok) {
        setInventory(data.inventory);
      } else {
        toast.error('Failed to fetch inventory');
      }
    } catch (error) {
      toast.error('Error fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditForm({
      currentStock: item.current_stock.toString(),
      minStock: item.min_stock.toString(),
      maxStock: item.max_stock.toString()
    });
  };

  const saveEdit = async () => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventoryId: editingItem,
          currentStock: parseInt(editForm.currentStock),
          minStock: parseInt(editForm.minStock),
          maxStock: parseInt(editForm.maxStock)
        }),
      });

      if (response.ok) {
        toast.success('Inventory updated successfully');
        setEditingItem(null);
        fetchInventory();
      } else {
        toast.error('Failed to update inventory');
      }
    } catch (error) {
      toast.error('Error updating inventory');
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ currentStock: '', minStock: '', maxStock: '' });
  };

  const getStockStatus = (current, min) => {
    if (current === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', priority: 'critical' };
    } else if (current <= min) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', priority: 'warning' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800', priority: 'normal' };
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.locations?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.products?.upc.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage stock levels across all locations</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by product name, location, or UPC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.map((item) => {
          const status = getStockStatus(item.current_stock, item.min_stock);
          const isEditing = editingItem === item.id;
          
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.products?.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {item.products?.upc}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.locations?.name} • Last restocked: {
                          item.last_restocked 
                            ? new Date(item.last_restocked).toLocaleDateString()
                            : 'Never'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Stock Information */}
                    <div className="text-right">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="Current Stock"
                            value={editForm.currentStock}
                            onChange={(e) => setEditForm({ ...editForm, currentStock: e.target.value })}
                            className="w-20 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Min Stock"
                            value={editForm.minStock}
                            onChange={(e) => setEditForm({ ...editForm, minStock: e.target.value })}
                            className="w-20 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Max Stock"
                            value={editForm.maxStock}
                            onChange={(e) => setEditForm({ ...editForm, maxStock: e.target.value })}
                            className="w-20 text-sm"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {item.current_stock}
                            </span>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Min: {item.min_stock} • Max: {item.max_stock}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {status.priority === 'critical' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEditing(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInventory.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching inventory items' : 'No inventory data'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Upload CSV files to populate inventory data'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}