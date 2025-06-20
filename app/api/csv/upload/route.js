import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseCsvFile } from '@/lib/csvParser';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    console.log('Received file:', file);
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    console.log('File name:', file.name);
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    console.log('User ID:', userId);

    const parseResult = await parseCsvFile(file);

    const { data: uploadRecord, error: uploadError } = await supabaseAdmin
      .from('csv_uploads')
      .insert({
        filename: file.name,
        vendor_source: parseResult.vendorFormat,
        total_records: parseResult.totalRows,
        processed_records: 0,
        failed_records: parseResult.failedRows,
        status: 'processing',
        error_log: parseResult.errors,
        uploaded_by: userId,
      })
      .select()
      .single();
    console.log('Upload Record:', uploadRecord);

    if (uploadError) {
      throw new Error(`Failed to create upload record: ${uploadError.message}`);
    }
    console.log('Parse Result:', parseResult);
    let processedCount = 0;
    const processingErrors = [];

    for (const transaction of parseResult?.data) {
      try {
        console.log('Processing Transaction:', transaction);
        // Location
        let { data: location } = await supabaseAdmin
          .from('locations')
          .select('id')
          .eq('location_id', transaction.locationId)
          .single();
        console.log('Location:', location);
        if (!location) {
          const { data: newLocation, error: locErr } = await supabaseAdmin
            .from('locations')
            .insert({
              location_id: transaction.locationId,
              name: `Location ${transaction.locationId}`,
              active: true,
            })
            .select()
            .single();
          if (locErr) throw new Error(`Location error: ${locErr.message}`);
          location = newLocation;
        }
        console.log('Location found or created:', location);
        // Product
        let { data: product } = await supabaseAdmin
          .from('products')
          .select('id')
          .eq('upc', transaction.upc)
          .single();

        if (!product) {
          const { data: newProduct, error: prodErr } = await supabaseAdmin
            .from('products')
            .insert({
              name: transaction.productName,
              upc: transaction.upc,
              price: transaction.unitPrice,
            })
            .select()
            .single();
          if (prodErr) throw new Error(`Product error: ${prodErr.message}`);
          product = newProduct;
        }
        console.log('Product found or created:', product);
        // Transaction
        const { error: transErr } = await supabaseAdmin
          .from('sales_transactions')
          .insert({
            location_id: location.id,
            product_id: product.id,
            quantity_sold: transaction.quantitySold,
            unit_price: transaction.unitPrice,
            total_amount: transaction.totalAmount,
            transaction_date: transaction.transactionDate,
            vendor_source: transaction.vendorSource,
            raw_data: transaction.rawData,
          });
        console.log('Transaction inserted:', transaction);
        if (transErr) throw new Error(`Transaction error: ${transErr.message}`);

        // Inventory
        const { data: existingInventory } = await supabaseAdmin
          .from('inventory')
          .select('id, current_stock')
          .eq('location_id', location.id)
          .eq('product_id', product.id)
          .single();

        if (existingInventory) {
          const newStock = Math.max(0, existingInventory.current_stock - transaction.quantitySold);
          await supabaseAdmin
            .from('inventory')
            .update({
              current_stock: newStock,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingInventory.id);
        } else {
          await supabaseAdmin.from('inventory').insert({
            location_id: location.id,
            product_id: product.id,
            current_stock: Math.max(0, 20 - transaction.quantitySold),
            min_stock: 5,
            max_stock: 50,
          });
        }

        processedCount++;
      } catch (error) {
        processingErrors.push({
          transaction,
          error: error.message,
        });
      }
    }
    console.log('Processed Count:', processedCount);

    await supabaseAdmin
      .from('csv_uploads')
      .update({
        processed_records: processedCount,
        failed_records: parseResult.failedRows + processingErrors.length,
        status: processedCount > 0 ? 'completed' : 'failed',
        error_log: [...parseResult.errors, ...processingErrors],
      })
      .eq('id', uploadRecord.id);
    console.log('Upload record updated:', uploadRecord.id);
    return NextResponse.json({
      message: 'CSV processing completed',
      uploadId: uploadRecord.id,
      totalRows: parseResult.totalRows,
      processedRows: processedCount,
      failedRows: parseResult.failedRows + processingErrors.length,
      vendorFormat: parseResult.vendorFormat,
      errors: parseResult.errors.concat(processingErrors),
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json({ error: `CSV upload failed: ${error.message}` }, { status: 500 });
  }
}

