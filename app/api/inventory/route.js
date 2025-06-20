// import { NextResponse } from 'next/server';
// import { supabaseAdmin } from '@/lib/supabase';

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const locationId = searchParams.get('locationId');

//     let query = supabaseAdmin
//       .from('inventory')
//       .select(`
//         *,
//         locations (
//           id,
//           location_id,
//           name,
//           address
//         ),
//         products (
//           id,
//           name,
//           upc,
//           price
//         )
//       `)
//       .order('current_stock', { ascending: true });

//     if (locationId) {
//       query = query.eq('location_id', locationId);
//     }

//     const { data, error } = await query;

//     if (error) {
//       throw new Error(error.message);
//     }

//     return NextResponse.json({
//       inventory: data
//     });

//   } catch (error) {
//     return NextResponse.json(
//       { error: `Failed to fetch inventory: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request) {
//   try {
//     const { inventoryId, currentStock, minStock, maxStock } = await request.json();

//     if (!inventoryId) {
//       return NextResponse.json(
//         { error: 'Inventory ID required' },
//         { status: 400 }
//       );
//     }

//     const { data, error } = await supabaseAdmin
//       .from('inventory')
//       .update({
//         current_stock: currentStock,
//         min_stock: minStock,
//         max_stock: maxStock,
//         updated_at: new Date().toISOString()
//       })
//       .eq('id', inventoryId)
//       .select()
//       .single();

//     if (error) {
//       throw new Error(error.message);
//     }

//     return NextResponse.json({
//       message: 'Inventory updated successfully',
//       inventory: data
//     });

//   } catch (error) {
//     return NextResponse.json(
//       { error: `Failed to update inventory: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    console.log('Fetching inventory...');
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
console.log('Location ID:', locationId);
    let query = supabaseAdmin
      .from('inventory')
      .select(`
        id,
        current_stock,
        min_stock,
        max_stock,
        location_id,
        product_id,
        locations (
          id,
          location_id,
          name,
          address
        ),
        products (
          id,
          name,
          upc,
          price
        )
      `)
      .order('current_stock', { ascending: true });
console.log('Initial query:', query);
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
console.log('Final query:', query);
    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return NextResponse.json({ inventory: data });

  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch inventory: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { inventoryId, currentStock, minStock, maxStock } = await request.json();

    if (!inventoryId) {
      return NextResponse.json(
        { error: 'Inventory ID required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('inventory')
      .update({
        current_stock: currentStock,
        min_stock: minStock,
        max_stock: maxStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      message: 'Inventory updated successfully',
      inventory: data
    });

  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update inventory: ${error.message}` },
      { status: 500 }
    );
  }
}
