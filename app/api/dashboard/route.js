import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total locations
    const { count: totalLocations } = await supabaseAdmin
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get low stock items (current_stock <= min_stock)
    const { data: lowStockData } = await supabaseAdmin
      .from('inventory')
      .select('current_stock, min_stock')
      // .gte('current_stock', 'min_stock');

      const x = lowStockData.filter(item => item.current_stock <= item.min_stock);

    const lowStockItems = x?.length || 0;

    // Get recent sales (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentSales } = await supabaseAdmin
      .from('sales_transactions')
      .select('total_amount, transaction_date')
      .gte('transaction_date', sevenDaysAgo.toISOString());

    const totalSalesAmount = recentSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

    // Get top performing locations (by sales volume)
    const { data: topLocations } = await supabaseAdmin
      .from('sales_transactions')
      .select(`
        total_amount,
        locations (
          name,
          location_id
        )
      `)
      .gte('transaction_date', sevenDaysAgo.toISOString());

    const locationSales = {};
    topLocations?.forEach(sale => {
      const locationName = sale.locations?.name || 'Unknown';
      locationSales[locationName] = (locationSales[locationName] || 0) + (sale.total_amount || 0);
    });

    const topPerformingLocations = Object.entries(locationSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));

    // Get recent uploads
    const { data: recentUploads } = await supabaseAdmin
      .from('csv_uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      dashboard: {
        totalLocations: totalLocations || 0,
        totalProducts: totalProducts || 0,
        lowStockItems,
        totalSalesAmount,
        topPerformingLocations,
        recentUploads: recentUploads || []
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: `Failed to fetch dashboard data: ${error.message}` },
      { status: 500 }
    );
  }
}