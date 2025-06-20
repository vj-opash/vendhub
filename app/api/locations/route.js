// import { NextResponse } from 'next/server';
// import { supabaseAdmin } from '@/lib/supabase';

// export async function GET() {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from('locations')
//       .select(`
//         *,
//         inventory (
//           id,
//           current_stock,
//           min_stock,
//           max_stock,
//           products (
//             name,
//             price
//           )
//         )
//       `)
//       .eq('active', true)
//       .order('name');

//     if (error) {
//       throw new Error(error.message);
//     }

//     // Calculate summary stats for each location
//     const locationsWithStats = data.map(location => {
//       const inventory = location.inventory || [];
//       const totalProducts = inventory.length;
//       const lowStockItems = inventory.filter(item => item.current_stock <= item.min_stock).length;
//       const outOfStockItems = inventory.filter(item => item.current_stock === 0).length;
//       const totalValue = inventory.reduce((sum, item) => {
//         return sum + (item.current_stock * (item.products?.price || 0));
//       }, 0);

//       return {
//         ...location,
//         stats: {
//           totalProducts,
//           lowStockItems,
//           outOfStockItems,
//           totalValue
//         }
//       };
//     });

//     return NextResponse.json({
//       locations: locationsWithStats
//     });

//   } catch (error) {
//     return NextResponse.json(
//       { error: `Failed to fetch locations: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('locations')
      .select(`
        *,
        inventory (
          id,
          current_stock,
          min_stock,
          max_stock,
          product_id,
          products (
            name,
            price
          )
        )
      `)
      .eq('active', true)
      .order('name');

    if (error) throw new Error(error.message);

    const locationsWithStats = data.map(location => {
      const inventory = location.inventory || [];

      const totalProducts = inventory.length;
      const lowStockItems = inventory.filter(
        item => item.current_stock <= item.min_stock
      ).length;
      const outOfStockItems = inventory.filter(
        item => item.current_stock === 0
      ).length;

      const totalValue = inventory.reduce((sum, item) => {
        const price = item.products?.price || 0;
        return sum + item.current_stock * price;
      }, 0);

      return {
        ...location,
        stats: {
          totalProducts,
          lowStockItems,
          outOfStockItems,
          totalValue
        }
      };
    });

    return NextResponse.json({ locations: locationsWithStats });

  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch locations: ${error.message}` },
      { status: 500 }
    );
  }
}
