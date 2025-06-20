import Papa from 'papaparse';

const vendorConfigs = [
  {
    name: 'Vendor A',
    key: 'vendor_a',
    requiredHeaders: ['Location_ID', 'Trans_Date'],
    fieldMap: {
      locationId: ['Location_ID', 'Location ID'],
      upc: ['Scancode', 'UPC'],
      productName: ['Product_Name', 'Product Name'],
      unitPrice: ['Price'],
      totalAmount: ['Total_Amount', 'Total Amount'],
      transactionDate: ['Trans_Date', 'Transaction Date'],
    },
  },
  {
    name: 'Vendor B',
    key: 'vendor_b',
    requiredHeaders: ['Site_Code', 'Sale_Date'],
    fieldMap: {
      locationId: ['Site_Code'],
      upc: ['UPC'],
      productName: ['Item_Description'],
      unitPrice: ['Unit_Price'],
      totalAmount: ['Final_Total'],
      transactionDate: ['Sale_Date'],
    },
  },
  // Add more vendors here
];

function detectVendor(headers) {
  return vendorConfigs.find(vendor =>
    vendor.requiredHeaders.every(h => headers.includes(h))
  );
}

function getFirstAvailableField(row, fieldNames) {
  for (const name of fieldNames) {
    if (row[name] !== undefined && row[name] !== '') return row[name];
  }
  return null;
}

export async function parseCsvFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const csvText = Buffer.from(arrayBuffer).toString('utf-8');
  console.log('CSV Text:', csvText.slice(0, 1000));

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const errors = [];
        const data = [];

        const vendor = detectVendor(headers);

        if (!vendor) {
          return resolve({
            vendorFormat: 'unknown',
            data: [],
            totalRows: results.data.length,
            processedRows: 0,
            failedRows: results.data.length,
            errors: results.data.map((row, i) => ({
              row: i + 1,
              message: 'Unknown vendor format',
              data: row,
            })),
          });
        }

        const map = vendor.fieldMap;

        results.data.forEach((row, index) => {
          try {
            const transaction = {
              locationId: getFirstAvailableField(row, map.locationId),
              upc: getFirstAvailableField(row, map.upc),
              productName: getFirstAvailableField(row, map.productName),
              quantitySold: 1,
              unitPrice: parseFloat(getFirstAvailableField(row, map.unitPrice)),
              totalAmount: parseFloat(getFirstAvailableField(row, map.totalAmount)),
              transactionDate: new Date(getFirstAvailableField(row, map.transactionDate)),
              vendorSource: vendor.name,
              rawData: row,
            };

            if (!transaction.upc || !transaction.locationId || isNaN(transaction.unitPrice)) {
              throw new Error('Missing required fields');
            }

            data.push(transaction);
          } catch (err) {
            errors.push({ row: index + 1, message: err.message, data: row });
          }
        });

        resolve({
          vendorFormat: vendor.key,
          data,
          totalRows: results.data.length,
          processedRows: data.length,
          failedRows: errors.length,
          errors,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}
